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

import EventDetail from './EventDetail'
import { getEventDetail } from '../api/events'
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../api/favorites'
import { getCurrentMember } from '../api/auth'

jest.mock('../api/events', () => ({
  getEventDetail: jest.fn(),
}))

jest.mock('../api/favorites', () => ({
  addFavorite: jest.fn(),
  getFavorites: jest.fn(),
  removeFavorite: jest.fn(),
}))

jest.mock('../api/auth', () => ({
  getCurrentMember: jest.fn(),
}))

jest.mock('../components/DemoNotice', () => {
  return function MockDemoNotice() {
    return <div>데모 안내</div>
  }
})

jest.mock('../components/EventMap', () => {
  return function MockEventMap() {
    return <div>행사 지도</div>
  }
})

jest.mock('../components/EventSummary', () => {
  return function MockEventSummary() {
    return <div>행사 요약</div>
  }
})

jest.mock('../components/EventComments', () => {
  return function MockEventComments() {
    return <div>행사 댓글</div>
  }
})

jest.mock('../components/EventViewCount', () => {
  return function MockEventViewCount() {
    return <div>조회수</div>
  }
})

const EVENT_ID =
  'https://culture.seoul.go.kr/event?id=12'

const EVENT = {
  eventId: EVENT_ID,
  title: '서울 문화행사',
  category: '전시',
  district: '마포구',
  place: '서울광장',
  startDate: '2026-09-20',
  endDate: '2026-09-25',
  imageUrl: '/event-detail.jpg',
  organization: '서울시',
  fee: '무료',
  originalUrl: 'https://example.com/event',
  viewCount: 10,
}

function renderEventDetail(state) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: `/events/${encodeURIComponent(EVENT_ID)}`, state },
      ]}
    >
      <Routes>
        <Route
          path="/events/:id"
          element={<EventDetail />}
        />

        <Route
          path="/login"
          element={<div>로그인 화면</div>}
        />

        <Route
          path="/favorites/calendar"
          element={<div>관심행사 캘린더</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  getEventDetail.mockReset()
  getFavorites.mockReset()
  addFavorite.mockReset()
  removeFavorite.mockReset()
  getCurrentMember.mockReset()

  getEventDetail.mockResolvedValue({
    event: EVENT,
    isMock: false,
  })

  // 기본 상태: 로그인되어 있지만 아직 저장하지 않은 행사
  getFavorites.mockResolvedValue([])
  getCurrentMember.mockResolvedValue({ memberId: 1 })
})

test('비로그인 사용자는 관심행사와 코스 추가 버튼을 볼 수 없다', async () => {
  getCurrentMember.mockResolvedValue(null)
  renderEventDetail()

  expect(await screen.findByText('서울 문화행사')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '관심행사 저장' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '코스에 추가' })).not.toBeInTheDocument()
  expect(getFavorites).not.toHaveBeenCalled()
})

test('로그인 사용자는 상세 행사에서 코스에 추가할 수 있다', async () => {
  renderEventDetail()

  const button = await screen.findByRole('button', { name: '코스에 추가' })
  expect(button).toHaveClass('bg-coral', 'text-white')
  fireEvent.click(button)

  expect(button).toHaveAttribute('aria-pressed', 'true')
  expect(button).toHaveClass('bg-[#E6FAF7]', 'text-[#008F75]')
  expect(JSON.parse(localStorage.getItem('culturemate.course-draft.v1'))[0].eventId).toBe(EVENT_ID)
})

test('행사 상세 정보를 표시한다', async () => {
  renderEventDetail()

  expect(
    await screen.findByText('서울 문화행사')
  ).toBeInTheDocument()

  expect(screen.getByRole('img', { name: '서울 문화행사' }).parentElement).toHaveClass('aspect-video', 'w-full', 'max-w-5xl')

  expect(
    screen.getByText('서울광장')
  ).toBeInTheDocument()

  expect(
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })
  ).toBeInTheDocument()
})

test('관심행사 캘린더에서 연 상세는 목록 버튼으로 캘린더에 돌아간다', async () => {
  renderEventDetail({ returnTo: '/favorites/calendar' })

  await screen.findByText('서울 문화행사')
  fireEvent.click(screen.getAllByRole('button', { name: '목록으로' })[0])

  expect(await screen.findByText('관심행사 캘린더')).toBeInTheDocument()
})

test('미저장 행사에서는 저장 가능한 상태로 표시한다', async () => {
  getFavorites.mockResolvedValue([])

  renderEventDetail()

  expect(
    await screen.findByText(
      '관심행사에 저장'
    )
  ).toBeInTheDocument()

  expect(screen.getByRole('button', { name: '관심행사 저장' })).toHaveClass('bg-[#F2F4F6]', 'text-ink-soft')

  expect(getFavorites).toHaveBeenCalled()
})

