import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getSharedCourse } from '../api/courses'
import { getPlaceDetails } from '../api/places'
import SharedCourse from './SharedCourse'

jest.mock('../api/courses', () => ({ getSharedCourse: jest.fn() }))
jest.mock('../api/places', () => ({
  getPlaceDetails: jest.fn(),
  getPlacePhotoUrl: (name, maxWidthPx = 640) => `/api/places/photo?name=${encodeURIComponent(name)}&maxWidthPx=${maxWidthPx}`,
}))

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

test('공유 코스의 Google 사진 저작자와 Maps 출처를 표시한다', async () => {
  getSharedCourse.mockResolvedValue({
    title: '사진 코스',
    stops: [{ stopId: 'place:p2', stopType: 'PLACE', placeType: 'cafe', placeId: 'p2' }],
  })
  getPlaceDetails.mockResolvedValue({
    placeId: 'p2', name: '사진 카페', placeType: 'cafe', photoName: 'places/p2/photos/one', mapUrl: 'https://maps.google.com/p2',
    authorAttributions: [{ displayName: '촬영자 A', uri: 'https://example.com/a' }, { displayName: '촬영자 B' }],
  })
  renderPage()

  const image = await screen.findByRole('img', { name: '사진 카페' })
  await waitFor(() => expect(image).toHaveAttribute('src', '/api/places/photo?name=places%2Fp2%2Fphotos%2Fone&maxWidthPx=640'))
  fireEvent.load(image)
  expect(screen.getByRole('link', { name: '촬영자 A' })).toHaveAttribute('href', 'https://example.com/a')
  expect(screen.getByText(/촬영자 B/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Google Maps' })).toHaveAttribute('href', 'https://maps.google.com/p2')
})
