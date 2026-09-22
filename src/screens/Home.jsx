const CATEGORY_COLORS = {
  '공연': '#FF6B47', '전시': '#8B5CF6', '교육/체험': '#00C4A0',
  '스포츠': '#D97706', '음악': '#FF6B47', '영화': '#4F46E5',
  '축제/행사': '#D97706', '문화/예술': '#8B5CF6',
}

const HOT_EVENTS = [
  { id: 1, title: '서울 재즈 페스티벌 2026', place: '올림픽공원 88잔디마당', category: '축제/행사', date: '9월 20–22일', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format', views: 4821 },
  { id: 3, title: '성수동 팝업 마켓 — 핸드메이드', place: '성수동 카페거리', category: '축제/행사', date: '9월 21–22일', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&auto=format', views: 2310 },
  { id: 6, title: '인사동 전통공예 체험 주간', place: '인사동 문화거리 일대', category: '교육/체험', date: '9월 18–30일', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=500&fit=crop&auto=format', views: 1904 },
  { id: 9, title: '마포 스트리트 댄스 배틀', place: '홍대 걷고싶은거리', category: '공연', date: '9월 27일', img: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=500&fit=crop&auto=format', views: 1550 },
  { id: 2, title: '한강 야경 사진전 — 빛의 도시', place: '반포한강공원 달빛광장', category: '전시', date: '9월 15일–10월 5일', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&auto=format', views: 980 },
  { id: 5, title: '뚝섬 달빛 영화제', place: '뚝섬한강공원 수변무대', category: '영화', date: '9월 21일', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop&auto=format', views: 720 },
]

const NEARBY_EVENTS = [
  { id: 1, title: '서울 재즈 페스티벌 2026', district: '송파구', date: '9월 20–22일', category: '축제/행사', dday: 'D-2' },
  { id: 3, title: '성수동 팝업 마켓 — 핸드메이드', district: '성동구', date: '9월 21–22일', category: '축제/행사', dday: 'D-3' },
  { id: 5, title: '뚝섬 달빛 영화제', district: '광진구', date: '9월 21일', category: '영화', dday: 'D-3' },
  { id: 8, title: '강남 클래식 음악회', district: '강남구', date: '9월 25일', category: '음악', dday: 'D-7' },
  { id: 4, title: '이태원 월드푸드 페스타', district: '용산구', date: '9월 28–29일', category: '축제/행사', dday: 'D-10' },
  { id: 2, title: '한강 야경 사진전 — 빛의 도시', district: '서초구', date: '9월 15일–10월 5일', category: '전시', dday: '진행중' },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-5 bg-[#1A1A2E]">
        <div className="flex items-start justify-between mb-5 max-w-5xl">
          <div>
            <p className="text-[#9CA3AF] text-sm font-medium tracking-wide uppercase">서울 마포구</p>
            <h1 className="font-display text-white text-3xl md:text-4xl font-bold mt-0.5 leading-tight">
              오늘 뭐할까,<br />
              <em className="text-[#FF6B47] not-italic">같이 찾아봐요</em>
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1 md:hidden">
            <span className="text-xl">🔔</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 md:px-8 lg:px-10">
        {/* HOT 행사 */}
        <div className="pt-6 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">HOT한 행사</h2>
            </div>
            <button className="text-[#FF6B47] text-sm font-semibold">전체보기</button>
          </div>

          <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 hide-scrollbar">
            {HOT_EVENTS.map(event => <HotCard key={event.id} event={event} />)}
          </div>
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {HOT_EVENTS.map(event => <HotCard key={event.id} event={event} />)}
          </div>
        </div>

        {/* 근처 행사 */}
        <div className="pt-6 pb-8 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">다가오는 근처 행사</h2>
            </div>
            <button className="text-[#FF6B47] text-sm font-semibold">전체보기</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {NEARBY_EVENTS.map(event => {
              const color = CATEGORY_COLORS[event.category] ?? '#FF6B47'
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left w-full"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ backgroundColor: color }}>
                    {event.dday}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">{event.title}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5 truncate">{event.district} · {event.date}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color + '20', color }}
                  >{event.category}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function HotCard({ event }) {
  const color = CATEGORY_COLORS[event.category] ?? '#FF6B47'
  return (
    <div className="flex-shrink-0 w-[200px] md:w-auto rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-[130px] md:h-[160px] bg-gray-100">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold" style={{ backgroundColor: color }}>
          {event.category}
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-sm">🤍</span>
        </div>
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-1">{event.title}</p>
        </div>
      </div>
      <div className="bg-white px-3 py-2.5">
        <p className="text-[#6B7280] text-xs truncate">{event.place}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[#1A1A2E] text-xs font-medium">{event.date}</p>
          <p className="text-[#9CA3AF] text-[11px]">👁 {event.views.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
