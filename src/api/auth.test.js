import api from './axios'
import { getCurrentMember, getKakaoLoginUrl } from './auth'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn() } }))

beforeEach(() => { api.get.mockReset() })

test('builds the Kakao login URL from the configured auth API base URL', () => {
  process.env.REACT_APP_AUTH_BASE_URL = 'https://api.example.com/api/'
  expect(getKakaoLoginUrl()).toBe('https://api.example.com/api/auth/kakao/start')
  delete process.env.REACT_APP_AUTH_BASE_URL
})

test('returns the current member using the session cookie request', async () => {
  const member = { memberId: 7, nickname: '문화인', residence: '마포구' }
  api.get.mockResolvedValue({ data: member })
  const controller = new AbortController()
  await expect(getCurrentMember(controller.signal)).resolves.toEqual(member)
  expect(api.get).toHaveBeenCalledWith('/auth/me', { signal: controller.signal })
})

test('401 means guest while other and malformed responses remain errors', async () => {
  api.get.mockRejectedValueOnce({ response: { status: 401 } })
  await expect(getCurrentMember()).resolves.toBeNull()
  const unavailable = { response: { status: 503 } }
  api.get.mockRejectedValueOnce(unavailable)
  await expect(getCurrentMember()).rejects.toBe(unavailable)
  api.get.mockResolvedValueOnce({ data: { memberId: '7' } })
  await expect(getCurrentMember()).rejects.toThrow('응답 형식')
})
