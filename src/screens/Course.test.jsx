import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import Course from './Course'
import { createCourse, deleteCourse, getCourseDetail, getCourses, shareCourse, unshareCourse, updateCourse, updateCourseFavorite } from '../api/courses'
import { getNearbyPlaces, getPlaceDetails, getPlacesBetween } from '../api/places'
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
jest.mock('../api/places', () => ({
  getNearbyPlaces: jest.fn(),
  getPlaceDetails: jest.fn(),
  getPlacePhotoUrl: (name, maxWidthPx = 640) => `/api/places/photo?name=${encodeURIComponent(name)}&maxWidthPx=${maxWidthPx}`,
  getPlacesBetween: jest.fn(),
  getPlacesError: () => '장소 조회 실패',
}))
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
  getPlaceDetails.mockImplementation((placeId, type) => Promise.resolve({ placeId, name: type === 'restaurant' ? '문화 식당' : '문화 카페', placeType: type }))
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

function renderCourseWithEventList() {
  return render(
    <MemoryRouter initialEntries={['/course']}>
      <Routes>
        <Route path="/course" element={<Course />} />
        <Route path="/events" element={<main><h1>행사 목록</h1><Link to="/course">코스로 돌아가기</Link></main>} />
      </Routes>
    </MemoryRouter>,
  )
}

test('빈 초안에서는 행사 목록으로 안내한다', () => {
  renderCourse()
  expect(screen.getByText('코스에 담긴 행사가 없어요')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '행사 둘러보기' })).toHaveAttribute('href', '/events')
  expect(getNearbyPlaces).not.toHaveBeenCalled()
})

test('두 행사 연계 장소에는 어느 행사 근처인지 표시한다', async () => {
  writeCourseDraft(events)
  getPlacesBetween.mockResolvedValue([
    { ...cafe, placeId: 'near-first', name: '첫 행사 옆 카페', nearEventId: 'e1' },
    { ...cafe, placeId: 'near-second', name: '둘째 행사 옆 카페', nearEventId: 'e2' },
    { ...cafe, placeId: 'unknown', name: '표시 없는 카페', nearEventId: '' },
  ])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))

  const first = (await screen.findByRole('heading', { name: '첫 행사 옆 카페' })).closest('article')
  const second = screen.getByRole('heading', { name: '둘째 행사 옆 카페' }).closest('article')
  const unknown = screen.getByRole('heading', { name: '표시 없는 카페' }).closest('article')
  expect(within(first).getByText(`📍 ${events[0].title} 근처`)).toBeInTheDocument()
  expect(within(second).getByText(`📍 ${events[1].title} 근처`)).toBeInTheDocument()
  expect(within(unknown).queryByText(/근처$/)).not.toBeInTheDocument()
})

test('행사 칩을 고르면 그 행사 근처만 검색하고 담은 장소는 그 행사 다음 순서에 들어간다', async () => {
  writeCourseDraft(events)
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '첫 번째 행사 주변' }))
  expect(screen.getByRole('button', { name: '첫 번째 행사 주변' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: '🍽 음식점' }))

  expect(await screen.findByRole('heading', { name: '문화 식당' })).toBeInTheDocument()
  expect(getNearbyPlaces).toHaveBeenCalledWith(
    { latitude: 37.566, longitude: 126.978, types: ['restaurant'], radius: 1500, maxResults: 20 }, expect.any(AbortSignal))
  expect(getPlacesBetween).not.toHaveBeenCalled()
  expect(screen.getByText('첫 번째 행사 주변 음식점')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '+ 추가' }))
  const route = screen.getByRole('heading', { name: '코스 순서' }).closest('section')
  expect(within(route).getAllByRole('heading', { level: 3 }).map(heading => heading.textContent))
    .toEqual(['첫 번째 행사', '문화 식당', '두 번째 행사'])

  fireEvent.click(screen.getByRole('button', { name: '첫 번째 행사 ~ 두 번째 행사 사이' }))
  await waitFor(() => expect(getPlacesBetween).toHaveBeenCalledWith({ eventId1: 'e1', eventId2: 'e2', type: 'restaurant' }, expect.any(AbortSignal)))

  fireEvent.click(screen.getByRole('button', { name: '두 번째 행사 주변 장소 찾기' }))
  expect(screen.getByRole('button', { name: '두 번째 행사 주변' })).toHaveAttribute('aria-pressed', 'true')
  await waitFor(() => expect(getNearbyPlaces).toHaveBeenLastCalledWith(
    { latitude: 37.57, longitude: 126.98, types: ['restaurant'], radius: 1500, maxResults: 20 }, expect.any(AbortSignal)))

  fireEvent.click(screen.getByRole('button', { name: '첫 번째 행사 주변' }))
  expect(await screen.findByRole('button', { name: '추가됨' })).toBeInTheDocument()
  expect(getNearbyPlaces).toHaveBeenCalledTimes(2)
})