test('이미 저장된 행사는 진입 시 저장된 상태로 표시한다', async () => {
  getFavorites.mockResolvedValue([
    {
      eventId: EVENT_ID,
      title: EVENT.title,
      startDate: EVENT.startDate,
      endDate: EVENT.endDate,
      place: EVENT.place,
      savedAt: '2026-09-28T10:00:00',
    },
  ])

  renderEventDetail()

  expect(
    await screen.findByText(
      '관심행사에 저장됨'
    )
  ).toBeInTheDocument()

  expect(screen.getByRole('button', { name: '관심행사 저장 취소' })).toHaveClass('bg-coral-light', 'text-coral')

  expect(addFavorite).not.toHaveBeenCalled()
})

test('저장된 행사에서 버튼을 다시 누르면 관심행사를 취소한다', async () => {
  getFavorites.mockResolvedValue([{ eventId: EVENT_ID, title: EVENT.title }])
  removeFavorite.mockResolvedValue()

  renderEventDetail()

  const button = await screen.findByRole('button', { name: '관심행사 저장 취소' })
  await waitFor(() => expect(button).not.toBeDisabled())
  fireEvent.click(button)

  await waitFor(() => expect(removeFavorite).toHaveBeenCalledWith(EVENT_ID))
  expect(await screen.findByText('관심행사에 저장')).toBeInTheDocument()
  expect(addFavorite).not.toHaveBeenCalled()
})

test('관심행사 저장 버튼을 누르면 eventId로 등록 요청한다', async () => {
  addFavorite.mockResolvedValue({
    eventId: EVENT_ID,
  })

  renderEventDetail()

  const button =
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })

  await waitFor(() => {
    expect(button).not.toBeDisabled()
  })

  fireEvent.click(button)

  await waitFor(() => {
    expect(addFavorite).toHaveBeenCalledWith(
      EVENT_ID
    )
  })

  expect(
    await screen.findByText(
      '관심행사에 저장됨'
    )
  ).toBeInTheDocument()
})

test('저장 요청에서 409가 발생하면 저장된 상태로 표시한다', async () => {
  addFavorite.mockRejectedValue({
    response: {
      status: 409,
    },
  })

  renderEventDetail()

  const button =
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })

  await waitFor(() => {
    expect(button).not.toBeDisabled()
  })

  fireEvent.click(button)

  expect(
    await screen.findByText(
      '관심행사에 저장됨'
    )
  ).toBeInTheDocument()
})

test('저장 여부 조회에서 401이 발생해도 상세 화면을 유지한다', async () => {
  getFavorites.mockRejectedValue({
    response: {
      status: 401,
    },
  })

  renderEventDetail()

  expect(
    await screen.findByText('서울 문화행사')
  ).toBeInTheDocument()

  expect(
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })
  ).toBeInTheDocument()

  expect(
    screen.queryByText('로그인 화면')
  ).not.toBeInTheDocument()
})

test('관심행사 저장 중 401이 발생하면 로그인 화면으로 이동한다', async () => {
  addFavorite.mockRejectedValue({
    response: {
      status: 401,
    },
  })

  renderEventDetail()

  const button =
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })

  await waitFor(() => {
    expect(button).not.toBeDisabled()
  })

  fireEvent.click(button)

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('관심행사 저장 실패 시 오류 메시지를 표시한다', async () => {
  addFavorite.mockRejectedValue(
    new Error('save failed')
  )

  renderEventDetail()

  const button =
    await screen.findByRole('button', {
      name: '관심행사 저장',
    })

  await waitFor(() => {
    expect(button).not.toBeDisabled()
  })

  fireEvent.click(button)

  expect(
    await screen.findByText(
      '관심행사 저장에 실패했습니다.'
    )
  ).toBeInTheDocument()

  expect(
    addFavorite
  ).toHaveBeenCalledTimes(1)
})

test('데모 행사는 관심행사 저장 API를 호출하지 않는다', async () => {
  getEventDetail.mockResolvedValue({
    event: EVENT,
    isMock: true,
  })

  renderEventDetail()

  expect(
    await screen.findByText('서울 문화행사')
  ).toBeInTheDocument()

  expect(
    await screen.findByText(
      '데모 행사는 관심행사에 저장할 수 없습니다.'
    )
  ).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {
      name: '관심행사 저장',
    })
  ).not.toBeInTheDocument()

  expect(getFavorites).not.toHaveBeenCalled()
  expect(addFavorite).not.toHaveBeenCalled()
})
