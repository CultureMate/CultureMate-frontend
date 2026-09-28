import { EVENTS } from './events'

// 시연할 때 지난 행사 필터도 확인할 수 있도록 종료된 일정과 다가오는 일정을 함께 만듭니다.
export function getMockEvents(now = new Date(Date.now())) {
  const today = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const dateAfter = days => new Date(Date.parse(today) + days * 86400000).toISOString().slice(0, 10)
  return EVENTS.map((event, index) => ({
    ...event,
    eventId: `mock-${event.id}`,
    imageUrl: event.img,
    organization: event.org,
    startDate: dateAfter(index * 2 - 6),
    endDate: dateAfter(index * 2 - 4),
    dDay: index * 2 - 6,
    viewCount: (event.hot ? 3000 : 1000) - index * 73,
  }))
}
