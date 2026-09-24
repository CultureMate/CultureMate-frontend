function coordinate(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function getEventCoordinates(event) {
  const latitude = coordinate(event.latitude ?? event.lat)
  const longitude = coordinate(event.longitude ?? event.lng)
  if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180
    || (latitude === 0 && longitude === 0)) return null
  return { latitude, longitude }
}

export function getKakaoMapLink(event, location) {
  const point = location || getEventCoordinates(event)
  if (point) return `https://map.kakao.com/link/map/${encodeURIComponent(point.name || event.place || event.title || '행사 위치')},${point.latitude},${point.longitude}`
  if (!event.place?.trim()) return null
  return `https://map.kakao.com/link/search/${encodeURIComponent(['서울', event.district, event.place].filter(Boolean).join(' '))}`
}

// 상세 API에 좌표가 없을 때만 장소 검색을 이용합니다. x=경도, y=위도입니다.
export function searchEventLocation(maps, event, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('MAP_ABORTED')); return }
    const place = event.place?.trim()
    if (!place) { reject(new Error('MAP_LOCATION_MISSING')); return }
    let settled = false
    const finish = (error, location) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      if (error) reject(error)
      else resolve(location)
    }
    const abort = () => finish(new Error('MAP_ABORTED'))
    const timer = setTimeout(() => finish(new Error('MAP_SEARCH_FAILED')), 10000)
    signal?.addEventListener('abort', abort, { once: true })
    try {
      const places = new maps.services.Places()
      const queries = [...new Set([place, place.replace(/\s*일대$/, '').trim()])]
      const search = index => {
        const query = ['서울', event.district, queries[index]].filter(Boolean).join(' ')
        places.keywordSearch(query, (results, status) => {
          if (settled) return
          if (status !== maps.services.Status.OK && status !== maps.services.Status.ZERO_RESULT) {
            finish(new Error('MAP_SEARCH_FAILED'))
            return
          }
          const match = (results || []).find(result => getEventCoordinates({ latitude: result.y, longitude: result.x })
            && (!event.district || `${result.address_name || ''} ${result.road_address_name || ''}`.includes(event.district)))
          if (status === maps.services.Status.OK && match) {
            finish(null, { ...getEventCoordinates({ latitude: match.y, longitude: match.x }), name: match.place_name, address: match.road_address_name || match.address_name, source: 'search' })
          } else if (index + 1 < queries.length) search(index + 1)
          else finish(new Error('MAP_LOCATION_NOT_FOUND'))
        }, { size: 5 })
      }
      search(0)
    } catch (error) { finish(error) }
  })
}
