import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Course from './Course'
import { createCourse, deleteCourse, getCourseDetail, getCourses, shareCourse, unshareCourse, updateCourse, updateCourseFavorite } from '../api/courses'
import { getNearbyPlaces, getPlacesBetween } from '../api/places'
import { writeCourseDraft } from '../utils/courseDraft'
import { getEventDetail } from '../api/events'

jest.mock('../api/courses', () => ({
  createCourse: jest.fn(),
  deleteCourse: jest.fn(),
  getCourseDetail: jest.fn(),
  getCourses: jest.fn(),
  shareCourse: jest.fn(),
  unshareCourse: jest.fn(),
  updateCourse: jest.fn(),
  updateCourseFavorite: jest.fn(),
  getCourseError: () => '저장 실패',
}))
jest.mock('../api/places', () => ({ getNearbyPlaces: jest.fn(), getPlacesBetween: jest.fn(), getPlacesError: () => '장소 조회 실패' }))
jest.mock('../api/events', () => ({ getEventDetail: jest.fn() }))

const events = [
  { eventId: 'e1', title: '첫 번째 행사', place: '서울광장', imageUrl: 'https://image.example/e1.jpg', latitude: 37.566, longitude: 126.978 },
  { eventId: 'e2', title: '두 번째 행사', place: '미술관', imageUrl: 'https://image.example/e2.jpg', latitude: 37.57, longitude: 126.98 },
]
const cafe = { placeId: 'p1', name: '문화 카페', address: '서울 중구', rating: 4.7, userRatingCount: 120,
  latitude: 37.567, longitude: 126.979, placeType: 'cafe', mapUrl: 'https://map.example/p1',
  imageUrl: 'https://image.example/cafe.jpg', openNow: true, todayHours: '오늘 10:00~22:00', openingHours: ['월요일 10:00~22:00'] }
const restaurant = { ...cafe, placeId: 'p2', name: '문화 식당', placeType: 'restaurant' }

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
  getNearbyPlaces.mockImplementation(({ types }) => Promise.resolve({
    places: [types[0] === 'restaurant' ? restaurant : cafe],
    isMock: false,
  }))
  getPlacesBetween.mockImplementation(({ type }) => Promise.resolve([type === 'restaurant' ? restaurant : cafe]))
  createCourse.mockResolvedValue({ courseId: 1 })
  getCourses.mockResolvedValue([])
  getCourseDetail.mockResolvedValue(null)
  updateCourseFavorite.mockResolvedValue({})
  updateCourse.mockResolvedValue({ courseId: 1, version: 2 })
  deleteCourse.mockResolvedValue()
  shareCourse.mockResolvedValue({ shareId: 'share-1' })
  unshareCourse.mockResolvedValue()
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
  expect(getNearbyPlaces).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '카페 검색' }))
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  expect(getNearbyPlaces).not.toHaveBeenCalled()
  expect(getPlacesBetween).toHaveBeenCalledTimes(1)
  expect(getPlacesBetween).toHaveBeenCalledWith({ eventId1: 'e1', eventId2: 'e2', type: 'cafe' }, expect.any(AbortSignal))
  fireEvent.click(screen.getByRole('button', { name: '+ 추가' }))
  const route = screen.getByRole('heading', { name: '코스 순서' }).closest('section')
  expect(within(route).getByText('문화 카페')).toBeInTheDocument()
  const downButtons = within(route).getAllByRole('button', { name: '아래로 이동' })
  fireEvent.click(downButtons[0])
  fireEvent.change(screen.getByLabelText('코스 이름'), { target: { value: '서울 문화 산책' } })
  fireEvent.click(screen.getByRole('button', { name: '이 코스 저장하기' }))
  await waitFor(() => expect(createCourse).toHaveBeenCalledTimes(1))
  expect(createCourse.mock.calls[0][0]).toEqual({
    title: '서울 문화 산책',
    stops: [expect.objectContaining({ eventId: 'e2', stopType: 'EVENT' }), expect.objectContaining({ eventId: 'e1', stopType: 'EVENT' }), expect.objectContaining({ placeId: 'p1', placeType: 'cafe' })],
  })
  expect(await screen.findByText('코스를 저장했어요.')).toBeInTheDocument()
  expect(screen.getByText('코스에 담긴 행사가 없어요')).toBeInTheDocument()
  expect(screen.queryByLabelText('코스 이름')).not.toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('culturemate.course-draft.v1'))).toEqual([])
    expect(JSON.parse(localStorage.getItem('culturemate.course-builder.v1'))).toEqual({ title: '', stops: [] })
  })
})

