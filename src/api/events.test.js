import api from './axios'
import { filterMockEvents, getEvents } from './events'
import { createEventParams, EVENT_PAGE_SIZE, readEventFilters } from '../utils/eventFilters'
import { getMockEvents } from '../data/mockEvents'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn() } }))
const empty = () => readEventFilters()

beforeEach(() => { api.get.mockReset(); process.env.REACT_APP_DATA_MODE = 'api' })
afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('serializes repeated filters without brackets or double encoding', async () => {
  api.get.mockResolvedValue({ data: { count: 0, totalCount: 0, events: [] } })
  const filters = { ...empty(), district: ['마포구', '강남구'], category: ['전시', '교육/체험'], from: '2026-10-10', to: '2026-10-11', keyword: '  서울 사진  ' }
  await getEvents(filters)
  const [path, config] = api.get.mock.calls[0]
  expect(path).toBe('/events')
  expect(config.params.getAll('district')).toEqual(['마포구', '강남구'])
  expect(config.params.getAll('category')).toEqual(['전시', '교육/체험'])
  expect(config.params.get('from')).toBe(filters.from)
  expect(config.params.get('to')).toBe(filters.to)
  expect(config.params.has('date')).toBe(false)
  expect(config.params.get('keyword')).toBe('서울 사진')
  expect(config.params.toString()).not.toContain('%5B')
  expect(config.params.get('size')).toBe(String(EVENT_PAGE_SIZE))
})

test('URL parsing removes duplicate and empty values and invalid dates/pages', () => {
  const filters = readEventFilters('district=마포구&district=마포구&district=&date=2026-02-30&date=2026-10-10&page=-2&keyword=++')
  expect(filters).toEqual({ district: ['마포구'], category: [], from: '2026-10-10', to: '2026-10-10', keyword: '', page: 0 })
  expect(createEventParams(filters).has('keyword')).toBe(false)
  expect(readEventFilters('from=2026-10-12&to=2026-10-10')).toMatchObject({ from: '2026-10-10', to: '2026-10-12' })
  expect(readEventFilters('from=2026-10-10')).toMatchObject({ from: '2026-10-10', to: '2026-10-10' })
  expect(readEventFilters('from=2026-02-30&to=invalid')).toMatchObject({ from: '', to: '' })
})

const fixtures = [
  { eventId: 'a', title: '사진 전시', place: '서울 전시장', district: '마포구', category: '전시/미술', startDate: '2026-10-10', endDate: '2026-10-12' },
  { eventId: 'b', title: '가을 공연', place: '서울 공연장', district: '강남구', category: '공연', startDate: '2026-10-11', endDate: '2026-10-11' },
  { eventId: 'c', title: '사진 강의', district: '종로구', category: '교육/체험', startDate: '2026-10-09', endDate: '2026-10-13' },
  { eventId: 'd', title: '일정 없음', district: '마포구', category: '전시', startDate: '', endDate: '' },
]

test('mock matches OR within filters, AND between filters, and sorts by start date', () => {
  const result = filterMockEvents(fixtures, { ...empty(), district: ['마포구', '강남구'], category: ['전시', '공연'], from: '2026-10-10', to: '2026-10-11', keyword: '서울' })
  expect(result.map(event => event.eventId)).toEqual(['a', 'b'])
  expect(filterMockEvents(fixtures, { ...empty(), keyword: '사진' }).map(event => event.eventId)).toEqual(['c', 'a'])
})

test.each([['2026-10-09', 0], ['2026-10-10', 1], ['2026-10-12', 1], ['2026-10-13', 0]])('date %s respects inclusive event boundaries', (date, count) => {
  expect(filterMockEvents([fixtures[0]], { ...empty(), from: date, to: date })).toHaveLength(count)
})

test('range includes events in the middle and overlapping either boundary', () => {
  const matching = range => filterMockEvents(fixtures, { ...empty(), ...range }).map(event => event.eventId)
  expect(matching({ from: '2026-10-08', to: '2026-10-14' })).toEqual(['c', 'a', 'b'])
  expect(matching({ from: '2026-10-08', to: '2026-10-10' })).toEqual(['c', 'a'])
  expect(matching({ from: '2026-10-12', to: '2026-10-14' })).toEqual(['c', 'a'])
  expect(matching({ from: '2026-10-14', to: '2026-10-15' })).toEqual([])
})

test('mock pagination uses totalCount before slicing and filters before paging', async () => {
  process.env.REACT_APP_DATA_MODE = 'mock'
  const first = await getEvents(empty())
  const second = await getEvents({ ...empty(), page: 1 })
  expect(first.totalCount).toBe(getMockEvents().length)
  expect(first.count).toBe(EVENT_PAGE_SIZE)
  expect(first.events.some(event => second.events.some(other => other.eventId === event.eventId))).toBe(false)
  const filtered = await getEvents({ ...empty(), district: ['강남구'] })
  expect(filtered.totalCount).toBe(1)
  expect(filtered.events[0].district).toBe('강남구')
  expect(api.get).not.toHaveBeenCalled()
})

test('auto fallback preserves selected filters and API mode reports failure', async () => {
  const error = { response: { status: 502 } }
  api.get.mockRejectedValue(error)
  await expect(getEvents(empty())).rejects.toBe(error)
  process.env.REACT_APP_DATA_MODE = 'auto'
  const result = await getEvents({ ...empty(), district: ['마포구'] })
  expect(result.isMock).toBe(true)
  expect(result.events.every(event => event.district === '마포구')).toBe(true)
})

test('auth errors, cancellation and malformed responses never become samples', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  const unauthorized = { response: { status: 401 } }
  api.get.mockRejectedValueOnce(unauthorized)
  await expect(getEvents(empty())).rejects.toBe(unauthorized)
  const controller = new AbortController()
  controller.abort()
  const error = { code: 'ERR_NETWORK' }
  api.get.mockRejectedValueOnce(error)
  await expect(getEvents(empty(), controller.signal)).rejects.toBe(error)
  api.get.mockResolvedValueOnce({ data: { events: [], count: 0 } })
  await expect(getEvents(empty())).rejects.toThrow('응답 형식')
})
