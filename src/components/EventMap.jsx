import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '../api/kakaoMaps'
import { getEventCoordinates, getKakaoMapLink, searchEventLocation } from '../utils/eventLocation'

const messages = {
  MAP_KEY_MISSING: '지도 서비스를 준비 중입니다. 카카오맵에서 장소를 확인해 주세요.',
  MAP_LOCATION_MISSING: '행사 위치 정보가 없습니다.',
  MAP_LOCATION_NOT_FOUND: '정확한 위치를 찾지 못했습니다. 카카오맵에서 장소를 확인해 주세요.',
  MAP_SEARCH_FAILED: '장소를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

export default function EventMap({ event }) {
  const containerRef = useRef(null)
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({ loading: true, location: null, error: null })
  const { eventId, place, district, title, latitude, longitude, lat, lng } = event

  useEffect(() => {
    const controller = new AbortController()
    const container = containerRef.current
    let marker
    let observer
    let onResize
    setState({ loading: true, location: null, error: null })
    const showMap = async () => {
      try {
        const currentEvent = { place, district, latitude, longitude, lat, lng }
        const coordinates = getEventCoordinates(currentEvent)
        if (!coordinates && !place?.trim()) throw new Error('MAP_LOCATION_MISSING')
        const maps = await loadKakaoMaps()
        if (controller.signal.aborted) return
        const location = coordinates ? { ...coordinates, name: place || title, source: 'coordinates' }
          : await searchEventLocation(maps, currentEvent, controller.signal)
        if (controller.signal.aborted) return
        const center = new maps.LatLng(location.latitude, location.longitude)
        const map = new maps.Map(container, { center, level: 3, scrollwheel: false })
        marker = new maps.Marker({ map, position: center, title: location.name || place || title })
        map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT)
        onResize = () => {
          map.relayout()
          map.setCenter(center)
        }
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(onResize)
          observer.observe(container)
        } else window.addEventListener('resize', onResize)
        setState({ loading: false, location, error: null })
      } catch (error) {
        if (!controller.signal.aborted) {
          marker?.setMap(null)
          container.replaceChildren()
          setState({ loading: false, location: null, error: error.message })
        }
      }
    }
    showMap()
    return () => {
      controller.abort()
      observer?.disconnect()
      if (onResize) window.removeEventListener('resize', onResize)
      marker?.setMap(null)
      container.replaceChildren()
    }
  }, [eventId, place, district, title, latitude, longitude, lat, lng, retry])

  const mapLink = getKakaoMapLink(event, state.location)
  const canRetry = state.error && !['MAP_KEY_MISSING', 'MAP_LOCATION_MISSING'].includes(state.error)
  return (
    <section aria-label="행사 위치" className="rounded-2xl overflow-hidden border border-[#E5E7EB] mb-4 bg-white">
      <div className="bg-[#F9FAFB] px-4 py-3 flex items-center gap-2 border-b border-[#E5E7EB]">
        <span aria-hidden="true">📍</span>
        <h2 className="text-sm font-bold text-[#1A1A2E]">지도</h2>
        <span className="text-xs text-[#6B7280]">{place}</span>
      </div>
      <div className="relative h-[260px] md:h-[320px] bg-[#E8F0E8]">
        <div ref={containerRef} aria-label="행사 위치 지도" aria-busy={state.loading} className="w-full h-full" />
        {(state.loading || state.error) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
          <p role="status" className="text-sm text-[#374151]">{state.loading ? '지도를 불러오는 중입니다.' : messages[state.error] || '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}</p>
          {canRetry && <button type="button" onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1A1A2E]">지도 다시 시도</button>}
        </div>}
      </div>
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#6B7280] min-w-0">
          {state.location?.source === 'search' ? <>
            <p className="font-semibold text-[#374151]">검색된 장소: {state.location.name}</p>
            <p className="mt-1">{state.location.address}</p>
            <p className="mt-1">장소명으로 찾은 위치입니다. 방문 전 행사 장소와 일치하는지 확인해 주세요.</p>
          </> : <p>{state.location ? '행사에서 제공한 위치입니다.' : district || '행사 위치 안내'}</p>}
        </div>
        {mapLink && <a href={mapLink} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-[#FFE500] px-4 py-2 text-xs font-bold text-[#1A1A2E]">카카오맵에서 보기 →</a>}
      </div>
    </section>
  )
}
