import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map()

function restoreScroll(target) {
  let cancelled = false
  let frame = 0
  const started = Date.now()
  const cancel = () => {
    cancelled = true
    cancelAnimationFrame(frame)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('wheel', cancel)
  }
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('wheel', cancel, { passive: true })

  // 돌아온 화면은 데이터를 다시 불러오므로 문서가 충분히 길어질 때까지 잠시 재시도한다.
  const attempt = () => {
    if (cancelled) return
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
    window.scrollTo(0, Math.min(target, max))
    if (max >= target || Date.now() - started > 6000) {
      cancel()
      return
    }
    frame = requestAnimationFrame(attempt)
  }
  attempt()
  return cancel
}

export default function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef(location)
  const currentKey = useRef(location.key)
  const cancelRestore = useRef(null)

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    const save = () => positions.set(currentKey.current, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  useLayoutEffect(() => {
    const prev = previous.current
    previous.current = location
    currentKey.current = location.key
    if (prev.key === location.key) return

    cancelRestore.current?.()
    cancelRestore.current = null

    if (navigationType === 'POP') {
      const target = positions.get(location.key)
      if (target) cancelRestore.current = restoreScroll(target)
      else window.scrollTo(0, 0)
      return
    }
    if (navigationType === 'REPLACE' && prev.pathname === location.pathname) return
    window.scrollTo(0, 0)
  }, [location, navigationType])

  return null
}
