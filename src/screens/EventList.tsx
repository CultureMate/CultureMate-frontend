import { useState } from 'react'

const CATEGORIES = ['전체', '음악', '전시', '마켓', '음식', '영화', '체험', '스포츠']

const EVENTS = [
  {
    id: 1,
    title: '서울 재즈 페스티벌 2026',
    date: '9월 20–22일',
    place: '올림픽공원 88잔디마당',
    category: '음악',
    fee: '무료',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format',
    org: '서울특별시',
    hot: true,
  },
  {
    id: 2,
    title: '한강 야경 사진전 — 빛의 도시',
    date: '9월 15일–10월 5일',
    place: '반포한강공원 달빛광장',
    category: '전시',
    fee: '무료',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&auto=format',
    org: '한강사업본부',
    hot: false,
  },
  {
    id: 3,
    title: '성수동 팝업 마켓 — 핸드메이드',
    date: '9월 21–22일',
    place: '성수동 카페거리',
    category: '마켓',
    fee: '무료',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&auto=format',
    org: '성동구청',
    hot: true,
  },
  {
    id: 4,
    title: '이태원 월드푸드 페스타',
    date: '9월 28–29일',
    place: '이태원 문화의 거리',
    category: '음식',
    fee: '무료',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&auto=format',
    org: '용산구청',
    hot: false,
  },
  {
    id: 5,
    title: '뚝섬 달빛 영화제',
    date: '9월 21일',
    place: '뚝섬한강공원',
    category: '영화',
    fee: '무료',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop&auto=format',
    org: '광진구청',
    hot: false,
  },
  {
    id: 6,
    title: '인사동 전통공예 체험 주간',
    date: '9월 25–29일',
    place: '인사동 문화거리',
    category: '체험',
    fee: '유료 (5,000원~)',
    img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&h=500&fit=crop&auto=format',
    org: '종로구청',
    hot: false,
  },
]

const CATEGORY_COLOR: Record<string, { bg: string; text: string }> = {
  음악: { bg: '#FFF0EC', text: '#FF6B47' },
  전시: { bg: '#F3EEFF', text: '#8B5CF6' },
  마켓: { bg: '#E6FAF7', text: '#00C4A0' },
  음식: { bg: '#FFFBE6', text: '#D97706' },
  영화: { bg: '#F3EEFF', text: '#8B5CF6' },
  체험: { bg: '#E6FAF7', text: '#00C4A0' },
  스포츠: { bg: '#FFFBE6', text: '#D97706' },
}

interface EventListProps {
  onEventClick: (id: number) => void
}

export default function EventList({ onEventClick }: EventListProps) {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [savedEvents, setSavedEvents] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')

  const filtered = EVENTS.filter(e => {
    const matchCategory = activeCategory === '전체' || e.category === activeCategory
    const matchQuery = e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.place.toLowerCase().includes(query.toLowerCase())
    return matchCategory && matchQuery
  })

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedEvents(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">
          행사 목록
        </h1>
        <p className="text-white/50 text-sm mt-1">{filtered.length}개의 행사{query && ` — "${query}"`}</p>
      </div>

      {/* Search input */}
      <div className="bg-white px-5 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2.5">
          <span className="text-base">🔍</span>
          <input
            type="text"
            placeholder="행사 이름, 장소로 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#9CA3AF] text-lg leading-none">×</button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-[#F3F4F6] sticky top-0 z-10">
        <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 hide-scrollbar">
        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <span className="text-4xl">🔍</span>
              <p className="text-[#6B7280] text-sm mt-3 font-medium">"{query}"에 해당하는 행사가 없어요</p>
              <button onClick={() => setQuery('')} className="mt-3 text-[#FF6B47] text-sm font-semibold">검색어 지우기</button>
            </div>
          )}
          {filtered.map(event => {
            const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform text-left w-full"
              >
                <div className="relative h-[180px] bg-gray-100">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {event.hot && (
                    <div className="absolute top-3 left-3 bg-[#FF6B47] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      🔥 HOT
                    </div>
                  )}
                  <button
                    onClick={e => toggleSave(event.id, e)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                  >
                    <span className="text-base">{savedEvents.has(event.id) ? '❤️' : '🤍'}</span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {event.category}
                    </span>
                    <span className="text-[#9CA3AF] text-xs">{event.org}</span>
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] text-base leading-tight mb-2">{event.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[#6B7280] text-xs flex items-center gap-1">
                        <span>📅</span> {event.date}
                      </p>
                      <p className="text-[#6B7280] text-xs flex items-center gap-1">
                        <span>📍</span> {event.place}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: event.fee === '무료' ? '#00C4A0' : '#FF6B47' }}
                    >
                      {event.fee}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
