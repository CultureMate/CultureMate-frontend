import { useState } from 'react'

const SAVED_EVENTS = [
  {
    id: 1,
    title: '서울 재즈 페스티벌',
    date: '9월 20–22일',
    place: '올림픽공원',
    category: '음악',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&auto=format',
    day: 20,
    month: 9,
  },
  {
    id: 3,
    title: '성수동 팝업 마켓',
    date: '9월 21–22일',
    place: '성수동',
    category: '마켓',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format',
    day: 21,
    month: 9,
  },
  {
    id: 5,
    title: '뚝섬 달빛 영화제',
    date: '9월 21일',
    place: '뚝섬한강공원',
    category: '영화',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop&auto=format',
    day: 21,
    month: 9,
  },
  {
    id: 6,
    title: '인사동 전통공예 체험',
    date: '9월 25일',
    place: '인사동',
    category: '체험',
    img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop&auto=format',
    day: 25,
    month: 9,
  },
]

const CAT_COLOR: Record<string, string> = {
  음악: '#FF6B47',
  전시: '#8B5CF6',
  마켓: '#00C4A0',
  음식: '#D97706',
  영화: '#8B5CF6',
  체험: '#00C4A0',
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

function Calendar({
  events,
  onDaySelect,
  selectedDay,
}: {
  events: typeof SAVED_EVENTS
  onDaySelect: (day: number | null) => void
  selectedDay: number | null
}) {
  const today = 18
  const daysInMonth = 30
  const firstDayOfWeek = 2 // September 2026 starts on Tuesday

  const days: (number | null)[] = Array(firstDayOfWeek).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  while (days.length % 7 !== 0) days.push(null)

  const eventDays = new Map<number, string>()
  events.forEach(e => {
    if (!eventDays.has(e.day)) eventDays.set(e.day, CAT_COLOR[e.category] ?? '#FF6B47')
  })

  return (
    <div className="bg-white rounded-2xl mx-5 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg hover:bg-[#F3F4F6]">‹</button>
        <h3 className="font-display text-lg font-bold text-[#1A1A2E]">2026년 9월</h3>
        <button className="w-8 h-8 flex items-center justify-center text-[#6B7280] rounded-lg hover:bg-[#F3F4F6]">›</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[11px] font-semibold py-1 ${
              i === 0 ? 'text-[#FF6B47]' : i === 6 ? 'text-[#8B5CF6]' : 'text-[#9CA3AF]'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />
          const isToday = day === today
          const hasEvent = eventDays.has(day)
          const isSelected = day === selectedDay
          const eventColor = eventDays.get(day)

          return (
            <button
              key={day}
              onClick={() => onDaySelect(isSelected ? null : day)}
              className="flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all active:scale-90"
              style={isSelected ? { backgroundColor: '#1A1A2E' } : {}}
            >
              <span
                className={`text-sm font-semibold ${
                  isSelected ? 'text-white' : isToday ? 'text-[#FF6B47]' : 'text-[#1A1A2E]'
                }`}
              >
                {day}
              </span>
              <div className="h-1.5 flex items-center justify-center">
                {hasEvent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? 'white' : eventColor }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Favorites() {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const displayEvents = selectedDay
    ? SAVED_EVENTS.filter(e => e.day === selectedDay)
    : SAVED_EVENTS

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-[#1A1A2E]">
        <h1 className="font-display text-white text-3xl font-bold leading-tight">
          관심 목록
        </h1>
        <p className="text-white/50 text-sm mt-1">{SAVED_EVENTS.length}개 저장됨</p>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-[#F3F4F6] px-5 py-3">
        <div className="flex bg-[#F3F4F6] rounded-xl p-1 w-fit gap-1">
          {(['list', 'calendar'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === v ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'
              }`}
            >
              {v === 'list' ? '📋 리스트' : '📅 캘린더'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {view === 'calendar' && (
          <div className="pt-4">
            <Calendar
              events={SAVED_EVENTS}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
            />
            {selectedDay && (
              <p className="px-5 mt-4 text-sm font-semibold text-[#6B7280]">
                9월 {selectedDay}일 저장된 행사
              </p>
            )}
          </div>
        )}

        {/* Event Cards */}
        <div className={`px-5 flex flex-col gap-3 ${view === 'calendar' ? 'mt-3' : 'mt-4'}`}>
          {displayEvents.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📭</span>
              <p className="text-[#6B7280] text-sm mt-3">이 날짜에 저장된 행사가 없어요</p>
            </div>
          ) : (
            displayEvents.map(event => {
              const color = CAT_COLOR[event.category] ?? '#FF6B47'
              return (
                <div key={event.id} className="bg-white rounded-2xl flex overflow-hidden shadow-sm">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                    <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {event.category}
                    </span>
                    <p className="font-semibold text-[#1A1A2E] text-sm mt-1 leading-tight line-clamp-1">{event.title}</p>
                    <p className="text-[#6B7280] text-xs mt-1">{event.place}</p>
                    <p className="text-[#9CA3AF] text-xs">{event.date}</p>
                  </div>
                  <button className="flex-shrink-0 px-3 flex items-center text-[#FF6B47]">
                    <span className="text-lg">❤️</span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
