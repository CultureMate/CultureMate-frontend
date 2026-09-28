import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getSharedCourse } from '../api/courses'
import { getPlaceDetails } from '../api/places'
import SharedCourse from './SharedCourse'

jest.mock('../api/courses', () => ({ getSharedCourse: jest.fn() }))
jest.mock('../api/places', () => ({ getPlaceDetails: jest.fn() }))

function renderPage() {
  return render(<MemoryRouter initialEntries={['/shared/courses/share-1']}>
    <Routes><Route path="/shared/courses/:shareId" element={<SharedCourse />} /></Routes>
  </MemoryRouter>)
}

beforeEach(() => {
  jest.clearAllMocks()
  getPlaceDetails.mockResolvedValue({ placeId: 'p1', name: '공유 카페', address: '서울 중구', placeType: 'cafe' })
})

test('공유 코스를 읽기 전용으로 표시한다', async () => {
  getSharedCourse.mockResolvedValue({
    title: '서울 문화 산책',
    stops: [
      { stopId: 'event:e1', stopType: 'EVENT', eventId: 'e1', title: '서울 전시', place: '서울광장' },
      { stopId: 'place:p1', stopType: 'PLACE', placeType: 'cafe', placeId: 'p1', name: '카페' },
    ],
  })
  renderPage()

  expect(await screen.findByText('서울 문화 산책')).toBeInTheDocument()
  expect(screen.getByText('서울 전시')).toBeInTheDocument()
  expect(await screen.findByText('공유 카페')).toBeInTheDocument()
  expect(screen.getByText('읽기 전용')).toBeInTheDocument()
  expect(getSharedCourse).toHaveBeenCalledWith('share-1', expect.any(AbortSignal))
})

test('서버가 비로그인 공유 조회를 막으면 현재 제약과 로그인 링크를 안내한다', async () => {
  getSharedCourse.mockRejectedValue({ response: { status: 401 } })
  renderPage()

  expect(await screen.findByText('현재 서버에서는 공유 코스도 로그인 후 확인할 수 있습니다.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '로그인하기' })).toHaveAttribute('href', '/login')
})
