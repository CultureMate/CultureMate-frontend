const CAT_ICONS = {
  '공연': '🎭', '전시': '🖼️', '교육/체험': '🎨', '스포츠': '⚽',
  '음악': '🎵', '영화': '🎬', '축제/행사': '🎪', '문화/예술': '🏛️',
}
const CATEGORIES = ['공연', '전시', '교육/체험', '스포츠', '음악', '영화', '축제/행사', '문화/예술']
const SELECTED_INTERESTS = ['음악', '전시']

const STATS = [
  { label: '저장한 행사', value: 3,  icon: '❤️' },
  { label: '다녀온 행사', value: 2,  icon: '✅' },
  { label: '이번 달 예정', value: 1, icon: '📅' },
  { label: '리뷰',        value: 0,  icon: '✏️' },
]

export default function MyPage() {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-8 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
                <span className="text-xl">{stat.icon}</span>
                <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
                <p className="text-white/50 text-[10px] mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start pt-5">

          <div className="flex flex-col gap-4">
            {/* 거주지 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
                <p className="font-semibold text-[#1A1A2E] text-sm">📍 거주지 정보</p>
                <button className="text-[#FF6B47] text-xs font-semibold border border-[#FF6B47] px-2.5 py-1 rounded-lg">수정</button>
              </div>
              <div className="px-4 py-4">
                <p className="text-[#9CA3AF] text-xs font-medium">거주 구</p>
                <p className="text-[#1A1A2E] font-semibold text-base mt-0.5">마포구</p>
              </div>
            </div>

            {/* 관심 카테고리 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <p className="font-semibold text-[#1A1A2E] text-sm">⭐ 관심 카테고리</p>
              </div>
              <div className="px-4 py-4 flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const selected = SELECTED_INTERESTS.includes(cat)
                  return (
                    <div
                      key={cat}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 border ${
                        selected ? 'bg-[#FF6B47] text-white border-[#FF6B47]' : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                      }`}
                    >
                      <span>{CAT_ICONS[cat] ?? '🎪'}</span>{cat}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 lg:mt-0">
            {/* 설정 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[{ icon: '🔔', label: '알림 설정' }, { icon: '🔒', label: '개인정보 처리방침' }].map((item, i, arr) => (
                <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-4 ${i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">{item.label}</span>
                  <span className="text-[#9CA3AF] text-sm">›</span>
                </button>
              ))}
            </div>

            {/* 로그아웃 / 탈퇴 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#F3F4F6]">
                <span className="text-base">🚪</span>
                <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">로그아웃</span>
                <span className="text-[#9CA3AF] text-sm">›</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-4">
                <span className="text-base">🗑️</span>
                <span className="text-sm font-medium flex-1 text-left text-[#EF4444]">회원탈퇴</span>
                <span className="text-[#9CA3AF] text-sm">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
