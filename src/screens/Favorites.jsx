import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENTS, CATEGORY_COLOR } from '../data/events'

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']
const YEAR = 2026
const MONTH = 9
const DAYS_IN_MONTH = 30
const FIRST_DOW = 2

// TODO: 백엔드 관심행사 조회 API 확정 후 서버 데이터로 교체
const INITIAL_FAVORITE_IDS = [1, 3, 7]

function formatDate(event) {
  const sd = parseInt(event.startDate.split('-')[2])
  const ed = parseInt(event.endDate.split('-')[2])
  const sm = parseInt(event.startDate.split('-')[1])
  const em = parseInt(event.endDate.split('-')[1])

  if (sm === em) {
    return sd === ed
      ? `${sm}월 ${sd}일`
      : `${sm}월 ${sd}–${ed}일`
  }

  return `${sm}월 ${sd}일–${em}월 ${ed}일`
}

function EventCard({ event, onRemove }) {
  const colors = CATEGORY_COLOR[event.category] ?? {
    bg: '#F3F4F6',
    text: '#6B7280',
  }

  return (
    <div className="bg-white rounded-2xl flex overflow-hidden shadow-sm">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
        <img
          src={event.img}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 p-3 min-w-0">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {event.category}
        </span>

        <p className="font-semibold text-[#1A1A2E] text-sm mt-1 leading-tight line-clamp-1">
          {event.title}
        </p>

        <p className="text-[#6B7280] text-xs mt-0.5">
          {event.place}
        </p>

        <p className="text-[#9CA3AF] text-xs">
          {formatDate(event)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(event.id)}
        aria-label={`${event.title} 관심행사 삭제`}
        className="flex-shrink-0 px-3 flex items-center active:scale-90 transition-transform"
      >
        <span className="text-lg">❤️</span>
      </button>
    </div>
  )
}

function EventsCalendar({ favoriteEvents }) {
  const cells = Array(FIRST_DOW).fill(null)

  for (let i = 1; i <= DAYS_IN_MONTH; i++) {
    cells.push(i)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const dayColorMap = new Map()

  favoriteEvents.forEach(event => {
    const sd = parseInt(event.startDate.split('-')[2])
    const ed = parseInt(event.endDate.split('-')[2])

    const color =
      (CATEGORY_COLOR[event.category] ?? {
        text: '#FF6B47',
      }).text

    for (
      let day = sd;
      day <= Math.min(ed, DAYS_IN_MONTH);
      day++
    ) {
      if (!dayColorMap.has(day)) {
        dayColorMap.set(day, color)
      }
    }
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg"
        >
          ‹
        </button>

        <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
          {YEAR}년 {MONTH}월
        </h3>

        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 px-2 mb-1">
        {DAYS_OF_WEEK.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] font-semibold py-1 ${
              i === 0
                ? 'text-[#FF6B47]'
                : i === 6
                  ? 'text-[#8B5CF6]'
                  : 'text-[#9CA3AF]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-2 pb-3">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} />
          }

          const isToday = day === 22
          const color = dayColorMap.get(day)

          const isRangeStart =
            Boolean(color) && !dayColorMap.has(day - 1)

          const isRangeEnd =
            Boolean(color) && !dayColorMap.has(day + 1)

          const isRangeMid =
            Boolean(color) && !isRangeStart && !isRangeEnd

          return (
            <div
              key={day}
              className="relative flex items-center justify-center h-10"
            >
              {isRangeMid && (
                <div
                  className="absolute inset-y-1.5 inset-x-0 opacity-20"
                  style={{ backgroundColor: color }}
                />
              )}

              {isRangeStart && !isRangeEnd && (
                <div
                  className="absolute inset-y-1.5 right-0 left-1/2 opacity-20 rounded-l-full"
                  style={{ backgroundColor: color }}
                />
              )}

              {isRangeEnd && !isRangeStart && (
                <div
                  className="absolute inset-y-1.5 left-0 right-1/2 opacity-20 rounded-r-full"
                  style={{ backgroundColor: color }}
                />
              )}

              <button
                type="button"
                className="relative z-10 w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all active:scale-90"
              >
                <span
                  className={`text-sm font-semibold leading-none ${
                    isToday
                      ? 'text-[#FF6B47]'
                      : 'text-[#1A1A2E]'
                  }`}
                >
                  {day}
                </span>

                {color && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: color }}
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

  const [favoriteIds, setFavoriteIds] = useState(
    INITIAL_FAVORITE_IDS
  )

  const favoriteEvents = EVENTS.filter(event =>
    favoriteIds.includes(event.id)
  )

  const handleRemove = eventId => {
    // TODO: 백엔드 삭제 API 확정 후 DELETE 요청 추가
    setFavoriteIds(prev =>
      prev.filter(id => id !== eventId)
    )
  }

  const handleListTab = () => {
    navigate('/favorites')
  }

  const handleCalendarTab = () => {
    navigate('/favorites/calendar')
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

      {/* 탭 */}
      <div className="bg-white border-b border-[#F3F4F6] px-5 md:px-8 lg:px-10 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex bg-[#F3F4F6] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={handleListTab}
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
              onClick={handleCalendarTab}
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
        {/* 리스트 탭 */}
        {view === 'list' && (
          <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
            {favoriteEvents.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl">💝</span>

                <p className="text-[#6B7280] text-sm mt-3 font-medium">
                  아직 저장한 행사가 없어요
                </p>

                <p className="text-[#9CA3AF] text-xs mt-1">
                  행사 목록에서 ❤️을 눌러 저장해보세요
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {favoriteEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 캘린더 탭 */}
        {view === 'calendar' && (
          <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
            <div className="lg:flex lg:gap-6 lg:items-start">
              <div className="lg:flex-shrink-0 lg:w-[360px] md:max-w-md md:mx-auto lg:mx-0">
                <EventsCalendar
                  favoriteEvents={favoriteEvents}
                />
              </div>

              <div className="mt-4 lg:mt-0 lg:flex-1 text-center py-10 text-[#9CA3AF] text-sm">
                달력에서 날짜를 선택하면
                <br />
                해당 날 행사를 볼 수 있어요
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}