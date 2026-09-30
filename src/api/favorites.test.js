import api from './axios'
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from './favorites'

jest.mock('./axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  localStorage.clear()
  api.get.mockReset()
  api.post.mockReset()
  api.delete.mockReset()
})

afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('mock mode stores favorites locally without the backend', async () => {
  process.env.REACT_APP_DATA_MODE = 'mock'
  await addFavorite('mock-1')
  await expect(getFavorites()).resolves.toEqual([
    expect.objectContaining({ eventId: 'mock-1' }),
  ])
  await removeFavorite('mock-1')
  await expect(getFavorites()).resolves.toEqual([])
  expect(api.get).not.toHaveBeenCalled()
  expect(api.post).not.toHaveBeenCalled()
  expect(api.delete).not.toHaveBeenCalled()
})

test('관심행사 목록을 조회한다', async () => {
  const favorites = [
    {
      eventId: 'https://culture.seoul.go.kr/event/1',
      title: '서울 문화행사',
      startDate: '2026-09-20',
      endDate: '2026-09-25',
      place: '서울광장',
      savedAt: '2026-09-27T10:00:00Z',
    },
  ]

  api.get.mockResolvedValue({
    data: favorites,
  })

  await expect(
    getFavorites()
  ).resolves.toEqual(favorites)

  expect(api.get).toHaveBeenCalledWith(
    '/favorites',
    {
      signal: undefined,
    }
  )
})

test('특정 월의 관심행사를 조회한다', async () => {
  api.get.mockResolvedValue({
    data: [],
  })

  await getFavorites(
    '2026-09'
  )

  expect(api.get).toHaveBeenCalledWith(
    '/favorites',
    {
      signal: undefined,
      params: {
        month: '2026-09',
      },
    }
  )
})

test('관심행사를 추가한다', async () => {
  const eventId =
    'https://culture.seoul.go.kr/event/1'

  api.post.mockResolvedValue({
    data: {
      eventId,
    },
  })

  await addFavorite(eventId)

  expect(api.post).toHaveBeenCalledWith(
    '/favorites',
    {
      eventId,
    }
  )
})

test('관심행사를 삭제한다', async () => {
  const eventId =
    'https://culture.seoul.go.kr/event/1'

  api.delete.mockResolvedValue({
    status: 204,
  })

  await removeFavorite(eventId)

  expect(api.delete).toHaveBeenCalledWith(
    '/favorites',
    {
      params: {
        eventId,
      },
    }
  )
})
