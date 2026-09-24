import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EventFilterFields from '../components/EventFilterFields'
import { createEventParams, readEventFilters } from '../utils/eventFilters'

export default function Search() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [filters, setFilters] = useState(() => readEventFilters(params.toString()))
  const filledSections = [filters.district.length, filters.category.length, filters.from].filter(Boolean).length
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <header className="px-5 md:px-8 lg:px-10 pt-12 pb-5 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">어떤 문화생활<br /><em className="text-[#FFD23F] not-italic">찾고 있어요?</em></h1>
        <p className="text-white/60 text-sm mt-2">원하는 조건을 골라 서울 문화행사를 찾아보세요.</p>
      </header>
      <div className="px-5 md:px-8 lg:px-10 py-3 bg-white border-b border-[#F3F4F6]">
        <div className="max-w-3xl flex justify-between text-xs mb-2"><span>조건 선택 (선택 사항)</span><span>{filledSections}/3</span></div>
        <div className="max-w-3xl h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden"><div className="h-full bg-[#FF6B47]" style={{ width: `${filledSections / 3 * 100}%` }} /></div>
      </div>
      <form className="px-5 md:px-8 lg:px-10 py-5 max-w-3xl w-full" onSubmit={event => { event.preventDefault(); navigate(`/events?${createEventParams({ ...filters, page: 0 })}`) }}>
        <label className="block text-sm font-semibold mb-2" htmlFor="search-keyword">행사 이름 또는 장소</label>
        <input id="search-keyword" type="search" value={filters.keyword} onChange={event => setFilters({ ...filters, keyword: event.target.value })}
          placeholder="검색어를 입력하세요" className="w-full mb-5 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm" />
        <EventFilterFields value={filters} onChange={setFilters} />
        <div className="flex gap-3 mt-5 pb-6">
          <button type="button" onClick={() => setFilters(readEventFilters())} className="px-5 py-3 bg-white border border-[#E5E7EB] rounded-xl">초기화</button>
          <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-[#FF6B47] text-white">{filledSections || filters.keyword.trim() ? '행사 검색' : '전체 행사 보기'}</button>
        </div>
      </form>
    </div>
  )
}
