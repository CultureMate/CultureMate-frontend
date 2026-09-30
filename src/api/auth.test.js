import api from './axios'
import {
  getCurrentMember,
  getKakaoLoginUrl,
  resetCurrentMemberCache,
  setCurrentMemberCache,
} from './auth'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn() } }))

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  api.get.mockReset()
  resetCurrentMemberCache()
})

afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('mock mode returns a complete demo member without the backend', async () => {
  process.env.REACT_APP_DATA_MODE = 'mock'
  await expect(getCurrentMember()).resolves.toEqual(expect.objectContaining({
    memberId: 1,
    nickname: '문화메이트',
    residence: '서울시',
  }))
  expect(api.get).not.toHaveBeenCalled()
  expect(getKakaoLoginUrl()).toBe('#/')
})

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
  expect(api.get).toHaveBeenCalledWith('/auth/me')
})

test('204 without a body means guest and is reused without another request', async () => {
  api.get.mockResolvedValue({ status: 204, data: '' })
  await expect(getCurrentMember()).resolves.toBeNull()
  await expect(getCurrentMember()).resolves.toBeNull()
  expect(api.get).toHaveBeenCalledTimes(1)
})

test('an empty 200 response is a malformed response, not a guest', async () => {
  api.get.mockResolvedValue({ status: 200, data: '' })
  await expect(getCurrentMember()).rejects.toThrow('응답 형식')
})

test('401 means guest while other and malformed responses remain errors', async () => {
  api.get.mockRejectedValueOnce({ response: { status: 401 } })
  await expect(getCurrentMember()).resolves.toBeNull()
  resetCurrentMemberCache()
  const unavailable = { response: { status: 503 } }
  api.get.mockRejectedValueOnce(unavailable)
  await expect(getCurrentMember()).rejects.toBe(unavailable)
  api.get.mockResolvedValueOnce({ data: { memberId: '7' } })
  await expect(getCurrentMember()).rejects.toThrow('응답 형식')
})

test('deduplicates concurrent requests and reuses the member result', async () => {
  const member = { memberId: 7, nickname: '문화인', residence: '마포구' }
  let resolveRequest
  api.get.mockReturnValue(new Promise(resolve => { resolveRequest = resolve }))

  const first = getCurrentMember()
  const second = getCurrentMember()
  expect(api.get).toHaveBeenCalledTimes(1)

  resolveRequest({ data: member })
  await expect(first).resolves.toEqual(member)
  await expect(second).resolves.toEqual(member)
  await expect(getCurrentMember()).resolves.toEqual(member)
  expect(api.get).toHaveBeenCalledTimes(1)
})

test('caches the guest result and supports explicit cache updates', async () => {
  api.get.mockRejectedValue({ response: { status: 401 } })
  await expect(getCurrentMember()).resolves.toBeNull()
  await expect(getCurrentMember()).resolves.toBeNull()
  expect(api.get).toHaveBeenCalledTimes(1)

  const member = { memberId: 9, nickname: '새 회원' }
  setCurrentMemberCache(member)
  await expect(getCurrentMember()).resolves.toEqual(member)
  expect(api.get).toHaveBeenCalledTimes(1)
})
