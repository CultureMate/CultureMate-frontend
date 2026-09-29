import { useId } from 'react'

export default function BrandMark({ size = 36, className = '' }) {
  const gradientId = `culturemate-mark-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 64 64" className={`flex-shrink-0 ${className}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A5B" />
          <stop offset="1" stopColor="#FF5A3C" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
      <path d="M32 13c-7.9 0-14.3 6.2-14.3 14 0 9.8 11.8 21 13.2 22.3a1.6 1.6 0 0 0 2.2 0C34.5 48 46.3 36.8 46.3 27 46.3 19.2 39.9 13 32 13z" fill="#fff" />
      <path d="m32 20.6 2 4.2 4.6.6-3.4 3.1 1 4.5L32 30.7l-4.2 2.3 1-4.5-3.4-3.1 4.6-.6z" fill="#FF6B47" />
    </svg>
  )
}

export function BrandWordmark({ className = '', light = false }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`text-[17px] font-extrabold tracking-[-0.04em] ${light ? 'text-white' : 'text-ink'}`}>CultureMate</span>
      <span className={`mt-1 text-[11px] font-medium ${light ? 'text-white/60' : 'text-ink-muted'}`}>서울 문화생활 코스</span>
    </span>
  )
}
