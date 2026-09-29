import { clearCourseEditSession, COURSE_BUILDER_KEY, COURSE_DRAFT_CHANGED, COURSE_DRAFT_KEY, COURSE_EDIT_SESSION_KEY, readActiveCourseEditSession, readCourseBuilder, readCourseDraft, readCourseEditSession, toggleCourseEvent, writeCourseBuilder, writeCourseDraft, writeCourseEditSession } from './courseDraft'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

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

test('수정 중인 코스 식별자와 version은 현재 브라우저 세션에만 보관한다', () => {
  expect(writeCourseEditSession({ courseId: 12, version: 4 })).toEqual({ courseId: 12, version: 4 })
  expect(readCourseEditSession()).toEqual({ courseId: 12, version: 4 })
  expect(sessionStorage.getItem(COURSE_EDIT_SESSION_KEY)).toContain('"courseId":12')
  expect(localStorage.getItem(COURSE_EDIT_SESSION_KEY)).toBeNull()

  clearCourseEditSession()
  expect(readCourseEditSession()).toBeNull()
})

test('작성 중인 내용이 있을 때만 수정 상태를 이어서 쓴다', () => {
  writeCourseEditSession({ courseId: 12, version: 4 })
  expect(readActiveCourseEditSession()).toBeNull()
  expect(readCourseEditSession()).toBeNull()

  writeCourseEditSession({ courseId: 12, version: 4 })
  writeCourseDraft([{ eventId: 'e1', title: '서울 전시' }])
  expect(readActiveCourseEditSession()).toEqual({ courseId: 12, version: 4 })

  writeCourseDraft([])
  writeCourseBuilder({ title: '수정 중인 코스', stops: [] })
  expect(readActiveCourseEditSession()).toEqual({ courseId: 12, version: 4 })
})

test('잘못된 코스 수정 세션은 복원하지 않는다', () => {
  sessionStorage.setItem(COURSE_EDIT_SESSION_KEY, JSON.stringify({ courseId: 12 }))
  expect(readCourseEditSession()).toBeNull()
  expect(writeCourseEditSession({ courseId: '', version: 1 })).toBeNull()
  expect(sessionStorage.getItem(COURSE_EDIT_SESSION_KEY)).toBeNull()
})
