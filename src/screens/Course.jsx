import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createCourse, deleteCourse, getCourseDetail, getCourseError, getCourses, shareCourse, unshareCourse, updateCourse, updateCourseFavorite } from '../api/courses'
import { getNearbyPlaces, getPlaceDetails, getPlacesBetween, getPlacesError } from '../api/places'
import { getEventDetail } from '../api/events'
import DemoNotice from '../components/DemoNotice'
import EventDialog from '../components/EventDialog'
import GooglePlacePhoto, { GoogleMapsAttribution } from '../components/GooglePlacePhoto'
import OpeningHours from '../components/OpeningHours'
import { getEventCoordinates } from '../utils/eventLocation'
import { clearCourseEditSession, readCourseBuilder, readCourseDraft, readCourseEditSession, writeCourseBuilder, writeCourseDraft, writeCourseEditSession } from '../utils/courseDraft'

const asEventStop = event => ({ ...event, stopId: `event:${event.eventId}`, stopType: 'EVENT' })
const asPlaceStop = place => ({ ...place, stopId: `place:${place.placeId}`, stopType: 'PLACE' })

async function hydrateCoursePlaces(course) {
  if (!course?.stops) return course
  const stops = await Promise.all(course.stops.map(async stop => {
    if (stop.stopType === 'EVENT' || !stop.placeId) return stop
    try {
      const place = await getPlaceDetails(stop.placeId, stop.placeType)
      return place ? { ...stop, ...place, stopId: stop.stopId, stopType: 'PLACE', placeType: stop.placeType } : stop
    } catch {
      return stop
    }
  }))
  return { ...course, stops }
}

function moveItem(items, from, to) {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function SpotImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  return src && !failed ? (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  ) : (
    <div role="img" aria-label={`${alt} 이미지 없음`} className={`flex items-center justify-center bg-[#F3F4F6] text-2xl ${className}`}>🗺️</div>
  )
}

