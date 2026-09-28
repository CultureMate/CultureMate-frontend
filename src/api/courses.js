import api from './axios'
import { canUseMock, getDataMode } from './dataMode'

export const SAVED_COURSES_KEY = 'culturemate.saved-courses.v1'

function saveLocally(course) {
  let courses = []
  try { courses = JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]') } catch { /* 새 목록으로 복구 */ }
  const saved = { ...course, courseId: `local-${Date.now()}`, createdAt: new Date().toISOString(), isLocal: true }
  localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify([saved, ...(Array.isArray(courses) ? courses : [])]))
  return saved
}

export async function createCourse(course, signal) {
  if (getDataMode() === 'mock') return saveLocally(course)
  try {
    const { data } = await api.post('/courses', course, { signal })
    return data
  } catch (error) {
    if (canUseMock(error)) return saveLocally(course)
    throw error
  }
}

export function getCourseError(error) {
  if (error.response?.status === 400) return '코스 이름과 경로를 확인해 주세요.'
  if (error.response?.status === 401) return '코스를 저장하려면 로그인이 필요합니다.'
  return '코스를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