test('행사가 하나면 해당 행사 좌표를 기준으로 주변 장소를 검색한다', async () => {
  writeCourseDraft([events[0]])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '카페 검색' }))

  await waitFor(() => expect(getNearbyPlaces).toHaveBeenCalledWith({
    latitude: 37.566,
    longitude: 126.978,
    types: ['cafe'],
    radius: 1500,
    maxResults: 20,
  }, expect.any(AbortSignal)))
  expect(getNearbyPlaces).toHaveBeenCalledTimes(1)
  expect(getPlacesBetween).not.toHaveBeenCalled()
})

test('카페와 음식점을 각각 조회해 유형별 탭에 표시한다', async () => {
  writeCourseDraft(events)
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '카페 검색' }))
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('전체 영업시간')
  expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('월요일 10:00~22:00')
  expect(screen.queryByText('문화 식당')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /음식점/ }))
  expect(screen.queryByText('문화 카페')).not.toBeInTheDocument()
  expect(screen.getByText('음식점 검색 버튼을 눌러 장소를 찾아보세요.')).toBeInTheDocument()
  expect(getPlacesBetween).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByRole('button', { name: '음식점 검색' }))
  expect(await screen.findByText('문화 식당')).toBeInTheDocument()
  expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('월요일 10:00~22:00')
  expect(screen.queryByText('문화 카페')).not.toBeInTheDocument()
  expect(getPlacesBetween).toHaveBeenLastCalledWith({ eventId1: 'e1', eventId2: 'e2', type: 'restaurant' }, expect.any(AbortSignal))
})

test('행사가 세 개면 순서에 따라 두 구간을 만들고 선택한 구간을 검색한다', async () => {
  const thirdEvent = { eventId: 'e3', title: '세 번째 행사', place: '공연장', imageUrl: 'https://image.example/e3.jpg', latitude: 37.58, longitude: 126.99 }
  writeCourseDraft([...events, thirdEvent])
  renderCourse()

  const segmentSelect = screen.getByLabelText('검색할 행사 구간')
  expect(within(segmentSelect).getAllByRole('option')).toHaveLength(2)
  expect(within(segmentSelect).getByRole('option', { name: /1순위 첫 번째 행사 → 2순위 두 번째 행사/ })).toBeInTheDocument()
  expect(within(segmentSelect).getByRole('option', { name: /2순위 두 번째 행사 → 3순위 세 번째 행사/ })).toBeInTheDocument()
  fireEvent.change(segmentSelect, { target: { value: '1' } })
  fireEvent.click(screen.getByRole('button', { name: '카페 검색' }))

  await waitFor(() => expect(getPlacesBetween).toHaveBeenCalledWith({ eventId1: 'e2', eventId2: 'e3', type: 'cafe' }, expect.any(AbortSignal)))
})

test('목록에 좌표가 없으면 상세를 확인하고 그래도 없을 때 주변 API를 호출하지 않는다', async () => {
  writeCourseDraft([{ eventId: 'missing', title: '좌표 없는 행사', place: '어딘가' }])
  renderCourse()
  expect(await screen.findByText(/좌표가 없는 행사가 있어 해당 구간을 검색할 수 없어요/)).toBeInTheDocument()
  expect(getEventDetail).toHaveBeenCalledWith('missing', expect.any(AbortSignal))
  expect(getNearbyPlaces).not.toHaveBeenCalled()
})

