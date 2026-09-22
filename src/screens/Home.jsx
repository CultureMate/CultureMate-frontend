import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventPath, formatEventDate, getEvents } from '../api/culture'
import { useFavorites } from '../api/useFavorites'

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Home() {
  const [hot, setHot] = useState([])
  const [nearby, setNearby] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { isSaved, isBusy, toggle } = useFavorites()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getEvents({ from: todayLocal(), page: 0, size: 12 }),
      getEvents({ from: todayLocal(), district: '마포구', page: 0, size: 9 }),
    ])
      .then(([all, mapo]) => {
        if (cancelled) return
        setHot(all.events || [])
        setNearby(mapo.events || [])
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-5 bg-[#1A1A2E]">
        <div className="flex items-start justify-between mb-5 max-w-5xl">
          <div>
            <p className="text-[#9CA3AF] text-sm font-medium tracking-wide uppercase">서울 문화행사</p>
            <h1 className="font-display text-white text-3xl md:text-4xl font-bold mt-0.5 leading-tight">
              오늘 뭐할까,
              <br />
              <em className="text-[#FF6B47] not-italic">같이 찾아봐요</em>
            </h1>
          </div>
          <Link to="/login" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1 text-white text-sm font-bold">
            로그인
          </Link>
        </div>
      </div>

      <div className="flex-1 px-5 md:px-8 lg:px-10">
        {error && <p className="pt-4 text-sm text-[#FF6B47] max-w-5xl">{error}</p>}
        {loading && <p className="pt-6 text-sm text-[#6B7280]">행사를 불러오는 중…</p>}

        <div className="pt-6 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">다가오는 행사</h2>
            </div>
            <Link to="/events" className="text-[#FF6B47] text-sm font-semibold">
              전체보기
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {hot.map((event) => (
              <EventCard key={event.eventId} event={event} saved={isSaved(event.eventId)} busy={isBusy(event.eventId)} onToggle={toggle} />
            ))}
          </div>
        </div>

        <div className="pt-6 pb-8 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">마포구 근처</h2>
            </div>
            <Link to="/events?district=마포구" className="text-[#FF6B47] text-sm font-semibold">
              전체보기
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearby.map((event) => (
              <Link key={event.eventId} to={eventPath(event.eventId)} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left w-full">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold bg-[#FF6B47]">
                  {(event.district || '서울').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">{event.title}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5 truncate">
                    {event.district} · {formatEventDate(event.startDate, event.endDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, saved, busy, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
      <Link to={eventPath(event.eventId)} className="block relative h-[130px] md:h-[160px] bg-gray-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#FFF0EC]">🎭</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold bg-[#FF6B47]">
          {event.category || '문화행사'}
        </div>
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-1">{event.title}</p>
        </div>
      </Link>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[#6B7280] text-xs truncate">{event.place || '장소 확인 필요'}</p>
          <p className="text-[#1A1A2E] text-xs font-medium">{formatEventDate(event.startDate, event.endDate)}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggle(event.eventId)}
          className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center disabled:opacity-50"
          aria-label={saved ? '관심 해제' : '관심 저장'}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  )
}
