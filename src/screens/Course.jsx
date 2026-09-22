import { EVENTS } from '../data/events'

const SAMPLE_COURSES = [
  {
    id: 1,
    name: '성수 문화 산책',
    eventIds: [3, 8, 5],
    createdAt: '9월 20일',
    favorited: true,
  },
  {
    id: 2,
    name: '강남 아트 데이트',
    eventIds: [7, 6],
    createdAt: '9월 19일',
    favorited: false,
  },
]

function EmptyState({ emoji, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-8">
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="text-[#1A1A2E] font-semibold text-base">{title}</p>
      <p className="text-[#9CA3AF] text-sm mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}

function CourseCard({ course }) {
  const events = course.eventIds.map(id => EVENTS.find(e => e.id === id)).filter(Boolean)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left w-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[#1A1A2E] text-base leading-tight">{course.name}</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">행사 {events.length}개 · {course.createdAt}</p>
        </div>
        <button className="flex-shrink-0 ml-2 w-8 h-8 flex items-center justify-center">
          <span className="text-lg">{course.favorited ? '⭐' : '☆'}</span>
        </button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {events.slice(0, 4).map((event, idx) => (
          <div key={event.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-100">
              <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-0.5 left-0.5 right-0.5 text-white text-[8px] font-semibold line-clamp-1 leading-tight">{event.title}</p>
            </div>
            {idx < Math.min(events.length - 1, 3) && <span className="text-[#D1D5DB] text-xs">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CourseDetail({ course }) {
  const events = course.eventIds.map(id => EVENTS.find(e => e.id === id)).filter(Boolean)
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-6 bg-[#1A1A2E]">
        <button className="flex items-center gap-1.5 text-white/60 text-sm font-medium mb-4">
          <span>←</span> 코스
        </button>
        <div className="flex items-center justify-between max-w-2xl">
          <div>
            <h1 className="font-display text-white text-2xl font-bold">{course.name}</h1>
            <p className="text-white/50 text-sm mt-0.5">행사 {events.length}개 · {course.createdAt}</p>
          </div>
          <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-6 pb-24 hide-scrollbar">
        <div className="max-w-2xl relative">
          <div className="absolute left-[19px] top-5 bottom-10 w-0.5 bg-[#FF6B47]/30 rounded-full" />
          <div className="flex flex-col gap-4">
            {events.map((event, idx) => (
              <div key={event.id} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#FF6B47] flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0 z-10">{idx + 1}</div>
                <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-[120px] bg-gray-100 relative">
                    <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2 left-3 right-3 text-white text-sm font-semibold leading-tight line-clamp-1">{event.title}</p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[#6B7280] text-xs">{event.place}</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">📅 {event.startDate} ~ {event.endDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Course() {
  const subTab = 'my'
  const showDetail = false

  if (showDetail) {
    return <CourseDetail course={SAMPLE_COURSES[0]} />
  }

  const displayCourses = subTab === 'my' ? SAMPLE_COURSES : SAMPLE_COURSES.filter(c => c.favorited)

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <div className="max-w-5xl">
          <h1 className="font-display text-white text-3xl font-bold leading-tight">코스</h1>
          <p className="text-white/50 text-sm mt-1">내 코스 {SAMPLE_COURSES.length}개</p>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="bg-white border-b border-[#F3F4F6] px-5 md:px-8 lg:px-10 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex bg-[#F3F4F6] rounded-xl p-1 gap-1">
            <button className="flex-1 py-2 rounded-lg text-sm font-semibold bg-white text-[#1A1A2E] shadow-sm">
              🗺️ 내가 만든 코스
            </button>
            <button className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#9CA3AF]">
              ⭐ 즐겨찾기한 코스
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-4">
          {displayCourses.length === 0 ? (
            <EmptyState emoji="🗺️" title="아직 만든 코스가 없어요" desc="행사 목록에서 + 버튼으로 행사를 담고 코스를 생성해보세요" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
