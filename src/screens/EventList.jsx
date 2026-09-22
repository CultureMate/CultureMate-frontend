import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { eventPath, formatEventDate, getEvents } from '../api/culture'
import { useFavorites } from '../api/useFavorites'

const CATEGORY_COLOR = {
  공연: { bg: '#FFF0EC', text: '#FF6B47' },
  전시: { bg: '#F3EEFF', text: '#8B5CF6' },
  '교육/체험': { bg: '#E6FAF7', text: '#00C4A0' },
  스포츠: { bg: '#FEF3C7', text: '#D97706' },
  음악: { bg: '#FFF0EC', text: '#FF6B47' },
  영화: { bg: '#EEF2FF', text: '#4F46E5' },
  '축제/행사': { bg: '#FEF3C7', text: '#D97706' },
  '문화/예술': { bg: '#F3EEFF', text: '#8B5CF6' },
}

const ALL_CATEGORIES = ['전체', '공연', '전시', '교육/체험', '스포츠', '음악', '영화', '축제/행사', '문화/예술']

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategories = searchParams.getAll('category')
  const districts = searchParams.getAll('district')
  const categoryKey = selectedCategories.join('\0')
  const districtKey = districts.join('\0')
  const keyword = searchParams.get('keyword') || ''
  const from = searchParams.get('from') || todayLocal()
  const to = searchParams.get('to') || ''
  const [draftKeyword, setDraftKeyword] = useState(keyword)
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isSaved, isBusy, toggle } = useFavorites()

  const filters = useMemo(
    () => ({
      from,
      page: 0,
      size: 30,
      ...(to ? { to } : {}),
      ...(categoryKey ? { category: categoryKey.split('\0') } : {}),
      ...(districtKey ? { district: districtKey.split('\0') } : {}),
      ...(keyword ? { keyword } : {}),
    }),
    [categoryKey, districtKey, keyword, from, to],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getEvents(filters)
      .then((data) => {
        if (cancelled) return
        setEvents(data.events || [])
        setTotal(data.totalCount ?? data.count ?? data.events?.length ?? 0)
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
  }, [filters])

  const setCategory = (next) => {
    const params = new URLSearchParams(searchParams)
    params.delete('category')
    if (next !== '전체') params.append('category', next)
    setSearchParams(params)
  }

  const isCategoryActive = (cat) => {
    if (cat === '전체') return selectedCategories.length === 0
    return selectedCategories.includes(cat)
  }

  const submitSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (draftKeyword.trim()) params.set('keyword', draftKeyword.trim())
    else params.delete('keyword')
    setSearchParams(params)
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">행사 목록</h1>
        <p className="text-white/50 text-sm mt-1">{loading ? '불러오는 중…' : `${total}개의 행사`}</p>
      </div>

      <div className="bg-white px-5 md:px-8 lg:px-10 pt-3 pb-2">
        <form onSubmit={submitSearch} className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2.5 mb-2">
          <span className="text-base">🔍</span>
          <input
            type="search"
            value={draftKeyword}
            onChange={(e) => setDraftKeyword(e.target.value)}
            placeholder="행사 이름, 장소로 검색"
            className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
          />
        </form>
        {districts.length > 0 && (
          <p className="text-xs text-[#6B7280] mb-2">
            자치구 필터: <span className="font-semibold text-[#1A1A2E]">{districts.join(', ')}</span>
            <button
              type="button"
              className="ml-2 text-[#FF6B47] font-semibold"
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.delete('district')
                setSearchParams(params)
              }}
            >
              해제
            </button>
          </p>
        )}
      </div>

      <div className="bg-white border-b border-[#F3F4F6] sticky top-0 z-10">
        <div className="flex overflow-x-auto md:flex-wrap md:overflow-x-visible hide-scrollbar px-4 md:px-8 lg:px-10 py-3 gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold ${
                isCategoryActive(cat) ? 'bg-[#1A1A2E] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-4 pb-24 hide-scrollbar">
        {error && <p className="text-sm text-[#FF6B47] mb-3">{error}</p>}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }
            return (
              <div key={event.eventId} className="bg-white rounded-2xl overflow-hidden shadow-sm text-left w-full">
                <Link to={eventPath(event.eventId)} className="block relative h-[180px] bg-gray-100">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-[#FFF0EC]">🎭</div>
                  )}
                  <div
                    className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {event.category || '문화행사'}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={eventPath(event.eventId)} className="block">
                    <p className="font-semibold text-[#1A1A2E] text-base leading-tight line-clamp-2">{event.title}</p>
                    <p className="text-[#6B7280] text-xs mt-1.5 truncate">{event.place || '장소 확인 필요'}</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">{formatEventDate(event.startDate, event.endDate)}</p>
                  </Link>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={isBusy(event.eventId)}
                      onClick={() => toggle(event.eventId)}
                      className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center disabled:opacity-50"
                      aria-label={isSaved(event.eventId) ? '관심 해제' : '관심 저장'}
                    >
                      {isSaved(event.eventId) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {!loading && !error && events.length === 0 && (
          <p className="text-center text-sm text-[#6B7280] py-16">조건에 맞는 행사가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
