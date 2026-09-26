import api from './axios'
import { getDataMode } from './dataMode'
import { getMockEvents } from '../data/mockEvents'

function getMockSummary(eventId) {
  const event = getMockEvents().find(item => item.eventId === eventId)
  if (!event?.description?.trim()) {
    const error = new Error('샘플 소개문을 찾을 수 없습니다.')
    error.response = { status: 404 }
    throw error
  }
  return { eventId, summary: event.description.trim(), createdAt: null, isMock: true }
}

export async function getEventSummary(eventId, signal) {
  const mode = getDataMode()
  if (mode === 'mock' || (mode === 'auto' && eventId.startsWith('mock-'))) {
    return getMockSummary(eventId)
  }

  // eventId가 URL일 수 있으므로 path 대신 query parameter로 전달합니다.
  const { data } = await api.post('/events/summary', null, {
    params: { eventId },
    signal,
    timeout: 35000,
  })
  if (!data || String(data.eventId) !== String(eventId) || typeof data.summary !== 'string' || !data.summary.trim()) {
    throw new Error('AI 소개문 응답 형식을 확인해 주세요.')
  }
  return { ...data, summary: data.summary.trim(), isMock: false }
}

export function getEventSummaryError(error) {
  const status = error.response?.status
  if (status === 501) return 'AI 소개문 기능을 준비 중입니다. 행사 기본 정보는 정상적으로 확인할 수 있습니다.'
  if (status === 503) return 'AI 소개문을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  if (status === 404) return '이 행사의 AI 소개문을 만들 수 없습니다.'
  if (status === 400) return '행사 정보를 확인한 뒤 다시 시도해 주세요.'
  if (error.code === 'ECONNABORTED') return 'AI 소개문 작성이 지연되고 있습니다. 다시 시도해 주세요.'
  return 'AI 소개문을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
