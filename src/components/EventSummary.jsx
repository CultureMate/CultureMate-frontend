import { useEffect, useState } from 'react'
import { getEventSummary, getEventSummaryError } from '../api/eventSummary'
import Icon from './Icon'

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
    <section aria-label="AI 소개문" className="mb-4 overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFF0EC] to-[#F3EEFF] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-coral shadow-sm">
          <Icon name="sparkle" size={16} filled />
        </span>
        <h2 className="text-sm font-bold text-ink">{state.data?.isMock ? '샘플 소개문' : 'AI 소개문'}</h2>
      </div>
      <div className="px-4 py-4 min-h-[76px] flex items-center">
        {state.loading && <div role="status" className="w-full space-y-2">
          <span className="sr-only">AI 소개문을 작성하고 있습니다.</span>
          <span aria-hidden="true" className="block h-3.5 w-full animate-pulse rounded bg-[#F2F4F6]" />
          <span aria-hidden="true" className="block h-3.5 w-11/12 animate-pulse rounded bg-[#F2F4F6]" />
          <span aria-hidden="true" className="block h-3.5 w-2/3 animate-pulse rounded bg-[#F2F4F6]" />
        </div>}
        {state.data && <p className="text-[15px] leading-7 text-ink-soft whitespace-pre-line">{state.data.summary}</p>}
        {state.error && <div role="alert" className="w-full">
          <p className="text-sm text-ink-muted">{getEventSummaryError(state.error)}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 rounded-lg bg-[#F2F4F6] px-3 py-1.5 text-sm font-bold text-ink">다시 시도</button>
        </div>}
      </div>
    </section>
  )
}
