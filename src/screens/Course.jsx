import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCourse, getCourseError } from '../api/courses'
import { getNearbyPlaces, getPlacesError } from '../api/places'
import { getEventDetail } from '../api/events'
import DemoNotice from '../components/DemoNotice'
import { getEventCoordinates } from '../utils/eventLocation'
import { readCourseBuilder, readCourseDraft, writeCourseBuilder, writeCourseDraft } from '../utils/courseDraft'

const asEventStop = event => ({ ...event, stopId: `event:${event.eventId}`, stopType: 'EVENT' })
const asPlaceStop = place => ({ ...place, stopId: `place:${place.placeId}`, stopType: 'PLACE' })

function moveItem(items, from, to) {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function StopCard({ stop, index, total, onMove, onRemove, onDragStart, onDrop }) {
  const isEvent = stop.stopType === 'EVENT'
  const label = isEvent ? '행사' : stop.placeType === 'restaurant' ? '음식점' : '카페'
  const badge = isEvent ? 'bg-[#FFF0EC] text-[#FF6B47]' : stop.placeType === 'restaurant' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E6FAF7] text-[#008F75]'
  return (
    <li draggable onDragStart={() => onDragStart(index)} onDragOver={event => event.preventDefault()} onDrop={() => onDrop(index)}
      className="relative flex gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1A1A2E] text-sm font-black text-white">{index + 1}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{label}</span>
          {!isEvent && stop.rating != null && <span className="text-xs text-[#6B7280]">★ {stop.rating} ({stop.userRatingCount.toLocaleString('ko-KR')})</span>}
        </div>
        <h3 className="truncate text-sm font-bold text-[#1A1A2E]">{isEvent ? stop.title : stop.name}</h3>
        <p className="mt-1 truncate text-xs text-[#6B7280]">📍 {isEvent ? stop.place || '장소 확인 필요' : stop.address || '주소 정보 없음'}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1" aria-label={`${isEvent ? stop.title : stop.name} 순서 변경`}>
        <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="위로 이동" className="h-8 w-8 rounded-lg bg-[#F3F4F6] text-sm disabled:opacity-30">↑</button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(index, index + 1)} aria-label="아래로 이동" className="h-8 w-8 rounded-lg bg-[#F3F4F6] text-sm disabled:opacity-30">↓</button>
        <button type="button" onClick={() => onRemove(stop.stopId)} aria-label={`${isEvent ? stop.title : stop.name} 삭제`} className="h-8 w-8 rounded-lg bg-[#FFF0EC] text-[#FF6B47]">×</button>
      </div>
    </li>
  )
}

