import api from './axios'
import { createCourse, deleteCourse, getCourseDetail, getSharedCourse, shareCourse, unshareCourse, updateCourse, updateCourseFavorite } from './courses'

jest.mock('./axios', () => ({
  __esModule: true,
  default: { delete: jest.fn(), get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  jest.clearAllMocks()
})

afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

const stops = [
  { stopType: 'EVENT', eventId: 'event-1', title: '서울 전시' },
  { stopType: 'PLACE', placeType: 'cafe', placeId: 'place-1', name: '카페' },
  { stopType: 'PLACE', placeType: 'restaurant', placeId: 'place-2', name: '식당' },
]

test('코스 생성과 수정 요청을 백엔드 계약 형식으로 보낸다', async () => {
  api.post.mockResolvedValue({ data: { courseId: 1, title: '문화 산책', version: 1, stops: [] } })
  api.put.mockResolvedValue({ data: { courseId: 1, title: '수정 산책', version: 2, stops: [] } })

  await createCourse({ title: '문화 산책', stops })
  expect(api.post).toHaveBeenCalledWith('/courses', {
    title: '문화 산책',
    stops: [
      { type: 'event', eventId: 'event-1' },
      { type: 'cafe', placeId: 'place-1' },
      { type: 'restaurant', placeId: 'place-2' },
    ],
  }, { signal: undefined })

  await updateCourse(1, { title: '수정 산책', version: 1, stops })
  expect(api.put).toHaveBeenCalledWith('/courses/1', {
    title: '수정 산책',
    version: 1,
    stops: expect.any(Array),
  }, { signal: undefined })
})

test('상세 응답의 행사 스냅샷과 장소 유형을 화면 형식으로 정규화한다', async () => {
  api.get.mockResolvedValue({ data: {
    courseId: 1,
    title: '문화 산책',
    stops: [
      { stopOrder: 0, type: 'event', eventId: 'e1', eventTitle: '서울 전시', eventPlace: '서울광장', eventImageUrl: 'event.jpg' },
      { stopOrder: 1, type: 'restaurant', placeId: 'p1' },
    ],
  } })

  const course = await getCourseDetail(1)
  expect(course.stops[0]).toEqual(expect.objectContaining({ stopType: 'EVENT', title: '서울 전시', place: '서울광장', imageUrl: 'event.jpg' }))
  expect(course.stops[1]).toEqual(expect.objectContaining({ stopType: 'PLACE', placeType: 'restaurant', name: '음식점' }))
})

test('관심·삭제·공유 API 메서드와 본문을 계약대로 사용한다', async () => {
  api.put.mockResolvedValue({ data: { courseId: 1, favorited: true } })
  api.delete.mockResolvedValue({})
  api.post.mockResolvedValue({ data: { shareId: 'share-1' } })

  await updateCourseFavorite(1, true)
  await shareCourse(1)
  await unshareCourse(1)
  await deleteCourse(1)

  expect(api.put).toHaveBeenCalledWith('/courses/1/favorite', { favorited: true }, { signal: undefined })
  expect(api.post).toHaveBeenCalledWith('/courses/1/share', null, { signal: undefined })
  expect(api.delete).toHaveBeenCalledWith('/courses/1/share', { signal: undefined })
  expect(api.delete).toHaveBeenCalledWith('/courses/1', { signal: undefined })
})

test('공유 코스 공개 경로를 조회한다', async () => {
  api.get.mockResolvedValue({ data: { title: '공유 코스', stops: [] } })
  await getSharedCourse('share-1')
  expect(api.get).toHaveBeenCalledWith('/courses/shared/share-1', { signal: undefined })
})
