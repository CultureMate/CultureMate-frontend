import { useState } from 'react'
import { CATEGORIES, DISTRICTS } from '../data/events'
import { includePastForSelectedDate, toggleValue } from '../utils/eventFilters'
import Icon from './Icon'

function CheckGroup({ label, options, selected, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? options : options.filter((value, index) => index < 8 || selected.includes(value))
  return (
    <fieldset className="mb-7">
      <legend className="mb-3 text-[15px] font-bold text-ink">{label} <span className="ml-1 text-xs font-medium text-ink-muted">{selected.length ? `${selected.length}개 선택` : '다중 선택 가능'}</span></legend>
      <div className="flex flex-wrap gap-2">
        {visible.map(value => <label key={value} className="cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={selected.includes(value)} onChange={() => onChange(toggleValue(selected, value))} />
          <span className="block rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-black/20 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-coral">{value}</span>
        </label>)}
        {options.length > 8 && <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}
          className="flex items-center gap-0.5 rounded-full bg-[#F2F4F6] px-3.5 py-2 text-sm font-semibold text-ink-soft">{expanded ? '접기' : `${label} 더보기`}<Icon name={expanded ? 'chevronLeft' : 'chevronRight'} size={14} className="rotate-90" /></button>}
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
  const yearOptions = Array.from({ length: 11 }, (_, index) => year - 5 + index)
  const offset = new Date(year, monthNumber - 1, 1).getDay()
  const count = new Date(year, monthNumber, 0).getDate()
  const moveTo = (nextYear, nextMonth) => {
    setMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`)
  }
  const changeMonth = direction => {
    const next = new Date(year, monthNumber - 1 + direction, 1)
    moveTo(next.getFullYear(), next.getMonth() + 1)
  }
  return (
    <fieldset className="mb-4">
      <legend className="mb-1 text-[15px] font-bold text-ink">날짜 범위</legend>
      <p className="mb-3 text-xs leading-relaxed text-ink-muted">하나만 고르면 당일로 검색합니다. 두 날짜를 고르면 빠른 날짜부터 늦은 날짜까지 적용됩니다. 범위 선택 후 다시 누르면 새로 선택합니다.</p>
      <div aria-live="polite" className="mb-3 grid max-w-lg grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
        <div className="rounded-xl bg-[#F2F4F6] px-3 py-2"><span className="block text-[11px] font-medium text-ink-muted">시작일</span><output aria-label="시작일" className={`font-semibold ${from ? 'text-ink' : 'text-ink-muted'}`}>{from || '선택 안 함'}</output></div>
        <span className="text-ink-muted">~</span>
        <div className="rounded-xl bg-[#F2F4F6] px-3 py-2"><span className="block text-[11px] font-medium text-ink-muted">종료일</span><output aria-label="종료일" className={`font-semibold ${to ? 'text-ink' : 'text-ink-muted'}`}>{to || '선택 안 함'}</output></div>
      </div>
      <div className="max-w-lg rounded-2xl border border-black/[0.06] p-3">
        <div className="flex justify-between items-center mb-2">
          <button type="button" aria-label="이전 달" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-[#F2F4F6]"><Icon name="chevronLeft" size={18} strokeWidth={2.2} /></button>
          <div className="flex items-center justify-center gap-2">
            <label className="sr-only" htmlFor="event-calendar-year">연도 선택</label>
            <select id="event-calendar-year" aria-label="연도 선택" value={year}
              onChange={event => moveTo(Number(event.target.value), monthNumber)}
              className="rounded-lg bg-[#F2F4F6] px-2 py-2 text-sm font-bold text-ink">
              {yearOptions.map(option => <option key={option} value={option}>{option}년</option>)}
            </select>
            <label className="sr-only" htmlFor="event-calendar-month">월 선택</label>
            <select id="event-calendar-month" aria-label="월 선택" value={monthNumber}
              onChange={event => moveTo(year, Number(event.target.value))}
              className="rounded-lg bg-[#F2F4F6] px-2 py-2 text-sm font-bold text-ink">
              {Array.from({ length: 12 }, (_, index) => index + 1).map(option => (
                <option key={option} value={option}>{option}월</option>
              ))}
            </select>
          </div>
          <button type="button" aria-label="다음 달" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-[#F2F4F6]"><Icon name="chevronRight" size={18} strokeWidth={2.2} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => <span key={day} className={`py-2 text-xs font-semibold ${index === 0 ? 'text-coral' : 'text-ink-muted'}`}>{day}</span>)}
          {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length: count }, (_, index) => {
            const date = `${month}-${String(index + 1).padStart(2, '0')}`
            const selected = Boolean(from && to && date >= from && date <= to)
            const endpoint = date === from || date === to
            return <button key={date} type="button" aria-label={date} aria-pressed={selected} aria-current={date === today ? 'date' : undefined}
              onClick={() => selectDate(date)}
              className={`h-10 rounded-full text-sm font-medium transition-colors ${endpoint ? 'bg-coral font-bold text-white' : selected ? 'bg-coral-light text-coral-dark' : date === today ? 'font-bold text-coral' : 'text-ink hover:bg-[#F2F4F6]'}`}>{index + 1}</button>
          })}
        </div>
      </div>
      {from && <div className="mt-3">
        <button type="button" onClick={() => { onChange({ from: '', to: '' }); setAnchor(null) }}
          className="flex items-center gap-1 rounded-full bg-coral-light px-3 py-1.5 text-xs font-semibold text-coral-dark">날짜 선택 해제<Icon name="close" size={12} strokeWidth={2.4} /></button>
      </div>}
    </fieldset>
  )
}

export default function EventFilterFields({ value, onChange }) {
  const update = (key, values) => onChange({ ...value, [key]: values })
  return <>
    <CheckGroup label="자치구" options={DISTRICTS} selected={value.district} onChange={values => update('district', values)} />
    <CheckGroup label="분야" options={CATEGORIES} selected={value.category} onChange={values => update('category', values)} />
    <DatePicker from={value.from} to={value.to}
      onChange={range => onChange(includePastForSelectedDate({ ...value, ...range }))} />
  </>
}