test('내 코스에서 전체와 관심 코스를 나누어 본다', async () => {
  getCourses.mockResolvedValue([
    { courseId: 1, title: '서울 문화 산책', stopCount: 3, firstEventTitle: '서울 전시', firstEventImageUrl: 'https://image.example/preview.jpg', createdAt: '2026-09-28', favorite: true },
    { courseId: 2, title: '주말 전시 코스', stopCount: 2, createdAt: '2026-09-27', favorite: false },
  ])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  expect(await screen.findByText('서울 문화 산책')).toBeInTheDocument()
  expect(screen.getByText('주말 전시 코스')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: '서울 전시' })).toHaveAttribute('src', 'https://image.example/preview.jpg')

  fireEvent.click(screen.getByRole('button', { name: /관심만 보기/ }))
  expect(screen.getByText('서울 문화 산책')).toBeInTheDocument()
  expect(screen.queryByText('주말 전시 코스')).not.toBeInTheDocument()
})

test('내 코스의 상세 동선을 확인하고 목록으로 돌아간다', async () => {
  const course = { courseId: 1, title: '서울 문화 산책', stopCount: 2, createdAt: '2026-09-28' }
  getCourses.mockResolvedValue([course])
  getCourseDetail.mockResolvedValue({
    ...course,
    stops: [
      { type: 'EVENT', eventId: 'e1', name: '서울 전시', address: '서울광장', order: 0 },
      { type: 'PLACE', placeId: 'p1', placeType: 'CAFE', name: '문화 카페', address: '서울 중구', order: 1 },
    ],
  })
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))

  expect(await screen.findByText('서울 전시')).toBeInTheDocument()
  expect(screen.getByText('문화 카페')).toBeInTheDocument()
  expect(getCourseDetail).toHaveBeenCalledWith(1, expect.any(AbortSignal))

  fireEvent.click(screen.getByRole('button', { name: '내 코스' }))
  expect(screen.getByRole('button', { name: '상세 보기' })).toBeInTheDocument()
})

test('코스 상세에서 수정 화면을 열고 version과 함께 저장한다', async () => {
  const course = { courseId: 1, title: '서울 문화 산책', stopCount: 1, version: 3 }
  getCourses.mockResolvedValue([course])
  getCourseDetail.mockResolvedValue({
    ...course,
    stops: [{ type: 'event', stopType: 'EVENT', stopId: 'event:e1', eventId: 'e1', title: '서울 전시', place: '서울광장' }],
  })
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
  await screen.findByText('서울 전시')
  fireEvent.click(screen.getByRole('button', { name: '수정' }))

  expect(screen.getByText('수정 중')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('코스 이름'), { target: { value: '수정한 코스' } })
  fireEvent.click(screen.getByRole('button', { name: '수정 내용 저장' }))

  await waitFor(() => expect(updateCourse).toHaveBeenCalledWith(1, expect.objectContaining({ title: '수정한 코스', version: 3 })))
  expect(await screen.findByText('코스를 수정했어요.')).toBeInTheDocument()
  expect(screen.getByText('코스에 담긴 행사가 없어요')).toBeInTheDocument()
  expect(screen.queryByLabelText('코스 이름')).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('culturemate.course-draft.v1'))).toEqual([])
  expect(JSON.parse(localStorage.getItem('culturemate.course-builder.v1'))).toEqual({ title: '', stops: [] })
})

test('코스 공유 링크를 만들고 삭제할 수 있다', async () => {
  const course = { courseId: 1, title: '서울 문화 산책', stopCount: 1, version: 1 }
  getCourses.mockResolvedValue([course])
  getCourseDetail.mockResolvedValue({ ...course, stops: [{ type: 'event', stopType: 'EVENT', stopId: 'event:e1', eventId: 'e1', title: '서울 전시' }] })
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
  await screen.findByText('서울 전시')
  fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }))

  await waitFor(() => expect(shareCourse).toHaveBeenCalledWith(1))
  expect(await screen.findByLabelText('공유 링크')).toHaveValue(`${window.location.origin}/shared/courses/share-1`)

  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  const dialog = screen.getByRole('dialog', { name: '코스 삭제' })
  fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }))
  await waitFor(() => expect(deleteCourse).toHaveBeenCalledWith(1))
  expect(await screen.findByText('아직 만든 코스가 없어요')).toBeInTheDocument()
})
