import { useEffect, useRef, useState } from 'react'
import { getPlacesError, loadPlacePhoto } from '../api/places'
import cafeDefaultImage from '../assets/course-cafe-default.svg'
import restaurantDefaultImage from '../assets/course-restaurant-default.svg'

export function PhotoAttributions({ attributions = [], className = '' }) {
  if (!attributions.length) return null
  return (
    <p className={`text-[10px] leading-4 text-[#6B7280] ${className}`}>
      사진: {attributions.map((author, index) => {
        const name = author?.displayName || 'Google 사용자'
        const content = author?.uri
          ? <a href={author.uri} target="_blank" rel="noreferrer" className="underline underline-offset-2">{name}</a>
          : name
        return <span key={`${name}-${author?.uri || index}`}>{index > 0 && ', '}{content}</span>
      })}
    </p>
  )
}

export function GoogleMapsAttribution({ place, className = '' }) {
  if (!place || place.stopType === 'EVENT') return null
  return (
    <p className={`text-[10px] text-[#9CA3AF] ${className}`}>
      장소 정보 제공: {place.mapUrl
        ? <a href={place.mapUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">Google Maps</a>
        : <span className="font-semibold">Google Maps</span>}
    </p>
  )
}

export default function GooglePlacePhoto({ place, alt, imageClassName = '', autoLoad = false, manualLoad = false, children }) {
  const [visible, setVisible] = useState(!autoLoad)
  const [requestCount, setRequestCount] = useState(0)
  const [photo, setPhoto] = useState({ url: '', loading: false, error: '' })
  const rootRef = useRef(null)
  const restaurant = place?.placeType === 'restaurant'
  const fallback = restaurant ? restaurantDefaultImage : cafeDefaultImage

  useEffect(() => {
    if (!autoLoad || !place?.photoName) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '120px' })
    if (rootRef.current) observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [autoLoad, place?.photoName])

  useEffect(() => {
    if (!place?.photoName || (!requestCount && !(autoLoad && visible))) return
    let active = true
    setPhoto(current => ({ ...current, loading: true, error: '' }))
    loadPlacePhoto(place.photoName)
      .then(url => { if (active) setPhoto({ url, loading: false, error: '' }) })
      .catch(error => { if (active) setPhoto({ url: '', loading: false, error: getPlacesError(error) }) })
    return () => { active = false }
  }, [autoLoad, place?.photoName, requestCount, visible])

  return (
    <div>
      <div ref={rootRef} className={`relative overflow-hidden bg-[#F3F4F6] ${imageClassName}`}>
        <img src={photo.url || fallback} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        {children}
        {manualLoad && place?.photoName && !photo.url && <button type="button" onClick={() => setRequestCount(count => count + 1)} disabled={photo.loading}
          className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
          {photo.loading ? '사진 불러오는 중' : '사진 보기'}
        </button>}
      </div>
      {photo.url && <PhotoAttributions attributions={place.authorAttributions} className="mt-1 px-1" />}
      {manualLoad && photo.error && <p role="alert" className="mt-1 px-1 text-[10px] text-[#B42318]">{photo.error}</p>}
    </div>
  )
}