test('주변 카페를 추가하고 행사와 함께 순서를 변경해 저장한다', async () => {
  writeCourseDraft(events)
  renderCourse()
  expect(getNearbyPlaces).not.toHaveBeenCalled()
  expect(getPlacesBetween).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  const places = screen.getByRole('heading', { name: '코스 주변 장소' }).closest('section')
  expect(places).toHaveClass('min-w-0', 'max-w-full')
  expect(screen.getByRole('img', { name: '문화 카페' }).parentElement).toHaveClass('aspect-video', 'w-full')
  expect(getNearbyPlaces).not.toHaveBeenCalled()
  expect(getPlacesBetween).toHaveBeenCalledTimes(1)
  expect(getPlacesBetween).toHaveBeenCalledWith({ eventId1: 'e1', eventId2: 'e2', type: 'cafe' }, expect.any(AbortSignal))
  fireEvent.click(screen.getByRole('button', { name: '+ 추가' }))
  const route = screen.getByRole('heading', { name: '코스 순서' }).closest('section')
  expect(route).toHaveClass('min-w-0', 'max-w-full')
  expect(within(route).getByText('문화 카페')).toBeInTheDocument()
  expect(within(route).getAllByRole('listitem')[0]).toHaveClass('grid-cols-[4rem_minmax(0,1fr)]', 'md:flex')
  const downButtons = within(route).getAllByRole('button', { name: '아래로 이동' })
  fireEvent.click(downButtons[0])
  fireEvent.change(screen.getByLabelText('코스 이름'), { target: { value: '서울 문화 산책' } })
  fireEvent.click(screen.getByRole('button', { name: '이 코스 저장하기' }))
  await waitFor(() => expect(createCourse).toHaveBeenCalledTimes(1))
  expect(createCourse.mock.calls[0][0]).toEqual({
    title: '서울 문화 산책',
    stops: [expect.objectContaining({ placeId: 'p1', placeType: 'cafe' }), expect.objectContaining({ eventId: 'e1', stopType: 'EVENT' }), expect.objectContaining({ eventId: 'e2', stopType: 'EVENT' })],
  })
  expect(await screen.findByRole('heading', { name: '내 코스' })).toBeInTheDocument()
  expect(screen.queryByText('코스를 저장했어요.')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('코스 이름')).not.toBeInTheDocument()
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('culturemate.course-draft.v1'))).toEqual([])
    expect(JSON.parse(localStorage.getItem('culturemate.course-builder.v1'))).toEqual({ title: '', stops: [] })
  })
})

test('행사가 하나면 해당 행사 좌표를 기준으로 주변 장소를 검색한다', async () => {
  writeCourseDraft([events[0]])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))

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

  expect(screen.getByText('카페나 음식점을 누르면 바로 찾아드려요.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  fireEvent.mouseEnter(screen.getByText('🕒 오늘 10:00~22:00'))
  expect(screen.getByRole('tooltip')).toHaveTextContent('전체 영업시간')
  expect(screen.getByRole('tooltip')).toHaveTextContent('월요일 10:00~22:00')
  expect(screen.queryByText('문화 식당')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '🍽 음식점' }))
  expect(await screen.findByText('문화 식당')).toBeInTheDocument()
  fireEvent.mouseEnter(screen.getByText('🕒 오늘 10:00~22:00'))
  expect(screen.getByRole('tooltip')).toHaveTextContent('월요일 10:00~22:00')
  expect(screen.queryByText('문화 카페')).not.toBeInTheDocument()
  expect(getPlacesBetween).toHaveBeenLastCalledWith({ eventId1: 'e1', eventId2: 'e2', type: 'restaurant' }, expect.any(AbortSignal))

  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))
  expect(await screen.findByText('문화 카페')).toBeInTheDocument()
  expect(getPlacesBetween).toHaveBeenCalledTimes(2)
})

