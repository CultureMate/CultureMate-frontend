const CATEGORY_COLOR = {
  '공연':    { bg: '#FFF0EC', text: '#FF6B47' },
  '전시':    { bg: '#F3EEFF', text: '#8B5CF6' },
  '교육/체험':{ bg: '#E6FAF7', text: '#00C4A0' },
  '스포츠':  { bg: '#FEF3C7', text: '#D97706' },
  '음악':    { bg: '#FFF0EC', text: '#FF6B47' },
  '영화':    { bg: '#EEF2FF', text: '#4F46E5' },
  '축제/행사':{ bg: '#FEF3C7', text: '#D97706' },
  '문화/예술':{ bg: '#F3EEFF', text: '#8B5CF6' },
}

const EVENTS = [
  { id: 1, title: '서울 재즈 페스티벌 2026', place: '올림픽공원 88잔디마당', fee: '무료', org: '서울특별시', category: '축제/행사', district: '송파구', startDate: '2026-09-20', endDate: '2026-09-22', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format', hot: true },
  { id: 2, title: '한강 야경 사진전 — 빛의 도시', place: '반포한강공원 달빛광장', fee: '무료', org: '한강사업본부', category: '전시', district: '서초구', startDate: '2026-09-15', endDate: '2026-10-05', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&auto=format', hot: false },
  { id: 3, title: '성수동 팝업 마켓 — 핸드메이드', place: '성수동 카페거리', fee: '무료', org: '성동구청', category: '축제/행사', district: '성동구', startDate: '2026-09-21', endDate: '2026-09-22', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&auto=format', hot: true },
  { id: 4, title: '이태원 월드푸드 페스타', place: '이태원 문화의 거리', fee: '무료', org: '용산구청', category: '축제/행사', district: '용산구', startDate: '2026-09-28', endDate: '2026-09-29', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&auto=format', hot: false },
  { id: 5, title: '뚝섬 달빛 영화제', place: '뚝섬한강공원 수변무대', fee: '무료', org: '광진구청', category: '영화', district: '광진구', startDate: '2026-09-21', endDate: '2026-09-21', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop&auto=format', hot: false },
  { id: 6, title: '인사동 전통공예 체험 주간', place: '인사동 문화거리 일대', fee: '무료', org: '종로구청', category: '교육/체험', district: '종로구', startDate: '2026-09-18', endDate: '2026-09-30', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=500&fit=crop&auto=format', hot: false },
  { id: 7, title: '노원 별빛 야외 콘서트', place: '노원문화예술회관 야외무대', fee: '무료', org: '노원구청', category: '공연', district: '노원구', startDate: '2026-09-26', endDate: '2026-09-26', img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop&auto=format', hot: false },
  { id: 8, title: '강남 클래식 음악회', place: '강남구민회관 대공연장', fee: '5,000원', org: '강남구청', category: '음악', district: '강남구', startDate: '2026-09-25', endDate: '2026-09-25', img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=500&fit=crop&auto=format', hot: false },
]

const ALL_CATEGORIES = ['전체', '공연', '전시', '교육/체험', '스포츠', '음악', '영화', '축제/행사', '문화/예술']

function formatDate(e) {
  const sd = parseInt(e.startDate.split('-')[2])
  const ed = parseInt(e.endDate.split('-')[2])
  const sm = parseInt(e.startDate.split('-')[1])
  const em = parseInt(e.endDate.split('-')[1])
  if (sm === em) return sd === ed ? `${sm}월 ${sd}일` : `${sm}월 ${sd}–${ed}일`
  return `${sm}월 ${sd}일–${em}월 ${ed}일`
}

export default function EventList() {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">행사 목록</h1>
        <p className="text-white/50 text-sm mt-1">{EVENTS.length}개의 행사</p>
      </div>

      <div className="bg-white px-5 md:px-8 lg:px-10 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2.5 mb-2">
          <span className="text-base">🔍</span>
          <input
            type="text"
            placeholder="행사 이름, 장소로 검색"
            className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
          />
        </div>
        <div className="flex gap-2 pb-1">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border bg-white text-[#6B7280] border-[#E5E7EB]">
            <span>📅</span>날짜 선택
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#F3F4F6] sticky top-0 z-10">
        <div className="flex overflow-x-auto md:flex-wrap md:overflow-x-visible hide-scrollbar px-4 md:px-8 lg:px-10 py-3 gap-2">
          {ALL_CATEGORIES.map((cat, i) => (
            <button key={cat}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold ${i === 0 ? 'bg-[#1A1A2E] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-4 pb-24 hide-scrollbar">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVENTS.map(event => {
            const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }
            return (
              <div key={event.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm text-left w-full"
              >
                <div className="relative h-[180px] bg-gray-100">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                  {event.hot && (
                    <div className="absolute top-3 left-3 bg-[#FF6B47] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">🔥 HOT</div>
                  )}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-base">🤍</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>{event.category}</span>
                    <span className="text-[#9CA3AF] text-xs">{event.org}</span>
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] text-base leading-tight mb-2">{event.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[#6B7280] text-xs flex items-center gap-1"><span>📅</span>{formatDate(event)}</p>
                      <p className="text-[#6B7280] text-xs flex items-center gap-1"><span>📍</span>{event.place}</p>
                      <p className="text-[#6B7280] text-xs flex items-center gap-1"><span>🗺️</span>{event.district}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: event.fee === '무료' ? '#00C4A0' : '#FF6B47' }}>{event.fee}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
