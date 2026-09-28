import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Course from './Course'
import { createCourse } from '../api/courses'
import { getNearbyPlaces } from '../api/places'
import { writeCourseDraft } from '../utils/courseDraft'
import { getEventDetail } from '../api/events'

jest.mock('../api/courses', () => ({ createCourse: jest.fn(), getCourseError: () => '저장 실패' }))
jest.mock('../api/places', () => ({ getNearbyPlaces: jest.fn(), getPlacesError: () => '장소 조회 실패' }))
jest.mock('../api/events', () => ({ getEventDetail: jest.fn() }))

const events = [
  { eventId: 'e1', title: '첫 번째 행사', place: '서울광장', latitude: 37.566, longitude: 126.978 },
  { eventId: 'e2', title: '두 번째 행사', place: '미술관', latitude: 37.57, longitude: 126.98 },
]
const cafe = { placeId: 'p1', name: '문화 카페', address: '서울 중구', rating: 4.7, userRatingCount: 120, latitude: 37.567, longitude: 126.979, placeType: 'cafe', mapUrl: 'https://map.example/p1', openNow: true }

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
  getNearbyPlaces.mockResolvedValue({ places: [cafe], isMock: false })
  createCourse.mockResolvedValue({ courseId: 1 })
  getEventDetail.mockRejectedValue(new Error('좌표 없음'))
})

function renderCourse() {
  return render(<MemoryRouter><Course /></MemoryRouter>)
}

test('빈 초안에서는 행사 목록으로 안내한다', () => {
  renderCourse()
  expect(screen.getByText('코스에 담긴 행사가 없어요')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '행사 둘러보기' })).toHaveAttribute('href', '/events')
  expect(getNearbyPlaces).not.toHaveBeenCalled()
})

test('주변 카페를 추가하고 행사와 함께 순서를 변경해 저장한다', async () => {
  writeCourseDraft(events)
  renderCourse()
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  expect(getNearbyPlaces).toHaveBeenCalledWith({ latitude: 37.566, longitude: 126.978, types: ['cafe'], radius: 1500, maxResults: 20 }, expect.any(AbortSignal))
  fireEvent.click(screen.getByRole('button', { name: '+ 추가' }))
  const route = screen.getByRole('heading', { name: '코스 순서' }).closest('section')
  expect(within(route).getByText('문화 카페')).toBeInTheDocument()
  const downButtons = within(route).getAllByRole('button', { name: '아래로 이동' })
  fireEvent.click(downButtons[0])
  fireEvent.change(screen.getByLabelText('코스 이름'), { target: { value: '서울 문화 산책' } })
  fireEvent.click(screen.getByRole('button', { name: '이 코스 저장하기' }))
  await waitFor(() => expect(createCourse).toHaveBeenCalledTimes(1))
  expect(createCourse.mock.calls[0][0]).toEqual({
    name: '서울 문화 산책',
    stops: [
      { type: 'EVENT', eventId: 'e2', order: 0 },
      { type: 'EVENT', eventId: 'e1', order: 1 },
      { type: 'PLACE', placeId: 'p1', placeType: 'CAFE', name: '문화 카페', address: '서울 중구', latitude: 37.567, longitude: 126.979, order: 2 },
    ],
  })
  expect(await screen.findByText('코스를 저장했어요.')).toBeInTheDocument()
})

test('목록에 좌표가 없으면 상세를 확인하고 그래도 없을 때 주변 API를 호출하지 않는다', async () => {
  writeCourseDraft([{ eventId: 'missing', title: '좌표 없는 행사', place: '어딘가' }])
  renderCourse()
  expect(await screen.findByText(/좌표 정보가 없어 주변 장소를 검색할 수 없어요/)).toBeInTheDocument()
  expect(getEventDetail).toHaveBeenCalledWith('missing', expect.any(AbortSignal))
  expect(getNearbyPlaces).not.toHaveBeenCalled()
})
