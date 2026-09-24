import { useState } from 'react'
import { CATEGORIES, DISTRICTS } from '../data/events'
import { toggleValue } from '../utils/eventFilters'

function CheckGroup({ label, options, selected, onChange, color }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? options : options.filter((value, index) => index < 8 || selected.includes(value))
  return (
    <fieldset className="mb-6">
      <legend className="font-semibold text-[#1A1A2E] mb-3">{label} <span className="text-xs text-[#6B7280]">{selected.length ? `${selected.length}개 선택` : '다중 선택 가능'}</span></legend>
      <div className="flex flex-wrap gap-2">
        {visible.map(value => <label key={value} className="cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={selected.includes(value)} onChange={() => onChange(toggleValue(selected, value))} />
          <span className="block px-3 py-2 rounded-xl text-sm border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#1A1A2E]"
            style={selected.includes(value) ? { backgroundColor: color, borderColor: color, color: 'white' } : { borderColor: '#E5E7EB', color: '#374151' }}>{value}</span>
        </label>)}
        {options.length > 8 && <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}
          className="px-3 py-2 rounded-xl text-sm border border-dashed text-[#6B7280]">{expanded ? '접기' : `${label} 더보기`}</button>}
      </div>
    </fieldset>
  )
}

function DatePicker({ from, to, onChange }) {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
  const [month, setMonth] = useState(() => (from || today).slice(0, 7))
  const [anchor, setAnchor] = useState(() => from && from === to ? from : null)
  const waitingForEnd = Boolean(anchor && from === anchor && to === anchor)
  const selectDate = date => {
    if (waitingForEnd) {
      const dates = [anchor, date].sort()
      onChange({ from: dates[0], to: dates[1] })
      setAnchor(null)
    } else {
      onChange({ from: date, to: date })
      setAnchor(date)
    }
  }
  const [year, monthNumber] = month.split('-').map(Number)
  const offset = new Date(year, monthNumber - 1, 1).getDay()
  const count = new Date(year, monthNumber, 0).getDate()
  const changeMonth = direction => {
    const next = new Date(year, monthNumber - 1 + direction, 1)
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
  }
  return (
    <fieldset className="mb-4">
      <legend className="font-semibold text-[#1A1A2E] mb-3">날짜 범위</legend>
      <p className="text-xs text-[#6B7280] mb-3">하나만 고르면 당일로 검색합니다. 두 날짜를 고르면 빠른 날짜부터 늦은 날짜까지 적용됩니다. 범위 선택 후 다시 누르면 새로 선택합니다.</p>
      <div aria-live="polite" className="flex items-center gap-3 mb-3 text-sm">
        <div><span className="block text-xs text-[#6B7280]">시작일</span><output aria-label="시작일">{from || '선택 안 함'}</output></div>
        <span>~</span>
        <div><span className="block text-xs text-[#6B7280]">종료일</span><output aria-label="종료일">{to || '선택 안 함'}</output></div>
      </div>
      <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl p-3 max-w-lg">
        <div className="flex justify-between items-center mb-2">
          <button type="button" aria-label="이전 달" onClick={() => changeMonth(-1)} className="w-10 h-10 rounded-xl hover:bg-white">←</button>
          <p aria-live="polite" className="font-semibold text-sm">{year}년 {monthNumber}월</p>
          <button type="button" aria-label="다음 달" onClick={() => changeMonth(1)} className="w-10 h-10 rounded-xl hover:bg-white">→</button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day} className="text-xs text-[#6B7280] py-2">{day}</span>)}
          {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length: count }, (_, index) => {
            const date = `${month}-${String(index + 1).padStart(2, '0')}`
            const selected = Boolean(from && to && date >= from && date <= to)
            const endpoint = date === from || date === to
            return <button key={date} type="button" aria-label={date} aria-pressed={selected} aria-current={date === today ? 'date' : undefined}
              onClick={() => selectDate(date)}
              className={`h-10 rounded-full text-sm ${endpoint ? 'bg-[#FF6B47] text-white' : selected ? 'bg-[#FFF0EC] text-[#FF6B47]' : date === today ? 'text-[#FF6B47] font-bold' : 'text-[#1A1A2E] hover:bg-white'}`}>{index + 1}</button>
          })}
        </div>
      </div>
      {from && <div className="mt-3">
        <button type="button" onClick={() => { onChange({ from: '', to: '' }); setAnchor(null) }}
          className="text-xs px-2 py-1 bg-[#FFF0EC] text-[#FF6B47] rounded-lg">날짜 선택 해제 ×</button>
      </div>}
    </fieldset>
  )
}

export default function EventFilterFields({ value, onChange }) {
  const update = (key, values) => onChange({ ...value, [key]: values })
  return <>
    <CheckGroup label="자치구" options={DISTRICTS} selected={value.district} onChange={values => update('district', values)} color="#FF6B47" />
    <CheckGroup label="분야" options={CATEGORIES} selected={value.category} onChange={values => update('category', values)} color="#8B5CF6" />
    <DatePicker from={value.from} to={value.to} onChange={range => onChange({ ...value, ...range })} />
  </>
}
