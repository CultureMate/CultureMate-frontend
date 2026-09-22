const CATEGORY_COLOR = {
  '공연': { bg: '#FFF0EC', text: '#FF6B47' },
  '전시': { bg: '#F3EEFF', text: '#8B5CF6' },
  '축제/행사': { bg: '#FEF3C7', text: '#D97706' },
  '영화': { bg: '#EEF2FF', text: '#4F46E5' },
}

// Display data only. Saving and loading favorites will be implemented later.
const FAVORITE_EVENTS = [
  { id: 1, title: '서울 재즈 페스티벌 2026', place: '올림픽공원 88잔디마당', category: '축제/행사', dateStr: '9월 20–22일', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format' },
  { id: 2, title: '한강 야경 사진전 — 빛의 도시', place: '반포한강공원 달빛광장', category: '전시', dateStr: '9월 15일–10월 5일', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&auto=format' },
  { id: 5, title: '뚝섬 달빛 영화제', place: '뚝섬한강공원 수변무대', category: '영화', dateStr: '9월 21일', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop&auto=format' },
]

function EventCard({ event }) {
  const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }
  return (
    <div className="bg-white rounded-2xl flex overflow-hidden shadow-sm">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-3 min-w-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>{event.category}</span>
        <p className="font-semibold text-[#1A1A2E] text-sm mt-1 leading-tight line-clamp-1">{event.title}</p>
        <p className="text-[#6B7280] text-xs mt-0.5">{event.place}</p>
        <p className="text-[#9CA3AF] text-xs">{event.dateStr}</p>
      </div>
      <button className="flex-shrink-0 px-3 flex items-center" aria-label={`${event.title} 관심 해제`}>
        <span className="text-lg">❤️</span>
      </button>
    </div>
  )
}

export default function Favorites() {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">관심 목록</h1>
          <p className="text-white/50 text-sm mt-1">행사 {FAVORITE_EVENTS.length}개 저장됨</p>
        </div>
      </div>

      <div className="bg-white border-b border-[#F3F4F6] px-5 md:px-8 lg:px-10 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex bg-[#F3F4F6] rounded-xl p-1 gap-1">
            <div className="flex-1 py-2 rounded-lg text-sm font-semibold bg-white text-[#1A1A2E] shadow-sm text-center">📋 리스트</div>
            <div className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#9CA3AF] text-center">📅 캘린더</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
          <div className="flex flex-col gap-3">
            {FAVORITE_EVENTS.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
