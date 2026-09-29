import { useId } from 'react'

export default function BrandMark({ size = 36, className = '' }) {
  const gradientId = `culturemate-mark-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 64 64" className={`flex-shrink-0 ${className}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF7A4D" />
          <stop offset="1" stopColor="#F0442E" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
      <path d="M41 20.5A14 14 0 1 0 41 43.5" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <circle cx="41" cy="20.5" r="5.2" fill="#fff" />
      <circle cx="41" cy="20.5" r="2.2" fill="#F0442E" />
      <path d="M47.5 24.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z" fill="#FFE066" />
    </svg>
  )
}

export function BrandWordmark({ className = '', light = false }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`text-[17px] font-extrabold tracking-[-0.04em] ${light ? 'text-white' : 'text-ink'}`}>Culture<span className={light ? 'text-[#FFE066]' : 'text-coral'}>Mate</span></span>
      <span className={`mt-1 text-[11px] font-medium ${light ? 'text-white/60' : 'text-ink-muted'}`}>서울 문화생활 코스</span>
    </span>
  )
}
