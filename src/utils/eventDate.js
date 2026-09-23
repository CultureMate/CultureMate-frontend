function dateParts(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? { year, month, day, time: date.getTime() } : null
}

export function formatShortDate({ startDate, endDate }) {
  const start = dateParts(startDate)
  const end = dateParts(endDate)
  if (!start || (end && end.time < start.time)) return '일정 확인 필요'
  if (!end || start.time === end.time) return `${start.month}월 ${start.day}일`
  if (start.year !== end.year) return `${start.year}.${start.month}.${start.day}–${end.year}.${end.month}.${end.day}`
  if (start.month === end.month) return `${start.month}월 ${start.day}–${end.day}일`
  return `${start.month}월 ${start.day}일–${end.month}월 ${end.day}일`
}

export function ddayLabel(event, now = new Date()) {
  let days = event.dDay
  if (!Number.isInteger(days)) {
    const start = dateParts(event.startDate)
    if (!start) return '일정 미정'
    // 서울 행사이므로 접속 기기의 시간대 대신 한국 날짜를 기준으로 계산합니다.
    const korea = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = Date.UTC(korea.getUTCFullYear(), korea.getUTCMonth(), korea.getUTCDate())
    days = Math.round((start.time - today) / 86400000)
  }
  if (days === 0) return 'D-DAY'
  return days > 0 ? `D-${days}` : '시작됨'
}
