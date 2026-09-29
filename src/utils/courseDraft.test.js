import { COURSE_BUILDER_KEY, COURSE_DRAFT_CHANGED, COURSE_DRAFT_KEY, readCourseBuilder, readCourseDraft, toggleCourseEvent, writeCourseBuilder, writeCourseDraft } from './courseDraft'

beforeEach(() => localStorage.clear())

test('행사 초안을 필요한 필드만 저장하고 같은 행사를 토글한다', () => {
  const event = { eventId: 7, title: '서울 전시', place: '미술관', latitude: '37.5', longitude: '127.1', ignored: '제외' }
  const changed = jest.fn()
  window.addEventListener(COURSE_DRAFT_CHANGED, changed)
  toggleCourseEvent(event)
  expect(readCourseDraft()).toEqual([expect.objectContaining({ eventId: '7', title: '서울 전시', latitude: '37.5' })])
  expect(JSON.parse(localStorage.getItem(COURSE_DRAFT_KEY))[0]).not.toHaveProperty('ignored')
  toggleCourseEvent(event)
  expect(readCourseDraft()).toEqual([])
  expect(changed).toHaveBeenCalledTimes(2)
  window.removeEventListener(COURSE_DRAFT_CHANGED, changed)
})

test('깨진 저장값은 빈 초안으로 복구한다', () => {
  localStorage.setItem(COURSE_DRAFT_KEY, '{broken')
  expect(readCourseDraft()).toEqual([])
  expect(writeCourseDraft([{ title: '식별자 없음' }])).toEqual([])
})

test('작성 중인 코스 이름과 전체 동선을 보관한다', () => {
  writeCourseBuilder({ title: '주말 코스', stops: [{ stopId: 'place:p1', stopType: 'PLACE', placeId: 'p1', placeType: 'cafe',
    name: '카페', photoName: 'places/p1/photos/one', imageUrl: '/api/places/photo?name=secret' }] })
  expect(readCourseBuilder()).toEqual({ title: '주말 코스', stops: [{ stopId: 'place:p1', stopType: 'PLACE', placeId: 'p1', placeType: 'cafe' }] })
  expect(localStorage.getItem(COURSE_BUILDER_KEY)).toContain('주말 코스')
  expect(localStorage.getItem(COURSE_BUILDER_KEY)).not.toContain('photoName')
  expect(localStorage.getItem(COURSE_BUILDER_KEY)).not.toContain('/api/places/photo')
})
