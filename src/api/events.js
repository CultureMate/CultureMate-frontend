import api from './axios'
import { canUseMock, getDataMode } from './dataMode'
import { getMockEvents } from '../data/mockEvents'
import { createEventParams, EVENT_PAGE_SIZE, isEventDate } from '../utils/eventFilters'

export function filterMockEvents(events, filters) {
  const normalize = value => (value || '').trim().toLowerCase()
  return events.filter(event => {
    const districtMatches = !filters.district.length || filters.district.some(value => normalize(value) === normalize(event.district))
    const categoryMatches = !filters.category.length || filters.category.some(value => normalize(event.category).includes(normalize(value)))
    const validPeriod = isEventDate(event.startDate) && isEventDate(event.endDate) && event.startDate <= event.endDate
    const dateMatches = (!filters.from && !filters.to) || (validPeriod
      && (!filters.from || event.endDate >= filters.from)
      && (!filters.to || event.startDate <= filters.to))
    const keyword = normalize(filters.keyword)
    const keywordMatches = !keyword || normalize(event.title).includes(keyword) || normalize(event.place).includes(keyword)
    return districtMatches && categoryMatches && dateMatches && keywordMatches
  }).sort((a, b) => (a.startDate || '9999').localeCompare(b.startDate || '9999') || (a.title || '').localeCompare(b.title || ''))
}

export async function getEvents(filters, signal) {
  const loadMock = () => {
    const allEvents = filterMockEvents(getMockEvents(), filters)
    const events = allEvents.slice(filters.page * EVENT_PAGE_SIZE, (filters.page + 1) * EVENT_PAGE_SIZE)
    return { events, count: events.length, totalCount: allEvents.length, page: filters.page, size: EVENT_PAGE_SIZE, isMock: true }
  }
  if (getDataMode() === 'mock') return loadMock()
  let data
  try {
    const response = await api.get('/events', { params: createEventParams(filters), signal })
    data = response.data
  } catch (error) {
    if (!signal?.aborted && canUseMock(error)) return loadMock()
    throw error
  }
  if (!Array.isArray(data?.events) || !Number.isInteger(data.totalCount) || data.totalCount < 0
    || data.count !== data.events.length || data.totalCount < data.count
    || data.events.some(event => !event || !['string', 'number'].includes(typeof event.eventId) || !String(event.eventId).trim())) {
    throw new Error('행사 목록 응답 형식을 확인해 주세요.')
  }
  return { ...data, isMock: false }
}

export function getEventsError(error) {
  if (error.response?.status === 401) return '로그인이 필요하거나 로그인 시간이 만료되었습니다.'
  if (error.response?.status === 400) return '검색 조건을 확인하고 다시 시도해 주세요.'
  if (error.code === 'ECONNABORTED') return '응답이 늦어지고 있습니다. 다시 시도해 주세요.'
  return '행사 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

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
