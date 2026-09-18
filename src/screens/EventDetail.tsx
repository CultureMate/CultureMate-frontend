import { useState } from 'react'

const EVENT_DATA: Record<number, any> = {
  1: {
    title: '서울 재즈 페스티벌 2026',
    date: '2026년 9월 20일(토) – 22일(월)',
    place: '올림픽공원 88잔디마당',
    org: '서울특별시',
    fee: '무료',
    category: '음악',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop&auto=format',
    aiSummary: '서울 한복판에서 펼쳐지는 국내 최대 규모의 야외 재즈 페스티벌입니다. 국내외 정상급 재즈 뮤지션 30팀이 3일간 무대를 꾸미며, 음악과 함께 즐기는 푸드트럭, 아트마켓도 운영됩니다. 가족, 연인, 친구 모두에게 완벽한 가을 나들이 코스입니다.',
    highlights: ['국내외 아티스트 30팀', '야외 무대 / 돗자리 자유석', '푸드트럭 & 아트마켓', '반려동물 동반 가능'],
  },
  2: {
    title: '한강 야경 사진전 — 빛의 도시',
    date: '2026년 9월 15일(화) – 10월 5일(월)',
    place: '반포한강공원 달빛광장',
    org: '한강사업본부',
    fee: '무료',
    category: '전시',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop&auto=format',
    aiSummary: '서울의 밤을 담은 200여 점의 사진 작품이 한강변에 펼쳐집니다. 세계적인 사진작가들이 포착한 서울 야경의 아름다움을 무료로 감상할 수 있으며, 야간에 더욱 빛나는 특별한 조명 설치 작품도 함께 즐길 수 있습니다.',
    highlights: ['사진 작품 200점+', '야간 조명 설치미술', '작가와의 대화 주말 진행', '한강뷰 포토존'],
  },
}

const FALLBACK = EVENT_DATA[1]

interface EventDetailProps {
  eventId: number
  onBack: () => void
}

export default function EventDetail({ eventId, onBack }: EventDetailProps) {
  const event = EVENT_DATA[eventId] ?? FALLBACK
  const [saved, setSaved] = useState(false)

  const CATEGORY_COLOR: Record<string, string> = {
    음악: '#FF6B47',
    전시: '#8B5CF6',
    마켓: '#00C4A0',
    음식: '#D97706',
    영화: '#8B5CF6',
    체험: '#00C4A0',
    스포츠: '#FFD23F',
  }
  const color = CATEGORY_COLOR[event.category] ?? '#FF6B47'

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Hero Image */}
      <div className="relative h-[280px] bg-gray-100">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <button
          onClick={onBack}
          className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-white text-lg">←</span>
        </button>
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-12 right-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-xl">{saved ? '❤️' : '🤍'}</span>
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <span
            className="text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2"
            style={{ backgroundColor: color }}
          >
            {event.category}
          </span>
          <h1 className="font-display text-white text-2xl font-bold leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar">
        {/* Quick Info */}
        <div className="bg-white px-5 py-4 border-b border-[#F3F4F6]">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📅', label: '일정', value: event.date },
              { icon: '📍', label: '장소', value: event.place },
              { icon: '🏢', label: '주최', value: event.org },
              { icon: '💰', label: '요금', value: event.fee },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-base mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-[#9CA3AF] text-[11px] font-medium">{item.label}</p>
                  <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5 leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="mx-5 mt-5 bg-gradient-to-br from-[#FF6B47]/10 to-[#8B5CF6]/10 rounded-2xl p-4 border border-[#FF6B47]/20">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-[#FF6B47]">AI 요약</span>
          </div>
          <p className="text-[#1A1A2E] text-sm leading-relaxed">{event.aiSummary}</p>
        </div>

        {/* Highlights */}
        <div className="mx-5 mt-5">
          <h2 className="font-display text-lg font-bold text-[#1A1A2E] mb-3">이런 점이 좋아요</h2>
          <div className="flex flex-col gap-2">
            {event.highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                <div className="w-6 h-6 bg-[#FFF0EC] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FF6B47] text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-[#1A1A2E] text-sm font-medium">{h}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mx-5 mt-5">
          <h2 className="font-display text-lg font-bold text-[#1A1A2E] mb-3">위치</h2>
          <div className="bg-[#E5E7EB] rounded-2xl h-[140px] flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl">🗺️</span>
              <p className="text-[#6B7280] text-sm mt-1">{event.place}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-5 py-4 pb-8">
        <div className="flex gap-3">
          <button
            onClick={() => setSaved(!saved)}
            className="flex-shrink-0 w-12 h-12 rounded-xl border border-[#E5E7EB] flex items-center justify-center"
          >
            <span className="text-xl">{saved ? '❤️' : '🤍'}</span>
          </button>
          <button className="flex-1 bg-[#FF6B47] text-white font-bold rounded-xl py-3.5 active:opacity-90 transition-opacity">
            ✨ AI 코스에 추가하기
          </button>
        </div>
      </div>
    </div>
  )
}
