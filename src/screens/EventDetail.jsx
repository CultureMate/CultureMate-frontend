import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEventDetail } from '../api/events'
import { CATEGORY_COLOR } from '../data/events'
import DemoNotice from '../components/DemoNotice'

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

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const loadEvent = async () => {
      setLoading(true)
      setError(null)
      try {
        // URL 형태의 행사 ID도 Axios params로 한 번만 인코딩합니다.
        const { event: data, isMock } = await getEventDetail(id, controller.signal)
        if (!controller.signal.aborted) setEvent({ ...data, img: data.imageUrl, org: data.organization, isMock })
      } catch (err) {
        if (!controller.signal.aborted) setError(err)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadEvent()
    return () => controller.abort()
  }, [id, retry])

  if (loading) return <p role="status" className="p-8">행사 정보를 불러오는 중입니다.</p>
  if (error) return (
    <div role="alert" className="p-8">
      <p>{error.response?.status === 404 ? '행사를 찾을 수 없습니다.' : '행사 정보를 불러오지 못했습니다.'}</p>
      <button onClick={() => setRetry(value => value + 1)} className="text-[#FF6B47] mr-4 mt-4">다시 시도</button>
      <Link to="/">홈으로</Link>
    </div>
  )
  return <EventDetailView event={event} />
}

function EventDetailView({ event }) {
  const navigate = useNavigate()
  const colors = CATEGORY_COLOR[event.category] ?? { bg: '#F3F4F6', text: '#6B7280' }
  const originalUrl = /^https?:\/\//i.test(event.originalUrl || '') ? event.originalUrl : null

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {event.isMock && <div className="px-5 pt-5"><DemoNotice /></div>}
      {/* 데스크탑 뒤로가기 */}
      <div className="hidden lg:flex items-center px-5 md:px-8 lg:px-10 pt-4 pb-2 max-w-5xl mx-auto w-full">
        <button aria-label="홈으로" onClick={() => navigate('/')} className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[#1A1A2E] text-lg">←</span>
        </button>
      </div>

      {/* 히어로 이미지 */}
      <div className="relative h-56 md:h-72 lg:h-80 bg-gray-100">
        {event.img && <img src={event.img} alt={event.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <button aria-label="홈으로" onClick={() => navigate('/')} className="lg:hidden absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-white text-lg">←</span>
        </button>
        <div className="absolute top-12 right-5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-white/70 text-xs">👁</span>
          <span className="text-white text-xs font-semibold">{event.viewCount ?? 0}</span>
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
                <Field icon="📅" label="기간"   value={[event.startDate, event.endDate].filter(Boolean).join(' ~ ')} />
                <Field icon="📍" label="장소"   value={event.place} />
                <Field icon="🏢" label="기관"   value={event.org} />
                <Field icon="💰" label="요금"   value={event.fee} />
                <Field icon="🗺️" label="자치구" value={event.district} />
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">🔗</span>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium">원문 링크</p>
                    {originalUrl ? <a href={originalUrl} target="_blank" rel="noreferrer" className="text-[#FF6B47] text-sm font-semibold mt-0.5 leading-tight underline">
                      바로가기 →
                    </a> : <span className="text-sm text-[#6B7280]">정보 없음</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* AI 소개문 */}
            {event.description && <div className="rounded-2xl overflow-hidden border border-[#FF6B47]/20 mb-4">
              <div className="bg-gradient-to-br from-[#FF6B47]/10 to-[#8B5CF6]/10 px-4 py-3 flex items-center gap-2 border-b border-[#FF6B47]/10">
                <span className="text-lg">✨</span>
                <span className="text-sm font-bold text-[#FF6B47]">{event.isMock ? '샘플 소개문' : 'AI 소개문'}</span>
              </div>
              <div className="bg-white px-4 py-4">
                <p className="text-[#1A1A2E] text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>}

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
                  {event.place && <a href={`https://map.kakao.com/link/search/${encodeURIComponent(event.place)}`} target="_blank" rel="noreferrer"
                    className="mt-1 bg-[#FFE500] text-[#1A1A2E] text-xs font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5"
                  >
                    카카오맵에서 보기 →
                  </a>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
