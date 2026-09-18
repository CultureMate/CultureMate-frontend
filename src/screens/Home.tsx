import { useState } from 'react'

const HOT_EVENTS = [
  {
    id: 1,
    title: '서울 재즈 페스티벌',
    date: '9월 20–22일',
    place: '올림픽공원',
    category: '음악',
    color: '#FF6B47',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&auto=format',
    views: '12.4k',
  },
  {
    id: 2,
    title: '한강 야경 사진전',
    date: '9월 15–10월 5일',
    place: '반포한강공원',
    category: '전시',
    color: '#8B5CF6',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
    views: '9.1k',
  },
  {
    id: 3,
    title: '성수 팝업 마켓',
    date: '9월 21–22일',
    place: '성수동',
    category: '마켓',
    color: '#00C4A0',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format',
    views: '7.8k',
  },
  {
    id: 4,
    title: '이태원 푸드 페스타',
    date: '9월 28–29일',
    place: '이태원 거리',
    category: '음식',
    color: '#FFD23F',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format',
    views: '6.5k',
  },
]

const NEARBY_EVENTS = [
  {
    id: 5,
    title: '마포구 청년 창업 전시회',
    date: '9월 19일',
    place: '마포 창업허브',
    category: '전시',
    dday: 'D-1',
    accent: '#FF6B47',
  },
  {
    id: 6,
    title: '광진구 뚝섬 달빛 영화제',
    date: '9월 21일',
    place: '뚝섬한강공원',
    category: '영화',
    dday: 'D-3',
    accent: '#8B5CF6',
  },
  {
    id: 7,
    title: '종로구 인사동 전통공예 체험',
    date: '9월 25일',
    place: '인사동 문화거리',
    category: '체험',
    dday: 'D-7',
    accent: '#00C4A0',
  },
  {
    id: 8,
    title: '강남구 코엑스 e스포츠 대회',
    date: '10월 2일',
    place: '코엑스 홀D',
    category: '스포츠',
    dday: 'D-14',
    accent: '#FFD23F',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  음악: '#FF6B47',
  전시: '#8B5CF6',
  마켓: '#00C4A0',
  음식: '#FFD23F',
  영화: '#8B5CF6',
  체험: '#00C4A0',
  스포츠: '#FFD23F',
}

interface HomeProps {
  onSearch: () => void
  onEventClick: (id: number) => void
}

export default function Home({ onSearch, onEventClick }: HomeProps) {
  const [savedEvents, setSavedEvents] = useState<Set<number>>(new Set())

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
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[#9CA3AF] text-sm font-medium tracking-wide uppercase">서울 마포구</p>
            <h1 className="font-display text-white text-3xl font-bold mt-0.5 leading-tight">
              오늘 뭐할까,<br />
              <em className="text-[#FF6B47] not-italic">같이 찾아봐요</em>
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1">
            <span className="text-xl">🔔</span>
          </button>
        </div>

        {/* Search Banner */}
        <button
          onClick={onSearch}
          className="w-full bg-[#FF6B47] rounded-2xl p-4 flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🔍</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-semibold text-base">나만의 문화 코스 찾기</p>
            <p className="text-white/70 text-xs mt-0.5">일정 · 동행자 · 동네로 맞춤 검색</p>
          </div>
          <span className="text-white/60 text-xl">→</span>
        </button>
      </div>

      {/* HOT 행사 */}
      <div className="pt-6">
        <div className="px-5 flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <h2 className="font-display text-xl font-bold text-[#1A1A2E]">HOT한 행사</h2>
          </div>
          <button className="text-[#FF6B47] text-sm font-semibold">전체보기</button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-5 pb-2 hide-scrollbar">
          {HOT_EVENTS.map(event => (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform text-left"
            >
              <div className="relative h-[130px] bg-gray-100">
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold"
                  style={{ backgroundColor: event.color }}
                >
                  {event.category}
                </div>
                <button
                  onClick={e => toggleSave(event.id, e)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <span className="text-sm">{savedEvents.has(event.id) ? '❤️' : '🤍'}</span>
                </button>
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <p className="text-white font-semibold text-sm leading-tight line-clamp-1">{event.title}</p>
                </div>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[#6B7280] text-xs">{event.place}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[#1A1A2E] text-xs font-medium">{event.date}</p>
                  <p className="text-[#9CA3AF] text-[11px]">👁 {event.views}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 근처 행사 */}
      <div className="pt-6 pb-24">
        <div className="px-5 flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📍</span>
            <h2 className="font-display text-xl font-bold text-[#1A1A2E]">다가오는 근처 행사</h2>
          </div>
          <button className="text-[#FF6B47] text-sm font-semibold">지도보기</button>
        </div>

        <div className="px-5 flex flex-col gap-3">
          {NEARBY_EVENTS.map(event => (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left w-full"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: event.accent }}
              >
                {event.dday}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">{event.title}</p>
                <p className="text-[#6B7280] text-xs mt-0.5">{event.place} · {event.date}</p>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[event.category] + '20', color: CATEGORY_COLORS[event.category] }}
              >
                {event.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
