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
import { CATEGORY_COLOR } from '../data/events'
import {
  ddayLabel,
  formatShortDate,
} from '../utils/eventDate'
import { getDataMode } from '../api/dataMode'
import DemoNotice from '../components/DemoNotice'

function eventPath(event) {
  return `/events/${encodeURIComponent(event.eventId)}`
}

function HotCard({ event }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color =
    CATEGORY_COLOR[event.category]?.text ?? '#FF6B47'

  return (
    <Link
      to={eventPath(event)}
      className="snap-start flex-shrink-0 w-[200px] md:w-auto rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform focus-visible:outline focus-visible:outline-[#FF6B47]"
    >
      <div className="relative h-[130px] md:h-[160px] bg-gray-100">
        {event.imageUrl && !imageFailed ? (
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F3EEFF] text-[#6B7280] text-sm">
            이미지 없음
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {event.category && (
          <span
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold"
            style={{ backgroundColor: color }}
          >
            {event.category}
          </span>
        )}

        <p className="absolute bottom-2 left-2.5 right-2.5 text-white font-semibold text-sm leading-tight line-clamp-2">
          {event.title || '제목 없음'}
        </p>
      </div>

      <div className="bg-white px-3 py-2.5">
        {event.place && (
          <p className="text-[#6B7280] text-xs truncate">
            {event.place}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-1">
          {event.startDate && (
            <p className="text-[#1A1A2E] text-xs font-medium">
              {formatShortDate(event)}
            </p>
          )}

          <p
            aria-label={`조회수 ${
              Number.isFinite(event.viewCount)
                ? event.viewCount.toLocaleString('ko-KR')
                : '-'
            }`}
            className="text-[#6B7280] text-[11px] flex items-center gap-1"
          >
            <span aria-hidden="true">👁</span>
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

  return (
    <Link
      to={eventPath(event)}
      className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left w-full"
    >
      <span
        className="min-w-12 h-12 px-1 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: color }}
      >
        {ddayLabel(event)}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[#1A1A2E] font-semibold text-sm leading-tight truncate">
          {event.title || '제목 없음'}
        </p>

        <p className="text-[#6B7280] text-xs mt-0.5 truncate">
          {[event.place, formatShortDate(event)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {event.category && (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: color + '20',
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
      className={`md:hidden absolute top-[65px] -translate-y-1/2 ${
        previous ? 'left-0' : 'right-0'
      } z-10 w-9 h-9 rounded-full bg-white/95 shadow-md text-[#1A1A2E] font-bold flex items-center justify-center`}
    >
      {previous ? '‹' : '›'}
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
        {events.map(event => (
          <HotCard
            key={event.eventId}
            event={event}
          />
        ))}
      </div>

      {!edges.end && (
        <>
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute top-0 bottom-2 -right-5 w-10 bg-gradient-to-l from-[#FAFAF8] to-transparent"
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
      <p
        role="status"
        className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]"
      >
        행사를 불러오는 중입니다.
      </p>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]"
      >
        <p>
          {errorMessage
            ? errorMessage(error)
            : getHomeError(error)}
        </p>

        <div className="flex gap-4 mt-3">
          <button
            type="button"
            onClick={onRetry}
            className="text-[#FF6B47] font-semibold"
          >
            다시 시도
          </button>

          {error.response?.status === 401 && (
            <Link
              to="/login"
              className="text-[#FF6B47] font-semibold"
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
        className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]"
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
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <header className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-5 bg-[#1A1A2E]">
        <div className="max-w-5xl">
          <p className="text-[#9CA3AF] text-sm font-medium tracking-wide">
            서울 문화행사
          </p>

          <h1 className="font-display text-white text-3xl md:text-4xl font-bold mt-0.5 leading-tight">
            {showAllHot ? (
              'HOT한 행사'
            ) : (
              <>
                오늘 뭐할까,
                <br />
                <em className="text-[#FF6B47] not-italic">
                  같이 찾아봐요
                </em>
              </>
            )}
          </h1>

          {showAllHot ? (
            <Link
              to="/"
              className="inline-block mt-4 text-sm text-white"
            >
              ← 홈으로
            </Link>
          ) : (
            <Link
              to="/search"
              className="flex items-center gap-3 mt-5 p-4 rounded-2xl bg-white text-[#6B7280] text-sm"
            >
              <span aria-hidden="true">🔍</span>
              어떤 문화행사를 찾으세요?
              <span
                aria-hidden="true"
                className="ml-auto"
              >
                →
              </span>
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 px-5 md:px-8 lg:px-10">
        <section
          aria-labelledby="hot-title"
          aria-busy={hotLoading}
          className="pt-6 pb-2 max-w-5xl"
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2
              id="hot-title"
              className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E]"
            >
              🔥 HOT한 행사
            </h2>

            {!showAllHot && (
              <Link
                to="/events/hot"
                className="text-[#FF6B47] text-sm font-semibold"
              >
                전체보기
              </Link>
            )}
          </div>

          {showAllHot && (
            <p className="text-sm text-[#6B7280] mb-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 [&>a]:w-full">
                {hotEvents.map(event => (
                  <HotCard
                    key={event.eventId}
                    event={event}
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
            className="pt-6 pb-8 max-w-5xl"
          >
            <h2
              id="upcoming-title"
              className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2"
            >
              📍 다가오는 근처 행사
            </h2>

            <p className="text-xs text-[#6B7280] mb-4">
              {upcomingMock
                ? '서울 전체 샘플 행사를 시작일 순으로 보여드려요.'
                : '회원 거주지 기준이며, 비로그인 또는 거주지 미설정 시 서울 전체 행사를 보여드려요.'}
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
            <h2
              id="interest-title"
              className="font-display text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2"
            >
              ⭐ 관심있는 행사
            </h2>

            {memberLoading && (
              <p
                role="status"
                className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]"
              >
                관심 카테고리를 확인하는 중입니다.
              </p>
            )}

            {!memberLoading &&
              memberError && (
                <div
                  role="alert"
                  className="rounded-2xl bg-white p-6 text-sm text-[#6B7280]"
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
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-[#6B7280]">
                    로그인하면 관심 카테고리에 맞는
                    행사를 추천해 드려요.
                  </p>

                  <div className="flex justify-center mt-4">
                    <Link
                      to="/login"
                      className="inline-block px-4 py-2.5 rounded-xl bg-[#FF6B47] text-white text-sm font-semibold active:scale-[0.98] transition-transform"
                    >
                       로그인하기
                    </Link>
                  </div>
                  </div>
              )}

            {!memberLoading &&
              !memberError &&
              member &&
              (member.interestCategories ?? [])
                .length === 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
                  <div
                    aria-hidden="true"
                    className="text-3xl mb-3"
                  >
                    ⭐
                  </div>

                  <p className="text-[#1A1A2E] text-sm font-semibold">
                    관심 카테고리를 선택해 주시면
                    행사를 추천해 드릴게요!
                  </p>

                  <button
                    type="button"
                    onClick={handleInterestSetting}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF6B47] text-white text-sm font-semibold active:scale-[0.98] transition-transform"
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
                  <p className="text-xs text-[#6B7280] mb-4">
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