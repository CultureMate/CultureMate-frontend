export default function PageHeader({ title, description, eyebrow, actions, children, live = false, innerClassName = 'max-w-5xl' }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-md md:px-8 md:pt-6 lg:px-10">
      <div className={innerClassName}>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-xs font-bold text-coral">{eyebrow}</p>}
            <h1 className="font-display text-2xl font-bold text-ink md:text-[28px] md:leading-tight">{title}</h1>
            {description && <p aria-live={live ? 'polite' : undefined} className="mt-1 text-sm text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  )
}
