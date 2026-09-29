import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EventFilterFields from '../components/EventFilterFields'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { createEventParams, readEventFilters } from '../utils/eventFilters'

export default function Search() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [filters, setFilters] = useState(() => readEventFilters(params.toString()))
  const filledSections = [filters.district.length, filters.category.length, filters.from].filter(Boolean).length
  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <PageHeader title="행사 찾기" description="원하는 조건을 골라 서울 문화행사를 찾아보세요." innerClassName="max-w-3xl" />
      <form className="px-5 md:px-8 lg:px-10 pt-5 max-w-3xl w-full" onSubmit={event => { event.preventDefault(); navigate(`/events?${createEventParams({ ...filters, page: 0 })}`) }}>
        <label className="sr-only" htmlFor="search-keyword">행사 이름 또는 장소</label>
        <div className="relative mb-4">
          <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input id="search-keyword" type="search" value={filters.keyword} onChange={event => setFilters({ ...filters, keyword: event.target.value })}
            placeholder="행사 이름 또는 장소를 검색하세요"
            className="h-14 w-full rounded-2xl border border-transparent bg-white pl-12 pr-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-ink-muted focus:border-coral" />
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-card md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-base font-bold text-ink">상세 조건</p>
            <span className="rounded-full bg-[#F2F4F6] px-2.5 py-1 text-xs font-semibold text-ink-soft">{filledSections}/3 선택</span>
          </div>
          <EventFilterFields value={filters} onChange={setFilters} />
        </div>
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-5 mt-5 flex gap-2 bg-gradient-to-t from-canvas via-canvas to-canvas/0 px-5 pb-4 pt-6 md:static md:mx-0 md:bg-none md:px-0 md:pb-10">
          <button type="button" onClick={() => setFilters(readEventFilters())} className="h-14 rounded-2xl bg-white px-5 text-[15px] font-bold text-ink-soft shadow-card">초기화</button>
          <button type="submit" className="h-14 flex-1 rounded-2xl bg-coral text-[15px] font-bold text-white transition-colors hover:bg-coral-dark">{filledSections || filters.keyword.trim() ? '행사 검색' : '전체 행사 보기'}</button>
        </div>
      </form>
    </div>
  )
}
