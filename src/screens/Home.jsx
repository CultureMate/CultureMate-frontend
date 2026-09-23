import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHomeError, getHotEvents, getUpcomingEvents } from '../api/home'
import { CATEGORY_COLOR } from '../data/events'
import { ddayLabel, formatShortDate } from '../utils/eventDate'
import { getDataMode } from '../api/dataMode'
import DemoNotice from '../components/DemoNotice'

function eventPath(event) {
  return `/events/${encodeURIComponent(event.eventId)}`
}

function HotCard({ event }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color = CATEGORY_COLOR[event.category]?.text ?? '#FF6B47'
  return (
    <Link to={eventPath(event)} className="flex-shrink-0 w-[200px] md:w-auto rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform focus-visible:outline focus-visible:outline-[#FF6B47]">
      <div className="relative h-[130px] md:h-[160px] bg-gray-100">
        {event.imageUrl && !imageFailed ? (
          <img src={event.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F3EEFF] text-[#6B7280] text-sm">이미지 없음</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {event.category && <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold" style={{ backgroundColor: color }}>{event.category}</span>}
        <p className="absolute bottom-2 left-2.5 right-2.5 text-white font-semibold text-sm leading-tight line-clamp-2">{event.title || '제목 없음'}</p>
      </div>
      <div className="bg-white px-3 py-2.5">
        {event.place && <p className="text-[#6B7280] text-xs truncate">{event.place}</p>}
        <div className="flex items-center justify-between gap-2 mt-1">
          {event.startDate && <p className="text-[#1A1A2E] text-xs font-medium">{formatShortDate(event)}</p>}
          <p className="text-[#6B7280] text-[11px]">조회수 {Number.isFinite(event.viewCount) ? event.viewCount.toLocaleString('ko-KR') : '-'}</p>
        </div>
      </div>
    </Link>
  )
}

function SectionStatus({ loading, error, empty, onRetry }) {
  if (loading) return <p role="status" className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]">행사를 불러오는 중입니다.</p>
  if (error) return (
    <div role="alert" className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]">
      <p>{getHomeError(error)}</p>
      <div className="flex gap-4 mt-3">
        <button type="button" onClick={onRetry} className="text-[#FF6B47] font-semibold">다시 시도</button>
        {error.response?.status === 401 && <Link to="/login" className="text-[#FF6B47] font-semibold">로그인</Link>}
      </div>
    </div>
  )
  if (empty) return <p role="status" className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]">표시할 행사가 없습니다.</p>
  return null
}

