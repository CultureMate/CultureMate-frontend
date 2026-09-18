import { useState } from 'react'

const SCHEDULE_OPTIONS = ['오늘', '이번 주말', '이번 달', '다음 달', '날짜 선택']
const COMPANION_OPTIONS = ['혼자', '둘이서', '가족과', '친구들과', '단체']
const DEPARTURE_OPTIONS = ['강남구', '마포구', '종로구', '용산구', '성동구', '광진구', '송파구', '강서구']
const DESTINATION_OPTIONS = ['강남구', '마포구', '종로구', '용산구', '성동구', '광진구', '송파구', '강서구', '상관없음']
const VENUE_OPTIONS = [
  { label: '카페', icon: '☕' },
  { label: '맛집', icon: '🍜' },
  { label: '공연장', icon: '🎭' },
  { label: '전시관', icon: '🖼️' },
  { label: '야외', icon: '🌿' },
  { label: '쇼핑', icon: '🛍️' },
  { label: '스포츠', icon: '⚽' },
  { label: '상관없음', icon: '✨' },
]

interface SearchProps {
  onResults: () => void
}

export default function Search({ onResults }: SearchProps) {
  const [schedule, setSchedule] = useState('')
  const [companion, setCompanion] = useState('')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [venue, setVenue] = useState('')

  const filledCount = [schedule, companion, departure, destination, venue].filter(Boolean).length
  const canSearch = filledCount >= 2

  const RadioGroup = ({
    label,
    options,
    value,
    onChange,
    icon,
  }: {
    label: string
    options: string[] | { label: string; icon: string }[]
    value: string
    onChange: (v: string) => void
    icon: string
  }) => {
    const isObj = typeof options[0] === 'object'
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-[#1A1A2E] text-base">{label}</h3>
          {value && (
            <span className="ml-auto text-xs font-semibold text-[#FF6B47] bg-[#FFF0EC] px-2 py-0.5 rounded-full">
              선택됨
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(options as any[]).map((opt: any) => {
            const val = isObj ? opt.label : opt
            const label2 = isObj ? `${opt.icon} ${opt.label}` : opt
            const selected = value === val
            return (
              <button
                key={val}
                onClick={() => onChange(selected ? '' : val)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  selected
                    ? 'bg-[#FF6B47] text-white shadow-sm'
                    : 'bg-white text-[#1A1A2E] border border-[#E5E7EB]'
                }`}
              >
                {label2}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">
          어떤 문화생활<br />
          <em className="text-[#FFD23F] not-italic">찾고 있어요?</em>
        </h1>
        <p className="text-white/50 text-sm mt-2">선택만 하면 AI가 코스를 짜드려요</p>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 bg-white border-b border-[#F3F4F6]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#6B7280] font-medium">조건 입력 중</span>
          <span className="text-xs font-bold text-[#FF6B47]">{filledCount}/5</span>
        </div>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6B47] rounded-full transition-all duration-500"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32 hide-scrollbar">
        <RadioGroup
          label="언제 가실 건가요?"
          icon="📅"
          options={SCHEDULE_OPTIONS}
          value={schedule}
          onChange={setSchedule}
        />
        <div className="h-px bg-[#F3F4F6] mb-6" />
        <RadioGroup
          label="누구랑 가시나요?"
          icon="👥"
          options={COMPANION_OPTIONS}
          value={companion}
          onChange={setCompanion}
        />
        <div className="h-px bg-[#F3F4F6] mb-6" />
        <RadioGroup
          label="어디서 출발하시나요?"
          icon="🚇"
          options={DEPARTURE_OPTIONS}
          value={departure}
          onChange={setDeparture}
        />
        <div className="h-px bg-[#F3F4F6] mb-6" />
        <RadioGroup
          label="어느 구로 가실 건가요?"
          icon="🗺️"
          options={DESTINATION_OPTIONS}
          value={destination}
          onChange={setDestination}
        />
        <div className="h-px bg-[#F3F4F6] mb-6" />
        <RadioGroup
          label="어떤 장소를 선호하세요?"
          icon="⭐"
          options={VENUE_OPTIONS}
          value={venue}
          onChange={setVenue}
        />
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-5 pb-2">
        <button
          onClick={() => canSearch && onResults()}
          disabled={!canSearch}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            canSearch
              ? 'bg-[#FF6B47] text-white shadow-lg shadow-[#FF6B47]/30 active:scale-95'
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          {canSearch ? '✨ 나만의 코스 찾기' : `조건 ${5 - filledCount}개 더 선택해주세요`}
        </button>
      </div>
    </div>
  )
}
