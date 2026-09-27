import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import Favorites from './Favorites'
import {
  getFavorites,
  removeFavorite,
} from '../api/favorites'

jest.mock('../api/favorites', () => ({
  getFavorites: jest.fn(),
  removeFavorite: jest.fn(),
}))

const FAVORITES = [
  {
    eventId: 'https://culture.seoul.go.kr/event/1',
    title: '서울 전시회',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    place: '서울광장',
    savedAt: '2026-09-20T10:00:00Z',
  },
  {
    eventId: 'https://culture.seoul.go.kr/event/2',
    title: '가을 음악회',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    place: '세종문화회관',
    savedAt: '2026-09-21T10:00:00Z',
  },
]

function renderFavorites({
  view = 'list',
  path = '/favorites',
} = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/favorites"
          element={<Favorites view={view} />}
        />

        <Route
          path="/favorites/calendar"
          element={<Favorites view="calendar" />}
        />

        <Route
          path="/login"
          element={<div>로그인 화면</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  getFavorites.mockReset()
  removeFavorite.mockReset()
})

test('서버에서 받은 관심행사 목록을 표시한다', async () => {
  getFavorites.mockResolvedValue(FAVORITES)

  renderFavorites()

  expect(
    await screen.findByText('서울 전시회')
  ).toBeInTheDocument()

  expect(
    screen.getByText('가을 음악회')
  ).toBeInTheDocument()

  expect(
    screen.getByText('행사 2개 저장됨')
  ).toBeInTheDocument()
})

test('관심행사가 없으면 빈 목록 안내를 표시한다', async () => {
  getFavorites.mockResolvedValue([])

  renderFavorites()

  expect(
    await screen.findByText(
      '아직 저장한 행사가 없어요'
    )
  ).toBeInTheDocument()
})

test('삭제 성공 후 해당 행사를 화면에서 제거한다', async () => {
  getFavorites.mockResolvedValue(FAVORITES)
  removeFavorite.mockResolvedValue()

  renderFavorites()

  expect(
    await screen.findByText('서울 전시회')
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', {
      name: '서울 전시회 관심행사 삭제',
    })
  )

  await waitFor(() => {
    expect(removeFavorite).toHaveBeenCalledWith(
      'https://culture.seoul.go.kr/event/1'
    )
  })

  await waitFor(() => {
    expect(
      screen.queryByText('서울 전시회')
    ).not.toBeInTheDocument()
  })

  expect(
    screen.getByText('가을 음악회')
  ).toBeInTheDocument()
})

test('삭제 실패 시 행사를 유지하고 오류를 표시한다', async () => {
  getFavorites.mockResolvedValue(FAVORITES)

  removeFavorite.mockRejectedValue(
    new Error('delete failed')
  )

  renderFavorites()

  expect(
    await screen.findByText('서울 전시회')
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', {
      name: '서울 전시회 관심행사 삭제',
    })
  )

  expect(
    await screen.findByText(
      '관심행사를 삭제하지 못했습니다.'
    )
  ).toBeInTheDocument()

  expect(
    screen.getByText('서울 전시회')
  ).toBeInTheDocument()
})

test('관심행사 조회 중 401이 발생하면 로그인 화면으로 이동한다', async () => {
  getFavorites.mockRejectedValue({
    response: {
      status: 401,
    },
  })

  renderFavorites()

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('리스트에서 캘린더 탭으로 이동할 수 있다', async () => {
  getFavorites.mockResolvedValue([])

  renderFavorites()

  await screen.findByText(
    '아직 저장한 행사가 없어요'
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: /캘린더/,
    })
  )

  expect(
    await screen.findByText(
      /달력에서 날짜를 선택하면/
    )
  ).toBeInTheDocument()
})

test('다음 달 버튼을 누르면 다음 달 데이터로 다시 조회한다', async () => {
  getFavorites.mockResolvedValue([])

  const now = new Date()

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const currentMonthKey =
    `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, '0')}`

  const nextDate = new Date(
    currentYear,
    currentMonth + 1,
    1
  )

  const nextMonthKey =
    `${nextDate.getFullYear()}-${String(
      nextDate.getMonth() + 1
    ).padStart(2, '0')}`

  renderFavorites({
    view: 'calendar',
    path: '/favorites/calendar',
  })

  // 최초 월 조회가 끝날 때까지 기다림
  await waitFor(() => {
    expect(getFavorites).toHaveBeenCalledWith(
      currentMonthKey,
      expect.anything()
    )
  })

  // 로딩이 끝나고 달력이 실제로 나타날 때까지 기다림
  const nextButton =
    await screen.findByRole('button', {
      name: '다음 달',
    })

  fireEvent.click(nextButton)

  // 다음 달 API 요청 확인
  await waitFor(() => {
    expect(getFavorites).toHaveBeenCalledWith(
      nextMonthKey,
      expect.anything()
    )
  })

  // 다음 달 로딩까지 끝난 후 제목 확인
  expect(
    await screen.findByText(
      `${nextDate.getFullYear()}년 ${nextDate.getMonth() + 1}월`
    )
  ).toBeInTheDocument()
})

test('달력에서 날짜를 선택하면 해당 날짜의 행사를 표시한다', async () => {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0')

  const event = {
    eventId:
      'https://culture.seoul.go.kr/event/current',
    title: '선택 날짜 행사',
    startDate: `${year}-${month}-10`,
    endDate: `${year}-${month}-12`,
    place: '서울',
  }

  getFavorites.mockResolvedValue([event])

  renderFavorites({
    view: 'calendar',
    path: '/favorites/calendar',
  })

  expect(
    await screen.findByText(
      `${year}년 ${now.getMonth() + 1}월`
    )
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', {
      name: `${year}-${month}-11`,
    })
  )

  expect(
    await screen.findByText(
      '선택 날짜 행사'
    )
  ).toBeInTheDocument()
})