test('장소 후보 사진은 검색 결과가 보이면 불러오고 저작자와 Google Maps 출처를 표시한다', async () => {
  writeCourseDraft(events)
  getPlacesBetween.mockResolvedValue([{
    ...cafe,
    photoName: 'places/p1/photos/one',
    authorAttributions: [{ displayName: '카페 촬영자', uri: 'https://example.com/photographer' }],
    mapUrl: 'https://maps.google.com/p1',
  }])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))
  const image = await screen.findByRole('img', { name: '문화 카페' })
  await waitFor(() => expect(image).toHaveAttribute('src', '/api/places/photo?name=places%2Fp1%2Fphotos%2Fone&maxWidthPx=640'))
  expect(screen.queryByRole('button', { name: '사진 보기' })).not.toBeInTheDocument()
  fireEvent.load(image)
  expect(screen.getByRole('link', { name: '카페 촬영자' })).toHaveAttribute('href', 'https://example.com/photographer')
  expect(screen.getByRole('link', { name: 'Google Maps' })).toHaveAttribute('href', 'https://maps.google.com/p1')
})

test('장소 사진은 최초 다섯 개만 표시하고 더 보기를 누르면 다음 사진을 표시한다', async () => {
  writeCourseDraft(events)
  const places = Array.from({ length: 6 }, (_, index) => ({
    ...cafe,
    placeId: `p${index + 1}`,
    name: `카페 ${index + 1}`,
    photoName: `places/p${index + 1}/photos/one`,
  }))
  getPlacesBetween.mockResolvedValue(places)
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))
  expect(await screen.findByRole('img', { name: '카페 5' })).toBeInTheDocument()
  expect(screen.queryByRole('img', { name: '카페 6' })).not.toBeInTheDocument()
  for (let index = 1; index <= 5; index += 1) {
    expect(screen.getByRole('img', { name: `카페 ${index}` }).getAttribute('src')).toContain(`places%2Fp${index}%2Fphotos%2Fone`)
  }

  fireEvent.click(screen.getByRole('button', { name: '장소 더 보기' }))
  const sixthImage = screen.getByRole('img', { name: '카페 6' })
  await waitFor(() => expect(sixthImage.getAttribute('src')).toContain('places%2Fp6%2Fphotos%2Fone'))
})

test('코스 이름 없이 저장하면 이름 입력란으로 이동해 오류를 표시한다', async () => {
  writeCourseDraft(events)
  const scrollIntoView = jest.fn()
  HTMLElement.prototype.scrollIntoView = scrollIntoView
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: '이 코스 저장하기' }))

  const titleInput = screen.getByLabelText('코스 이름')
  await waitFor(() => expect(titleInput).toHaveFocus())
  expect(titleInput).toHaveAttribute('aria-invalid', 'true')
  expect(titleInput).toHaveClass('border-[#B42318]')
  expect(screen.getByText('코스 이름을 입력해 주세요.')).toHaveClass('text-xs')
  expect(scrollIntoView).toHaveBeenCalled()
  expect(createCourse).not.toHaveBeenCalled()

  fireEvent.change(titleInput, { target: { value: '서울 산책' } })
  expect(screen.queryByText('코스 이름을 입력해 주세요.')).not.toBeInTheDocument()
})

