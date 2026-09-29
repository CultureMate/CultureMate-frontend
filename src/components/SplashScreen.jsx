import { useEffect, useState } from 'react'
import BrandMark from './BrandMark'

const SPLASH_EVENT = 'culturemate:splash'
const SEEN_KEY = 'culturemate:splash-seen'

export function showSplash(message = '') {
  window.dispatchEvent(new CustomEvent(SPLASH_EVENT, { detail: { message } }))
}

function firstLaunchSplash() {
  try {
    if (window.sessionStorage.getItem(SEEN_KEY)) return null
    window.sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    return null
  }
  return { message: '', key: 0 }
}

export default function SplashScreen() {
  const [splash, setSplash] = useState(firstLaunchSplash)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const show = event => {
      setLeaving(false)
      setSplash({ message: event.detail?.message ?? '', key: Date.now() })
    }
    window.addEventListener(SPLASH_EVENT, show)
    return () => window.removeEventListener(SPLASH_EVENT, show)
  }, [])

  useEffect(() => {
    if (!splash) return undefined
    const hold = splash.message ? 1500 : 1000
    const leaveTimer = setTimeout(() => setLeaving(true), hold)
    const doneTimer = setTimeout(() => setSplash(null), hold + 550)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(doneTimer)
    }
  }, [splash])

  if (!splash) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_50%_38%,#FFF1EB_0%,#FFFFFF_62%)] transition-[opacity,filter] duration-500 ease-out ${
        leaving ? 'pointer-events-none opacity-0 blur-md' : 'opacity-100'
      }`}
    >
      <div key={splash.key} className={`flex flex-col items-center px-8 text-center transition-transform duration-500 ${leaving ? 'scale-105' : ''}`}>
        <BrandMark size={88} className="animate-splash-mark drop-shadow-[0_14px_28px_rgba(240,68,46,0.28)]" />
        <p className="animate-splash-text mt-6 text-[30px] font-extrabold tracking-[-0.04em] text-ink">
          Culture<span className="text-coral">Mate</span>
        </p>
        <p className="animate-splash-text mt-2 text-[15px] font-medium text-ink-muted [animation-delay:120ms]">
          {splash.message || '서울 문화생활, 코스로 즐겨요'}
        </p>
      </div>
    </div>
  )
}
