import { useEffect, useState } from 'react'
import { getEventSummary, getEventSummaryError } from '../api/eventSummary'

export default function EventSummary({ event }) {
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()
    const loadSummary = async () => {
      setState({ loading: true, data: null, error: null })
      try {
        const data = await getEventSummary(event.eventId, controller.signal)
        if (!controller.signal.aborted) setState({ loading: false, data, error: null })
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, data: null, error })
      }
    }
    // 개발 StrictMode의 setup → cleanup → setup 점검에서 POST가 두 번 나가지 않게
    // 실제 요청은 다음 이벤트 루프에서 시작합니다.
    const startTimer = setTimeout(loadSummary, 0)
    return () => {
      clearTimeout(startTimer)
      controller.abort()
    }
  }, [event.eventId, retry])

  return (
    <section aria-label="AI 소개문" className="rounded-2xl overflow-hidden border border-[#FF6B47]/20 mb-4 bg-white">
      <div className="bg-gradient-to-br from-[#FF6B47]/10 to-[#8B5CF6]/10 px-4 py-3 flex items-center gap-2 border-b border-[#FF6B47]/10">
        <span aria-hidden="true" className="text-lg">✨</span>
        <h2 className="text-sm font-bold text-[#FF6B47]">{state.data?.isMock ? '샘플 소개문' : 'AI 소개문'}</h2>
      </div>
      <div className="px-4 py-4 min-h-[76px] flex items-center">
        {state.loading && <p role="status" className="text-sm text-[#6B7280]">AI 소개문을 작성하고 있습니다.</p>}
        {state.data && <p className="text-[#1A1A2E] text-sm leading-relaxed whitespace-pre-line">{state.data.summary}</p>}
        {state.error && <div role="alert" className="w-full">
          <p className="text-sm text-[#6B7280]">{getEventSummaryError(state.error)}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 text-sm font-semibold text-[#FF6B47]">다시 시도</button>
        </div>}
      </div>
    </section>
  )
}
