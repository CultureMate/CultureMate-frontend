const EVENT = {
  title: '서울 재즈 페스티벌 2026',
  category: '축제/행사',
  place: '올림픽공원 88잔디마당',
  org: '서울특별시',
  fee: '무료',
  district: '송파구',
  startDate: '2026-09-20',
  endDate: '2026-09-22',
  img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format',
}

const AI_SUMMARY = '국내외 정상급 재즈 뮤지션 30팀이 3일간 올림픽공원 야외무대에서 공연하는 서울 최대 규모의 재즈 페스티벌입니다. 음악과 함께 즐기는 푸드트럭, 아트마켓도 운영됩니다.'

const COMMENTS = [
  { id: 1, author: '김민지', text: '작년에도 갔는데 정말 좋았어요! 올해도 기대됩니다 🎵', createdAt: '9월 15일',
    replies: [{ id: 2, author: '이수현', text: '저도 작년에 갔었는데 너무 좋았어요. 올해는 같이 가요!', createdAt: '9월 15일' }] },
  { id: 3, author: '박준혁', text: '입장료 없이 이런 수준의 공연을 볼 수 있다니 대박이네요', createdAt: '9월 16일', replies: [] },
]

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <p className="text-[#9CA3AF] text-[11px] font-medium">{label}</p>
        <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  )
}

export default function EventDetail() {
  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="hidden lg:flex items-center px-5 md:px-8 lg:px-10 pt-4 pb-2 max-w-5xl mx-auto w-full">
        <button aria-label="목록으로" className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[#1A1A2E] text-lg">←</span>
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-56 md:h-72 lg:h-80 bg-gray-100">
        <img src={EVENT.img} alt={EVENT.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <button aria-label="목록으로" className="lg:hidden absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-white text-lg">←</span>
        </button>
        <div className="absolute top-12 right-5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-white/70 text-xs">👁</span>
          <span className="text-white text-xs font-semibold">4,821</span>
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2 bg-[#D97706]">
            {EVENT.category}
          </span>
          <h1 className="font-display text-white text-2xl font-bold leading-tight">{EVENT.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar">
        <div className="lg:flex lg:gap-6 lg:items-start max-w-5xl mx-auto px-5 md:px-8 lg:px-10 py-4">

          <div className="lg:flex-1 lg:min-w-0">
            {/* Info grid */}
            <div className="bg-white rounded-2xl py-4 px-4 border border-[#F3F4F6] mb-4">
              <div className="grid grid-cols-2 gap-4">
                <Field icon="📅" label="기간"   value={`${EVENT.startDate} ~ ${EVENT.endDate}`} />
                <Field icon="📍" label="장소"   value={EVENT.place} />
                <Field icon="🏢" label="기관"   value={EVENT.org} />
                <Field icon="💰" label="요금"   value={EVENT.fee} />
                <Field icon="🗺️" label="자치구" value={EVENT.district} />
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">🔗</span>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium">원문 링크</p>
                    <button
                      className="text-[#FF6B47] text-sm font-semibold mt-0.5 leading-tight underline">바로가기 →</button>
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
                <p className="text-[#1A1A2E] text-sm leading-relaxed">{AI_SUMMARY}</p>
              </div>
            </div>

            {/* 지도 */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] mb-4">
              <div className="bg-[#F9FAFB] px-4 py-3 flex items-center gap-2 border-b border-[#E5E7EB]">
                <span className="text-lg">📍</span>
                <span className="text-sm font-bold text-[#1A1A2E]">지도</span>
                <span className="text-xs text-[#9CA3AF] ml-1">{EVENT.place}</span>
              </div>
              <div className="relative bg-[#E8F0E8] h-[200px] md:h-[240px] flex flex-col items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#FFE500] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <p className="text-[#374151] text-sm font-semibold">{EVENT.place}</p>
                  <p className="text-[#6B7280] text-xs">{EVENT.district}</p>
                  <button
                    className="mt-1 bg-[#FFE500] text-[#1A1A2E] text-xs font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5"
                  >
                    카카오맵에서 보기 →
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block mb-4">
              <button className="w-full font-bold rounded-xl py-3.5 bg-[#FF6B47] text-white flex items-center justify-center gap-2">
                <span className="text-xl">🤍</span>
                관심목록에 저장
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-4">
            <div className="mt-5 lg:mt-0">
              <h2 className="font-display text-lg font-bold text-[#1A1A2E] mb-3">
                댓글 <span className="text-[#FF6B47]">3</span>
              </h2>
              <div className="flex flex-col gap-4 mb-4">
                {COMMENTS.map(comment => (
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
                <input
                  type="text"
                  placeholder="댓글을 남겨보세요"
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                />
                <button className="font-bold text-sm px-4 py-3 rounded-xl bg-[#F3F4F6] text-[#9CA3AF]">등록</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action — mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-5 py-4 pb-8"
        style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
        <button className="w-full font-bold rounded-xl py-3.5 bg-[#FF6B47] text-white flex items-center justify-center gap-2">
          <span className="text-xl">🤍</span>
          관심목록에 저장
        </button>
      </div>
    </div>
  )
}
