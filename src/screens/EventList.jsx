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
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { addFavorite, getFavorites, removeFavorite } from '../api/favorites'
import useCurrentMember from '../hooks/useCurrentMember'
import { COURSE_DRAFT_CHANGED, readActiveCourseEditSession, readCourseBuilder, readCourseDraft, toggleCourseEvent } from '../utils/courseDraft'

function FilterSheet({ filters, onClose, onApply }) {
  const [draft, setDraft] = useState(filters)
  return (
    <EventDialog title="필터" id="event-filter-title" onClose={onClose}>
      <form onSubmit={event => { event.preventDefault(); onApply(draft) }}>
        <div className="flex justify-end mb-3">
          <button type="button" onClick={() => setDraft({ ...draft, district: [], category: [], from: '', to: '' })} className="rounded-lg px-2 py-1 text-sm font-semibold text-ink-muted hover:bg-[#F2F4F6]">필터 초기화</button>
        </div>
        <EventFilterFields value={draft} onChange={setDraft} />
        <div className="sticky bottom-0 flex gap-2 bg-white pt-3">
          <button type="button" onClick={onClose} className="rounded-2xl bg-[#F2F4F6] px-6 py-3.5 font-semibold text-ink-soft">취소</button>
          <button type="submit" className="flex-1 rounded-2xl bg-coral py-3.5 font-bold text-white">필터 적용하기</button>
        </div>
      </form>
    </EventDialog>
  )
}

function EventCard({ event, returnTo, selected, favoriteSaved, favoriteLoading, onToggleCourse, onToggleFavorite }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color = CATEGORY_COLOR[event.category] || { bg: '#F3EEFF', text: '#8B5CF6' }
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card transition duration-200 md:hover:-translate-y-0.5 md:hover:shadow-lift">
      <Link to={`/events/${encodeURIComponent(event.eventId)}`} state={{ returnTo }}
        className="block flex-1 transition-transform active:scale-[0.99]">
      <div className="relative aspect-video w-full overflow-hidden bg-[#F2F4F6]">
        {event.imageUrl && !imageFailed
          ? <img src={event.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-[1.03]" />
          : <div className="h-full flex items-center justify-center text-sm text-ink-muted bg-[#F3EEFF]">이미지 없음</div>}
        {event.category && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow-sm" style={{ color: color.text }}>{event.category}</span>}
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 text-base font-bold leading-snug text-ink">{event.title || '제목 없음'}</h2>
        <div className="mt-2.5 space-y-1.5 text-[13px] text-ink-muted">
          <p className="flex items-center gap-1.5"><Icon name="calendar" size={15} /><span>{formatShortDate(event)}</span></p>
          <p className="flex items-center gap-1.5"><Icon name="pin" size={15} /><span className="truncate">{[event.district, event.place || '장소 확인 필요'].filter(Boolean).join(' · ')}</span></p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          {event.fee ? <p className="truncate rounded-md bg-[#E6FAF7] px-2 py-0.5 text-xs font-bold text-[#008F75]">{event.fee}</p> : <span />}
          <p aria-label={`조회수 ${Number.isFinite(event.viewCount) ? event.viewCount.toLocaleString('ko-KR') : '-'}`}
            className="flex flex-shrink-0 items-center gap-1 text-xs text-ink-muted">
            <Icon name="eye" size={14} />
            <span>{Number.isFinite(event.viewCount) ? event.viewCount.toLocaleString('ko-KR') : '-'}</span>
          </p>
        </div>
      </div>
      </Link>
      {onToggleFavorite && <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <button type="button" onClick={() => onToggleFavorite(event)} disabled={favoriteLoading} aria-pressed={favoriteSaved}
          aria-label={`${event.title} ${favoriteSaved ? '관심행사 취소' : '관심행사 추가'}`}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[13px] font-bold transition-colors disabled:opacity-60 ${favoriteSaved ? 'bg-coral-light text-coral' : 'bg-[#F2F4F6] text-ink-soft hover:bg-[#E9ECEF]'}`}>
          <Icon name="heart" size={16} filled={favoriteSaved} strokeWidth={2} />
          {favoriteLoading ? (favoriteSaved ? '취소 중...' : '저장 중...') : favoriteSaved ? '저장됨' : '관심행사'}
        </button>
        <button type="button" aria-pressed={selected} onClick={() => onToggleCourse(event)}
          aria-label={`${event.title} 코스에 추가`}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[13px] font-bold transition-colors ${selected ? 'bg-[#E6FAF7] text-[#008F75]' : 'bg-ink text-white hover:bg-black'}`}>
          <Icon name={selected ? 'route' : 'plus'} size={16} strokeWidth={2.2} />
          {selected ? '코스에 담음' : '코스에 담기'}
        </button>
      </div>}
    </article>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const [pageInput, setPageInput] = useState(String(currentPage + 1))
  const blockStart = Math.floor(currentPage / 10) * 10
  const pages = Array.from({ length: Math.min(10, totalPages - blockStart) }, (_, index) => blockStart + index)
  const hasPreviousBlock = blockStart > 0
  const hasNextBlock = blockStart + 10 < totalPages

  useEffect(() => { setPageInput(String(currentPage + 1)) }, [currentPage])

  const submitPage = event => {
    event.preventDefault()
    const page = Number(pageInput)
    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
      setPageInput(String(currentPage + 1))
      return
    }
    onPageChange(page - 1)
  }

  return (
    <nav aria-label="행사 페이지" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" disabled={!hasPreviousBlock} onClick={() => onPageChange(blockStart - 1)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-soft shadow-card disabled:opacity-40">이전</button>
      <div className="flex flex-wrap items-center justify-center gap-1" aria-label="페이지 번호">
        {pages.map(page => <button key={page} type="button" aria-label={`${page + 1}페이지`} aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)} className={`h-9 min-w-9 rounded-xl px-2 text-sm tabular-nums transition-colors ${page === currentPage ? 'bg-ink font-bold text-white' : 'text-ink-soft hover:bg-white'}`}>
          {page + 1}
        </button>)}
      </div>
      <button type="button" disabled={!hasNextBlock} onClick={() => onPageChange(blockStart + 10)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-soft shadow-card disabled:opacity-40">다음</button>
      <form aria-label="페이지 직접 이동" onSubmit={submitPage} className="basis-full sm:basis-auto flex items-center justify-center gap-2 mt-2 sm:mt-0 sm:ml-2">
        <label htmlFor="event-page-input" className="text-sm text-ink-muted">페이지</label>
        <input id="event-page-input" type="number" min="1" max={totalPages} value={pageInput} onChange={event => setPageInput(event.target.value)}
          className="w-20 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-center text-sm tabular-nums" />
        <span className="text-sm text-ink-muted">/ {totalPages}</span>
        <button type="submit" className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink shadow-card">이동</button>
      </form>
    </nav>
  )
}

