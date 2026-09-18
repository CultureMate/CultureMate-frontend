import { useState } from 'react'

const INTEREST_CATEGORIES = ['음악', '전시', '마켓', '음식', '영화', '체험']
const CAT_ICONS: Record<string, string> = {
  음악: '🎵', 전시: '🖼️', 마켓: '🛍️', 음식: '🍜', 영화: '🎬', 체험: '🎨',
}

export default function MyPage() {
  const [interests, setInterests] = useState<Set<string>>(new Set(['음악', '전시']))

  const toggleInterest = (cat: string) => {
    setInterests(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 bg-[#1A1A2E]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🦊</span>
          </div>
          <div>
            <h1 className="font-display text-white text-2xl font-bold">김서울</h1>
            <p className="text-white/50 text-sm mt-0.5">seoul@kakao.com</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-4 h-4 bg-[#FFE500] rounded-full flex items-center justify-center">
                <span className="text-[8px] font-black text-black">K</span>
              </div>
              <span className="text-white/60 text-xs">카카오 로그인</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: '저장한 행사', value: '4', icon: '❤️' },
            { label: '다녀온 코스', value: '2', icon: '✅' },
            { label: '즐겨찾기 코스', value: '1', icon: '⭐' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
              <p className="text-white/50 text-[10px] mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {/* Residence */}
        <div className="mx-5 mt-5 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="font-semibold text-[#1A1A2E] text-sm">📍 거주지 정보</p>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-xs font-medium">거주 구</p>
                <p className="text-[#1A1A2E] font-semibold text-base mt-0.5">마포구</p>
              </div>
              <button className="text-[#FF6B47] text-sm font-semibold border border-[#FF6B47] px-3 py-1.5 rounded-lg">
                수정
              </button>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="font-semibold text-[#1A1A2E] text-sm">⭐ 관심 카테고리</p>
          </div>
          <div className="px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {INTEREST_CATEGORIES.map(cat => {
                const selected = interests.has(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleInterest(cat)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-[#FF6B47] text-white'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    <span>{CAT_ICONS[cat]}</span>
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Past Courses */}
        <div className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="font-semibold text-[#1A1A2E] text-sm">🗺️ 즐겨찾기 코스</p>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {[
              { title: '홍대 힙한 하루', places: '홍대 카페 → 공연 → 맛집', date: '9월 14일', emoji: '🎸' },
              { title: '성수동 주말 데이트', places: '카페 → 팝업마켓 → 한강', date: '9월 7일', emoji: '☕' },
            ].map((course, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFF0EC] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {course.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A2E] text-sm truncate">{course.title}</p>
                  <p className="text-[#9CA3AF] text-xs truncate">{course.places}</p>
                </div>
                <p className="text-[#9CA3AF] text-xs flex-shrink-0">{course.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm mb-2">
          {[
            { icon: '🔔', label: '알림 설정' },
            { icon: '🔒', label: '개인정보 처리방침' },
            { icon: '📞', label: '고객센터' },
            { icon: '🚪', label: '로그아웃', color: '#FF6B47' },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-4 active:bg-[#F9FAFB] transition-colors ${
                i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span
                className="text-sm font-medium flex-1 text-left"
                style={{ color: item.color ?? '#1A1A2E' }}
              >
                {item.label}
              </span>
              <span className="text-[#9CA3AF] text-sm">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
