const DISTRICTS = ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구']
const CATEGORIES = ['공연','전시','교육/체험','스포츠','음악','영화','축제/행사','문화/예술']
const DAYS_OF_WEEK = ['일','월','화','수','목','금','토']

const SELECTED_DISTRICTS = ['마포구', '서대문구']
const SELECTED_CATEGORIES = ['음악', '공연']

const DAYS_IN_MONTH = 30
const FIRST_DOW = 2

function ChipGroup({ label, icon, options, selected, colorSelected = '#FF6B47' }) {
  const visible = options.slice(0, 8)
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
            <div
              key={opt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                on ? 'text-white border-transparent' : 'bg-white text-[#1A1A2E] border-[#E5E7EB]'
              }`}
              style={on ? { backgroundColor: colorSelected, borderColor: colorSelected } : {}}
            >
              {on && <span className="text-[10px] font-black">✓</span>}
              {opt}
            </div>
          )
        })}
        {options.length > 8 && (
          <div className="px-3 py-1.5 rounded-xl text-sm font-medium text-[#6B7280] border border-dashed border-[#D1D5DB] bg-white">
            +{options.length - 8}개 더보기
          </div>
        )}
      </div>
    </div>
  )
}

function DateSection() {
  const cells = Array(FIRST_DOW).fill(null)
  for (let i = 1; i <= DAYS_IN_MONTH; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  const startDay = 20, endDay = 25

  const inRange = (d) => d > startDay && d < endDay

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <h3 className="font-semibold text-[#1A1A2E] text-base flex-1">날짜</h3>
        <button className="text-xs text-[#9CA3AF] font-medium">초기화</button>
      </div>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden max-w-lg">
        <div className="px-4 py-2.5 text-sm font-semibold border-b border-[#F3F4F6] text-[#FF6B47]">
          9월 {startDay}일 — {endDay}일
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
            const isStart = day === startDay
            const isEnd = day === endDay
            const isMid = !!inRange(day)
            return (
              <div key={day} className="relative flex items-center justify-center h-9">
                {isMid && <div className="absolute inset-y-1 inset-x-0 bg-[#FFF0EC]" />}
                {isStart && <div className="absolute inset-y-1 right-0 left-1/2 bg-[#FFF0EC]" />}
                {isEnd && <div className="absolute inset-y-1 left-0 right-1/2 bg-[#FFF0EC]" />}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isStart || isEnd ? 'bg-[#FF6B47] text-white' : isMid ? 'text-[#FF6B47]' : 'text-[#1A1A2E]'
                  }`}
                >{day}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Search() {
  const filledSections = 3

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-5 bg-[#1A1A2E]">
        <div className="max-w-2xl md:max-w-3xl">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">
            어떤 문화생활<br />
            <em className="text-[#FFD23F] not-italic">찾고 있어요?</em>
          </h1>
          <p className="text-white/50 text-sm mt-2">선택만 하면 AI가 코스를 짜드려요</p>
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-3 bg-white border-b border-[#F3F4F6]">
        <div className="max-w-2xl md:max-w-3xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#6B7280] font-medium">조건 입력 중</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF6B47]">{filledSections}/3</span>
              <button className="text-xs text-[#9CA3AF]">초기화</button>
            </div>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6B47] rounded-full w-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-5 pb-36 hide-scrollbar">
        <div className="max-w-2xl md:max-w-3xl">
          <ChipGroup label="자치구" icon="🗺️" options={DISTRICTS} selected={SELECTED_DISTRICTS} />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <ChipGroup label="분야" icon="🎭" options={CATEGORIES} selected={SELECTED_CATEGORIES} colorSelected="#8B5CF6" />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <DateSection />
        </div>
      </div>

      <div
        className="fixed bottom-20 px-5 md:px-8 lg:px-10 pb-2"
        style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}
      >
        <div className="md:flex md:justify-center">
          <button className="block text-center w-full md:max-w-sm py-4 rounded-2xl font-bold text-base bg-[#FF6B47] text-white shadow-lg shadow-[#FF6B47]/30">
            ✨ 행사 검색하기
          </button>
        </div>
      </div>
    </div>
  )
}