function PlaceCard({ place, added, onAdd }) {
  const restaurant = place.placeType === 'restaurant'
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${restaurant ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E6FAF7] text-[#008F75]'}`}>{restaurant ? '음식점' : '카페'}</span>
          <h3 className="mt-2 truncate text-sm font-bold text-[#1A1A2E]">{place.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{place.address || '주소 정보 없음'}</p>
        </div>
        {place.openNow != null && <span className={`flex-shrink-0 text-[11px] font-semibold ${place.openNow ? 'text-[#008F75]' : 'text-[#9CA3AF]'}`}>{place.openNow ? '영업 중' : '영업 종료'}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-[#6B7280]">{place.rating != null ? `★ ${place.rating} · 리뷰 ${place.userRatingCount.toLocaleString('ko-KR')}` : '평점 정보 없음'}</p>
        <div className="flex gap-2">
          {place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#F3F4F6] px-2.5 py-2 text-xs font-semibold text-[#374151]">지도</a>}
          <button type="button" disabled={added} onClick={() => onAdd(place)} className="rounded-lg bg-[#1A1A2E] px-3 py-2 text-xs font-bold text-white disabled:bg-[#D1D5DB]">{added ? '추가됨' : '+ 추가'}</button>
        </div>
      </div>
    </article>
  )
}

export default function Course() {
  const initialEvents = useMemo(() => readCourseDraft(), [])
  const initialBuilder = useMemo(() => readCourseBuilder(), [])
  const [stops, setStops] = useState(() => {
    const eventIds = new Set(initialEvents.map(event => String(event.eventId)))
    const savedStops = initialBuilder.stops.filter(stop => stop?.stopType === 'PLACE' || (stop?.stopType === 'EVENT' && eventIds.has(String(stop.eventId))))
    const savedEventIds = new Set(savedStops.filter(stop => stop.stopType === 'EVENT').map(stop => String(stop.eventId)))
    return [...savedStops, ...initialEvents.filter(event => !savedEventIds.has(String(event.eventId))).map(asEventStop)]
  })
  const [title, setTitle] = useState(initialBuilder.title)
  const [selectedEventId, setSelectedEventId] = useState(initialEvents[0]?.eventId || '')
  const [placeType, setPlaceType] = useState('cafe')
  const [placeRequest, setPlaceRequest] = useState({ loading: false, places: [], error: null, isMock: false })
  const [visibleCount, setVisibleCount] = useState(5)
  const [dragIndex, setDragIndex] = useState(null)
  const [saveState, setSaveState] = useState({ loading: false, message: '', error: '' })
  const [coordinateLoading, setCoordinateLoading] = useState(false)
  const coordinateAttempts = useRef(new Set())
  const events = stops.filter(stop => stop.stopType === 'EVENT')
  const selectedEvent = events.find(stop => String(stop.eventId) === String(selectedEventId)) || events[0]
  const coordinates = selectedEvent ? getEventCoordinates(selectedEvent) : null
  const latitude = coordinates?.latitude
  const longitude = coordinates?.longitude

  useEffect(() => {
    if (!events.some(stop => String(stop.eventId) === String(selectedEventId))) setSelectedEventId(events[0]?.eventId || '')
    writeCourseDraft(events)
  // 행사 추가·삭제 시에만 초안을 동기화합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.map(stop => stop.eventId).join('|')])

  useEffect(() => { writeCourseBuilder({ title, stops }) }, [title, stops])

  useEffect(() => {
    if (!selectedEventId || latitude != null || longitude != null || coordinateAttempts.current.has(String(selectedEventId))) return
    coordinateAttempts.current.add(String(selectedEventId))
    const controller = new AbortController()
    setCoordinateLoading(true)
    getEventDetail(String(selectedEventId), controller.signal)
      .then(({ event }) => setStops(items => items.map(stop => stop.stopType === 'EVENT' && String(stop.eventId) === String(selectedEventId) ? { ...stop, ...event } : stop)))
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setCoordinateLoading(false) })
    return () => controller.abort()
  }, [selectedEventId, latitude, longitude])

  useEffect(() => {
    if (!selectedEventId || latitude == null || longitude == null) {
      setPlaceRequest({ loading: false, places: [], error: null, isMock: false })
      return
    }
    const controller = new AbortController()
    setVisibleCount(5)
    setPlaceRequest({ loading: true, places: [], error: null, isMock: false })
    getNearbyPlaces({ latitude, longitude, types: [placeType], radius: 1500, maxResults: 20 }, controller.signal)
      .then(result => setPlaceRequest({ loading: false, places: result.places, error: null, isMock: result.isMock }))
      .catch(error => { if (!controller.signal.aborted) setPlaceRequest({ loading: false, places: [], error, isMock: false }) })
    return () => controller.abort()
  }, [selectedEventId, latitude, longitude, placeType])

  const moveStop = (from, to) => setStops(items => moveItem(items, from, to))
  const removeStop = stopId => setStops(items => items.filter(item => item.stopId !== stopId))
  const addPlace = place => setStops(items => items.some(item => item.stopId === `place:${place.placeId}`) ? items : [...items, asPlaceStop(place)])
  const dropStop = index => {
    if (dragIndex != null) moveStop(dragIndex, index)
    setDragIndex(null)
  }

  const save = async event => {
    event.preventDefault()
    const name = title.trim()
    if (!name) { setSaveState({ loading: false, message: '', error: '코스 이름을 입력해 주세요.' }); return }
    if (!events.length) { setSaveState({ loading: false, message: '', error: '행사를 한 개 이상 담아 주세요.' }); return }
    const payload = {
      name,
      stops: stops.map((stop, order) => stop.stopType === 'EVENT'
        ? { type: 'EVENT', eventId: stop.eventId, order }
        : { type: 'PLACE', placeId: stop.placeId, placeType: stop.placeType.toUpperCase(), name: stop.name, address: stop.address, latitude: stop.latitude, longitude: stop.longitude, order }),
    }
    setSaveState({ loading: true, message: '', error: '' })
    try {
      const saved = await createCourse(payload)
      setSaveState({ loading: false, message: saved?.isLocal ? '개발용 코스로 이 브라우저에 저장했어요.' : '코스를 저장했어요.', error: '' })
    } catch (error) {
      setSaveState({ loading: false, message: '', error: getCourseError(error) })
    }
  }

  return (
    <div className="min-h-full bg-[#FAFAF8] pb-12">
      <header className="bg-[#1A1A2E] px-5 pb-7 pt-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF8A70]">Course builder</p>
          <h1 className="font-display text-3xl font-bold text-white">코스 만들기</h1>
          <p className="mt-2 text-sm text-white/60">행사와 주변 장소를 원하는 순서로 배치해 나만의 동선을 만드세요.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 md:px-8 lg:px-10">
        {!events.length ? <section className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="text-5xl" aria-hidden="true">🗺️</span>
          <h2 className="mt-5 text-lg font-bold text-[#1A1A2E]">코스에 담긴 행사가 없어요</h2>
          <p className="mt-2 text-sm text-[#6B7280]">행사 목록에서 가고 싶은 행사를 먼저 담아 주세요.</p>
          <Link to="/events" className="mt-6 inline-block rounded-xl bg-[#FF6B47] px-5 py-3 text-sm font-bold text-white">행사 둘러보기</Link>
        </section> : <form onSubmit={save}>
          <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <label htmlFor="course-title" className="mb-2 block text-sm font-bold text-[#1A1A2E]">코스 이름</label>
            <input id="course-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={50} placeholder="예: 성수 전시와 카페 산책"
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#FF6B47]" />
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <section aria-labelledby="route-title" className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div><h2 id="route-title" className="font-bold text-[#1A1A2E]">코스 순서</h2><p className="mt-1 text-xs text-[#6B7280]">카드를 끌거나 화살표로 행사와 장소 순서를 바꿀 수 있어요.</p></div>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#6B7280]">{stops.length}곳</span>
              </div>
              <ol className="space-y-3">
                {stops.map((stop, index) => <StopCard key={stop.stopId} stop={stop} index={index} total={stops.length}
                  onMove={moveStop} onRemove={removeStop} onDragStart={setDragIndex} onDrop={dropStop} />)}
              </ol>
              <Link to="/events" className="mt-4 block rounded-xl border border-dashed border-[#FF6B47] py-3 text-center text-sm font-bold text-[#FF6B47]">+ 행사 더 담기</Link>
            </section>

            <section aria-labelledby="places-title" className="self-start rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-5">
              <div className="mb-4"><h2 id="places-title" className="font-bold text-[#1A1A2E]">행사 주변 장소</h2><p className="mt-1 text-xs text-[#6B7280]">선택한 행사 반경 1.5km의 장소를 찾아요.</p></div>
              <label htmlFor="source-event" className="mb-1.5 block text-xs font-semibold text-[#6B7280]">기준 행사</label>
              <select id="source-event" value={selectedEvent?.eventId || ''} onChange={event => setSelectedEventId(event.target.value)} className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm">
                {events.map(event => <option key={event.eventId} value={event.eventId}>{event.title}</option>)}
              </select>
              <div className="my-4 grid grid-cols-2 rounded-xl bg-[#F3F4F6] p-1">
                <button type="button" aria-pressed={placeType === 'cafe'} onClick={() => setPlaceType('cafe')} className={`rounded-lg py-2 text-sm font-bold ${placeType === 'cafe' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>☕ 카페</button>
                <button type="button" aria-pressed={placeType === 'restaurant'} onClick={() => setPlaceType('restaurant')} className={`rounded-lg py-2 text-sm font-bold ${placeType === 'restaurant' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>🍽 음식점</button>
              </div>

              {coordinateLoading && <p role="status" className="rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">행사 위치를 확인하고 있어요.</p>}
              {!coordinateLoading && !coordinates && <div className="rounded-xl bg-[#FFF8E7] p-4 text-sm text-[#92400E]">이 행사는 좌표 정보가 없어 주변 장소를 검색할 수 없어요. 다른 행사를 선택해 주세요.</div>}
              {placeRequest.loading && <p role="status" className="rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">주변 장소를 찾고 있어요.</p>}
              {placeRequest.error && <p role="alert" className="rounded-xl bg-[#FFF0EC] p-4 text-sm text-[#B42318]">{getPlacesError(placeRequest.error)}</p>}
              {placeRequest.isMock && <DemoNotice />}
              {!placeRequest.loading && coordinates && !placeRequest.error && !placeRequest.places.length && <p className="rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">조건에 맞는 장소를 찾지 못했어요.</p>}
              <div className="space-y-3">
                {placeRequest.places.slice(0, visibleCount).map(place => <PlaceCard key={place.placeId} place={place}
                  added={stops.some(stop => stop.stopId === `place:${place.placeId}`)} onAdd={addPlace} />)}
              </div>
              {visibleCount < placeRequest.places.length && <button type="button" onClick={() => setVisibleCount(count => count + 5)} className="mt-3 w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-bold text-[#374151]">장소 더 보기</button>}
            </section>
          </div>

          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:p-5">
            <div aria-live="polite" className="mb-3 text-sm md:mb-0">
              {saveState.error && <p role="alert" className="text-[#B42318]">{saveState.error}</p>}
              {saveState.message && <p className="font-semibold text-[#008F75]">{saveState.message}</p>}
              {!saveState.error && !saveState.message && <p className="text-[#6B7280]">행사 {events.length}개 · 주변 장소 {stops.length - events.length}개</p>}
            </div>
            <button type="submit" disabled={saveState.loading} className="w-full rounded-xl bg-[#FF6B47] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 md:w-auto">{saveState.loading ? '저장 중...' : '이 코스 저장하기'}</button>
          </section>
        </form>}
      </main>
    </div>
  )
}
