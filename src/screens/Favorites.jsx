import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventPath, formatEventDate, getFavorites, removeFavorite } from '../api/culture'

export default function Favorites() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getFavorites()
      .then((data) => {
        if (cancelled) return
        setItems(data || [])
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

  const onRemove = async (eventId) => {
    setBusyId(eventId)
    try {
      await removeFavorite(eventId)
      setItems((prev) => prev.filter((item) => item.eventId !== eventId))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">관심 목록</h1>
          <p className="text-white/50 text-sm mt-1">{loading ? '불러오는 중…' : `행사 ${items.length}개 저장됨`}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
          {error && <p className="text-sm text-[#FF6B47] mb-3">{error}</p>}
          {!loading && items.length === 0 && !error && (
            <div className="text-center py-16">
              <p className="text-sm text-[#6B7280] mb-4">저장한 행사가 없습니다.</p>
              <Link to="/events" className="text-[#FF6B47] font-semibold text-sm">
                행사 둘러보기 →
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {items.map((event) => (
              <div key={event.eventId} className="bg-white rounded-2xl flex overflow-hidden shadow-sm">
                <Link to={eventPath(event.eventId)} className="w-24 h-24 flex-shrink-0 bg-[#FFF0EC] flex items-center justify-center text-2xl">
                  ❤️
                </Link>
                <Link to={eventPath(event.eventId)} className="flex-1 p-3 min-w-0">
                  <p className="font-semibold text-[#1A1A2E] text-sm leading-tight line-clamp-2">{event.title}</p>
                  <p className="text-[#6B7280] text-xs mt-1">{event.place || '장소 확인 필요'}</p>
                  <p className="text-[#9CA3AF] text-xs">{formatEventDate(event.startDate, event.endDate)}</p>
                </Link>
                <button
                  type="button"
                  disabled={busyId === event.eventId}
                  onClick={() => onRemove(event.eventId)}
                  className="flex-shrink-0 px-3 flex items-center disabled:opacity-50"
                  aria-label={`${event.title} 관심 해제`}
                >
                  <span className="text-lg">❤️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
