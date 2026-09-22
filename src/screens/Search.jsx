import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DISTRICTS = [
  '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구',
  '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구',
  '관악구', '서초구', '강남구', '송파구', '강동구',
]
const CATEGORIES = ['공연', '전시', '교육/체험', '스포츠', '음악', '영화', '축제/행사', '문화/예술']

function ChipGroup({ label, icon, options, selected, onToggle, colorSelected = '#FF6B47', limit = 12 }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? options : options.slice(0, limit)
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-[#1A1A2E] text-base flex-1">{label}</h3>
        {selected.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF0EC] text-[#FF6B47]">{selected.length}개 선택</span>
        )}
      </div>
      <div className="flex flex-wrap md:grid md:grid-cols-2 gap-2">
        {visible.map((opt) => {
          const on = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                on ? 'text-white border-transparent' : 'bg-white text-[#1A1A2E] border-[#E5E7EB]'
              }`}
              style={on ? { backgroundColor: colorSelected, borderColor: colorSelected } : {}}
            >
              {on && <span className="text-[10px] font-black">✓</span>}
              {opt}
            </button>
          )
        })}
        {options.length > limit && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-[#6B7280] border border-dashed border-[#D1D5DB] bg-white"
          >
            {expanded ? '접기' : `+${options.length - limit}개 더보기`}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Search() {
  const navigate = useNavigate()
  const [districts, setDistricts] = useState([])
  const [categories, setCategories] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [dateError, setDateError] = useState('')

  const filled = useMemo(() => {
    let n = 0
    if (districts.length) n += 1
    if (categories.length) n += 1
    if (from || to) n += 1
    return n
  }, [districts, categories, from, to])

  const toggle = (list, setList, value) => {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const reset = () => {
    setDistricts([])
    setCategories([])
    setFrom('')
    setTo('')
    setDateError('')
  }

  const submit = () => {
    if (from && to && from > to) {
      setDateError('종료일은 시작일 이후여야 합니다.')
      return
    }
    setDateError('')
    const params = new URLSearchParams()
    districts.forEach((district) => params.append('district', district))
    categories.forEach((category) => params.append('category', category))
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    navigate(`/events?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-5 bg-[#1A1A2E]">
        <div className="max-w-2xl md:max-w-3xl">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">
            어떤 문화생활
            <br />
            <em className="text-[#FFD23F] not-italic">찾고 있어요?</em>
          </h1>
          <p className="text-white/50 text-sm mt-2">조건 선택 후 행사 목록으로 이동합니다</p>
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-3 bg-white border-b border-[#F3F4F6]">
        <div className="max-w-2xl md:max-w-3xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#6B7280] font-medium">조건 입력 중</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF6B47]">{filled}/3</span>
              <button type="button" onClick={reset} className="text-xs text-[#9CA3AF]">
                초기화
              </button>
            </div>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6B47] rounded-full transition-all" style={{ width: `${(filled / 3) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-5 pb-36 hide-scrollbar">
        <div className="max-w-2xl md:max-w-3xl">
          <ChipGroup
            label="자치구"
            icon="🗺️"
            options={DISTRICTS}
            selected={districts}
            onToggle={(v) => toggle(districts, setDistricts, v)}
          />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <ChipGroup
            label="분야"
            icon="🎭"
            options={CATEGORIES}
            selected={categories}
            onToggle={(v) => toggle(categories, setCategories, v)}
            colorSelected="#8B5CF6"
          />
          <div className="h-px bg-[#F3F4F6] mb-6" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📅</span>
              <h3 className="font-semibold text-[#1A1A2E] text-base flex-1">날짜</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              <label className="text-xs text-[#6B7280]">
                시작
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value)
                    setDateError('')
                  }}
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A1A2E]"
                />
              </label>
              <label className="text-xs text-[#6B7280]">
                종료
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value)
                    setDateError('')
                  }}
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A1A2E]"
                />
              </label>
            </div>
            {dateError && <p className="text-xs text-[#FF6B47] mt-2">{dateError}</p>}
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 md:px-8 lg:px-10 pb-2 z-10">
        <div className="md:flex md:justify-center">
          <button
            type="button"
            onClick={submit}
            className="block text-center w-full md:max-w-sm py-4 rounded-2xl font-bold text-base bg-[#FF6B47] text-white shadow-lg shadow-[#FF6B47]/30"
          >
            행사 검색하기
          </button>
        </div>
      </div>
    </div>
  )
}
