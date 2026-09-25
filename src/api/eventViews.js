import api from './axios'

export async function increaseEventView(eventId, signal) {
  // eventId가 URL일 수 있으므로 path 대신 query parameter로 전달합니다.
  const { data } = await api.post('/events/views', null, { params: { eventId }, signal })
  if (!data || String(data.eventId) !== String(eventId)
    || !Number.isInteger(data.viewCount) || data.viewCount < 0) {
    throw new Error('조회수 응답 형식을 확인해 주세요.')
  }
  return data.viewCount
}