export default function EventList({ initialFilterOpen = false }) {
  const { member } = useCurrentMember()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.toString()
  const filters = readEventFilters(query)
  const [keyword, setKeyword] = useState(filters.keyword)
  const [filterOpen, setFilterOpen] = useState(initialFilterOpen)
  const [retry, setRetry] = useState(0)
  const [request, setRequest] = useState({ query, loading: true, data: null, error: null })
  const [emptyNotice, setEmptyNotice] = useState(false)
  const [courseEvents, setCourseEvents] = useState(() => readCourseDraft())
  const [coursePlaces, setCoursePlaces] = useState(() => readCourseBuilder().stops.filter(stop => stop.stopType === 'PLACE'))
  const [courseEditSession] = useState(() => readActiveCourseEditSession())
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null)
  const [favoriteError, setFavoriteError] = useState('')
  const loading = request.query !== query || request.loading
  const data = request.query === query ? request.data : null
  const error = request.query === query ? request.error : null
  const tags = ['district', 'category'].flatMap(key => filters[key].map(value => ({ key, value })))
  if (filters.from) tags.push({ key: 'range', value: `${filters.from} ~ ${filters.to}` })
  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / EVENT_PAGE_SIZE)) : 1
  const cafeCount = coursePlaces.filter(place => place.placeType === 'cafe').length
  const restaurantCount = coursePlaces.filter(place => place.placeType === 'restaurant').length
  const courseSummary = [
    `행사 ${courseEvents.length}개`,
    ...(cafeCount ? [`카페 ${cafeCount}개`] : []),
    ...(restaurantCount ? [`음식점 ${restaurantCount}개`] : []),
  ].join(' · ')

  useEffect(() => { setKeyword(readEventFilters(query).keyword) }, [query])

  useEffect(() => {
    const sync = event => {
      setCourseEvents(event.detail || readCourseDraft())
      setCoursePlaces(readCourseBuilder().stops.filter(stop => stop.stopType === 'PLACE'))
    }
    window.addEventListener(COURSE_DRAFT_CHANGED, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(COURSE_DRAFT_CHANGED, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (!member) {
      setFavoriteIds(new Set())
      return undefined
    }

    const controller = new AbortController()
    getFavorites(undefined, controller.signal)
      .then(items => {
        if (!controller.signal.aborted) {
          setFavoriteIds(new Set(items.map(item => String(item.eventId))))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFavoriteIds(new Set())
      })
    return () => controller.abort()
  }, [member])

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

  const handleToggleFavorite = async event => {
    if (!member || favoriteLoadingId) return
    const id = String(event.eventId)
    const saved = favoriteIds.has(id)
    const setSaved = value => setFavoriteIds(current => {
      const next = new Set(current)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
    setFavoriteLoadingId(id)
    setFavoriteError('')
    try {
      if (saved) await removeFavorite(event.eventId)
      else await addFavorite(event.eventId)
      setSaved(!saved)
    } catch (error) {
      const status = error.response?.status
      if (status === 401) navigate('/login')
      else if (!saved && status === 409) setSaved(true)
      else if (saved && status === 404) setSaved(false)
      else setFavoriteError(saved ? '관심행사 취소에 실패했습니다.' : '관심행사 저장에 실패했습니다.')
    } finally {
      setFavoriteLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <PageHeader title="행사 목록" live
        description={loading ? '행사를 찾고 있어요' : error ? '조회 실패' : `${(data?.totalCount ?? 0).toLocaleString('ko-KR')}개의 행사`} />

      <div className="bg-white px-5 md:px-8 lg:px-10 pt-3 pb-3">
        <div className="flex items-center gap-2 max-w-5xl">
          <form aria-label="행사 검색" onSubmit={event => { event.preventDefault(); applyFilters({ ...filters, keyword }) }} className="relative flex flex-1 min-w-0 gap-2">
            <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input aria-label="행사 이름, 장소로 검색" type="search" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="행사 이름, 장소로 검색"
              className="h-11 min-w-0 flex-1 rounded-xl bg-[#F2F4F6] pl-10 pr-3 text-[15px] text-ink outline-none placeholder:text-ink-muted focus:bg-white focus:ring-2 focus:ring-coral/40" />
            <button type="submit" className="h-11 rounded-xl bg-ink px-4 text-sm font-bold text-white">검색</button>
          </form>
          <button type="button" onClick={() => setFilterOpen(true)} aria-label={`필터${tags.length ? ` ${tags.length}` : ''}`}
            className={`relative flex h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-bold ${tags.length ? 'border-coral bg-coral-light text-coral' : 'border-black/[0.08] text-ink-soft'}`}>
            <Icon name="filter" size={18} strokeWidth={2} />
            <span className="hidden sm:inline">필터</span>
            {tags.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] text-white">{tags.length}</span>}
          </button>
        </div>
        {(tags.length > 0 || filters.keyword) && <div aria-label="적용된 검색 조건" className="flex flex-wrap items-center gap-2 mt-3 max-w-5xl">
          {tags.map(({ key, value }) => <button key={`${key}-${value}`} type="button" aria-label={`${value} 조건 해제`}
            onClick={() => applyFilters(key === 'range' ? { ...filters, from: '', to: '' } : { ...filters, [key]: filters[key].filter(item => item !== value) })}
            className="flex items-center gap-1 rounded-full bg-coral-light py-1 pl-3 pr-2 text-xs font-semibold text-coral">{value} <Icon name="close" size={13} strokeWidth={2.4} /></button>)}
          {filters.keyword && <button type="button" aria-label="검색어 조건 해제" onClick={() => applyFilters({ ...filters, keyword: '' })} className="flex items-center gap-1 rounded-full bg-coral-light py-1 pl-3 pr-2 text-xs font-semibold text-coral">검색어: {filters.keyword} <Icon name="close" size={13} strokeWidth={2.4} /></button>}
          <button type="button" onClick={() => applyFilters(readEventFilters())} className="px-2 text-xs font-semibold text-ink-muted hover:text-ink">전체 초기화</button>
        </div>}
      </div>

      <div aria-label="분야 빠른 선택" className="bg-white border-b border-black/[0.06] flex overflow-x-auto md:flex-wrap px-5 md:px-8 lg:px-10 pb-3 pt-1 gap-2 hide-scrollbar">
        {['전체', ...CATEGORIES].map(category => {
          const selected = category === '전체' ? !filters.category.length : filters.category.includes(category)
          return <button key={category} type="button" aria-pressed={selected}
            onClick={() => applyFilters({ ...filters, category: category === '전체' ? [] : toggleValue(filters.category, category) })}
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${selected ? 'border-ink bg-ink text-white' : 'border-black/[0.08] bg-white text-ink-soft hover:border-black/20'}`}>{category}</button>
        })}
        <label className="ml-auto flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft">
          <input type="checkbox" checked={filters.includePast} onChange={event => applyFilters({ ...filters, includePast: event.target.checked })} className="h-4 w-4 accent-[#FF6B47]" />
          지난 행사 보기
        </label>
      </div>

      <section aria-label="행사 검색 결과" aria-busy={loading} className="px-5 md:px-8 lg:px-10 pt-4 pb-8">
        <div className="max-w-5xl">
          {member && courseEvents.length > 0 && <div className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-ink py-2.5 pl-4 pr-2.5 text-white shadow-lift md:bottom-6 md:left-[calc(72px+1.5rem)] lg:left-[calc(232px+1.5rem)]">
            <p className="min-w-0 text-sm"><strong>{courseSummary}</strong>를 코스에 담았어요.</p>
            <Link to="/course" className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-coral px-4 py-2.5 text-sm font-bold">{courseEditSession ? '코스 수정 계속하기' : '코스 만들기'}<Icon name="chevronRight" size={16} strokeWidth={2.4} /></Link>
          </div>}
          {loading && <div role="status" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">행사를 불러오는 중입니다.</span>
            {[0, 1, 2].map(key => <div key={key} aria-hidden="true" className={`overflow-hidden rounded-2xl bg-white shadow-card ${key > 0 ? 'hidden md:block' : ''}`}>
              <div className="aspect-video animate-pulse bg-[#F2F4F6]" />
              <div className="space-y-2.5 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-[#F2F4F6]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#F2F4F6]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#F2F4F6]" />
              </div>
            </div>)}
          </div>}
          {error && <div role="alert" className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-card">
            <p>{getEventsError(error)}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-[#F2F4F6] px-4 py-2 font-bold text-ink">다시 시도</button>
              {error.response?.status === 401 && <Link to="/login" className="rounded-xl bg-coral px-4 py-2 font-bold text-white">로그인</Link>}
            </div>
          </div>}
          {!loading && data && <>
            {data.isMock && <DemoNotice onRetry={getDataMode() === 'auto' ? () => setRetry(value => value + 1) : undefined} />}
            <p className="text-[13px] text-ink-muted mb-3">시작일이 빠른 순으로 표시됩니다.</p>
            {favoriteError && <p role="alert" className="mb-3 rounded-xl bg-[#FFF0EC] px-3 py-2 text-sm text-[#B93820]">{favoriteError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.events.map(event => member ? <EventCard key={event.eventId} event={event} returnTo={`/events?${query}`}
                selected={courseEvents.some(item => String(item.eventId) === String(event.eventId))}
                favoriteSaved={favoriteIds.has(String(event.eventId))}
                favoriteLoading={favoriteLoadingId === String(event.eventId)}
                onToggleCourse={item => setCourseEvents(toggleCourseEvent(item))}
                onToggleFavorite={handleToggleFavorite} /> : (
                  <EventCard key={event.eventId} event={event} returnTo={`/events?${query}`} />
                ))}
            </div>
            {!data.events.length && <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center text-sm text-ink-muted shadow-card">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F4F6] text-ink-muted"><Icon name="search" size={22} /></span>
              <p>{data.totalCount ? '이 페이지에는 행사가 없습니다.' : '조건에 맞는 행사가 없습니다. 다른 조건으로 찾아보세요.'}</p>
              <button type="button" onClick={data.totalCount ? () => setSearchParams(createEventParams({ ...filters, page: 0 })) : changeConditions}
                className="mt-4 rounded-xl bg-ink px-4 py-2.5 font-bold text-white">{data.totalCount ? '첫 페이지로' : '조건 변경'}</button>
            </div>}
            {member && courseEvents.length > 0 && <div aria-hidden="true" className="h-20 md:h-16" />}
            {data.totalCount > 0 && <Pagination currentPage={filters.page} totalPages={totalPages}
              onPageChange={page => setSearchParams(createEventParams({ ...filters, page }))} />}
          </>}
        </div>
      </section>
      {filterOpen && <FilterSheet filters={filters} onClose={closeFilter} onApply={applySheet} />}
      {emptyNotice && !loading && !filterOpen && <EventDialog size="sm" title="검색 결과가 없습니다" id="empty-events-title" onClose={() => setEmptyNotice(false)}>
        <p className="text-[15px] text-ink-soft mb-5">자치구·분야·날짜 또는 검색어를 변경해 보세요.</p>
        <button type="button" onClick={changeConditions} className="w-full rounded-2xl bg-coral py-3.5 font-bold text-white">조건 변경하기</button>
      </EventDialog>}
    </div>
  )
}
