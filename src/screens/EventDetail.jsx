import { EVENTS, CATEGORY_COLOR } from '../data/events'

const SAMPLE_COMMENTS = [
  {
    id: 1, author: '김민지', text: '작년에도 갔는데 정말 좋았어요! 올해도 기대됩니다 🎵', createdAt: '9월 15일',
    replies: [
      { id: 2, author: '이수현', text: '저도 작년에 갔었는데 너무 좋았어요. 올해는 같이 가요!', createdAt: '9월 15일' },
    ],
  },
  { id: 3, author: '박준혁', text: '입장료 없이 이런 수준의 공연을 볼 수 있다니 대박이네요', createdAt: '9월 16일', replies: [] },
]

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <p className="text-[#9CA3AF] text-[11px] font-medium">{label}</p>
        <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5 leading-tight">
          {value || <span className="text-[#D1D5DB] font-normal">정보 없음</span>}
        </p>
      </div>
    </div>
  )
}

export default function EventDetail({ eventId = 1, loggedIn = true }) {
  const event  = EVENTS.find(e => e.id === eventId) ?? EVENTS[0]
  const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* 데스크탑 뒤로가기 */}
      <div className="hidden lg:flex items-center px-5 md:px-8 lg:px-10 pt-4 pb-2 max-w-5xl mx-auto w-full">
        <button className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[#1A1A2E] text-lg">←</span>
        </button>
      </div>

      {/* 히어로 이미지 */}
      <div className="relative h-56 md:h-72 lg:h-80 bg-gray-100">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <button className="lg:hidden absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-white text-lg">←</span>
        </button>
        <div className="absolute top-12 right-5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-white/70 text-xs">👁</span>
          <span className="text-white text-xs font-semibold">1,234</span>
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2" style={{ backgroundColor: colors.text }}>
            {event.category}
          </span>
          <h1 className="font-display text-white text-2xl font-bold leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar">
        <div className="lg:flex lg:gap-6 lg:items-start max-w-5xl mx-auto px-5 md:px-8 lg:px-10 py-4">

          {/* 왼쪽: 행사 정보 */}
          <div className="lg:flex-1 lg:min-w-0">

            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl py-4 px-4 border border-[#F3F4F6] mb-4">
              <div className="grid grid-cols-2 gap-4">
                <Field icon="📅" label="기간"   value={`${event.startDate} ~ ${event.endDate}`} />
                <Field icon="📍" label="장소"   value={event.place} />
                <Field icon="🏢" label="기관"   value={event.org} />
                <Field icon="💰" label="요금"   value={event.fee} />
                <Field icon="🗺️" label="자치구" value={event.district} />
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">🔗</span>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium">원문 링크</p>
                    <span className="text-[#FF6B47] text-sm font-semibold mt-0.5 leading-tight underline">
                      바로가기 →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 소개문 */}
            <div className="rounded-2xl overflow-hidden border border-[#FF6B47]/20 mb-4">
              <div className="bg-gradient-to-br from-[#FF6B47]/10 to-[#8B5CF6]/10 px-4 py-3 flex items-center gap-2 border-b border-[#FF6B47]/10">
                <span className="text-lg">✨</span>
                <span className="text-sm font-bold text-[#FF6B47]">AI 소개문</span>
              </div>
              <div className="bg-white px-4 py-4">
                <p className="text-[#1A1A2E] text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* 지도 */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] mb-4">
              <div className="bg-[#F9FAFB] px-4 py-3 flex items-center gap-2 border-b border-[#E5E7EB]">
                <span className="text-lg">📍</span>
                <span className="text-sm font-bold text-[#1A1A2E]">지도</span>
                <span className="text-xs text-[#9CA3AF] ml-1">{event.place}</span>
              </div>
              <div className="relative bg-[#E8F0E8] h-[200px] md:h-[240px] flex flex-col items-center justify-center gap-3">
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#FFE500] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <p className="text-[#374151] text-sm font-semibold">{event.place}</p>
                  <p className="text-[#6B7280] text-xs">{event.district}</p>
                  <span
                    className="mt-1 bg-[#FFE500] text-[#1A1A2E] text-xs font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5"
                  >
                    카카오맵에서 보기 →
                  </span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 (데스크탑) */}
            <div className="hidden lg:flex gap-3 mb-4">
              <button className="flex-1 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 border bg-white text-[#6B7280] border-[#E5E7EB]">
                <span>+</span> 코스에 추가
              </button>
              <button className="flex-1 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 bg-[#FF6B47] text-white">
                <span className="text-xl">🤍</span> 관심목록 저장
              </button>
            </div>
          </div>

          {/* 오른쪽: 댓글 */}
          <div className="lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-4">
            <div className="mt-5 lg:mt-0">
              <h2 className="font-display text-lg font-bold text-[#1A1A2E] mb-3">
                댓글 <span className="text-[#FF6B47]">3</span>
              </h2>

              {loggedIn ? (
                <>
                  <div className="flex flex-col gap-4 mb-4">
                    {SAMPLE_COMMENTS.map(comment => (
                      <div key={comment.id}>
                        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#FFF0EC] rounded-full flex items-center justify-center text-xs">{comment.author[0]}</div>
                              <span className="text-sm font-semibold text-[#1A1A2E]">{comment.author}</span>
                              <span className="text-xs text-[#9CA3AF]">{comment.createdAt}</span>
                            </div>
                            <button className="text-xs text-[#6B7280]">답글</button>
                          </div>
                          <p className="text-sm text-[#374151] leading-relaxed">{comment.text}</p>
                        </div>

                        {comment.replies.length > 0 && (
                          <div className="ml-5 mt-2 flex flex-col gap-2">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="bg-[#F9FAFB] rounded-xl p-3 border-l-2 border-[#E5E7EB]">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-[#9CA3AF]">↳</span>
                                  <div className="w-5 h-5 bg-[#F3EEFF] rounded-full flex items-center justify-center text-[10px]">{reply.author[0]}</div>
                                  <span className="text-xs font-semibold text-[#1A1A2E]">{reply.author}</span>
                                  <span className="text-[10px] text-[#9CA3AF]">{reply.createdAt}</span>
                                </div>
                                <p className="text-xs text-[#374151] leading-relaxed">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <input type="text" placeholder="댓글을 남겨보세요"
                      className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                    />
                    <button className="font-bold text-sm px-4 py-3 rounded-xl bg-[#F3F4F6] text-[#9CA3AF]">등록</button>
                  </div>
                </>
              ) : (
                /* 비로그인: 블러 오버레이 */
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="flex flex-col gap-3 mb-3">
                      {SAMPLE_COMMENTS.slice(0, 2).map(comment => (
                        <div key={comment.id} className="bg-white rounded-2xl p-3.5 shadow-sm">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 bg-[#FFF0EC] rounded-full flex items-center justify-center text-xs">{comment.author[0]}</div>
                            <span className="text-sm font-semibold text-[#1A1A2E]">{comment.author}</span>
                          </div>
                          <p className="text-sm text-[#374151]">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#D1D5DB]">댓글을 남겨보세요</div>
                      <div className="bg-[#F3F4F6] text-[#D1D5DB] font-bold text-sm px-4 py-3 rounded-xl">등록</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] px-6 text-center gap-4">
                    <div className="w-12 h-12 bg-[#FFF0EC] rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-[#1A1A2E] text-sm font-semibold leading-relaxed">
                      로그인시 댓글 확인 및<br />작성이 가능합니다.
                    </p>
                    <button
                      className="flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-2xl w-full"
                      style={{ backgroundColor: '#FFE500', color: '#1A1A2E' }}
                    >
                      <div className="w-5 h-5 bg-[#1A1A2E] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-black">K</span>
                      </div>
                      카카오로 로그인
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 (모바일) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-5 py-3 pb-8 flex gap-3">
        <button className="flex-1 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 border bg-white text-[#6B7280] border-[#E5E7EB]">
          <span>+</span> 코스 추가
        </button>
        <button className="flex-1 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 bg-[#FF6B47] text-white">
          <span className="text-lg">🤍</span> 관심 저장
        </button>
      </div>
    </div>
  )
}
