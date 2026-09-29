import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSharedCourse } from '../api/courses'
import { getPlaceDetails } from '../api/places'
import GooglePlacePhoto, { GoogleMapsAttribution } from '../components/GooglePlacePhoto'
import OpeningHours from '../components/OpeningHours'
import BrandMark from '../components/BrandMark'
import Icon from '../components/Icon'

function SharedStop({ stop, index, last }) {
  const event = stop.stopType === 'EVENT'
  const label = event ? '행사' : stop.placeType === 'restaurant' ? '음식점' : '카페'
  const title = event ? stop.title : stop.name
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      <div className="flex w-7 flex-shrink-0 flex-col items-center">
        <span className={`z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${event ? 'bg-coral' : 'bg-[#00A884]'}`}>{index + 1}</span>
        {!last && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-black/10" />}
      </div>
      <div className="flex min-w-0 flex-1 gap-4 rounded-2xl bg-white p-4 shadow-card">
        <div className="w-20 flex-shrink-0">
          {event ? <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#F2F4F6]">
            {stop.imageUrl || stop.img ? <img src={stop.imageUrl || stop.img} alt={title} loading="lazy" className="h-full w-full object-cover" />
              : <div role="img" aria-label={`${title} 이미지 없음`} className="flex h-full items-center justify-center text-ink-muted"><Icon name="ticket" size={24} /></div>}
          </div> : <GooglePlacePhoto place={stop} alt={title} imageClassName="h-20 w-20 rounded-xl" autoLoad />}
        </div>
        <div className="min-w-0">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${event ? 'bg-coral-light text-coral-dark' : 'bg-[#E6FAF7] text-[#008F75]'}`}>{label}</span>
          <h2 className="mt-2 font-bold leading-snug text-ink">{title}</h2>
          {(stop.place || stop.address) && <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted"><Icon name="pin" size={13} /><span className="truncate">{stop.place || stop.address}</span></p>}
          {!event && stop.openNow != null && <p className={`mt-1 text-xs font-semibold ${stop.openNow ? 'text-[#00A884]' : 'text-ink-muted'}`}>{stop.openNow ? '현재 영업 중' : '현재 영업 종료'}</p>}
          {!event && <OpeningHours spot={stop} className="mt-1" />}
          {!event && <GoogleMapsAttribution place={stop} className="mt-2" />}
        </div>
      </div>
    </li>
  )
}

async function loadPlaceDetails(course) {
  const stops = await Promise.all((course?.stops || []).map(async stop => {
    if (stop.stopType === 'EVENT') return stop
    try {
      const place = await getPlaceDetails(stop.placeId, stop.placeType)
      return place ? { ...stop, ...place, stopType: 'PLACE', placeType: stop.placeType } : stop
    } catch {
      return stop
    }
  }))
  return { ...course, stops }
}

export default function SharedCourse() {
  const { shareId } = useParams()
  const [request, setRequest] = useState({ loading: true, course: null, error: '', loginRequired: false })

  useEffect(() => {
    const controller = new AbortController()
    getSharedCourse(shareId, controller.signal)
      .then(course => {
        if (!course) throw Object.assign(new Error('not found'), { response: { status: 404 } })
        return loadPlaceDetails(course)
      })
      .then(course => {
        if (!controller.signal.aborted) setRequest({ loading: false, course, error: '', loginRequired: false })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        const loginRequired = error.response?.status === 401
        setRequest({ loading: false, course: null, loginRequired,
          error: loginRequired ? '현재 서버에서는 공유 코스도 로그인 후 확인할 수 있습니다.' : '공유 코스를 찾을 수 없거나 공유가 중지되었습니다.' })
      })
    return () => controller.abort()
  }, [shareId])

  return (
    <div className="min-h-full bg-canvas pb-12">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link to="/" aria-label="CultureMate 홈" className="flex items-center gap-2 md:hidden">
            <BrandMark size={32} />
            <span className="text-[15px] font-bold text-ink">CultureMate</span>
          </Link>
          <p aria-hidden="true" className="hidden text-lg font-bold text-ink md:block">공유 코스</p>
          <Link to="/course" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">나도 코스 만들기</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        <h1 className="sr-only">공유 코스</h1>
        {request.loading ? <div role="status" className="animate-pulse space-y-3">
            <span className="sr-only">공유 코스를 불러오고 있어요.</span>
            <div className="h-28 rounded-3xl bg-[#E9ECEF]" />
            <div className="h-28 rounded-2xl bg-[#E9ECEF]" />
            <div className="h-28 rounded-2xl bg-[#E9ECEF]" />
          </div>
          : request.error ? <section className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F4F6] text-ink-muted"><Icon name="route" size={26} /></span>
            <p role="alert" className="mt-4 text-sm leading-relaxed text-ink-soft">{request.error}</p>
            {request.loginRequired && <Link to="/login" className="mt-5 inline-block rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white">로그인하기</Link>}
          </section>
          : <>
            <section className="mb-6 overflow-hidden rounded-3xl bg-white shadow-card">
              <div className="bg-gradient-to-br from-[#FFF0EC] via-white to-white px-5 pb-5 pt-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-coral shadow-sm"><Icon name="share" size={12} strokeWidth={2.2} />공유받은 코스</span>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink">{request.course.title}</h2>
                <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
                  <span className="flex items-center gap-1"><Icon name="pin" size={14} />장소 {request.course.stops?.length || 0}곳</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1"><Icon name="eye" size={14} />읽기 전용</span>
                </div>
              </div>
            </section>
            <ol>
              {request.course.stops.map((stop, index) => <SharedStop key={stop.stopId} stop={stop} index={index} last={index === request.course.stops.length - 1} />)}
            </ol>
          </>}
      </main>
    </div>
  )
}
