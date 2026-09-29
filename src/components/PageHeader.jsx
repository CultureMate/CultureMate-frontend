import { useEffect, useState } from 'react'
import Icon from './Icon'

function useHideOnScroll(enabled) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - last
      if (Math.abs(delta) < 8) return
      setHidden(delta > 0 && y > 160)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled])

  return enabled && hidden
}

export default function PageHeader({ title, description, eyebrow, actions, children, live = false, innerClassName = 'max-w-5xl', onBack, backLabel = '뒤로 가기', hideOnScroll = false }) {
  const hidden = useHideOnScroll(hideOnScroll)

  return (
    <header className={`sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-md transition-transform duration-300 md:px-8 md:pt-6 lg:px-10 ${hidden ? '-translate-y-full' : ''}`}>
      <div className={innerClassName}>
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1">
            {onBack && (
              <button type="button" onClick={onBack} aria-label={backLabel}
                className="-ml-2 flex h-10 w-10 flex-shrink-0 items-center justify-center self-start rounded-full text-ink transition-colors hover:bg-[#F2F4F6]">
                <Icon name="arrowLeft" size={22} strokeWidth={2.2} />
              </button>
            )}
            <div className="min-w-0">
              {eyebrow && <p className="mb-1 text-xs font-bold text-coral">{eyebrow}</p>}
              <h1 className="font-display text-2xl font-bold text-ink md:text-[28px] md:leading-tight">{title}</h1>
              {description && <p aria-live={live ? 'polite' : undefined} className="mt-1 text-sm text-ink-muted">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  )
}