test('행사가 세 개면 동선 순서대로 위치 칩을 만들고 고른 사이 구간을 검색한다', async () => {
  const thirdEvent = { eventId: 'e3', title: '세 번째 행사', place: '공연장', imageUrl: 'https://image.example/e3.jpg', latitude: 37.58, longitude: 126.99 }
  writeCourseDraft([...events, thirdEvent])
  renderCourse()

  const chips = within(screen.getByRole('group', { name: '검색 위치' })).getAllByRole('button')
  expect(chips.map(chip => chip.getAttribute('aria-label'))).toEqual([
    '첫 번째 행사 주변', '첫 번째 행사 ~ 두 번째 행사 사이', '두 번째 행사 주변', '두 번째 행사 ~ 세 번째 행사 사이', '세 번째 행사 주변',
  ])
  expect(chips[1]).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(chips[3])
  fireEvent.click(screen.getByRole('button', { name: '☕ 카페' }))

  await waitFor(() => expect(getPlacesBetween).toHaveBeenCalledWith({ eventId1: 'e2', eventId2: 'e3', type: 'cafe' }, expect.any(AbortSignal)))
  fireEvent.click(await screen.findByRole('button', { name: '+ 추가' }))
  const route = screen.getByRole('heading', { name: '코스 순서' }).closest('section')
  expect(within(route).getAllByRole('heading', { level: 3 }).map(heading => heading.textContent))
    .toEqual(['첫 번째 행사', '두 번째 행사', '문화 카페', '세 번째 행사'])
})

test('목록에 좌표가 없으면 상세를 확인하고 그래도 없을 때 주변 API를 호출하지 않는다', async () => {
  writeCourseDraft([{ eventId: 'missing', title: '좌표 없는 행사', place: '어딘가' }])
  renderCourse()
  expect(await screen.findByText(/위치 정보가 없는 행사라 주변 장소를 찾을 수 없어요/)).toBeInTheDocument()
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

test('내 코스 미리보기는 네 곳까지 표시하고 나머지 장소 수를 보여준다', async () => {
  getCourses.mockResolvedValue([{
    courseId: 1,
    title: '여섯 곳 코스',
    stopCount: 6,
    stops: [
      { stopId: 'event:e1', type: 'event', eventId: 'e1', title: '첫 행사', imageUrl: 'https://image.example/event.jpg' },
      { stopId: 'place:c1', type: 'cafe', placeId: 'c1', name: '첫 카페', imageUrl: 'https://image.example/should-not-load-cafe.jpg' },
      { stopId: 'place:r1', type: 'restaurant', placeId: 'r1', name: '첫 음식점', imageUrl: 'https://image.example/should-not-load-restaurant.jpg' },
      { stopId: 'event:e2', type: 'event', eventId: 'e2', title: '둘째 행사', imageUrl: 'https://image.example/event-2.jpg' },
      { stopId: 'place:c2', type: 'cafe', placeId: 'c2', name: '둘째 카페' },
      { stopId: 'place:r2', type: 'restaurant', placeId: 'r2', name: '둘째 음식점' },
    ],
  }])
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('여섯 곳 코스')

  expect(screen.getByRole('img', { name: '첫 행사' })).toHaveAttribute('src', 'https://image.example/event.jpg')
  expect(screen.getAllByRole('img', { name: '카페' })).toHaveLength(1)
  expect(screen.getAllByRole('img', { name: '음식점' })).toHaveLength(1)
  expect(screen.getByRole('img', { name: '둘째 행사' })).toHaveAttribute('src', 'https://image.example/event-2.jpg')
  expect(screen.getByText('+2')).toHaveAttribute('aria-label', '남은 장소 2곳')
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
  getPlaceDetails.mockResolvedValue({
    placeId: 'p1', name: '문화 카페', address: '서울 중구', placeType: 'cafe',
    todayHours: '화요일 10:00~22:00',
    openingHours: ['월요일 10:00~22:00', '화요일 10:00~22:00'],
  })
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))

  expect(await screen.findByText('서울 전시')).toBeInTheDocument()
  expect(screen.getByText('문화 카페')).toBeInTheDocument()
  const hours = screen.getByText('🕒 화요일 10:00~22:00')
  fireEvent.mouseEnter(hours)
  expect(screen.getByRole('tooltip')).toHaveTextContent('월요일 10:00~22:00')
  expect(screen.getByRole('tooltip')).toHaveTextContent('화요일 10:00~22:00')
  expect(screen.getByRole('link', { name: '서울 전시 상세 보기' })).toHaveAttribute('href', '/events/e1')
  expect(getCourseDetail).toHaveBeenCalledWith(1, expect.any(AbortSignal))

  fireEvent.click(screen.getByRole('button', { name: '내 코스' }))
  expect(screen.getByRole('button', { name: '상세 보기' })).toBeInTheDocument()
})

