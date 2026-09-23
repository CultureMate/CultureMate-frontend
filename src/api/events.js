import api from './axios'
import { getDataMode } from './dataMode'
import { getMockEvents } from '../data/mockEvents'

export async function getEventDetail(eventId, signal) {
  const mode = getDataMode()
  if (mode === 'mock' || (mode === 'auto' && eventId.startsWith('mock-'))) {
    const event = getMockEvents().find(item => item.eventId === eventId)
    if (!event) {
      const error = new Error('샘플 행사를 찾을 수 없습니다.')
      error.response = { status: 404 }
      throw error
    }
    return { event, isMock: true }
  }
  const { data } = await api.get('/events/detail', { params: { eventId }, signal })
  if (!data?.eventId) throw new Error('행사 응답을 확인해 주세요.')
  return { event: data, isMock: false }
}
