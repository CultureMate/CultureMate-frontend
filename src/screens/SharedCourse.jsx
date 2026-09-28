import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSharedCourse } from '../api/courses'
import { getPlaceDetails } from '../api/places'

function SharedStop({ stop, index }) {
  const event = stop.stopType === 'EVENT'
  const label = event ? '행사' : stop.placeType === 'restaurant' ? '음식점' : '카페'
  const title = event ? stop.title : stop.name
  const imageUrl = stop.imageUrl || stop.img
  return (
    <li className="flex gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6]">
        {imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          : <div role="img" aria-label={`${title} 이미지 없음`} className="flex h-full items-center justify-center text-2xl">🗺️</div>}
        <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B47] text-[11px] font-black text-white">{index + 1}</span>
      </div>
      <div className="min-w-0">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${event ? 'bg-[#FFF0EC] text-[#FF6B47]' : 'bg-[#E6FAF7] text-[#008F75]'}`}>{label}</span>
        <h2 className="mt-2 font-bold text-[#1A1A2E]">{title}</h2>
        {(stop.place || stop.address) && <p className="mt-1 text-xs text-[#6B7280]">📍 {stop.place || stop.address}</p>}
        {!event && stop.openNow != null && <p className="mt-1 text-xs text-[#6B7280]">{stop.openNow ? '현재 영업 중' : '현재 영업 종료'}</p>}
      </div>
    </li>
  )
}

async function loadPlaceDetails(course, signal) {
  const stops = await Promise.all((course?.stops || []).map(async stop => {
    if (stop.stopType === 'EVENT') return stop
    try {
      const place = await getPlaceDetails(stop.placeId, stop.placeType, signal)
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
        return loadPlaceDetails(course, controller.signal)
      })
      .then(course => setRequest({ loading: false, course, error: '', loginRequired: false }))
      .catch(error => {
        if (controller.signal.aborted) return
        const loginRequired = error.response?.status === 401
        setRequest({ loading: false, course: null, loginRequired,
          error: loginRequired ? '현재 서버에서는 공유 코스도 로그인 후 확인할 수 있습니다.' : '공유 코스를 찾을 수 없거나 공유가 중지되었습니다.' })
      })
    return () => controller.abort()
  }, [shareId])

  return (
    <div className="min-h-full bg-[#FAFAF8] pb-12">
      <header className="bg-[#1A1A2E] px-5 pb-8 pt-12 text-white md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF8A70]">Shared course</p>
          <h1 className="mt-2 font-display text-3xl font-bold">공유 코스</h1>
          <p className="mt-2 text-sm text-white/60">공유받은 코스를 읽기 전용으로 확인합니다.</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        {request.loading ? <p role="status" className="rounded-2xl bg-white px-6 py-16 text-center text-sm text-[#6B7280] shadow-sm">공유 코스를 불러오고 있어요.</p>
          : request.error ? <section className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
            <span className="text-4xl" aria-hidden="true">🔗</span>
            <p role="alert" className="mt-4 text-sm text-[#6B7280]">{request.error}</p>
            {request.loginRequired && <Link to="/login" className="mt-5 inline-block rounded-xl bg-[#FF6B47] px-5 py-3 text-sm font-bold text-white">로그인하기</Link>}
          </section>
          : <>
            <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-[#FF6B47]">읽기 전용</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#1A1A2E]">{request.course.title}</h2>
              <p className="mt-2 text-sm text-[#6B7280]">장소 {request.course.stops?.length || 0}곳</p>
            </section>
            <ol className="space-y-3">
              {request.course.stops.map((stop, index) => <SharedStop key={stop.stopId} stop={stop} index={index} />)}
            </ol>
          </>}
      </main>
    </div>
  )
}
