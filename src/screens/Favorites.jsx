import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFavorites,
  removeFavorite,
} from '../api/favorites'

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

function formatDate(event) {
  const { startDate, endDate } = event

  if (!startDate && !endDate) {
    return '날짜 정보 없음'
  }

  if (!startDate) {
    return `~ ${endDate}`
  }

  if (!endDate) {
    return `${startDate} ~`
  }

  if (startDate === endDate) {
    return startDate
  }

  return `${startDate} ~ ${endDate}`
}

function formatMonth(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function formatDay(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isEventOnDate(event, dateString) {
  const start = event.startDate || event.endDate
  const end = event.endDate || event.startDate

  if (!start || !end) {
    return false
  }

  return dateString >= start && dateString <= end
}

function EventCard({
  event,
  onRemove,
  removing,
}) {
  return (
    <div className="bg-white rounded-2xl flex shadow-sm border border-[#F3F4F6] overflow-hidden">
      <div className="w-2 flex-shrink-0 bg-[#FF6B47]" />

      <div className="flex-1 p-4 min-w-0">
        <p className="font-semibold text-[#1A1A2E] text-sm leading-tight">
          {event.title}
        </p>

        <p className="text-[#6B7280] text-xs mt-2">
          📍 {event.place || '장소 정보 없음'}
        </p>

        <p className="text-[#9CA3AF] text-xs mt-1">
          📅 {formatDate(event)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(event.eventId)}
        disabled={removing}
        aria-label={`${event.title} 관심행사 삭제`}
        className="flex-shrink-0 px-4 flex items-center disabled:opacity-40 active:scale-90 transition-transform"
      >
        <span className="text-lg">
          {removing ? '⏳' : '❤️'}
        </span>
      </button>
    </div>
  )
}

function EventsCalendar({
  monthDate,
  favoriteEvents,
  selectedDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}) {
  const year = monthDate.getFullYear()
  const monthIndex = monthDate.getMonth()
  const month = monthIndex + 1

  const daysInMonth =
    new Date(year, monthIndex + 1, 0).getDate()

  const firstDow =
    new Date(year, monthIndex, 1).getDay()

  const cells = Array(firstDow).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const todayString = formatDay(new Date())

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          aria-label="이전 달"
          onClick={onPreviousMonth}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg"
        >
          ‹
        </button>

        <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
          {year}년 {month}월
        </h3>

        <button
          type="button"
          aria-label="다음 달"
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 px-2 mb-1">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={`text-center text-[11px] font-semibold py-1 ${
              index === 0
                ? 'text-[#FF6B47]'
                : index === 6
                  ? 'text-[#8B5CF6]'
                  : 'text-[#9CA3AF]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-2 pb-3">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />
          }

          const date = new Date(year, monthIndex, day)
          const dateString = formatDay(date)

          const hasEvent = favoriteEvents.some(event =>
            isEventOnDate(event, dateString)
          )

          const isSelected =
            selectedDate === dateString

          const isToday =
            todayString === dateString

          return (
            <div
              key={dateString}
              className="relative flex items-center justify-center h-10"
            >
              <button
                type="button"
                aria-label={dateString}
                aria-pressed={isSelected}
                onClick={() => onSelectDate(dateString)}
                className={`relative w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 ${
                  isSelected
                    ? 'bg-[#FF6B47] text-white'
                    : ''
                }`}
              >
                <span
                  className={`text-sm font-semibold leading-none ${
                    isSelected
                      ? 'text-white'
                      : isToday
                        ? 'text-[#FF6B47]'
                        : 'text-[#1A1A2E]'
                  }`}
                >
                  {day}
                </span>

                {hasEvent && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected
                        ? 'bg-white'
                        : 'bg-[#FF6B47]'
                    }`}
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Favorites({ view = 'list' }) {
  const navigate = useNavigate()

  const [favoriteEvents, setFavoriteEvents] = useState([])
  const [monthDate, setMonthDate] = useState(
    () => new Date()
  )
  const [selectedDate, setSelectedDate] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [removingId, setRemovingId] = useState(null)

  const monthKey = formatMonth(monthDate)

  useEffect(() => {
    const controller = new AbortController()

    const loadFavorites = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getFavorites(
          view === 'calendar' ? monthKey : undefined,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setFavoriteEvents(data)
        }
      } catch (err) {
        if (controller.signal.aborted) return

        if (err.response?.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        setError('관심행사를 불러오지 못했습니다.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadFavorites()

    return () => controller.abort()
  }, [view, monthKey, retry, navigate])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return favoriteEvents.filter(event =>
      isEventOnDate(event, selectedDate)
    )
  }, [favoriteEvents, selectedDate])

  const handleRemove = async eventId => {
    if (removingId) return

    setRemovingId(eventId)
    setError('')

    try {
      await removeFavorite(eventId)

      setFavoriteEvents(prev =>
        prev.filter(event => event.eventId !== eventId)
      )
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      setError('관심행사를 삭제하지 못했습니다.')
    } finally {
      setRemovingId(null)
    }
  }

  const handlePreviousMonth = () => {
    setSelectedDate(null)

    setMonthDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() - 1,
        1
      )
    )
  }

  const handleNextMonth = () => {
    setSelectedDate(null)

    setMonthDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() + 1,
        1
      )
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">
            관심 목록
          </h1>

          <p className="text-white/50 text-sm mt-1">
            행사 {favoriteEvents.length}개 저장됨
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-[#F3F4F6] px-5 md:px-8 lg:px-10 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex bg-[#F3F4F6] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => navigate('/favorites')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                view === 'list'
                  ? 'bg-white text-[#1A1A2E] shadow-sm'
                  : 'text-[#9CA3AF]'
              }`}
            >
              📋 리스트
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/favorites/calendar')
              }
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                view === 'calendar'
                  ? 'bg-white text-[#1A1A2E] shadow-sm'
                  : 'text-[#9CA3AF]'
              }`}
            >
              📅 캘린더
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {error && (
          <div
            role="alert"
            className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4"
          >
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRetry(prev => prev + 1)
                }
                className="text-sm font-semibold text-[#FF6B47] mt-2"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p
            role="status"
            className="text-center text-[#9CA3AF] py-16 text-sm"
          >
            관심행사를 불러오는 중입니다.
          </p>
        ) : (
          <>
            {view === 'list' && (
              <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
                {favoriteEvents.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-4xl">💝</span>

                    <p className="text-[#6B7280] text-sm mt-3 font-medium">
                      아직 저장한 행사가 없어요
                    </p>

                    <p className="text-[#9CA3AF] text-xs mt-1">
                      행사 상세에서 ❤️을 눌러 저장해보세요
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {favoriteEvents.map(event => (
                      <EventCard
                        key={event.eventId}
                        event={event}
                        onRemove={handleRemove}
                        removing={
                          removingId === event.eventId
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'calendar' && (
              <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
                <div className="lg:flex lg:gap-6 lg:items-start">
                  <div className="lg:flex-shrink-0 lg:w-[360px] md:max-w-md md:mx-auto lg:mx-0">
                    <EventsCalendar
                      monthDate={monthDate}
                      favoriteEvents={favoriteEvents}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      onPreviousMonth={handlePreviousMonth}
                      onNextMonth={handleNextMonth}
                    />
                  </div>

                  <div className="mt-4 lg:mt-0 lg:flex-1">
                    {!selectedDate ? (
                      <div className="text-center py-10 text-[#9CA3AF] text-sm">
                        달력에서 날짜를 선택하면
                        <br />
                        해당 날 행사를 볼 수 있어요
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-[#1A1A2E] mb-3">
                          {selectedDate} 행사
                        </h3>

                        {selectedEvents.length === 0 ? (
                          <p className="text-center py-10 text-[#9CA3AF] text-sm">
                            선택한 날짜에 저장한 행사가 없어요.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {selectedEvents.map(event => (
                              <EventCard
                                key={event.eventId}
                                event={event}
                                onRemove={handleRemove}
                                removing={
                                  removingId ===
                                  event.eventId
                                }
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}