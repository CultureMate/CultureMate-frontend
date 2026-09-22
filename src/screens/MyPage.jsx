import { CATEGORIES, DISTRICTS } from '../data/events'

const CAT_ICONS = {
  '공연': '🎭', '전시': '🖼️', '교육/체험': '🎨', '스포츠': '⚽',
  '음악': '🎵', '영화': '🎬', '축제/행사': '🎪', '문화/예술': '🏛️',
}

const SELECTED_INTERESTS = new Set(['음악', '전시'])
const RESIDENCE = '마포구'

export default function MyPage() {
  const showDeleteConfirm = false
  const editMode = false

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

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: '저장한 행사', value: 3,  icon: '❤️' },
              { label: '다녀온 행사', value: 2,  icon: '✅' },
              { label: '이번 달 예정', value: 1, icon: '📅' },
              { label: '리뷰',        value: 0,  icon: '✏️' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
                <span className="text-xl">{stat.icon}</span>
                <p className="text-white font-bold text-lg mt-1">{stat.value}</p>
                <p className="text-white/50 text-[10px] mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start pt-5">

          {/* 왼쪽: 거주지 + 관심 카테고리 */}
          <div className="flex flex-col gap-4">

            {/* 거주지 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
                <p className="font-semibold text-[#1A1A2E] text-sm">📍 거주지 정보</p>
                {!editMode && (
                  <button className="text-[#FF6B47] text-xs font-semibold border border-[#FF6B47] px-2.5 py-1 rounded-lg">수정</button>
                )}
              </div>
              {editMode ? (
                <div className="px-4 py-4">
                  <p className="text-xs text-[#6B7280] font-medium mb-2">거주 구 선택</p>
                  <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto hide-scrollbar">
                    {DISTRICTS.map(d => (
                      <button key={d}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          d === RESIDENCE ? 'bg-[#FF6B47] text-white border-[#FF6B47]' : 'bg-white text-[#1A1A2E] border-[#E5E7EB]'
                        }`}
                      >{d}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280]">취소</button>
                    <button className="flex-1 py-2.5 rounded-xl bg-[#FF6B47] text-white text-sm font-semibold">저장</button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <p className="text-[#9CA3AF] text-xs font-medium">거주 구</p>
                  <p className="text-[#1A1A2E] font-semibold text-base mt-0.5">{RESIDENCE}</p>
                </div>
              )}
            </div>

            {/* 관심 카테고리 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <p className="font-semibold text-[#1A1A2E] text-sm">⭐ 관심 카테고리</p>
              </div>
              <div className="px-4 py-4 flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const selected = SELECTED_INTERESTS.has(cat)
                  return (
                    <button key={cat}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 border ${
                        selected ? 'bg-[#FF6B47] text-white border-[#FF6B47]' : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                      }`}
                    >
                      <span>{CAT_ICONS[cat] ?? '🎪'}</span>{cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 설정 + 로그아웃 */}
          <div className="flex flex-col gap-4 mt-4 lg:mt-0">

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { icon: '🔔', label: '알림 설정' },
                { icon: '🔒', label: '개인정보 처리방침' },
              ].map((item, i, arr) => (
                <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-4 active:bg-[#F9FAFB] ${i<arr.length-1?'border-b border-[#F3F4F6]':''}`}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">{item.label}</span>
                  <span className="text-[#9CA3AF] text-sm">›</span>
                </button>
              ))}
            </div>

            <div className="mb-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#F3F4F6] active:bg-[#F9FAFB]">
                <span className="text-base">🚪</span>
                <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">로그아웃</span>
                <span className="text-[#9CA3AF] text-sm">›</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-4 active:bg-[#FFF0EC]">
                <span className="text-base">🗑️</span>
                <span className="text-sm font-medium flex-1 text-left text-[#EF4444]">회원탈퇴</span>
                <span className="text-[#9CA3AF] text-sm">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl" style={{ maxWidth: 380, margin: '0 auto' }}>
            <h3 className="font-display text-xl font-bold text-[#1A1A2E] mb-2">정말 탈퇴하시겠어요?</h3>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-5">저장된 관심 행사와 모든 개인정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280]">취소</button>
              <button className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white text-sm font-semibold">탈퇴하기</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