test('코스 상세에서 관심 상태를 변경해도 상세 동선을 유지한다', async () => {
  const course = { courseId: 1, title: '서울 문화 산책', stopCount: 2, createdAt: '2026-09-28' }
  getCourses.mockResolvedValue([course])
  getCourseDetail.mockResolvedValue({
    ...course,
    stops: [
      { type: 'EVENT', eventId: 'e1', name: '서울 전시', address: '서울광장', order: 0 },
      { type: 'PLACE', placeId: 'p1', placeType: 'CAFE', name: '문화 카페', address: '서울 중구', order: 1 },
    ],
  })
  getPlaceDetails.mockResolvedValue({ placeId: 'p1', name: '문화 카페', placeType: 'cafe' })
  updateCourseFavorite.mockResolvedValue({ courseId: 1, favorited: true, stops: [] })
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
  expect(await screen.findByText('서울 전시')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '서울 문화 산책 관심 코스 등록' }))
  await waitFor(() => expect(updateCourseFavorite).toHaveBeenCalledWith(1, true))

  const route = screen.getByRole('heading', { name: '코스 동선' }).closest('section')
  expect(within(route).getAllByRole('listitem')).toHaveLength(2)
  expect(within(route).getByText('서울 전시')).toBeInTheDocument()
  expect(within(route).getByText('문화 카페')).toBeInTheDocument()
})

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const courseDetail = (courseId, eventTitle) => ({
  courseId,
  title: `코스 ${courseId}`,
  stopCount: 2,
  stops: [
    { type: 'EVENT', eventId: `e${courseId}`, name: eventTitle, order: 0 },
    { type: 'PLACE', placeId: `p${courseId}`, placeType: 'CAFE', name: `카페 ${courseId}`, order: 1 },
  ],
})

test('상세 로딩 중 목록으로 돌아가면 늦게 도착한 상세가 화면을 다시 열지 않는다', async () => {
  getCourses.mockResolvedValue([{ courseId: 1, title: '코스 1', stopCount: 2 }])
  getCourseDetail.mockResolvedValue(courseDetail(1, '첫 코스 행사'))
  const place = deferred()
  getPlaceDetails.mockReturnValue(place.promise)
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('코스 1')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
  fireEvent.click(await screen.findByRole('button', { name: '내 코스' }))
  await act(async () => { place.resolve({ placeId: 'p1', name: '카페 1', placeType: 'cafe' }) })

  expect(screen.getByRole('button', { name: '상세 보기' })).toBeInTheDocument()
  expect(screen.queryByText('첫 코스 행사')).not.toBeInTheDocument()
})

test('다른 코스 상세를 열면 이전 코스의 늦은 응답이 현재 상세를 덮지 않는다', async () => {
  getCourses.mockResolvedValue([
    { courseId: 1, title: '코스 1', stopCount: 2 },
    { courseId: 2, title: '코스 2', stopCount: 2 },
  ])
  getCourseDetail.mockImplementation(courseId => Promise.resolve(courseDetail(courseId, courseId === 1 ? '첫 코스 행사' : '둘째 코스 행사')))
  const firstPlace = deferred()
  getPlaceDetails.mockImplementation(placeId => placeId === 'p1'
    ? firstPlace.promise
    : Promise.resolve({ placeId, name: '카페 2', placeType: 'cafe' }))
  renderCourse()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('코스 1')
  fireEvent.click(screen.getAllByRole('button', { name: '상세 보기' })[0])
  fireEvent.click(await screen.findByRole('button', { name: '내 코스' }))
  fireEvent.click(screen.getAllByRole('button', { name: '상세 보기' })[1])
  await screen.findByText('둘째 코스 행사')
  await act(async () => { firstPlace.resolve({ placeId: 'p1', name: '카페 1', placeType: 'cafe' }) })

  expect(screen.getByText('둘째 코스 행사')).toBeInTheDocument()
  expect(screen.queryByText('첫 코스 행사')).not.toBeInTheDocument()
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
  expect(await screen.findByRole('heading', { name: '내 코스' })).toBeInTheDocument()
  expect(screen.queryByText('코스를 수정했어요.')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('코스 이름')).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('culturemate.course-draft.v1'))).toEqual([])
  expect(JSON.parse(localStorage.getItem('culturemate.course-builder.v1'))).toEqual({ title: '', stops: [] })
})

