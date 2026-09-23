import api from './axios'
import { canUseMock, getDataMode } from './dataMode'
import { getMockEvents } from '../data/mockEvents'

// FR-07: 쿠키로 회원 거주지를 판단하므로 기본 요청에는 district를 보내지 않습니다.
async function loadEvents(path, params, signal) {
  const loadMock = () => {
    const events = getMockEvents().sort(path.includes('hot-events')
      ? (a, b) => b.viewCount - a.viewCount
      : (a, b) => a.startDate.localeCompare(b.startDate))
    return { events: events.slice(0, params.limit), isMock: true }
  }
  if (getDataMode() === 'mock') return loadMock()
  let data
  try {
    const response = await api.get(path, { params, signal })
    data = response.data
  } catch (error) {
    if (!signal?.aborted && canUseMock(error)) return loadMock()
    throw error
  }
  if (!Array.isArray(data?.events) || data.events.some(event =>
    !event || !['string', 'number'].includes(typeof event.eventId) || String(event.eventId).trim() === ''
  )) {
    throw new Error('행사 응답 형식을 확인해 주세요.')
  }
  return { events: data.events, isMock: false }
}

export function getHotEvents({ limit = 6, signal } = {}) {
  return loadEvents('/main/hot-events', { limit }, signal)
}

export function getUpcomingEvents({ limit = 6, signal } = {}) {
  return loadEvents('/main/upcoming-events', { limit }, signal)
}

export function getHomeError(error) {
  if (error.response?.status === 401) return '로그인이 필요하거나 로그인 시간이 만료되었습니다.'
  if (error.response?.status === 404 || error.response?.status === 501) return '행사 조회 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요.'
  if (error.code === 'ECONNABORTED') return '응답이 늦어지고 있습니다. 다시 시도해 주세요.'
  return '행사를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
