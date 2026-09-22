import { EVENTS } from '../data/events'

const CATEGORY_COLORS = {
  '공연': '#FF6B47', '전시': '#8B5CF6', '교육/체험': '#00C4A0',
  '스포츠': '#D97706', '음악': '#FF6B47', '영화': '#4F46E5',
  '축제/행사': '#D97706', '문화/예술': '#8B5CF6',
}

const hotEvents = [...EVENTS].sort((a, b) => Number(b.hot) - Number(a.hot)).slice(0, 6)
const nearbyEvents = [...EVENTS].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 6)

function formatShortDate(e) {
  const sd = parseInt(e.startDate.split('-')[2])
  const ed = parseInt(e.endDate.split('-')[2])
  const sm = parseInt(e.startDate.split('-')[1])
  const em = parseInt(e.endDate.split('-')[1])
  if (sm === em) return sd === ed ? `${sm}월 ${sd}일` : `${sm}월 ${sd}–${ed}일`
  return `${sm}월 ${sd}일–${em}월 ${ed}일`
}

function ddayLabel(startDate) {
  const today = new Date(2026, 8, 22)
  const start = new Date(startDate)
  const diff  = Math.ceil((start.getTime() - today.getTime()) / 86400000)
  if (diff <= 0) return 'D-DAY'
  return `D-${diff}`
}

function HotCard({ event }) {
  const color = CATEGORY_COLORS[event.category] ?? '#FF6B47'
  return (
    <div className="flex-shrink-0 w-[200px] md:w-auto rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer">
      <div className="relative h-[130px] md:h-[160px] bg-gray-100">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold" style={{ backgroundColor: color }}>
          {event.category}
        </div>
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-sm">🤍</span>
        </button>
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-1">{event.title}</p>
        </div>
      </div>
      <div className="bg-white px-3 py-2.5">
        <p className="text-[#6B7280] text-xs truncate">{event.place}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[#1A1A2E] text-xs font-medium">{formatShortDate(event)}</p>
          <p className="text-[#9CA3AF] text-[11px]">👁 -</p>
        </div>
      </div>
    </div>
  )
}

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
            {hotEvents.map(event => <HotCard key={event.id} event={event} />)}
          </div>
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {hotEvents.map(event => <HotCard key={event.id} event={event} />)}
          </div>
        </div>

        {/* 근처 행사 */}
        <div className="pt-6 pb-8 max-w-5xl">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]">다가오는 근처 행사</h2>
            </div>
            <button className="text-[#FF6B47] text-sm font-semibold">지도보기</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyEvents.map(event => {
              const color = CATEGORY_COLORS[event.category] ?? '#FF6B47'
              const dd    = ddayLabel(event.startDate)
              return (
                <button
                  key={event.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left w-full"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ backgroundColor: color }}>
                    {dd}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">{event.title}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5 truncate">{event.district} · {formatShortDate(event)}</p>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color + '20', color }}
                  >{event.category}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
