import { useEffect, useState } from 'react'
import { increaseEventView } from '../api/eventViews'

function safeCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0
}

export default function EventViewCount({ eventId, initialCount, isMock }) {
  const [state, setState] = useState({ count: safeCount(initialCount), loading: !isMock, error: null })

  useEffect(() => {
    const count = safeCount(initialCount)
    if (isMock) {
      setState({ count, loading: false, error: null })
      return undefined
    }

    const controller = new AbortController()
    setState({ count, loading: true, error: null })
    const increase = async () => {
      try {
        const viewCount = await increaseEventView(eventId, controller.signal)
        if (!controller.signal.aborted) setState({ count: viewCount, loading: false, error: null })
      } catch (error) {
        if (!controller.signal.aborted) setState({ count, loading: false, error })
      }
    }
    // 개발 StrictMode의 점검용 effect에서는 POST가 실행되지 않도록 한 틱 미룹니다.
    const startTimer = setTimeout(increase, 0)
    return () => {
      clearTimeout(startTimer)
      controller.abort()
    }
  }, [eventId, initialCount, isMock])

  return <div className="absolute top-12 right-5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
    <span aria-hidden="true" className="text-white/70 text-xs">👁</span>
    <span aria-label={`조회수 ${state.count.toLocaleString('ko-KR')}`} className="text-white text-xs font-semibold">{state.count.toLocaleString('ko-KR')}</span>
    {state.loading && <span className="sr-only" role="status">조회수를 반영하고 있습니다.</span>}
    {state.error && <span role="status" title="조회수를 반영하지 못했습니다."
      className="text-[#FFD23F] text-xs" aria-label="조회수 반영 실패">!</span>}
  </div>
}
