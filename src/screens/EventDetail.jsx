import { useEffect, useRef, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { getEventDetail } from '../api/events'
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../api/favorites'
import { CATEGORY_COLOR } from '../data/events'

import DemoNotice from '../components/DemoNotice'
import EventMap from '../components/EventMap'
import EventSummary from '../components/EventSummary'
import EventComments from '../components/EventComments'
import EventViewCount from '../components/EventViewCount'
import Icon from '../components/Icon'
import useCurrentMember from '../hooks/useCurrentMember'
import { COURSE_DRAFT_CHANGED, readCourseDraft, toggleCourseEvent } from '../utils/courseDraft'

function Field({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F2F4F6] text-ink-soft">
        <Icon name={icon} size={18} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-muted">
          {label}
        </p>

        <div className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">
          {children || (
            <span className="font-normal text-[#B0B8C1]">
              정보 없음
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventDetail() {
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadEvent = async () => {
      setLoading(true)
      setError(null)

      try {
        // URL 형태의 행사 ID도 Axios params로 한 번만 인코딩합니다.
        const {
          event: data,
          isMock,
        } = await getEventDetail(
          id,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setEvent({
            ...data,
            img: data.imageUrl,
            org: data.organization,
            isMock,
          })
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => controller.abort()
  }, [id, retry])

  if (loading) {
    return (
      <div role="status" className="mx-auto w-full max-w-5xl lg:px-10 lg:pt-6">
        <span className="sr-only">행사 정보를 불러오는 중입니다.</span>
        <div aria-hidden="true" className="aspect-video w-full animate-pulse bg-[#E9ECEF] max-sm:aspect-[4/3] lg:rounded-3xl" />
        <div aria-hidden="true" className="space-y-3 px-5 py-6 lg:px-0">
          <div className="h-5 w-20 animate-pulse rounded-full bg-[#E9ECEF]" />
          <div className="h-7 w-4/5 animate-pulse rounded-lg bg-[#E9ECEF]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-[#E9ECEF]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F4F6] text-ink-muted">
          <Icon name="ticket" size={26} />
        </span>
        <p className="text-[15px] font-semibold text-ink">
          {error.response?.status === 404
            ? '행사를 찾을 수 없습니다.'
            : '행사 정보를 불러오지 못했습니다.'}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setRetry(value => value + 1)
            }
            className="rounded-xl bg-[#F2F4F6] px-4 py-2.5 text-sm font-bold text-ink"
          >
            다시 시도
          </button>

          <Link to="/" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white">
            홈으로
          </Link>
        </div>
      </div>
    )
  }

  return <EventDetailView event={event} />
}

function EventDetailView({ event }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { member } = useCurrentMember()
  const [courseEvents, setCourseEvents] = useState(() => readCourseDraft())

  const [favoriteLoading, setFavoriteLoading] =
    useState(false)

  const [favoriteSaved, setFavoriteSaved] =
    useState(false)

  const [favoriteError, setFavoriteError] =
    useState('')

  const [favoriteStatusLoading, setFavoriteStatusLoading] =
    useState(false)

  const heroRef = useRef(null)
  const [barSolid, setBarSolid] = useState(false)

  useEffect(() => {
    const update = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0
      setBarSolid(window.innerWidth >= 1024 || heroBottom <= 64)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const sync = event => setCourseEvents(event.detail || readCourseDraft())
    window.addEventListener(COURSE_DRAFT_CHANGED, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(COURSE_DRAFT_CHANGED, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  /*
   * 상세 화면에 처음 들어왔을 때 현재 행사가 이미
   * 관심행사에 저장되어 있는지 확인합니다.
   *
   * 비로그인 사용자의 경우 GET /api/favorites가
   * 401을 반환할 수 있지만, 이 시점에는 로그인
   * 화면으로 이동시키지 않습니다.
   */
  useEffect(() => {
    if (event.isMock || !member) {
      setFavoriteStatusLoading(false)
      setFavoriteSaved(false)
      return undefined
    }

    const controller = new AbortController()

    const loadFavoriteStatus = async () => {
      setFavoriteStatusLoading(true)

      try {
        const favorites = await getFavorites(
          undefined,
          controller.signal
        )

        if (controller.signal.aborted) {
          return
        }

        const isSaved = favorites.some(
          favorite =>
            String(favorite.eventId) ===
            String(event.eventId)
        )

        setFavoriteSaved(isSaved)
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }

        /*
         * 상세 진입 시 401은 비로그인 상태로 간주합니다.
         * 여기서는 로그인 화면으로 강제 이동하지 않습니다.
         */
        if (err.response?.status === 401) {
          setFavoriteSaved(false)
          return
        }

        /*
         * 관심행사 상태 조회 실패가 행사 상세 자체를
         * 막지는 않도록 저장 상태만 기본값으로 둡니다.
         */
        setFavoriteSaved(false)
      } finally {
        if (!controller.signal.aborted) {
          setFavoriteStatusLoading(false)
        }
      }
    }

    loadFavoriteStatus()

    return () => controller.abort()
  }, [event.eventId, event.isMock, member])

  const courseSaved = courseEvents.some(
    item => String(item.eventId) === String(event.eventId)
  )

  const returnTo =
    /^(?:\/events|\/course|\/favorites(?:\/calendar)?)(?:\?|$)/.test(
      state?.returnTo || ''
    )
      ? state.returnTo
      : '/'

  const colors =
    CATEGORY_COLOR[event.category] ?? {
      bg: '#F3F4F6',
      text: '#6B7280',
    }

  const originalUrl =
    /^https?:\/\//i.test(
      event.originalUrl || ''
    )
      ? event.originalUrl
      : null

  const handleToggleFavorite = async () => {
    /*
     * 데모 행사는 백엔드에 mock eventId를
     * 보내지 않습니다.
     */
    if (event.isMock) {
      return
    }

    if (
      favoriteLoading ||
      favoriteStatusLoading
    ) {
      return
    }

    setFavoriteLoading(true)
    setFavoriteError('')

    try {
      if (favoriteSaved) {
        await removeFavorite(event.eventId)
        setFavoriteSaved(false)
      } else {
        await addFavorite(event.eventId)
        setFavoriteSaved(true)
      }
    } catch (err) {
      /*
       * 상세 진입 시에는 401을 무시하지만,
       * 사용자가 저장 버튼을 직접 눌렀을 때
       * 401이 발생하면 로그인 화면으로 이동합니다.
       */
      if (err.response?.status === 401) {
        navigate('/login', {
          replace: true,
        })
        return
      }

      // 이미 관심행사에 등록된 경우
      if (!favoriteSaved && err.response?.status === 409) {
        setFavoriteSaved(true)
        return
      }

      // 이미 관심행사에서 빠진 경우
      if (favoriteSaved && err.response?.status === 404) {
        setFavoriteSaved(false)
        return
      }

      setFavoriteError(
        favoriteSaved
          ? '관심행사 취소에 실패했습니다.'
          : '관심행사 저장에 실패했습니다.'
      )
    } finally {
      setFavoriteLoading(false)
    }
  }

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(returnTo)
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div
        className={`sticky top-0 z-30 -mb-[calc(4rem+env(safe-area-inset-top))] border-b pt-[env(safe-area-inset-top)] transition-colors duration-200 lg:mb-0 ${
          barSolid
            ? 'border-black/[0.06] bg-white/95 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 md:px-8 lg:px-10">
          <button
            type="button"
            aria-label={
              returnTo === '/'
                ? '홈으로'
                : '목록으로'
            }
            onClick={goBack}
            className={`-ml-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
              barSolid
                ? 'text-ink hover:bg-[#F2F4F6]'
                : 'bg-white/90 text-ink shadow-card backdrop-blur-sm'
            }`}
          >
            <Icon name="arrowLeft" size={20} strokeWidth={2.2} />
          </button>

          <span
            aria-hidden="true"
            data-title={event.title}
            className={`min-w-0 flex-1 truncate text-base font-bold text-ink transition-opacity duration-200 before:content-[attr(data-title)] ${
              barSolid ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <EventViewCount
            eventId={event.eventId}
            initialCount={event.viewCount}
            isMock={event.isMock}
            solid={barSolid}
          />
        </div>
      </div>

      {/* 히어로 이미지 */}
      <div ref={heroRef} className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden bg-[#E9ECEF] max-sm:aspect-[4/3] lg:mt-6 lg:rounded-3xl">
        {event.img && (
          <img
            src={event.img}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent lg:hidden" />
      </div>

      {event.isMock && (
        <div className="mx-auto w-full max-w-5xl px-5 pt-5 md:px-8 lg:px-10">
          <DemoNotice />
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-5 pb-32 pt-5 md:px-8 lg:px-10 lg:pb-12">
        {/* 제목 */}
        <div className="mb-5">
          {event.category && (
            <span
              className="mb-2.5 inline-block rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {event.category}
            </span>
          )}

          <h1 className="font-display text-[24px] font-bold leading-snug text-ink md:text-[30px]">
            {event.title}
          </h1>

          {(event.place || event.startDate) && (
            <p className="mt-2 text-sm text-ink-muted">
              {[event.place, [event.startDate, event.endDate].filter(Boolean).join(' ~ ')].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* 로그인 사용자 전용 저장 기능 */}
        {member && (event.isMock ? (
          <div
            role="note"
            className="mb-5 w-full rounded-2xl bg-[#F2F4F6] px-4 py-3.5 text-center text-sm font-semibold text-ink-muted"
          >
            데모 행사는 관심행사에 저장할 수 없습니다.
          </div>
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md md:left-[72px] lg:static lg:mb-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr] gap-2 sm:grid-cols-2 lg:max-w-md">
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={
                  favoriteLoading ||
                  favoriteStatusLoading
                }
                aria-pressed={favoriteSaved}
                aria-label={favoriteSaved ? '관심행사 저장 취소' : '관심행사 저장'}
                className={`flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-[15px] font-bold transition-colors ${
                  favoriteSaved
                    ? 'bg-coral-light text-coral'
                    : 'bg-[#F2F4F6] text-ink-soft hover:bg-[#E9ECEF]'
                } disabled:opacity-70`}
              >
                <Icon name="heart" size={20} filled={favoriteSaved} strokeWidth={2} />
                <span className="hidden sm:inline">
                  {favoriteStatusLoading
                    ? '저장 여부 확인 중...'
                    : favoriteLoading
                      ? (favoriteSaved ? '취소 중...' : '저장 중...')
                      : favoriteSaved
                        ? '관심행사에 저장됨'
                        : '관심행사에 저장'}
                </span>
              </button>

              <button
                type="button"
                aria-pressed={courseSaved}
                aria-label="코스에 추가"
                onClick={() => setCourseEvents(toggleCourseEvent(event))}
                className={`flex items-center justify-center gap-1.5 rounded-2xl py-3.5 text-[15px] font-bold transition-colors ${
                  courseSaved
                    ? 'bg-[#E6FAF7] text-[#008F75]'
                    : 'bg-coral text-white hover:bg-coral-dark'
                }`}
              >
                <Icon name={courseSaved ? 'route' : 'plus'} size={18} strokeWidth={2.2} />
                {courseSaved ? '코스에 담음' : '코스에 담기'}
              </button>

              {favoriteError && (
                <p
                  role="alert"
                  className="col-span-2 text-sm text-[#B93820]"
                >
                  {favoriteError}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 기본 정보 */}
        <section aria-label="행사 기본 정보" className="mb-4 rounded-2xl bg-white px-4 py-1 shadow-card">
          <div className="grid divide-y divide-black/[0.05] md:grid-cols-2 md:divide-y-0 md:gap-x-6">
            <Field icon="calendar" label="기간">
              {[event.startDate, event.endDate].filter(Boolean).join(' ~ ')}
            </Field>

            <Field icon="pin" label="장소">
              {event.place}
            </Field>

            <Field icon="building" label="기관">
              {event.org}
            </Field>

            <Field icon="ticket" label="요금">
              {event.fee}
            </Field>

            <Field icon="map" label="자치구">
              {event.district}
            </Field>

            <Field icon="external" label="원문 링크">
              {originalUrl && (
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-coral hover:underline"
                >
                  바로가기
                  <Icon name="chevronRight" size={16} strokeWidth={2.2} />
                </a>
              )}
            </Field>
          </div>
        </section>

        <EventSummary
          event={event}
        />

        <EventMap
          key={event.eventId}
          event={event}
        />

        <EventComments
          event={event}
        />
      </div>
    </div>
  )
}
