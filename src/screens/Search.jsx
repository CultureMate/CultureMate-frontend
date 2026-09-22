import { DISTRICTS, CATEGORIES } from '../data/events'

const DAYS_OF_WEEK = ['일','월','화','수','목','금','토']

function ChipGroup({ label, icon, options, selected = [], colorSelected = '#FF6B47' }) {
  const showAll = false
  const visible = showAll ? options : options.slice(0, 8)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-[#1A1A2E] text-base flex-1">{label}</h3>
        {selected.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF0EC] text-[#FF6B47]">
            {selected.length}개 선택
          </span>
        )}
      </div>
      <div className="flex flex-wrap md:grid md:grid-cols-2 gap-2">
        {visible.map(opt => {
          const on = selected.includes(opt)
          return (
            <button key={opt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                on ? 'text-white border-transparent' : 'bg-white text-[#1A1A2E] border-[#E5E7EB]'
              }`}
              style={on ? { backgroundColor: colorSelected } : {}}
            >
              {on && <span className="text-[10px] font-black">✓</span>}
              {opt}
            </button>
          )
        })}
        {options.length > 8 && (
          <button className="px-3 py-1.5 rounded-xl text-sm font-medium text-[#6B7280] border border-dashed border-[#D1D5DB] bg-white">
            +{options.length - 8}개 더보기
          </button>
        )}
      </div>
    </div>
  )
}

function DateSection() {
  const cells = Array(2).fill(null)
  for (let i = 1; i <= 30; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <h3 className="font-semibold text-[#1A1A2E] text-base flex-1">날짜</h3>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden max-w-lg">
        <div className="px-4 py-2.5 text-sm font-semibold border-b border-[#F3F4F6] text-[#9CA3AF]">
          날짜를 선택하세요
        </div>
        <p className="text-center text-xs font-bold text-[#1A1A2E] pt-3 pb-1">2026년 9월</p>
        <div className="grid grid-cols-7 px-2">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-semibold py-1 ${i===0?'text-[#FF6B47]':i===6?'text-[#8B5CF6]':'text-[#9CA3AF]'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 px-2 pb-3">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} />
            const isToday = day === 22
            return (
              <div key={day} className="relative flex items-center justify-center h-9">
                <button className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isToday ? 'text-[#FF6B47] font-bold' : 'text-[#1A1A2E]'
                }`}>
                  {day}
                  {isToday && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B47]" />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Search() {
  const filledSections = 0

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-5 bg-[#1A1A2E]">
        <div className="max-w-2xl md:max-w-3xl">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">
            어떤 문화생활<br />
            <em className="text-[#FFD23F] not-italic">찾고 있어요?</em>
          </h1>
          <p className="text-white/50 text-sm mt-2">선택만 하면 AI가 코스를 짜드려요</p>
        </div>
      </div>

      {/* 진행 상태 바 */}
      <div className="px-5 md:px-8 lg:px-10 py-3 bg-white border-b border-[#F3F4F6]">
        <div className="max-w-2xl md:max-w-3xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#6B7280] font-medium">조건 입력 중</span>
            <span className="text-xs font-bold text-[#FF6B47]">{filledSections}/3</span>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6B47] rounded-full" style={{ width: `${(filledSections / 3) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* 필터 폼 */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-5 pb-36 hide-scrollbar">
        <div className="max-w-2xl md:max-w-3xl">
          <ChipGroup label="자치구" icon="🗺️" options={DISTRICTS} selected={[]} />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <ChipGroup label="분야" icon="🎭" options={CATEGORIES} selected={[]} colorSelected="#8B5CF6" />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <DateSection />
        </div>
      </div>

      {/* 검색 버튼 */}
      <div className="fixed bottom-20 px-5 md:px-8 lg:px-10 pb-2" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}>
        <button
          disabled
          className="w-full md:max-w-sm py-4 rounded-2xl font-bold text-base bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
        >
          조건을 1개 이상 선택해주세요
        </button>
      </div>
    </div>
  )
}
