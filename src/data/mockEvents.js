import { EVENTS } from './events'

// 시연할 때마다 다가오는 일정을 볼 수 있도록 한국의 오늘 날짜를 기준으로 만듭니다.
export function getMockEvents(now = new Date()) {
  const today = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const dateAfter = days => new Date(Date.parse(today) + days * 86400000).toISOString().slice(0, 10)
  return EVENTS.map((event, index) => ({
    ...event,
    eventId: `mock-${event.id}`,
    imageUrl: event.img,
    organization: event.org,
    startDate: dateAfter(index * 2),
    endDate: dateAfter(index * 2 + 2),
    dDay: index * 2,
    viewCount: (event.hot ? 3000 : 1000) - index * 73,
  }))
}