test('코스 수정 중 행사 목록을 다녀와도 기존 코스를 version과 함께 수정한다', async () => {
  const course = { courseId: 1, title: '서울 문화 산책', stopCount: 1, version: 3 }
  getCourses.mockResolvedValue([course])
  getCourseDetail.mockResolvedValue({
    ...course,
    stops: [{ type: 'event', stopType: 'EVENT', stopId: 'event:e1', eventId: 'e1', title: '서울 전시', place: '서울광장' }],
  })
  renderCourseWithEventList()

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  await screen.findByText('서울 문화 산책')
  fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
  await screen.findByText('서울 전시')
  fireEvent.click(screen.getByRole('button', { name: '수정' }))
  fireEvent.click(screen.getByRole('link', { name: '+ 행사 더 담기' }))

  expect(screen.getByRole('heading', { name: '행사 목록' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('link', { name: '코스로 돌아가기' }))

  expect(screen.getByText('수정 중')).toBeInTheDocument()
  expect(screen.getByLabelText('코스 이름')).toHaveValue('서울 문화 산책')
  fireEvent.change(screen.getByLabelText('코스 이름'), { target: { value: '행사를 더 담은 코스' } })
  fireEvent.click(screen.getByRole('button', { name: '수정 내용 저장' }))

  await waitFor(() => expect(updateCourse).toHaveBeenCalledWith(1, expect.objectContaining({ title: '행사를 더 담은 코스', version: 3 })))
  expect(createCourse).not.toHaveBeenCalled()
  expect(localStorage.getItem('culturemate.course-edit.v1')).toBeNull()
})

test('수정 중인 코스를 삭제하면 작성 내용은 두고 수정 상태만 해제한다', async () => {
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

  fireEvent.click(screen.getByRole('button', { name: /📚 내 코스/ }))
  fireEvent.click(await screen.findByRole('button', { name: '상세 보기' }))
  await screen.findByText('서울 전시')
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: '코스 삭제' })).getByRole('button', { name: '삭제' }))
  await waitFor(() => expect(deleteCourse).toHaveBeenCalledWith(1))

  expect(localStorage.getItem('culturemate.course-edit.v1')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /🗺️ 코스 만들기/ }))
  expect(screen.queryByText('수정 중')).not.toBeInTheDocument()
  expect(screen.getByLabelText('코스 이름')).toHaveValue('서울 문화 산책')
})

test('새 탭에서 코스 화면을 열어도 작성 중이던 수정 상태를 이어간다', () => {
  localStorage.setItem('culturemate.course-draft.v1', JSON.stringify([{ eventId: 'e1', title: '서울 전시', place: '서울광장' }]))
  localStorage.setItem('culturemate.course-builder.v1', JSON.stringify({ title: '서울 문화 산책', stops: [] }))
  localStorage.setItem('culturemate.course-edit.v1', JSON.stringify({ courseId: 1, version: 3 }))
  renderCourse()

  expect(screen.getByText('수정 중')).toBeInTheDocument()
  expect(screen.getByLabelText('코스 이름')).toHaveValue('서울 문화 산책')
})

test('작성 내용이 모두 비어 있으면 남은 수정 상태를 복원하지 않고 지운다', () => {
  localStorage.setItem('culturemate.course-edit.v1', JSON.stringify({ courseId: 1, version: 3 }))
  renderCourse()

  expect(screen.queryByText('수정 중')).not.toBeInTheDocument()
  expect(localStorage.getItem('culturemate.course-edit.v1')).toBeNull()
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