function StopCard({ stop, index, total, onMove, onRemove, onDragStart, onDrop }) {
  const isEvent = stop.stopType === 'EVENT'
  const label = isEvent ? '행사' : stop.placeType === 'restaurant' ? '음식점' : '카페'
  const badge = isEvent ? 'bg-[#FFF0EC] text-[#FF6B47]' : stop.placeType === 'restaurant' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E6FAF7] text-[#008F75]'
  return (
    <li draggable onDragStart={() => onDragStart(index)} onDragOver={event => event.preventDefault()} onDrop={() => onDrop(index)}
      className="relative grid min-w-0 max-w-full grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm md:flex">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
        {isEvent
          ? <SpotImage src={stop.imageUrl || stop.img} alt={stop.title} className="h-full w-full" />
          : <GooglePlacePhoto place={stop} alt={stop.name} imageClassName="h-16 w-16" />}
        <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A2E] text-[11px] font-black text-white">{index + 1}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{label}</span>
          {!isEvent && stop.rating != null && <span className="text-xs text-[#6B7280]">★ {stop.rating} ({stop.userRatingCount.toLocaleString('ko-KR')})</span>}
        </div>
        <h3 className="truncate text-sm font-bold text-[#1A1A2E]">{isEvent ? stop.title : stop.name}</h3>
        <p className="mt-1 truncate text-xs text-[#6B7280]">📍 {isEvent ? stop.place || '장소 확인 필요' : stop.address || '주소 정보 없음'}</p>
        {!isEvent && <OpeningHours spot={stop} className="mt-1" />}
        {!isEvent && <GoogleMapsAttribution place={stop} className="mt-1" />}
      </div>
      <div className="col-span-2 flex flex-shrink-0 items-center justify-end gap-1 md:col-span-1" aria-label={`${isEvent ? stop.title : stop.name} 순서 변경`}>
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
    <article className="min-w-0 max-w-full rounded-2xl border border-[#E5E7EB] bg-white">
      <GooglePlacePhoto place={place} alt={place.name} imageClassName="aspect-video w-full rounded-t-2xl" eagerLoad />
      <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${restaurant ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E6FAF7] text-[#008F75]'}`}>{restaurant ? '음식점' : '카페'}</span>
          <h3 className="mt-2 truncate text-sm font-bold text-[#1A1A2E]">{place.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{place.address || '주소 정보 없음'}</p>
        </div>
        {place.openNow != null && <span className={`flex-shrink-0 text-[11px] font-semibold ${place.openNow ? 'text-[#008F75]' : 'text-[#9CA3AF]'}`}>{place.openNow ? '영업 중' : '영업 종료'}</span>}
      </div>
      <OpeningHours spot={place} />
      <GoogleMapsAttribution place={place} className="mt-2" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-[#6B7280]">{place.rating != null ? `★ ${place.rating} · 리뷰 ${place.userRatingCount.toLocaleString('ko-KR')}` : '평점 정보 없음'}</p>
        <div className="ml-auto flex flex-shrink-0 gap-2">
          {place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#F3F4F6] px-2.5 py-2 text-xs font-semibold text-[#374151]">지도</a>}
          <button type="button" disabled={added} onClick={() => onAdd(place)} className="rounded-lg bg-[#1A1A2E] px-3 py-2 text-xs font-bold text-white disabled:bg-[#D1D5DB]">{added ? '추가됨' : '+ 추가'}</button>
        </div>
      </div>
      </div>
    </article>
  )
}

function formatCourseDate(value) {
  if (!value) return '저장 날짜 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date)
}

function getCourseStopKind(stop) {
  const type = String(stop?.type ?? stop?.stopType ?? '').toLowerCase()
  const placeType = String(stop?.placeType ?? '').toLowerCase()
  if (type === 'event') return 'event'
  if (type === 'restaurant' || placeType === 'restaurant') return 'restaurant'
  return 'cafe'
}

function CourseCard({ course, onOpen, onToggleFavorite }) {
  const courseId = course.courseId ?? course.id
  const name = course.name ?? course.title ?? '이름 없는 코스'
  const stops = Array.isArray(course.previewStops) ? course.previewStops : Array.isArray(course.stops) ? course.stops : []
  const stopCount = course.stopCount ?? stops.length
  const favorite = Boolean(course.favorite ?? course.favorited ?? course.isFavorite)
  const availablePreviewStops = stops.length > 0
    ? stops
    : course.firstEventImageUrl
      ? [{ stopId: 'first-event', stopType: 'EVENT', title: course.firstEventTitle || '첫 행사', imageUrl: course.firstEventImageUrl }]
      : []
  const previewStops = availablePreviewStops.slice(0, 4)
  const remainingCount = Math.max(stopCount, availablePreviewStops.length) - previewStops.length

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold text-[#1A1A2E]">{name}</h3>
          <p className="mt-1 text-xs text-[#9CA3AF]">장소 {stopCount}곳 · {formatCourseDate(course.createdAt ?? course.savedAt)}</p>
        </div>
        <button type="button" aria-label={`${name} ${favorite ? '관심 코스 해제' : '관심 코스 등록'}`}
          aria-pressed={favorite} onClick={() => onToggleFavorite(courseId, !favorite)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF8E7] text-lg">
          {favorite ? '⭐' : '☆'}
        </button>
      </div>

      {previewStops.length > 0 ? (
        <div className="mt-4 flex items-center gap-1 overflow-x-auto hide-scrollbar" aria-label={`${name} 코스 미리보기`}>
          {previewStops.map((stop, index) => (
            <div key={stop.stopId ?? `${stop.type}-${stop.eventId ?? stop.placeId}-${index}`} className="flex flex-shrink-0 items-center gap-1">
              <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-[#E5E7EB]">
                {getCourseStopKind(stop) === 'event'
                  ? <SpotImage src={stop.imageUrl || stop.img || stop.eventImageUrl} alt={stop.name ?? stop.title ?? '행사'} className="h-full w-full" />
                  : <div role="img" aria-label={getCourseStopKind(stop) === 'restaurant' ? '음식점' : '카페'}
                    className={`flex h-full w-full items-center justify-center text-xl ${getCourseStopKind(stop) === 'restaurant' ? 'bg-[#FFF2C7]' : 'bg-[#DDF7F1]'}`}>
                    {getCourseStopKind(stop) === 'restaurant' ? '🍽️' : '☕'}
                  </div>}
                <span className="absolute bottom-0 left-0 right-0 bg-black/55 py-0.5 text-center text-[9px] font-bold text-white">
                  {getCourseStopKind(stop) === 'event' ? '행사' : getCourseStopKind(stop) === 'restaurant' ? '음식점' : '카페'}
                </span>
              </div>
              {(index < previewStops.length - 1 || remainingCount > 0) && <span className="text-[10px] leading-none text-[#D1D5DB]">→</span>}
            </div>
          ))}
          {remainingCount > 0 && <span aria-label={`남은 장소 ${remainingCount}곳`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-xs font-bold text-[#6B7280]">
            +{remainingCount}
          </span>}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-[#F8F8F6] px-3 py-3 text-xs text-[#6B7280]">코스 상세에서 전체 동선을 확인할 수 있어요.</p>
      )}
      <button type="button" onClick={() => onOpen(course)}
        className="mt-4 w-full rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-bold text-[#374151]">
        상세 보기
      </button>
    </article>
  )
}

function CourseDetail({ course, loading, error, action, onBack, onToggleFavorite, onEdit, onDelete, onToggleShare, onCopyShare }) {
  const courseId = course?.courseId ?? course?.id
  const name = course?.name ?? course?.title ?? '이름 없는 코스'
  const stops = Array.isArray(course?.stops) ? [...course.stops].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
  const favorite = Boolean(course?.favorite ?? course?.favorited ?? course?.isFavorite)

  return (
    <main className="mx-auto max-w-3xl px-5 py-6 md:px-8 lg:px-10">
      <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 text-sm font-bold text-[#6B7280]">
        <span aria-hidden="true">←</span> 내 코스
      </button>

      {loading ? (
        <p role="status" className="rounded-2xl bg-white px-6 py-16 text-center text-sm text-[#6B7280] shadow-sm">코스 상세를 불러오고 있어요.</p>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-[#FFF0EC] p-4 text-sm text-[#B42318]">{error}</p>
      ) : (
        <>
          <section className="mb-5 rounded-2xl bg-[#1A1A2E] p-5 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF8A70]">Saved course</p>
                <h2 className="mt-2 font-display text-2xl font-bold">{name}</h2>
                <p className="mt-2 text-sm text-white/60">장소 {stops.length || course?.stopCount || 0}곳 · {formatCourseDate(course?.createdAt ?? course?.savedAt)}</p>
              </div>
              <button type="button" aria-label={`${name} ${favorite ? '관심 코스 해제' : '관심 코스 등록'}`}
                aria-pressed={favorite} onClick={() => onToggleFavorite(courseId, !favorite)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                {favorite ? '⭐' : '☆'}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <button type="button" onClick={() => onEdit(course)} disabled={action.loading}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1A1A2E] disabled:opacity-50">수정</button>
              <button type="button" onClick={onDelete} disabled={action.loading}
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">삭제</button>
              <button type="button" onClick={() => onToggleShare(!course?.shareId)} disabled={action.loading}
                className="rounded-xl bg-[#FF6B47] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {course?.shareId ? '공유 중지' : '공유 링크 만들기'}
              </button>
            </div>
            {course?.shareId && <div className="mt-3 rounded-xl bg-white/10 p-3">
              <p className="mb-2 text-xs font-semibold text-white/70">공유 링크</p>
              <div className="flex gap-2">
                <input readOnly aria-label="공유 링크" value={`${window.location.origin}/shared/courses/${course.shareId}`}
                  className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-xs text-[#374151]" />
                <button type="button" onClick={onCopyShare} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E]">복사</button>
              </div>
            </div>}
            {action.message && <p role="status" className="mt-3 text-sm text-[#B9F6E9]">{action.message}</p>}
            {action.error && <p role="alert" className="mt-3 text-sm text-[#FFD2C7]">{action.error}</p>}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1A1A2E]">코스 동선</h3>
                <p className="mt-1 text-xs text-[#6B7280]">저장한 순서대로 표시됩니다.</p>
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#6B7280]">{stops.length}곳</span>
            </div>

            {stops.length > 0 ? (
              <ol className="space-y-3">
                {stops.map((stop, index) => {
                  const isEvent = String(stop.type ?? stop.stopType).toUpperCase() === 'EVENT'
                  const label = isEvent ? '행사' : String(stop.placeType).toUpperCase() === 'RESTAURANT' ? '음식점' : '카페'
                  return (
                    <li key={stop.stopId ?? `${stop.type}-${stop.eventId ?? stop.placeId}-${index}`}
                      className={`relative flex gap-3 rounded-2xl border border-[#E5E7EB] p-4 ${isEvent ? 'transition-colors hover:border-[#FF8A70] hover:bg-[#FFFDFC]' : ''}`}>
                      {isEvent && stop.eventId && <Link to={`/events/${encodeURIComponent(stop.eventId)}`} state={{ returnTo: '/course?tab=library' }}
                        aria-label={`${stop.name ?? stop.title ?? label} 상세 보기`}
                        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B47]">
                        <span className="sr-only">{stop.name ?? stop.title ?? label} 상세 보기</span>
                      </Link>}
                      <div className="w-20 flex-shrink-0">
                        {isEvent
                          ? <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                            <SpotImage src={stop.imageUrl || stop.img} alt={stop.name ?? stop.title ?? label} className="h-full w-full" />
                            <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B47] text-[11px] font-black text-white">{index + 1}</span>
                          </div>
                          : <GooglePlacePhoto place={stop} alt={stop.name ?? label} imageClassName="h-20 w-20 rounded-xl" autoLoad>
                            <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B47] text-[11px] font-black text-white">{index + 1}</span>
                          </GooglePlacePhoto>}
                      </div>
                      <div className="min-w-0">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isEvent ? 'bg-[#FFF0EC] text-[#FF6B47]' : 'bg-[#E6FAF7] text-[#008F75]'}`}>{label}</span>
                        <p className="mt-1.5 font-bold text-[#1A1A2E]">{stop.name ?? stop.title ?? `${label} ${index + 1}`}</p>
                        {(stop.address ?? stop.place) && <p className="mt-1 text-xs text-[#6B7280]">📍 {stop.address ?? stop.place}</p>}
                        {!isEvent && <OpeningHours spot={stop} className="mt-1" />}
                        {!isEvent && <GoogleMapsAttribution place={stop} className="mt-2" />}
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="rounded-xl bg-[#F8F8F6] px-4 py-8 text-center text-sm text-[#6B7280]">저장된 상세 동선이 없습니다.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function CourseLibrary({ onEdit }) {
  const [filter, setFilter] = useState('all')
  const [request, setRequest] = useState({ loading: true, courses: [], error: '' })
  const [detail, setDetail] = useState({ course: null, loading: false, error: '' })
  const [action, setAction] = useState({ loading: false, message: '', error: '' })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const detailRequest = useRef(null)

  useEffect(() => () => detailRequest.current?.abort(), [])

  useEffect(() => {
    const controller = new AbortController()
    getCourses(controller.signal)
      .then(courses => setRequest({ loading: false, courses, error: '' }))
      .catch(error => {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          setRequest({ loading: false, courses: [], error: '코스 내역을 불러오지 못했습니다.' })
        }
      })
    return () => controller.abort()
  }, [])

  const toggleFavorite = async (courseId, favorite) => {
    const previous = request.courses
    setRequest(current => ({
      ...current,
      courses: current.courses.map(course => String(course.courseId ?? course.id) === String(courseId)
        ? { ...course, favorite, favorited: favorite, isFavorite: favorite }
        : course),
      error: '',
    }))
    try {
      const updated = await updateCourseFavorite(courseId, favorite)
      setDetail(current => current.course && String(current.course.courseId ?? current.course.id) === String(courseId)
        ? { ...current, course: {
          ...current.course,
          ...updated,
          stops: current.course.stops,
          favorite,
          favorited: favorite,
          isFavorite: favorite,
        } }
        : current)
    } catch {
      setRequest({ loading: false, courses: previous, error: '관심 코스 상태를 변경하지 못했습니다.' })
    }
  }

  const openCourse = course => {
    const courseId = course.courseId ?? course.id
    detailRequest.current?.abort()
    const controller = new AbortController()
    detailRequest.current = controller
    setDetail({ course, loading: true, error: '' })
    getCourseDetail(courseId, controller.signal)
      .then(data => hydrateCoursePlaces(data || course))
      .then(data => {
        if (controller.signal.aborted) return
        setDetail({ course: data || course, loading: false, error: '' })
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetail({ course, loading: false, error: '코스 상세를 불러오지 못했습니다.' })
      })
  }

  const closeCourse = () => {
    detailRequest.current?.abort()
    setDetail({ course: null, loading: false, error: '' })
  }

  const removeCourse = async () => {
    const courseId = detail.course?.courseId ?? detail.course?.id
    setAction({ loading: true, message: '', error: '' })
    try {
      await deleteCourse(courseId)
      setRequest(current => ({ ...current, courses: current.courses.filter(course => String(course.courseId ?? course.id) !== String(courseId)) }))
      setDeleteOpen(false)
      setDetail({ course: null, loading: false, error: '' })
      setAction({ loading: false, message: '', error: '' })
    } catch (error) {
      setAction({ loading: false, message: '', error: getCourseError(error, '삭제') })
    }
  }

  const toggleShare = async enabled => {
    const courseId = detail.course?.courseId ?? detail.course?.id
    setAction({ loading: true, message: '', error: '' })
    try {
      if (enabled) {
        const result = await shareCourse(courseId)
        setDetail(current => ({ ...current, course: { ...current.course, shareId: result.shareId, shared: true } }))
        setAction({ loading: false, message: '공유 링크를 만들었어요.', error: '' })
      } else {
        await unshareCourse(courseId)
        setDetail(current => ({ ...current, course: { ...current.course, shareId: null, shared: false } }))
        setAction({ loading: false, message: '공유를 중지했어요.', error: '' })
      }
      setRequest(current => ({ ...current, courses: current.courses.map(course => String(course.courseId ?? course.id) === String(courseId)
        ? { ...course, shared: enabled }
        : course) }))
    } catch (error) {
      setAction({ loading: false, message: '', error: getCourseError(error, enabled ? '공유' : '공유 해제') })
    }
  }

  const copyShare = async () => {
    const url = `${window.location.origin}/shared/courses/${detail.course.shareId}`
    try {
      await navigator.clipboard.writeText(url)
      setAction({ loading: false, message: '공유 링크를 복사했어요.', error: '' })
    } catch {
      setAction({ loading: false, message: '', error: '링크를 복사하지 못했습니다. 주소를 직접 복사해 주세요.' })
    }
  }

  const visibleCourses = filter === 'favorite'
    ? request.courses.filter(course => course.favorite ?? course.favorited ?? course.isFavorite)
    : request.courses

  if (detail.course) {
    return <>
      <CourseDetail course={detail.course} loading={detail.loading} error={detail.error} action={action}
        onBack={closeCourse} onToggleFavorite={toggleFavorite}
        onEdit={onEdit} onDelete={() => setDeleteOpen(true)} onToggleShare={toggleShare} onCopyShare={copyShare} />
      {deleteOpen && <EventDialog title="코스 삭제" id="course-delete-title" onClose={() => !action.loading && setDeleteOpen(false)}>
        <p className="text-sm text-[#6B7280]">이 코스를 삭제하면 다시 복구할 수 없습니다. 삭제할까요?</p>
        {action.error && <p role="alert" className="mt-3 text-sm text-[#B42318]">{action.error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={action.loading} onClick={() => setDeleteOpen(false)} className="rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold">취소</button>
          <button type="button" disabled={action.loading} onClick={removeCourse} className="rounded-xl bg-[#B42318] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{action.loading ? '삭제 중...' : '삭제'}</button>
        </div>
      </EventDialog>}
    </>
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-6 md:px-8 lg:px-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1A1A2E]">내 코스</h2>
          <p className="mt-1 text-sm text-[#6B7280]">만든 코스를 다시 확인하고 관심 코스로 모아보세요.</p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#6B7280] shadow-sm">{request.courses.length}개</span>
      </div>

      <div className="mb-5 inline-flex rounded-xl bg-[#EDEDEA] p-1" aria-label="내 코스 필터">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}
          className={`rounded-lg px-5 py-2 text-sm font-bold ${filter === 'all' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>전체</button>
        <button type="button" aria-pressed={filter === 'favorite'} onClick={() => setFilter('favorite')}
          className={`rounded-lg px-5 py-2 text-sm font-bold ${filter === 'favorite' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>⭐ 관심만 보기</button>
      </div>

      {request.error && <p role="alert" className="mb-4 rounded-xl bg-[#FFF0EC] p-4 text-sm text-[#B42318]">{request.error}</p>}
      {request.loading ? (
        <p role="status" className="rounded-2xl bg-white px-6 py-16 text-center text-sm text-[#6B7280] shadow-sm">코스 내역을 불러오고 있어요.</p>
      ) : visibleCourses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map(course => <CourseCard key={course.courseId ?? course.id} course={course}
            onOpen={openCourse} onToggleFavorite={toggleFavorite} />)}
        </div>
      ) : (
        <section className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="text-5xl" aria-hidden="true">{filter === 'favorite' ? '⭐' : '🗺️'}</span>
          <h3 className="mt-5 text-lg font-bold text-[#1A1A2E]">{filter === 'favorite' ? '관심 코스가 없어요' : '아직 만든 코스가 없어요'}</h3>
          <p className="mt-2 text-sm text-[#6B7280]">{filter === 'favorite' ? '마음에 드는 코스의 별을 눌러 모아보세요.' : '코스 만들기에서 첫 번째 동선을 만들어 보세요.'}</p>
        </section>
      )}
    </main>
  )
}

export default function Course() {
  const location = useLocation()
  const initialEvents = useMemo(() => readCourseDraft(), [])
  const initialBuilder = useMemo(() => readCourseBuilder(), [])
  const initialEditSession = useMemo(() => readCourseEditSession(), [])
  const [stops, setStops] = useState(() => {
    const eventIds = new Set(initialEvents.map(event => String(event.eventId)))
    const savedStops = initialBuilder.stops.filter(stop => stop?.stopType === 'PLACE' || (stop?.stopType === 'EVENT' && eventIds.has(String(stop.eventId))))
    const savedEventIds = new Set(savedStops.filter(stop => stop.stopType === 'EVENT').map(stop => String(stop.eventId)))
    return [...savedStops, ...initialEvents.filter(event => !savedEventIds.has(String(event.eventId))).map(asEventStop)]
  })
  const [title, setTitle] = useState(initialBuilder.title)
  const [placeType, setPlaceType] = useState('cafe')
  const [placeRequest, setPlaceRequest] = useState({ loading: false, places: [], error: null, isMock: false, searched: false })
  const [visibleCount, setVisibleCount] = useState(5)
  const [dragIndex, setDragIndex] = useState(null)
  const [saveState, setSaveState] = useState({ loading: false, message: '', error: '' })
  const [titleError, setTitleError] = useState('')
  const [coordinateLoading, setCoordinateLoading] = useState(false)
  const [pageTab, setPageTab] = useState(() => new URLSearchParams(location.search).get('tab') === 'library' ? 'library' : 'builder')
  const [editingCourse, setEditingCourse] = useState(() => (initialBuilder.title.trim() || initialBuilder.stops.length) ? initialEditSession : null)
  const [segmentIndex, setSegmentIndex] = useState(0)
  const coordinateAttempts = useRef(new Set())
  const titleInputRef = useRef(null)
  const events = stops.filter(stop => stop.stopType === 'EVENT')
  const segments = events.slice(0, -1).map((event, index) => ({ from: event, to: events[index + 1], index }))
  const selectedSegment = segments[segmentIndex] || segments[0] || null
  const singleEventCenter = events.length === 1 ? getEventCoordinates(events[0]) : null
  const selectedSegmentLocated = selectedSegment
    ? Boolean(getEventCoordinates(selectedSegment.from) && getEventCoordinates(selectedSegment.to))
    : false
  const canSearchPlaces = events.length === 1 ? Boolean(singleEventCenter) : Boolean(selectedSegment && selectedSegmentLocated)
  const visiblePlaces = placeRequest.places.filter(place => place.placeType === placeType)

  const resetPlaceResults = () => setPlaceRequest({ loading: false, places: [], error: null, isMock: false, searched: false })

  useEffect(() => {
    writeCourseDraft(events)
  // 행사 추가·삭제 시에만 초안을 동기화합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.map(stop => stop.eventId).join('|')])

  useEffect(() => { writeCourseBuilder({ title, stops }) }, [title, stops])

  useEffect(() => {
    const pending = stops.filter(stop => stop.stopType === 'PLACE' && stop.placeId && !stop.name)
    if (!pending.length) return
    const controller = new AbortController()
    Promise.all(pending.map(stop => getPlaceDetails(stop.placeId, stop.placeType)
      .then(place => ({ stopId: stop.stopId, place }))
      .catch(() => null)))
      .then(results => {
        if (controller.signal.aborted) return
        setStops(items => items.map(stop => {
          const result = results.find(item => item?.stopId === stop.stopId)
          return result?.place ? { ...stop, ...result.place, stopId: stop.stopId, stopType: 'PLACE' } : stop
        }))
      })
    return () => controller.abort()
  // 저장된 장소 참조가 화면 상태로 복원됐을 때 한 번만 상세를 보완합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.filter(stop => stop.stopType === 'PLACE' && !stop.name).map(stop => stop.stopId).join('|')])

  useEffect(() => {
    setSegmentIndex(0)
    resetPlaceResults()
  // 행사 순서가 달라지면 구간과 이전 검색 결과를 초기화합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.map(event => event.eventId).join('|')])

  useEffect(() => {
    const missingEvents = events.filter(event => (!getEventCoordinates(event) || !(event.imageUrl || event.img))
      && !coordinateAttempts.current.has(String(event.eventId)))
    if (!missingEvents.length) return
    missingEvents.forEach(event => coordinateAttempts.current.add(String(event.eventId)))
    const controller = new AbortController()
    setCoordinateLoading(true)
    Promise.all(missingEvents.map(source => getEventDetail(String(source.eventId), controller.signal)
      .then(result => ({ eventId: source.eventId, event: result.event }))
      .catch(() => null)))
      .then(results => setStops(items => items.map(stop => {
        if (stop.stopType !== 'EVENT') return stop
        const detail = results.find(result => String(result?.eventId) === String(stop.eventId))?.event
        return detail ? { ...stop, ...detail } : stop
      })))
      .finally(() => { if (!controller.signal.aborted) setCoordinateLoading(false) })
    return () => controller.abort()
  // 좌표나 이미지가 없는 행사가 추가됐을 때만 상세 정보를 보완합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.map(event => `${event.eventId}:${getEventCoordinates(event) ? 'located' : 'missing'}:${event.imageUrl || event.img ? 'image' : 'no-image'}`).join('|')])

  const searchPlaces = () => {
    if (!canSearchPlaces || placeRequest.loading) return
    const controller = new AbortController()
    setVisibleCount(5)
    setPlaceRequest({ loading: true, places: [], error: null, isMock: false, searched: false })
    const request = events.length === 1
      ? getNearbyPlaces({ ...singleEventCenter, types: [placeType], radius: 1500, maxResults: 20 }, controller.signal)
      : getPlacesBetween({ eventId1: selectedSegment.from.eventId, eventId2: selectedSegment.to.eventId, type: placeType }, controller.signal)
        .then(places => ({ places, isMock: false }))
    request
      .then(result => setPlaceRequest({ loading: false, places: result.places, error: null, isMock: result.isMock, searched: true }))
      .catch(error => { if (!controller.signal.aborted) setPlaceRequest({ loading: false, places: [], error, isMock: false, searched: true }) })
  }

  const selectPlaceType = type => {
    setPlaceType(type)
    setVisibleCount(5)
    resetPlaceResults()
  }

  const selectSegment = index => {
    setSegmentIndex(index)
    setVisibleCount(5)
    resetPlaceResults()
  }

  const moveStop = (from, to) => setStops(items => moveItem(items, from, to))
  const removeStop = stopId => setStops(items => items.filter(item => item.stopId !== stopId))
  const addPlace = place => setStops(items => items.some(item => item.stopId === `place:${place.placeId}`) ? items : [...items, asPlaceStop(place)])
  const dropStop = index => {
    if (dragIndex != null) moveStop(dragIndex, index)
    setDragIndex(null)
  }

  const editCourse = course => {
    setStops(Array.isArray(course.stops) ? course.stops : [])
    setTitle(course.title ?? course.name ?? '')
    const editSession = { courseId: course.courseId ?? course.id, version: course.version }
    setEditingCourse(editSession)
    writeCourseEditSession(editSession)
    setPlaceRequest({ loading: false, places: [], error: null, isMock: false, searched: false })
    setSaveState({ loading: false, message: '', error: '' })
    setTitleError('')
    setPageTab('builder')
  }

  const clearCourseDraft = () => {
    setTitle('')
    setStops([])
    setPlaceType('cafe')
    setSegmentIndex(0)
    setVisibleCount(5)
    setPlaceRequest({ loading: false, places: [], error: null, isMock: false, searched: false })
    coordinateAttempts.current.clear()
    setTitleError('')
    writeCourseDraft([])
    writeCourseBuilder({ title: '', stops: [] })
    clearCourseEditSession()
  }

  const cancelEdit = () => {
    clearCourseDraft()
    setEditingCourse(null)
    setSaveState({ loading: false, message: '', error: '' })
    setPageTab('library')
  }

  const save = async event => {
    event.preventDefault()
    const name = title.trim()
    if (!name) {
      setTitleError('코스 이름을 입력해 주세요.')
      setSaveState({ loading: false, message: '', error: '' })
      requestAnimationFrame(() => {
        titleInputRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        titleInputRef.current?.focus({ preventScroll: true })
      })
      return
    }
    setTitleError('')
    if (!events.length) { setSaveState({ loading: false, message: '', error: '행사를 한 개 이상 담아 주세요.' }); return }
    if (stops.length > 20) { setSaveState({ loading: false, message: '', error: '코스에는 장소를 최대 20개까지 담을 수 있습니다.' }); return }
    const payload = { title: name, stops }
    setSaveState({ loading: true, message: '', error: '' })
    try {
      if (editingCourse) await updateCourse(editingCourse.courseId, { ...payload, version: editingCourse.version })
      else await createCourse(payload)
      setEditingCourse(null)
      clearCourseDraft()
      setSaveState({ loading: false, message: '', error: '' })
      setPageTab('library')
    } catch (error) {
      setSaveState({ loading: false, message: '', error: getCourseError(error) })
    }
  }

  return (
    <div className="min-h-full bg-[#FAFAF8] pb-12">
      <header className="sticky top-0 z-30 bg-[#1A1A2E] px-5 pb-7 pt-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF8A70]">My course</p>
          <h1 className="font-display text-3xl font-bold text-white">코스</h1>
          <p className="mt-2 text-sm text-white/60">나만의 동선을 만들고 저장한 코스를 한곳에서 관리하세요.</p>
        </div>
      </header>

      <nav className="border-b border-[#E5E7EB] bg-white px-5 py-3 md:px-8 lg:px-10" aria-label="코스 메뉴">
        <div className="mx-auto flex max-w-6xl gap-1 rounded-xl bg-[#F3F4F6] p-1">
          <button type="button" aria-pressed={pageTab === 'builder'} onClick={() => setPageTab('builder')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${pageTab === 'builder' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>
            🗺️ 코스 만들기
          </button>
          <button type="button" aria-pressed={pageTab === 'library'} onClick={() => setPageTab('library')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${pageTab === 'library' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>
            📚 내 코스
          </button>
        </div>
      </nav>

      {pageTab === 'builder' ? (
      <main className="mx-auto w-full min-w-0 max-w-6xl px-5 py-6 md:px-8 lg:px-10">
        {!events.length ? <section className="min-w-0 rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="text-5xl" aria-hidden="true">🗺️</span>
          <h2 className="mt-5 text-lg font-bold text-[#1A1A2E]">코스에 담긴 행사가 없어요</h2>
          <p className="mt-2 text-sm text-[#6B7280]">행사 목록에서 가고 싶은 행사를 먼저 담아 주세요.</p>
          {saveState.message && <p role="status" className="mt-3 text-sm font-semibold text-[#008F75]">{saveState.message}</p>}
          <Link to="/events" className="mt-6 inline-block rounded-xl bg-[#FF6B47] px-5 py-3 text-sm font-bold text-white">행사 둘러보기</Link>
        </section> : <form onSubmit={save} className="min-w-0 max-w-full">
          <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="course-title" className="block text-sm font-bold text-[#1A1A2E]">코스 이름</label>
              {editingCourse && <span className="rounded-full bg-[#FFF0EC] px-3 py-1 text-xs font-bold text-[#FF6B47]">수정 중</span>}
            </div>
            <input ref={titleInputRef} id="course-title" value={title} onChange={event => {
              setTitle(event.target.value)
              if (titleError) setTitleError('')
            }} maxLength={50} placeholder="예: 성수 전시와 카페 산책" aria-invalid={Boolean(titleError)} aria-describedby={titleError ? 'course-title-error' : undefined}
              className={`w-full rounded-xl border bg-[#FAFAF8] px-4 py-3 text-sm outline-none ${titleError ? 'border-[#B42318] focus:border-[#B42318]' : 'border-[#E5E7EB] focus:border-[#FF6B47]'}`} />
            {titleError && <p id="course-title-error" role="alert" className="mt-1.5 text-xs text-[#B42318]">{titleError}</p>}
          </section>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <section aria-labelledby="route-title" className="min-w-0 max-w-full rounded-2xl bg-white p-4 shadow-sm md:p-5">
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

            <section aria-labelledby="places-title" className="min-w-0 max-w-full self-start rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-[10rem]">
              <div className="mb-4"><h2 id="places-title" className="font-bold text-[#1A1A2E]">코스 주변 장소</h2><p className="mt-1 text-xs text-[#6B7280]">행사 순서대로 구간을 선택하고 카페 또는 음식점을 검색해 보세요.</p></div>
              {segments.length > 0 && <div className="mb-4">
                <label htmlFor="course-search-segment" className="mb-2 block text-xs font-bold text-[#1A1A2E]">검색할 행사 구간</label>
                <select id="course-search-segment" value={segmentIndex} onChange={event => selectSegment(Number(event.target.value))}
                  className="min-w-0 w-full max-w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-semibold text-[#374151] outline-none focus:border-[#FF6B47]">
                  {segments.map(segment => <option key={`${segment.from.eventId}-${segment.to.eventId}`} value={segment.index}>
                    구간 {segment.index + 1} · {segment.index + 1}순위 {segment.from.title} → {segment.index + 2}순위 {segment.to.title}
                  </option>)}
                </select>
                <p className="mt-2 text-[11px] text-[#9CA3AF]">선택한 두 행사 사이의 중점과 구간 거리를 기준으로 검색합니다.</p>
              </div>}
              <div className="mb-4 grid grid-cols-2 rounded-xl bg-[#F3F4F6] p-1">
                <button type="button" aria-pressed={placeType === 'cafe'} onClick={() => selectPlaceType('cafe')} className={`rounded-lg py-2 text-sm font-bold ${placeType === 'cafe' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>☕ 카페</button>
                <button type="button" aria-pressed={placeType === 'restaurant'} onClick={() => selectPlaceType('restaurant')} className={`rounded-lg py-2 text-sm font-bold ${placeType === 'restaurant' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>🍽 음식점</button>
              </div>
              <div className="rounded-xl bg-[#F8F8F6] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A1A2E]">검색 기준</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{events.length === 1 ? '선택 행사 주변 · 반경 1.5km' : `구간 ${segmentIndex + 1}의 두 행사 사이`}</p>
                  </div>
                  <button type="button" onClick={searchPlaces} disabled={!canSearchPlaces || coordinateLoading || placeRequest.loading}
                    className="w-full flex-shrink-0 rounded-xl bg-[#FF6B47] px-4 py-2.5 text-xs font-bold text-white disabled:bg-[#D1D5DB] sm:w-auto">
                    {placeRequest.loading ? '검색 중...' : placeType === 'cafe' ? '카페 검색' : '음식점 검색'}
                  </button>
                </div>
                {events.length === 1 && singleEventCenter && <p className="mt-2 text-[11px] text-[#9CA3AF]">행사 위치를 기준으로 검색합니다.</p>}
                {events.length > 1 && selectedSegment && <p className="mt-2 text-[11px] text-[#9CA3AF]">{selectedSegment.from.title}과(와) {selectedSegment.to.title}의 중점과 구간 거리를 기준으로 검색합니다.</p>}
              </div>

              {coordinateLoading && <p role="status" className="rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">행사 위치를 확인하고 있어요.</p>}
              {!coordinateLoading && !canSearchPlaces && <div className="mt-4 rounded-xl bg-[#FFF8E7] p-4 text-sm text-[#92400E]">좌표가 없는 행사가 있어 해당 구간을 검색할 수 없어요. 위치 정보가 있는 행사로 구간을 구성해 주세요.</div>}
              {placeRequest.loading && <p role="status" className="rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">주변 장소를 찾고 있어요.</p>}
              {placeRequest.error && <p role="alert" className="rounded-xl bg-[#FFF0EC] p-4 text-sm text-[#B42318]">{getPlacesError(placeRequest.error)}</p>}
              {placeRequest.isMock && <DemoNotice />}
              {!placeRequest.loading && !placeRequest.error && !placeRequest.searched && <p className="mt-4 rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">{placeType === 'cafe' ? '카페' : '음식점'} 검색 버튼을 눌러 장소를 찾아보세요.</p>}
              {!placeRequest.loading && placeRequest.searched && visiblePlaces.length === 0 && <p className="mt-4 rounded-xl bg-[#F3F4F6] p-4 text-sm text-[#6B7280]">선택한 구간에서 {placeType === 'cafe' ? '카페' : '음식점'}을 찾지 못했어요.</p>}
              <div className="min-w-0 max-w-full space-y-3">
                {visiblePlaces.slice(0, visibleCount).map(place => <PlaceCard key={place.placeId} place={place}
                  added={stops.some(stop => stop.stopId === `place:${place.placeId}`)} onAdd={addPlace} />)}
              </div>
              {visibleCount < visiblePlaces.length && <button type="button" onClick={() => setVisibleCount(count => count + 5)} className="mt-3 w-full rounded-xl bg-[#F3F4F6] py-3 text-sm font-bold text-[#374151]">장소 더 보기</button>}
            </section>
          </div>

          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:p-5">
            <div aria-live="polite" className="mb-3 text-sm md:mb-0">
              {saveState.error && <p role="alert" className="text-[#B42318]">{saveState.error}</p>}
              {saveState.message && <p className="font-semibold text-[#008F75]">{saveState.message}</p>}
              {!saveState.error && !saveState.message && <p className="text-[#6B7280]">행사 {events.length}개 · 주변 장소 {stops.length - events.length}개</p>}
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              {editingCourse && <button type="button" disabled={saveState.loading} onClick={cancelEdit}
                className="flex-1 rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-bold text-[#6B7280] disabled:opacity-50">수정 취소</button>}
              <button type="submit" disabled={saveState.loading} className="flex-1 whitespace-nowrap rounded-xl bg-[#FF6B47] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 md:w-auto">
                {saveState.loading ? '저장 중...' : editingCourse ? '수정 내용 저장' : '이 코스 저장하기'}
              </button>
            </div>
          </section>
        </form>}
      </main>
      ) : <CourseLibrary onEdit={editCourse} />}
    </div>
  )
}
