import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getHomeError,
  getHotEvents,
  getUpcomingEvents,
} from '../api/home'
import { getCurrentMember } from '../api/auth'
import { getEvents, getEventsError } from '../api/events'
import { CATEGORIES, CATEGORY_COLOR } from '../data/events'
import {
  ddayLabel,
  formatShortDate,
} from '../utils/eventDate'
import { getDataMode } from '../api/dataMode'
import DemoNotice from '../components/DemoNotice'
import Icon from '../components/Icon'
import BrandMark, { BrandWordmark } from '../components/BrandMark'

function eventPath(event) {
  return `/events/${encodeURIComponent(event.eventId)}`
}

function SectionTitle({ id, icon, iconClassName, title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="font-display flex items-center gap-2 text-xl font-bold text-ink md:text-[22px]">
        <Icon name={icon} size={22} filled className={iconClassName} />
        {title}
      </h2>
      {action}
    </div>
  )
}

function HotCard({ event, rank }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color =
    CATEGORY_COLOR[event.category]?.text ?? '#FF6B47'

  return (
    <Link
      to={eventPath(event)}
      className="group snap-start flex-shrink-0 w-[74vw] max-w-[300px] md:w-auto md:max-w-none overflow-hidden rounded-2xl bg-white shadow-card transition duration-200 active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:shadow-lift"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#F2F4F6]">
        {event.imageUrl && !imageFailed ? (
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F3EEFF] text-ink-muted text-sm">
            이미지 없음
          </div>
        )}

        {rank != null && (
          <span aria-hidden="true" className="absolute left-3 top-2 text-[28px] font-black italic leading-none text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
            {rank}
          </span>
        )}

        {event.category && (
          <span
            className="absolute right-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold shadow-sm"
            style={{ color }}
          >
            {event.category}
          </span>
        )}
      </div>

      <div className="px-3.5 pb-3.5 pt-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug text-ink">
          {event.title || '제목 없음'}
        </p>

        {event.place && (
          <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-ink-muted">
            <Icon name="pin" size={13} />
            <span className="truncate">{event.place}</span>
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-1">
          {event.startDate && (
            <p className="text-ink-soft text-xs font-medium">
              {formatShortDate(event)}
            </p>
          )}

          <p
            aria-label={`조회수 ${
              Number.isFinite(event.viewCount)
                ? event.viewCount.toLocaleString('ko-KR')
                : '-'
            }`}
            className="ml-auto text-ink-muted text-[11px] flex items-center gap-1"
          >
            <Icon name="eye" size={13} />
            <span>
              {Number.isFinite(event.viewCount)
                ? event.viewCount.toLocaleString('ko-KR')
                : '-'}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}

function EventListCard({ event }) {
  const color =
    CATEGORY_COLOR[event.category]?.text ?? '#FF6B47'
  const dday = ddayLabel(event)
  const tone = dday === 'D-DAY'
    ? 'bg-coral text-white'
    : /^D-[1-3]$/.test(dday) ? 'bg-coral-light text-coral' : 'bg-[#F2F4F6] text-ink-soft'

  return (
    <Link
      to={eventPath(event)}
      className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-card transition duration-200 active:scale-[0.98] md:hover:shadow-lift"
    >
      <span
        className={`flex h-12 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-xl px-1.5 text-xs font-extrabold ${tone}`}
      >
        {dday}
      </span>

      <div className="flex-1 min-w-0">
        <p className="truncate text-[15px] font-bold leading-tight text-ink">
          {event.title || '제목 없음'}
        </p>

        <p className="mt-1 truncate text-xs text-ink-muted">
          {[event.place, formatShortDate(event)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {event.category && (
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: color + '1A',
            color,
          }}
        >
          {event.category}
        </span>
      )}
    </Link>
  )
}

function ScrollButton({ direction, onClick }) {
  const previous = direction < 0

  return (
    <button
      type="button"
      aria-label={
        previous ? '이전 HOT 행사' : '다음 HOT 행사'
      }
      onClick={onClick}
      className={`md:hidden [@media(pointer:coarse)]:hidden absolute top-[68px] -translate-y-1/2 ${
        previous ? 'left-0' : 'right-0'
      } z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-lift`}
    >
      <Icon name={previous ? 'chevronLeft' : 'chevronRight'} size={18} strokeWidth={2.2} />
    </button>
  )
}

// 폰 너비에서는 가로로 넘기고, md 이상에서는 기존 그리드로 보여준다.
function HotCarousel({ events }) {
  const listRef = useRef(null)
  const [edges, setEdges] = useState({
    start: true,
    end: true,
  })

  const updateEdges = useCallback(() => {
    const list = listRef.current
    if (!list) return

    const start = list.scrollLeft <= 4
    const end =
      list.scrollLeft + list.clientWidth >=
      list.scrollWidth - 4

    setEdges(prev =>
      prev.start === start && prev.end === end
        ? prev
        : { start, end }
    )
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)

    return () =>
      window.removeEventListener('resize', updateEdges)
  }, [events, updateEdges])

  const scrollByPage = direction => {
    const list = listRef.current

    if (list) {
      list.scrollBy({
        left: direction * list.clientWidth * 0.8,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative">
      {!edges.start && (
        <ScrollButton
          direction={-1}
          onClick={() => scrollByPage(-1)}
        />
      )}

      <div
        ref={listRef}
        onScroll={updateEdges}
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 md:snap-none pb-2 -mx-5 px-5 md:mx-0 md:px-0 hide-scrollbar"
      >
        {events.map((event, index) => (
          <HotCard
            key={event.eventId}
            event={event}
            rank={index + 1}
          />
        ))}
      </div>

      {!edges.end && (
        <>
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute top-0 bottom-2 -right-5 w-10 bg-gradient-to-l from-canvas to-transparent"
          />

          <ScrollButton
            direction={1}
            onClick={() => scrollByPage(1)}
          />
        </>
      )}
    </div>
  )
}

function SectionStatus({
  loading,
  error,
  empty,
  onRetry,
  errorMessage,
}) {
  if (loading) {
    return (
      <div role="status" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <span className="sr-only">행사를 불러오는 중입니다.</span>
        {[0, 1, 2].map(key => (
          <div key={key} aria-hidden="true" className={`flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-card ${key > 0 ? 'hidden md:flex' : ''}`}>
            <span className="h-12 w-[3.25rem] animate-pulse rounded-xl bg-[#F2F4F6]" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-3/4 animate-pulse rounded bg-[#F2F4F6]" />
              <span className="block h-3 w-1/2 animate-pulse rounded bg-[#F2F4F6]" />
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-card"
      >
        <p>
          {errorMessage
            ? errorMessage(error)
            : getHomeError(error)}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-[#F2F4F6] px-4 py-2 text-sm font-bold text-ink"
          >
            다시 시도
          </button>

          {error.response?.status === 401 && (
            <Link
              to="/login"
              className="rounded-xl bg-coral px-4 py-2 text-sm font-bold text-white"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    )
  }

  if (empty) {
    return (
      <p
        role="status"
        className="rounded-2xl bg-white p-8 text-center text-sm text-ink-muted shadow-card"
      >
        표시할 행사가 없습니다.
      </p>
    )
  }

  return null
}

export default function Home({ showAllHot = false }) {
  const navigate = useNavigate()

  const [hotEvents, setHotEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])

  const [hotMock, setHotMock] = useState(false)
  const [upcomingMock, setUpcomingMock] =
    useState(false)

  const [hotLoading, setHotLoading] = useState(true)
  const [upcomingLoading, setUpcomingLoading] =
    useState(true)

  const [hotError, setHotError] = useState(null)
  const [upcomingError, setUpcomingError] =
    useState(null)

  const [hotRetry, setHotRetry] = useState(0)
  const [upcomingRetry, setUpcomingRetry] =
    useState(0)

  const [member, setMember] = useState(null)
  const [memberLoading, setMemberLoading] =
    useState(true)
  const [memberError, setMemberError] = useState(null)

  const [interestEvents, setInterestEvents] =
    useState([])
  const [interestLoading, setInterestLoading] =
    useState(false)
  const [interestError, setInterestError] =
    useState(null)
  const [interestMock, setInterestMock] =
    useState(false)
  const [interestRetry, setInterestRetry] =
    useState(0)

  // 화면 진입 → API 요청 → state 갱신 → map 렌더링
  useEffect(() => {
    const controller = new AbortController()

    const loadHotEvents = async () => {
      setHotLoading(true)
      setHotError(null)
      setHotMock(false)

      try {
        const { events, isMock } =
          await getHotEvents({
            limit: showAllHot ? 30 : 6,
            signal: controller.signal,
          })

        if (!controller.signal.aborted) {
          setHotEvents(events)
          setHotMock(isMock)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setHotError(error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setHotLoading(false)
        }
      }
    }

    loadHotEvents()

    return () => controller.abort()
  }, [showAllHot, hotRetry])

  useEffect(() => {
    if (showAllHot) return

    const controller = new AbortController()

    const loadUpcomingEvents = async () => {
      setUpcomingLoading(true)
      setUpcomingError(null)
      setUpcomingMock(false)

      try {
        const { events, isMock } =
          await getUpcomingEvents({
            signal: controller.signal,
          })

        if (!controller.signal.aborted) {
          setUpcomingEvents(events)
          setUpcomingMock(isMock)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setUpcomingError(error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setUpcomingLoading(false)
        }
      }
    }

    loadUpcomingEvents()

    return () => controller.abort()
  }, [showAllHot, upcomingRetry])

  // 회원정보는 getCurrentMember가 앱 전체에서 한 번만 조회해 재사용한다.
  // 마이페이지에서 관심사를 수정하면 그 캐시가 갱신되므로
  // 홈으로 돌아왔을 때 변경된 interestCategories가 반영된다.
  useEffect(() => {
    if (showAllHot) return

    const controller = new AbortController()

    const loadMember = async () => {
      try {
        setMemberLoading(true)
        setMemberError(null)

        const data = await getCurrentMember(
          controller.signal
        )

        if (!controller.signal.aborted) {
          setMember(data)
        }
      } catch (error) {
        if (
          error.name === 'CanceledError' ||
          error.name === 'AbortError'
        ) {
          return
        }

        if (!controller.signal.aborted) {
          setMemberError(error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setMemberLoading(false)
        }
      }
    }

    loadMember()

    return () => controller.abort()
  }, [showAllHot])

  useEffect(() => {
    if (showAllHot || memberLoading) return

    const interests =
      member?.interestCategories ?? []

    if (!member || interests.length === 0) {
      setInterestEvents([])
      setInterestLoading(false)
      setInterestError(null)
      setInterestMock(false)
      return
    }

    const controller = new AbortController()

    const loadInterestEvents = async () => {
      try {
        setInterestLoading(true)
        setInterestError(null)
        setInterestMock(false)

        const result = await getEvents(
          {
            district: [],
            category: interests,
            from: '',
            to: '',
            keyword: '',
            includePast: false,
            page: 0,
          },
          controller.signal
        )

        if (!controller.signal.aborted) {
          setInterestEvents(result.events)
          setInterestMock(result.isMock)
        }
      } catch (error) {
        if (
          error.name === 'CanceledError' ||
          error.name === 'AbortError'
        ) {
          return
        }

        if (!controller.signal.aborted) {
          setInterestError(error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setInterestLoading(false)
        }
      }
    }

    loadInterestEvents()

    return () => controller.abort()
  }, [
    showAllHot,
    member,
    memberLoading,
    interestRetry,
  ])

  const handleInterestSetting = () => {
    navigate('/my?edit=interests')
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <header className="border-b border-black/[0.06] bg-white px-5 pb-5 pt-[calc(env(safe-area-inset-top)+0.875rem)] md:px-8 md:pb-8 md:pt-8 lg:px-10">
        <div className="max-w-5xl">
          {showAllHot ? (
            <Link
              to="/"
              className="-ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-ink-soft hover:bg-[#F2F4F6]"
            >
              <Icon name="arrowLeft" size={18} />
              홈으로
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 md:hidden">
              <BrandMark size={32} />
              <BrandWordmark />
            </div>
          )}

          <h1 className="font-display mt-4 text-[26px] font-bold leading-[1.3] text-ink md:mt-0 md:text-[40px] md:leading-[1.25]">
            {showAllHot ? (
              'HOT한 행사'
            ) : (
              <>
                오늘 뭐할까,
                <br />
                <em className="text-coral not-italic">
                  같이 찾아봐요
                </em>
              </>
            )}
          </h1>

          {!showAllHot && (
            <>
              <Link
                to="/search"
                className="mt-4 flex h-[52px] items-center gap-3 rounded-2xl bg-[#F2F4F6] px-4 text-[15px] text-ink-muted transition-colors hover:bg-[#E9ECEF] md:mt-5 md:h-14 md:max-w-2xl"
              >
                <Icon name="search" size={20} strokeWidth={2} className="text-ink-soft" />
                어떤 문화행사를 찾으세요?
                <Icon name="arrowRight" size={18} className="ml-auto text-ink-muted" />
              </Link>

              <nav aria-label="카테고리 바로가기" className="-mx-5 mt-3 flex snap-x gap-2 overflow-x-auto scroll-px-5 px-5 hide-scrollbar md:mx-0 md:mt-4 md:px-0">
                {CATEGORIES.map(category => (
                  <Link
                    key={category}
                    to={`/events?category=${encodeURIComponent(category)}`}
                    className="flex-shrink-0 snap-start rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-coral hover:text-coral active:bg-[#F2F4F6]"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 px-5 md:px-8 lg:px-10">
        <section
          aria-labelledby="hot-title"
          aria-busy={hotLoading}
          className="pt-7 pb-2 max-w-5xl"
        >
          <SectionTitle
            id="hot-title"
            icon="flame"
            iconClassName="text-coral"
            title="HOT한 행사"
            action={!showAllHot && (
              <Link
                to="/events/hot"
                className="flex items-center gap-0.5 text-sm font-semibold text-ink-muted hover:text-ink"
              >
                전체보기
                <Icon name="chevronRight" size={16} />
              </Link>
            )}
          />

          {showAllHot && (
            <p className="text-sm text-ink-muted mb-4">
              조회수가 높은 행사 최대 30개를
              보여드려요.
            </p>
          )}

          {hotMock && (
            <DemoNotice
              onRetry={
                getDataMode() === 'auto'
                  ? () =>
                      setHotRetry(value => value + 1)
                  : undefined
              }
            />
          )}

          <SectionStatus
            loading={hotLoading}
            error={hotError}
            empty={!hotEvents.length}
            onRetry={() =>
              setHotRetry(value => value + 1)
            }
          />

          {!hotLoading &&
            !hotError &&
            (showAllHot ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 [&>a]:w-full [&>a]:max-w-none">
                {hotEvents.map((event, index) => (
                  <HotCard
                    key={event.eventId}
                    event={event}
                    rank={index + 1}
                  />
                ))}
              </div>
            ) : (
              <HotCarousel events={hotEvents} />
            ))}
        </section>

        {!showAllHot && (
          <section
            aria-labelledby="upcoming-title"
            aria-busy={upcomingLoading}
            className="pt-8 pb-8 max-w-5xl"
          >
            <SectionTitle
              id="upcoming-title"
              icon="pin"
              iconClassName="text-[#3182F6]"
              title="다가오는 근처 행사"
            />

            <p className="-mt-1 text-[13px] text-ink-muted mb-4">
              {upcomingMock
                ? '서울 전체 샘플 행사를 시작일 순으로 보여드려요.'
                : '내 거주지 기준이에요. 로그인 전에는 서울 전체를 보여드려요.'}
            </p>

            {upcomingMock && (
              <DemoNotice
                onRetry={
                  getDataMode() === 'auto'
                    ? () =>
                        setUpcomingRetry(
                          value => value + 1
                        )
                    : undefined
                }
              />
            )}

            <SectionStatus
              loading={upcomingLoading}
              error={upcomingError}
              empty={!upcomingEvents.length}
              onRetry={() =>
                setUpcomingRetry(value => value + 1)
              }
            />

            {!upcomingLoading &&
              !upcomingError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingEvents.map(event => (
                    <EventListCard
                      key={event.eventId}
                      event={event}
                    />
                  ))}
                </div>
              )}
          </section>
        )}

        {!showAllHot && (
          <section
            aria-labelledby="interest-title"
            aria-busy={
              memberLoading || interestLoading
            }
            className="pt-2 pb-10 max-w-5xl"
          >
            <SectionTitle
              id="interest-title"
              icon="star"
              iconClassName="text-[#FFC342]"
              title="관심있는 행사"
            />

            {memberLoading && (
              <p
                role="status"
                className="rounded-2xl bg-white p-6 text-sm text-ink-muted shadow-card"
              >
                관심 카테고리를 확인하는 중입니다.
              </p>
            )}

            {!memberLoading &&
              memberError && (
                <div
                  role="alert"
                  className="rounded-2xl bg-white p-6 text-sm text-ink-muted shadow-card"
                >
                  <p>
                    관심 카테고리를 불러오지
                    못했습니다.
                  </p>
                </div>
              )}

            {!memberLoading &&
              !memberError &&
              !member && (
                <div className="flex flex-col items-start gap-4 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF6DD] text-[#F5A500]">
                      <Icon name="sparkle" size={22} filled />
                    </span>
                    <p className="text-sm text-ink-soft">
                      로그인하면 관심 카테고리에 맞는
                      행사를 추천해 드려요.
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="w-full rounded-xl bg-ink px-5 py-3 text-center text-sm font-bold text-white transition active:scale-[0.98] sm:w-auto"
                  >
                    로그인하기
                  </Link>
                </div>
              )}

            {!memberLoading &&
              !memberError &&
              member &&
              (member.interestCategories ?? [])
                .length === 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-card text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6DD] text-[#F5A500]">
                    <Icon name="star" size={24} filled />
                  </span>

                  <p className="text-ink text-[15px] font-semibold">
                    관심 카테고리를 선택해 주시면
                    행사를 추천해 드릴게요!
                  </p>

                  <button
                    type="button"
                    onClick={handleInterestSetting}
                    className="mt-4 px-5 py-3 rounded-xl bg-coral text-white text-sm font-bold active:scale-[0.98] transition-transform"
                  >
                    관심 카테고리 설정하기
                  </button>
                </div>
              )}

            {!memberLoading &&
              !memberError &&
              member &&
              (member.interestCategories ?? [])
                .length > 0 && (
                <>
                  <p className="-mt-1 text-[13px] text-ink-muted mb-4">
                    선택한 관심 카테고리를 기준으로
                    추천해 드려요.
                  </p>

                  {interestMock && (
                    <DemoNotice
                      onRetry={
                        getDataMode() === 'auto'
                          ? () =>
                              setInterestRetry(
                                value => value + 1
                              )
                          : undefined
                      }
                    />
                  )}

                  <SectionStatus
                    loading={interestLoading}
                    error={interestError}
                    empty={
                      !interestLoading &&
                      !interestEvents.length
                    }
                    onRetry={() =>
                      setInterestRetry(
                        value => value + 1
                      )
                    }
                    errorMessage={getEventsError}
                  />

                  {!interestLoading &&
                    !interestError &&
                    interestEvents.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {interestEvents.map(event => (
                          <EventListCard
                            key={event.eventId}
                            event={event}
                          />
                        ))}
                      </div>
                    )}
                </>
              )}
          </section>
        )}
      </div>
    </div>
  )
}