export default function Home({ showAllHot = false }) {
  const [hotEvents, setHotEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [hotMock, setHotMock] = useState(false)
  const [upcomingMock, setUpcomingMock] = useState(false)
  const [hotLoading, setHotLoading] = useState(true)
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const [hotError, setHotError] = useState(null)
  const [upcomingError, setUpcomingError] = useState(null)
  const [hotRetry, setHotRetry] = useState(0)
  const [upcomingRetry, setUpcomingRetry] = useState(0)

  // 화면 진입 → API 요청 → state 갱신 → map 렌더링 (React 수업 방식)
  useEffect(() => {
    const controller = new AbortController()
    const loadHotEvents = async () => {
      setHotLoading(true)
      setHotError(null)
      setHotMock(false)
      try {
        const { events, isMock } = await getHotEvents({ limit: showAllHot ? 30 : 6, signal: controller.signal })
        if (!controller.signal.aborted) {
          setHotEvents(events)
          setHotMock(isMock)
        }
      } catch (error) {
        if (!controller.signal.aborted) setHotError(error)
      } finally {
        if (!controller.signal.aborted) setHotLoading(false)
      }
    }
    loadHotEvents()
    return () => controller.abort()
  }, [showAllHot, hotRetry])

  useEffect(() => {
    if (showAllHot) return
    const controller = new AbortController()
    const loadUpcomingEvents = async () => {
      setUpcomingLoading(true)
      setUpcomingError(null)
      setUpcomingMock(false)
      try {
        const { events, isMock } = await getUpcomingEvents({ signal: controller.signal })
        if (!controller.signal.aborted) {
          setUpcomingEvents(events)
          setUpcomingMock(isMock)
        }
      } catch (error) {
        if (!controller.signal.aborted) setUpcomingError(error)
      } finally {
        if (!controller.signal.aborted) setUpcomingLoading(false)
      }
    }
    loadUpcomingEvents()
    return () => controller.abort()
  }, [showAllHot, upcomingRetry])

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <header className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-5 bg-[#1A1A2E]">
        <div className="max-w-5xl">
          <p className="text-[#9CA3AF] text-sm font-medium tracking-wide">서울 문화행사</p>
          <h1 className="font-display text-white text-3xl md:text-4xl font-bold mt-0.5 leading-tight">
            {showAllHot ? 'HOT한 행사' : <>오늘 뭐할까,<br /><em className="text-[#FF6B47] not-italic">같이 찾아봐요</em></>}
          </h1>
          {showAllHot ? <Link to="/" className="inline-block mt-4 text-sm text-white">← 홈으로</Link> : (
            <Link to="/search" className="flex items-center gap-3 mt-5 p-4 rounded-2xl bg-white text-[#6B7280] text-sm">
              <span aria-hidden="true">🔍</span>어떤 문화행사를 찾으세요?<span aria-hidden="true" className="ml-auto">→</span>
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 px-5 md:px-8 lg:px-10">
        <section aria-labelledby="hot-title" aria-busy={hotLoading} className="pt-6 pb-2 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <h2 id="hot-title" className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">🔥 HOT한 행사</h2>
            {!showAllHot && <Link to="/events/hot" className="text-[#FF6B47] text-sm font-semibold">전체보기</Link>}
          </div>
          {showAllHot && <p className="text-sm text-[#6B7280] mb-4">조회수가 높은 행사 최대 30개를 보여드려요.</p>}
          {hotMock && <DemoNotice onRetry={getDataMode() === 'auto' ? () => setHotRetry(value => value + 1) : undefined} />}
          <SectionStatus loading={hotLoading} error={hotError} empty={!hotEvents.length} onRetry={() => setHotRetry(value => value + 1)} />
          {!hotLoading && !hotError && <div className={showAllHot
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 [&>a]:w-full'
            : 'flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 hide-scrollbar'}>
            {hotEvents.map(event => <HotCard key={event.eventId} event={event} />)}
          </div>}
        </section>

        {!showAllHot && <section aria-labelledby="upcoming-title" aria-busy={upcomingLoading} className="pt-6 pb-8 max-w-5xl">
          <h2 id="upcoming-title" className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2">📍 다가오는 근처 행사</h2>
          <p className="text-xs text-[#6B7280] mb-4">{upcomingMock ? '서울 전체 샘플 행사를 시작일 순으로 보여드려요.' : '회원 거주지 기준이며, 비로그인 또는 거주지 미설정 시 서울 전체 행사를 보여드려요.'}</p>
          {upcomingMock && <DemoNotice onRetry={getDataMode() === 'auto' ? () => setUpcomingRetry(value => value + 1) : undefined} />}
          <SectionStatus loading={upcomingLoading} error={upcomingError} empty={!upcomingEvents.length} onRetry={() => setUpcomingRetry(value => value + 1)} />
          {!upcomingLoading && !upcomingError && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingEvents.map(event => {
              const color = CATEGORY_COLOR[event.category]?.text ?? '#FF6B47'
              return (
                <Link key={event.eventId} to={eventPath(event)} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left w-full">
                  <span className="min-w-12 h-12 px-1 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ backgroundColor: color }}>{ddayLabel(event)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">{event.title || '제목 없음'}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5 truncate">{[event.place, formatShortDate(event)].filter(Boolean).join(' · ')}</p>
                  </div>
                  {event.category && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: color + '20', color }}>{event.category}</span>}
                </Link>
              )
            })}
          </div>}
        </section>}
      </div>
    </div>
  )
}
