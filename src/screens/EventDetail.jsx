import { useEffect, useState } from 'react'
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
import useCurrentMember from '../hooks/useCurrentMember'
import { COURSE_DRAFT_CHANGED, readCourseDraft, toggleCourseEvent } from '../utils/courseDraft'

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">
        {icon}
      </span>

      <div>
        <p className="text-[#9CA3AF] text-[11px] font-medium">
          {label}
        </p>

        <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5 leading-tight">
          {value || (
            <span className="text-[#D1D5DB] font-normal">
              정보 없음
            </span>
          )}
        </p>
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
      <p role="status" className="p-8">
        행사 정보를 불러오는 중입니다.
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" className="p-8">
        <p>
          {error.response?.status === 404
            ? '행사를 찾을 수 없습니다.'
            : '행사 정보를 불러오지 못했습니다.'}
        </p>

        <button
          type="button"
          onClick={() =>
            setRetry(value => value + 1)
          }
          className="text-[#FF6B47] mr-4 mt-4"
        >
          다시 시도
        </button>

        <Link to="/">
          홈으로
        </Link>
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
    /^(?:\/events|\/course)(?:\?|$)/.test(
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

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {event.isMock && (
        <div className="px-5 pt-5">
          <DemoNotice />
        </div>
      )}

      {/* 데스크탑 뒤로가기 */}
      <div className="hidden lg:flex items-center px-5 md:px-8 lg:px-10 pt-4 pb-2 max-w-5xl mx-auto w-full">
        <button
          type="button"
          aria-label={
            returnTo === '/'
              ? '홈으로'
              : '목록으로'
          }
          onClick={() =>
            navigate(returnTo)
          }
          className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm"
        >
          <span className="text-[#1A1A2E] text-lg">
            ←
          </span>
        </button>
      </div>

      {/* 히어로 이미지 */}
      <div className="relative mx-auto aspect-video w-full max-w-5xl bg-gray-100">
        {event.img && (
          <img
            src={event.img}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        <button
          type="button"
          aria-label={
            returnTo === '/'
              ? '홈으로'
              : '목록으로'
          }
          onClick={() =>
            navigate(returnTo)
          }
          className="lg:hidden absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-white text-lg">
            ←
          </span>
        </button>

        <EventViewCount
          eventId={event.eventId}
          initialCount={event.viewCount}
          isMock={event.isMock}
        />

        <div className="absolute bottom-5 left-5 right-5">
          <span
            className="text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2"
            style={{
              backgroundColor:
                colors.text,
            }}
          >
            {event.category}
          </span>

          <h1 className="font-display text-white text-2xl font-bold leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* 로그인 사용자 전용 저장 기능 */}
      {member && <div className="max-w-5xl mx-auto w-full px-5 md:px-8 lg:px-10 pt-4">
        {event.isMock ? (
          <div
            role="note"
            className="w-full py-3.5 px-4 rounded-xl bg-[#F3F4F6] text-[#6B7280] text-sm font-semibold text-center"
          >
            데모 행사는 관심행사에 저장할 수 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={
                favoriteLoading ||
                favoriteStatusLoading
              }
              aria-pressed={favoriteSaved}
              aria-label={favoriteSaved ? '관심행사 저장 취소' : '관심행사 저장'}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${
                favoriteSaved
                  ? 'bg-[#FFF0EC] text-[#FF6B47]'
                  : 'bg-[#FF6B47] text-white'
              } disabled:opacity-70`}
            >
              {favoriteStatusLoading
                ? '저장 여부 확인 중...'
                : favoriteLoading
                  ? (favoriteSaved ? '취소 중...' : '저장 중...')
                  : favoriteSaved
                    ? '❤️ 관심행사에 저장됨'
                    : '🤍 관심행사에 저장'}
            </button>

            <button
              type="button"
              aria-pressed={courseSaved}
              aria-label="코스에 추가"
              onClick={() => setCourseEvents(toggleCourseEvent(event))}
              className={`w-full rounded-xl py-3.5 text-sm font-bold transition-colors ${
                courseSaved
                  ? 'bg-[#E6FAF7] text-[#008F75]'
                  : 'bg-[#F3EEFF] text-[#8B5CF6]'
              }`}
            >
              {courseSaved ? '✓ 코스에 담음' : '+ 코스에 담기'}
            </button>

            {favoriteError && (
              <p
                role="alert"
                className="col-span-2 text-[#FF6B47] text-sm"
              >
                {favoriteError}
              </p>
            )}
          </div>
        )}
      </div>}

      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar">
        <div className="lg:flex lg:gap-6 lg:items-start max-w-5xl mx-auto px-5 md:px-8 lg:px-10 py-4">
          {/* 왼쪽: 행사 정보 */}
          <div className="lg:flex-1 lg:min-w-0">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl py-4 px-4 border border-[#F3F4F6] mb-4">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  icon="📅"
                  label="기간"
                  value={[
                    event.startDate,
                    event.endDate,
                  ]
                    .filter(Boolean)
                    .join(' ~ ')}
                />

                <Field
                  icon="📍"
                  label="장소"
                  value={event.place}
                />

                <Field
                  icon="🏢"
                  label="기관"
                  value={event.org}
                />

                <Field
                  icon="💰"
                  label="요금"
                  value={event.fee}
                />

                <Field
                  icon="🗺️"
                  label="자치구"
                  value={event.district}
                />

                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">
                    🔗
                  </span>

                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium">
                      원문 링크
                    </p>

                    {originalUrl ? (
                      <a
                        href={originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF6B47] text-sm font-semibold mt-0.5 leading-tight underline"
                      >
                        바로가기 →
                      </a>
                    ) : (
                      <span className="text-sm text-[#6B7280]">
                        정보 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
      </div>
    </div>
  )
}
