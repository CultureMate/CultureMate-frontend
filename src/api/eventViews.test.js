import api from './axios'
import { increaseEventView } from './eventViews'

jest.mock('./axios', () => ({ __esModule: true, default: { post: jest.fn() } }))

beforeEach(() => { api.post.mockReset() })

test('increments URL-shaped event IDs through the query endpoint', async () => {
  const eventId = 'https://culture.seoul.go.kr/event?id=12&name=서울'
  const controller = new AbortController()
  api.post.mockResolvedValue({ data: { eventId, viewCount: 1235 } })
  await expect(increaseEventView(eventId, controller.signal)).resolves.toBe(1235)
  expect(api.post).toHaveBeenCalledWith('/events/views', null, { params: { eventId }, signal: controller.signal })
})

test('invalid and mismatched responses are rejected', async () => {
  for (const data of [null, {}, { eventId: 'other', viewCount: 1 }, { eventId: 'a', viewCount: -1 }, { eventId: 'a', viewCount: 1.5 }]) {
    api.post.mockResolvedValueOnce({ data })
    await expect(increaseEventView('a')).rejects.toThrow('응답 형식')
  }
})

test('API errors and cancellation are passed to the screen', async () => {
  const error = { response: { status: 404 } }
  api.post.mockRejectedValue(error)
  await expect(increaseEventView('missing')).rejects.toBe(error)
})
