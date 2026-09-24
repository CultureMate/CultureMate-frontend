import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getEvents, getEventsError } from '../api/events'
import { getDataMode } from '../api/dataMode'
import { CATEGORY_COLOR, CATEGORIES } from '../data/events'
import { createEventParams, EVENT_PAGE_SIZE, readEventFilters, toggleValue } from '../utils/eventFilters'
import { formatShortDate } from '../utils/eventDate'
import DemoNotice from '../components/DemoNotice'
import EventDialog from '../components/EventDialog'
import EventFilterFields from '../components/EventFilterFields'

function FilterSheet({ filters, onClose, onApply }) {
  const [draft, setDraft] = useState(filters)
  return (
    <EventDialog title="필터" id="event-filter-title" onClose={onClose}>
      <form onSubmit={event => { event.preventDefault(); onApply(draft) }}>
        <div className="flex justify-end mb-3">
          <button type="button" onClick={() => setDraft({ ...draft, district: [], category: [], from: '', to: '' })} className="text-sm text-[#6B7280] underline">필터 초기화</button>
        </div>
        <EventFilterFields value={draft} onChange={setDraft} />
        <div className="sticky bottom-0 bg-white pt-3 flex gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-[#E5E7EB]">취소</button>
          <button type="submit" className="flex-1 py-3 rounded-xl bg-[#FF6B47] text-white font-bold">필터 적용하기</button>
        </div>
      </form>
    </EventDialog>
  )
}

function EventCard({ event, returnTo }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color = CATEGORY_COLOR[event.category] || { bg: '#F3EEFF', text: '#8B5CF6' }
  return (
    <Link to={`/events/${encodeURIComponent(event.eventId)}`} state={{ returnTo }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform text-left w-full focus-visible:outline focus-visible:outline-[#FF6B47]">
      <div className="relative h-[180px] bg-gray-100">
        {event.imageUrl && !imageFailed
          ? <img src={event.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} className="w-full h-full object-cover" />
          : <div className="h-full flex items-center justify-center text-sm text-[#6B7280] bg-[#F3EEFF]">이미지 없음</div>}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.category && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color.bg, color: color.text }}>{event.category}</span>}
          {event.district && <span className="text-[#6B7280] text-xs">{event.district}</span>}
        </div>
        <h2 className="font-semibold text-[#1A1A2E] text-base leading-tight mb-2">{event.title || '제목 없음'}</h2>
        <p className="text-[#6B7280] text-xs mb-1">📅 {formatShortDate(event)}</p>
        <p className="text-[#6B7280] text-xs">📍 {event.place || '장소 확인 필요'}</p>
        {event.fee && <p className="text-sm font-bold mt-2 text-[#00C4A0]">{event.fee}</p>}
      </div>
    </Link>
  )
}

