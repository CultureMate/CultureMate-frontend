import api from './axios'
import { getHotEvents, getUpcomingEvents } from './home'
import { getEventDetail } from './events'
import { getDataMode } from './dataMode'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn() } }))

beforeEach(() => {
  api.get.mockReset()
  process.env.REACT_APP_DATA_MODE = 'auto'
})

afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test.each([
  { code: 'ERR_NETWORK' }, { code: 'ECONNABORTED' },
  { response: { status: 500 } }, { response: { status: 404 } },
  { response: { status: 501 } }, { response: { status: 502 } },
])('uses demo data for unavailable servers: %j', async error => {
  api.get.mockRejectedValue(error)
  const result = await getHotEvents({ limit: 3 })
  expect(result.isMock).toBe(true)
  expect(result.events).toHaveLength(3)
  expect(result.events[0].viewCount).toBeGreaterThanOrEqual(result.events[1].viewCount)
  expect(result.events.every(event => event.eventId.startsWith('mock-'))).toBe(true)
})

test.each([401, 403, 400])('preserves HTTP %i instead of hiding it with demo data', async status => {
  const error = { response: { status } }
  api.get.mockRejectedValue(error)
  await expect(getHotEvents()).rejects.toBe(error)
})

test('preserves empty successful responses and malformed response errors', async () => {
  api.get.mockResolvedValueOnce({ data: { events: [] } }).mockResolvedValueOnce({ data: 'not JSON' })
  await expect(getHotEvents()).resolves.toEqual({ events: [], isMock: false })
  await expect(getHotEvents()).rejects.toThrow('응답 형식')
})

test('forced mock skips API requests and keeps upcoming dates in the future', async () => {
  process.env.REACT_APP_DATA_MODE = 'mock'
  const { events } = await getUpcomingEvents()
  expect(events).toHaveLength(6)
  expect(events[0].dDay).toBe(0)
  expect(events.every(event => event.dDay >= 0)).toBe(true)
  expect(events[0].startDate <= events[1].startDate).toBe(true)
  const result = await getEventDetail(events[0].eventId)
  expect(result.event.startDate).toBe(events[0].startDate)
  expect(result.isMock).toBe(true)
  expect(api.get).not.toHaveBeenCalled()
})

test('API mode and cancellation never fall back', async () => {
  process.env.REACT_APP_DATA_MODE = 'api'
  const error = { code: 'ERR_NETWORK' }
  api.get.mockRejectedValue(error)
  await expect(getHotEvents()).rejects.toBe(error)
  process.env.REACT_APP_DATA_MODE = 'auto'
  const controller = new AbortController()
  controller.abort()
  await expect(getHotEvents({ signal: controller.signal })).rejects.toBe(error)
  const canceled = { code: 'ERR_CANCELED' }
  api.get.mockRejectedValue(canceled)
  await expect(getHotEvents()).rejects.toBe(canceled)
})

test('unknown demo IDs and offline real IDs do not display an unrelated sample', async () => {
  await expect(getEventDetail('mock-unknown')).rejects.toMatchObject({ response: { status: 404 } })
  expect(api.get).not.toHaveBeenCalled()
  const error = { code: 'ERR_NETWORK' }
  api.get.mockRejectedValue(error)
  await expect(getEventDetail('real-event')).rejects.toBe(error)
})

test('production defaults to API mode', () => {
  const previous = process.env.NODE_ENV
  try {
    delete process.env.REACT_APP_DATA_MODE
    process.env.NODE_ENV = 'production'
    expect(getDataMode()).toBe('api')
  } finally {
    process.env.NODE_ENV = previous
  }
})
