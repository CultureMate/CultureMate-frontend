const DAYS_OF_WEEK = ['일','월','화','수','목','금','토']

function DateRangePicker() {
  const cells = [null, null, ...Array.from({ length: 30 }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <p className="text-sm font-semibold mb-3 text-[#9CA3AF]">날짜를 선택하세요</p>
      <div className="bg-[#FAFAF8] rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <p className="text-center text-xs font-bold text-[#1A1A2E] pt-3 pb-1">2026년 9월</p>
        <div className="grid grid-cols-7 px-2 mb-1">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-semibold py-1 ${i===0?'text-[#FF6B47]':i===6?'text-[#8B5CF6]':'text-[#9CA3AF]'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 px-2 pb-3">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} />
            return (
              <div key={day} className="relative flex items-center justify-center h-9">
                <button className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-[#1A1A2E]">
                  {day}
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-[10px] text-[#9CA3AF] mt-2 text-center">시작일 탭 → 종료일 탭으로 범위 선택</p>
    </div>
  )
}

function FilterSheet({ onClose }) {
  const COMPANIONS = ['혼자', '친구랑', '연인이랑', '가족이랑']
  const COMPANION_ICONS = { '혼자': '🧍', '친구랑': '👫', '연인이랑': '💑', '가족이랑': '👨‍👩‍👧' }
  const DISTRICTS = ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구']
  const CATEGORIES = ['전시·미술', '공연·콘서트', '영화·상영', '축제·행사', '스포츠', '교육·강연', '팝업·체험', '음식·음료']

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '92dvh' }}>
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-[#E5E7EB] rounded-full" /></div>
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <h3 className="font-display text-xl font-bold text-[#1A1A2E]">필터</h3>
            <button className="text-sm text-[#9CA3AF] font-medium">초기화</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 hide-scrollbar">
          {/* Companion */}
          <div className="mb-5 pb-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">👥</span>
              <p className="font-semibold text-[#1A1A2E] text-sm">누구랑 가시나요?</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {COMPANIONS.map(c => (
                <button key={c} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 bg-white border-[#E5E7EB]">
                  <span className="text-xl">{COMPANION_ICONS[c]}</span>
                  <span className="text-[11px] font-semibold text-[#374151]">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Districts */}
          <div className="mb-5 pb-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🗺️</span>
              <p className="font-semibold text-[#1A1A2E] text-sm flex-1">지역</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.slice(0, 10).map(d => (
                <button key={d} className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-white text-[#374151] border-[#E5E7EB]">{d}</button>
              ))}
              <button className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B7280] border border-dashed border-[#D1D5DB]">
                +{DISTRICTS.length - 10}개 더
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-5 pb-5 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🎭</span>
              <p className="font-semibold text-[#1A1A2E] text-sm flex-1">분야</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-white text-[#374151] border-[#E5E7EB]">{c}</button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📅</span>
              <p className="font-semibold text-[#1A1A2E] text-sm flex-1">날짜</p>
            </div>
            <DateRangePicker />
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-[#F3F4F6]">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#FF6B47] text-white font-bold text-base shadow-lg shadow-[#FF6B47]/20 active:scale-95 transition-transform"
          >
            전체 행사 보기
          </button>
        </div>
      </div>
    </>
  )
}

function SaveCourseModal({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 shadow-2xl max-w-sm mx-auto">
        <h3 className="font-display text-xl font-bold text-[#1A1A2E] mb-1">코스 이름 짓기</h3>
        <p className="text-[#9CA3AF] text-sm mb-4">행사 3개로 구성된 코스예요</p>
        <input
          type="text"
          placeholder="예: 홍대 문화 산책"
          maxLength={20}
          className="w-full border-2 border-[#E5E7EB] rounded-2xl px-4 py-3 text-base font-semibold text-[#1A1A2E] placeholder-[#D1D5DB] outline-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280]">취소</button>
          <button className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-[#D1D5DB]">저장하기</button>
        </div>
      </div>
    </>
  )
}

const SAMPLE_EVENTS = [
  { id: 1, category: '전시·미술', categoryColor: { bg: '#EDE9FE', text: '#8B5CF6' }, org: '국립현대미술관', title: '2026 젊은 작가전', date: '9월 1–30일', place: '국립현대미술관 서울', fee: '무료', hot: true, img: 'https://images.unsplash.com/photo-1531913223931-b0d3198229ee?w=400&q=80' },
  { id: 2, category: '공연·콘서트', categoryColor: { bg: '#FFF0EC', text: '#FF6B47' }, org: '서울예술센터', title: '서울 재즈 페스티벌 2026', date: '9월 12–14일', place: '올림픽공원 88잔디마당', fee: '유료', hot: true, img: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&q=80' },
  { id: 3, category: '축제·행사', categoryColor: { bg: '#ECFDF5', text: '#059669' }, org: '서울시', title: '한강 달빛 야시장', date: '9월 5일', place: '여의도 한강공원', fee: '무료', hot: false, img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
  { id: 4, category: '팝업·체험', categoryColor: { bg: '#FEF3C7', text: '#D97706' }, org: '카카오프렌즈', title: '라이언 팝업 스토어', date: '9월 1–28일', place: '성수동 갤러리아', fee: '무료', hot: true, img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80' },
  { id: 5, category: '교육·강연', categoryColor: { bg: '#E0F2FE', text: '#0284C7' }, org: 'D.SCHOOL', title: '디자인 씽킹 워크숍', date: '9월 20일', place: '디캠프 선릉', fee: '유료', hot: false, img: 'https://images.unsplash.com/photo-1561489413-985b06da5bee?w=400&q=80' },
  { id: 6, category: '영화·상영', categoryColor: { bg: '#F3E8FF', text: '#9333EA' }, org: '한국영화진흥위원회', title: '독립영화 특별전', date: '9월 15–21일', place: '씨네큐브 광화문', fee: '유료', hot: false, img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80' },
]

const ALL_CATEGORIES = ['전체', '전시·미술', '공연·콘서트', '영화·상영', '축제·행사', '스포츠', '교육·강연', '팝업·체험', '음식·음료']

export default function EventList({ showFilterSheet, setShowFilterSheet, showSaveCourse, setShowSaveCourse }) {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 pb-4 bg-[#1A1A2E]">
        <div className="flex items-end justify-between max-w-5xl">
          <div>
            <h1 className="font-display text-white text-3xl font-bold leading-tight">행사 목록</h1>
            <p className="text-white/50 text-sm mt-1">6개의 행사</p>
          </div>
          <button
            onClick={() => setShowSaveCourse?.(true)}
            className="flex items-center gap-1.5 bg-[#FF6B47] text-white text-xs font-bold px-3 py-2 rounded-xl mb-0.5 flex-shrink-0"
          >
            🗺️ 3개 · 코스 생성
          </button>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="bg-white px-5 md:px-8 lg:px-10 pt-3 pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2 max-w-5xl">
          <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2.5 flex-1">
            <span className="text-base">🔍</span>
            <input
              type="text"
              placeholder="행사 이름, 장소로 검색"
              className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilterSheet?.(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold border bg-white text-[#6B7280] border-[#E5E7EB] flex-shrink-0"
          >
            <span>⚙️</span>
            필터
          </button>
        </div>

        {/* Active filter chips (sample) */}
        <div className="flex flex-wrap gap-1.5 mt-2 max-w-5xl">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#FF6B47] bg-[#FFF0EC] px-2.5 py-1 rounded-full">
            📅 9월 12일–14일
            <button className="font-black">×</button>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
            마포구<button className="text-[#9CA3AF] font-black">×</button>
          </span>
        </div>
      </div>

      {/* Category tab bar */}
      <div className="bg-white border-b border-[#F3F4F6] sticky top-0 z-10">
        <div className="flex overflow-x-auto md:flex-wrap md:overflow-x-visible hide-scrollbar px-4 md:px-8 lg:px-10 py-3 gap-2">
          {ALL_CATEGORIES.map((cat, i) => (
            <button key={cat}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${i===0?'bg-[#1A1A2E] text-white':'bg-[#F3F4F6] text-[#6B7280]'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Event grid */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-10 pt-4 pb-32 hide-scrollbar">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_EVENTS.map(event => (
            <div key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform text-left w-full"
            >
              <div className="relative h-[180px] bg-gray-100">
                <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                {event.hot && (
                  <div className="absolute top-3 left-3 bg-[#FF6B47] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">🔥 HOT</div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm font-bold text-[#374151]">+</button>
                  <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-base">🤍</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: event.categoryColor.bg, color: event.categoryColor.text }}>{event.category}</span>
                  <span className="text-[#9CA3AF] text-xs truncate">{event.org}</span>
                </div>
                <h3 className="font-semibold text-[#1A1A2E] text-base leading-tight mb-2">{event.title}</h3>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[#6B7280] text-xs flex items-center gap-1"><span>📅</span>{event.date}</p>
                    <p className="text-[#6B7280] text-xs flex items-center gap-1"><span>📍</span>{event.place}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: event.fee==='무료'?'#00C4A0':'#FF6B47' }}>{event.fee}</span>
                </div>
                <button className="mt-3 w-full py-2 rounded-xl text-xs font-bold border bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] flex items-center justify-center gap-1.5">
                  + 코스에 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course cart sticky bar */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-20 flex justify-center px-5 pointer-events-none">
        <div className="bg-[#1A1A2E] text-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto max-w-sm w-full">
          <div className="w-8 h-8 bg-[#FF6B47] rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black">3</div>
          <p className="flex-1 text-sm font-semibold">행사가 코스에 담겼어요</p>
          <button onClick={() => setShowSaveCourse?.(true)} className="bg-[#FF6B47] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0">생성하기</button>
        </div>
      </div>

      {showFilterSheet && <FilterSheet onClose={() => setShowFilterSheet?.(false)} />}
      {showSaveCourse && <SaveCourseModal onClose={() => setShowSaveCourse?.(false)} />}
    </div>
  )
}
