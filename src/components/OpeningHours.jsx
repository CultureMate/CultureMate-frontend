import { useId, useState } from 'react'

function getTodayHours(spot) {
  if (spot?.todayHours) return spot.todayHours
  if (!Array.isArray(spot?.openingHours) || !spot.openingHours.length) return ''
  const day = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][new Date().getDay()]
  return spot.openingHours.find(value => String(value).startsWith(day)) || spot.openingHours[0]
}

export default function OpeningHours({ spot, className = 'mt-2' }) {
  const tooltipId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const todayHours = getTodayHours(spot)
  const openingHours = Array.isArray(spot?.openingHours) ? spot.openingHours : []
  const canShowAll = openingHours.length > 0
  const showAll = canShowAll && (hovered || focused)

  if (!todayHours) return null

  return (
    <div className={`relative max-w-full ${className}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button type="button" disabled={!canShowAll}
        aria-describedby={showAll ? tooltipId : undefined}
        aria-expanded={canShowAll ? showAll : undefined}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`block max-w-full truncate text-left text-xs text-[#6B7280] disabled:cursor-default ${canShowAll ? 'cursor-help decoration-dotted underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A70]' : ''}`}>
        🕒 {todayHours}
      </button>
      {showAll && <div id={tooltipId} role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-xl bg-[#1A1A2E] p-3 text-left text-xs leading-5 text-white shadow-xl">
        <p className="mb-1 font-bold text-[#FF8A70]">전체 영업시간</p>
        {openingHours.map((hours, index) => <p key={`${hours}-${index}`}>{hours}</p>)}
      </div>}
    </div>
  )
}
