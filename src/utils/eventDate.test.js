import { ddayLabel, formatShortDate } from './eventDate'

test('uses the API D-Day, including zero, and computes a Korea-date fallback', () => {
  expect(ddayLabel({ dDay: 0 })).toBe('D-DAY')
  expect(ddayLabel({ dDay: 7 })).toBe('D-7')
  expect(ddayLabel({ dDay: -1 })).toBe('시작됨')
  expect(ddayLabel({ startDate: '2026-09-24' }, new Date('2026-09-23T15:30:00Z'))).toBe('D-DAY')
  expect(ddayLabel({ startDate: '' })).toBe('일정 미정')
})

test('formats valid ranges and handles missing or invalid dates', () => {
  expect(formatShortDate({ startDate: '2026-09-24', endDate: '2026-09-26' })).toBe('9월 24–26일')
  expect(formatShortDate({ startDate: '2026-12-31', endDate: '2027-01-01' })).toBe('2026.12.31–2027.1.1')
  expect(formatShortDate({ startDate: '2026-02-30' })).toBe('일정 확인 필요')
  expect(formatShortDate({})).toBe('일정 확인 필요')
  expect(formatShortDate({ startDate: '2026-09-24', endDate: '2026-09-23' })).toBe('일정 확인 필요')
})
