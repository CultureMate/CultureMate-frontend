import { readCourseDraft, toggleCourseEvent } from './courseDraft'

beforeEach(() => {
  localStorage.clear()
})

test('행사를 코스 초안에 추가하고 다시 선택하면 제거한다', () => {
  const event = {
    eventId: 'event-1',
    title: '서울 전시',
    place: '서울광장',
  }

  toggleCourseEvent(event)
  expect(readCourseDraft()).toEqual([
    expect.objectContaining({ eventId: 'event-1', title: '서울 전시' }),
  ])

  toggleCourseEvent(event)
  expect(readCourseDraft()).toEqual([])
})

test('손상된 코스 초안은 빈 배열로 복구한다', () => {
  localStorage.setItem('culturemate.course-draft.v1', '{broken')
  expect(readCourseDraft()).toEqual([])
})
