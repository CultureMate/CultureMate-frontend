import api from './axios'
import { getEventSummary, getEventSummaryError } from './eventSummary'

jest.mock('./axios', () => ({ __esModule: true, default: { post: jest.fn() } }))

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  api.post.mockReset()
})
afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('URL-shaped event IDs use the query API exactly once', async () => {
  const eventId = 'https://culture.seoul.go.kr/event?id=12&name=서울'
  api.post.mockResolvedValue({ data: { eventId, summary: '  두 문장 소개문입니다.  ', createdAt: '2026-09-25T10:00:00' } })
  const controller = new AbortController()
  await expect(getEventSummary(eventId, controller.signal)).resolves.toMatchObject({ summary: '두 문장 소개문입니다.', isMock: false })
  expect(api.post).toHaveBeenCalledWith('/events/summary', null, { params: { eventId }, signal: controller.signal })
})

test('malformed and mismatched responses are rejected', async () => {
  for (const data of [null, {}, { eventId: 'other', summary: '소개' }, { eventId: 'a', summary: '   ' }]) {
    api.post.mockResolvedValueOnce({ data })
    await expect(getEventSummary('a')).rejects.toThrow('응답 형식')
  }
})

test('mock IDs use their sample description without an API request', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  const result = await getEventSummary('mock-1')
  expect(result.isMock).toBe(true)
  expect(result.summary).toBeTruthy()
  expect(api.post).not.toHaveBeenCalled()
})

test('real API failures never become unrelated sample summaries', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  const error = { response: { status: 503 } }
  api.post.mockRejectedValue(error)
  await expect(getEventSummary('real-event')).rejects.toBe(error)
})

test('summary errors provide specific user messages', () => {
  expect(getEventSummaryError({ response: { status: 501 } })).toContain('준비 중')
  expect(getEventSummaryError({ response: { status: 503 } })).toContain('생성하지 못했습니다')
  expect(getEventSummaryError({ response: { status: 404 } })).toContain('만들 수 없습니다')
  expect(getEventSummaryError({ response: { status: 400 } })).toContain('행사 정보')
  expect(getEventSummaryError({ code: 'ECONNABORTED' })).toContain('지연')
  expect(getEventSummaryError({})).toContain('불러오지 못했습니다')
})