export default function EventList({ initialFilterOpen = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.toString()
  const filters = readEventFilters(query)
  const [keyword, setKeyword] = useState(filters.keyword)
  const [filterOpen, setFilterOpen] = useState(initialFilterOpen)
  const [retry, setRetry] = useState(0)
  const [request, setRequest] = useState({ query, loading: true, data: null, error: null })
  const [emptyNotice, setEmptyNotice] = useState(false)
  const loading = request.query !== query || request.loading
  const data = request.query === query ? request.data : null
  const error = request.query === query ? request.error : null
  const tags = ['district', 'category'].flatMap(key => filters[key].map(value => ({ key, value })))
  if (filters.from) tags.push({ key: 'range', value: `${filters.from} ~ ${filters.to}` })
  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / EVENT_PAGE_SIZE)) : 1

  useEffect(() => { setKeyword(readEventFilters(query).keyword) }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const loadData = async () => {
      setRequest({ query, loading: true, data: null, error: null })
      setEmptyNotice(false)
      try {
        const result = await getEvents(readEventFilters(query), controller.signal)
        if (!controller.signal.aborted) {
          setRequest({ query, loading: false, data: result, error: null })
          setEmptyNotice(result.totalCount === 0)
        }
      } catch (err) {
        if (!controller.signal.aborted) setRequest({ query, loading: false, data: null, error: err })
      }
    }
    loadData()
    return () => controller.abort()
  }, [query, retry])

  const applyFilters = next => {
    setEmptyNotice(false)
    setSearchParams(createEventParams({ ...next, page: 0 }))
  }
  const closeFilter = () => {
    setFilterOpen(false)
    if (initialFilterOpen) navigate({ pathname: '/events', search: query ? `?${query}` : '' }, { replace: true })
  }
  const applySheet = draft => {
    setFilterOpen(false)
    setEmptyNotice(false)
    if (initialFilterOpen) navigate(`/events?${createEventParams({ ...draft, page: 0 })}`, { replace: true })
    else applyFilters(draft)
  }
  const changeConditions = () => { setEmptyNotice(false); setFilterOpen(true) }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <header className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold">행사 목록</h1>
        <p aria-live="polite" className="text-white/60 text-sm mt-2">{loading ? '행사를 찾고 있어요' : error ? '조회 실패' : `${data?.totalCount ?? 0}개의 행사`}</p>
      </header>

      <div className="bg-white px-5 md:px-8 lg:px-10 pt-3 pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2 max-w-5xl">
          <form aria-label="행사 검색" onSubmit={event => { event.preventDefault(); applyFilters({ ...filters, keyword }) }} className="flex gap-2 flex-1 min-w-0">
            <input aria-label="행사 이름, 장소로 검색" type="search" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="행사 이름, 장소로 검색"
              className="min-w-0 flex-1 bg-[#F3F4F6] rounded-xl px-3 py-2.5 text-sm text-[#1A1A2E]" />
            <button type="submit" className="px-3 py-2 rounded-xl bg-[#1A1A2E] text-white text-sm font-bold">검색</button>
          </form>
          <button type="button" onClick={() => setFilterOpen(true)} className="px-3 py-2.5 rounded-xl text-sm font-bold border border-[#E5E7EB] text-[#6B7280]">필터{tags.length ? ` ${tags.length}` : ''}</button>
        </div>
        {(tags.length > 0 || filters.keyword) && <div aria-label="적용된 검색 조건" className="flex flex-wrap gap-2 mt-3 max-w-5xl">
          {tags.map(({ key, value }) => <button key={`${key}-${value}`} type="button" aria-label={`${value} 조건 해제`}
            onClick={() => applyFilters(key === 'range' ? { ...filters, from: '', to: '' } : { ...filters, [key]: filters[key].filter(item => item !== value) })}
            className="px-2 py-1 rounded-lg bg-[#FFF0EC] text-[#FF6B47] text-xs">{value} ×</button>)}
          {filters.keyword && <button type="button" aria-label="검색어 조건 해제" onClick={() => applyFilters({ ...filters, keyword: '' })} className="px-2 py-1 rounded-lg bg-[#FFF0EC] text-[#FF6B47] text-xs">검색어: {filters.keyword} ×</button>}
          <button type="button" onClick={() => applyFilters(readEventFilters())} className="px-2 text-xs text-[#6B7280] underline">전체 초기화</button>
        </div>}
      </div>

      <div aria-label="분야 빠른 선택" className="bg-white border-b border-[#F3F4F6] flex overflow-x-auto md:flex-wrap px-5 md:px-8 lg:px-10 py-3 gap-2 hide-scrollbar">
        {['전체', ...CATEGORIES].map(category => {
          const selected = category === '전체' ? !filters.category.length : filters.category.includes(category)
          return <button key={category} type="button" aria-pressed={selected}
            onClick={() => applyFilters({ ...filters, category: category === '전체' ? [] : toggleValue(filters.category, category) })}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold ${selected ? 'bg-[#1A1A2E] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{category}</button>
        })}
      </div>

      <section aria-label="행사 검색 결과" aria-busy={loading} className="px-5 md:px-8 lg:px-10 pt-4 pb-8">
        <div className="max-w-5xl">
          {loading && <p role="status" className="p-6 rounded-2xl bg-white text-sm text-[#6B7280]">행사를 불러오는 중입니다.</p>}
          {error && <div role="alert" className="p-6 rounded-2xl bg-white text-sm text-[#6B7280]">
            <p>{getEventsError(error)}</p>
            <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 text-[#FF6B47] font-semibold">다시 시도</button>
            {error.response?.status === 401 && <Link to="/login" className="ml-4 text-[#FF6B47]">로그인</Link>}
          </div>}
          {!loading && data && <>
            {data.isMock && <DemoNotice onRetry={getDataMode() === 'auto' ? () => setRetry(value => value + 1) : undefined} />}
            <p className="text-xs text-[#6B7280] mb-3">시작일이 빠른 순으로 표시됩니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.events.map(event => <EventCard key={event.eventId} event={event} returnTo={`/events?${query}`} />)}
            </div>
            {!data.events.length && <div className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]">
              <p>{data.totalCount ? '이 페이지에는 행사가 없습니다.' : '조건에 맞는 행사가 없습니다. 다른 조건으로 찾아보세요.'}</p>
              <button type="button" onClick={data.totalCount ? () => setSearchParams(createEventParams({ ...filters, page: 0 })) : changeConditions}
                className="mt-3 text-[#FF6B47] font-semibold">{data.totalCount ? '첫 페이지로' : '조건 변경'}</button>
            </div>}
            {data.totalCount > 0 && <nav aria-label="행사 페이지" className="flex items-center justify-center gap-5 mt-6">
              <button type="button" disabled={filters.page === 0} onClick={() => setSearchParams(createEventParams({ ...filters, page: filters.page - 1 }))} className="px-4 py-2 bg-white rounded-xl disabled:opacity-40">이전</button>
              <span className="text-sm">{filters.page + 1} / {totalPages}</span>
              <button type="button" disabled={filters.page + 1 >= totalPages} onClick={() => setSearchParams(createEventParams({ ...filters, page: filters.page + 1 }))} className="px-4 py-2 bg-white rounded-xl disabled:opacity-40">다음</button>
            </nav>}
          </>}
        </div>
      </section>
      {filterOpen && <FilterSheet filters={filters} onClose={closeFilter} onApply={applySheet} />}
      {emptyNotice && !loading && !filterOpen && <EventDialog title="검색 결과가 없습니다" id="empty-events-title" onClose={() => setEmptyNotice(false)}>
        <p className="text-sm text-[#6B7280] mb-5">자치구·분야·날짜 또는 검색어를 변경해 보세요.</p>
        <button type="button" onClick={changeConditions} className="w-full py-3 rounded-xl bg-[#FF6B47] text-white font-bold">조건 변경하기</button>
      </EventDialog>}
    </div>
  )
}
