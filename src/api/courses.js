import api from './axios'
import { getDataMode } from './dataMode'

export const SAVED_COURSES_KEY = 'culturemate.saved-courses.v1'

const now = () => new Date().toISOString()

function readLocalCourses() {
  try {
    const courses = JSON.parse(localStorage.getItem(SAVED_COURSES_KEY) || '[]')
    if (!Array.isArray(courses)) return []
    const safeCourses = courses.map(course => ({ ...course, stops: stripPlacePhotoData(course.stops) }))
    if (JSON.stringify(safeCourses) !== JSON.stringify(courses)) writeLocalCourses(safeCourses)
    return safeCourses
  } catch {
    return []
  }
}

function writeLocalCourses(courses) {
  localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(courses))
}

function canUseCourseReadMock(error) {
  if (getDataMode() !== 'auto' || error?.code === 'ERR_CANCELED') return false
  if (['ERR_NETWORK', 'ECONNREFUSED'].includes(error?.code)) return true
  const body = typeof error?.response?.data === 'string' ? error.response.data : ''
  return error?.response?.status === 500
    && body.startsWith('Proxy error: Could not proxy request')
    && body.includes('ECONNREFUSED')
}

function stripPlacePhotoData(stops = []) {
  return stops.map(stop => {
    if (String(stop?.type ?? stop?.stopType).toLowerCase() === 'event') return stop
    const safeStop = { ...stop }
    delete safeStop.photoName
    delete safeStop.photoUrl
    delete safeStop.imageUrl
    delete safeStop.authorAttributions
    delete safeStop.photoAttribution
    return safeStop
  })
}

function localCourseDetail(course) {
  if (!course) return null
  return {
    ...course,
    title: course.title ?? course.name,
    favorited: Boolean(course.favorited ?? course.favorite),
    version: Number(course.version || 1),
  }
}

function saveLocally(course) {
  const saved = localCourseDetail({
    ...course,
    stops: stripPlacePhotoData(course.stops),
    courseId: `local-${Date.now()}`,
    createdAt: now(),
    updatedAt: now(),
    favorited: false,
    version: 1,
    isLocal: true,
  })
  writeLocalCourses([saved, ...readLocalCourses()])
  return saved
}

function updateLocally(courseId, changes) {
  let updated = null
  const courses = readLocalCourses().map(course => {
    if (String(course.courseId) !== String(courseId)) return course
    updated = localCourseDetail({ ...course, ...changes, stops: changes.stops ? stripPlacePhotoData(changes.stops) : course.stops, updatedAt: now() })
    return updated
  })
  writeLocalCourses(courses)
  return updated
}

export function serializeCourseStops(stops = []) {
  return stops.map(stop => {
    const type = String(stop.type ?? stop.stopType ?? '').toLowerCase()
    if (type === 'event') return { type: 'event', eventId: String(stop.eventId) }
    return {
      type: type === 'restaurant' || String(stop.placeType).toLowerCase() === 'restaurant' ? 'restaurant' : 'cafe',
      placeId: String(stop.placeId),
    }
  })
}

export function normalizeCourseStop(stop, index = 0) {
  const type = String(stop?.type ?? stop?.stopType ?? '').toLowerCase()
  if (type === 'event') {
    return {
      ...stop,
      type: 'event',
      stopType: 'EVENT',
      stopId: `event:${stop.eventId}`,
      title: stop.title ?? stop.name ?? stop.eventTitle ?? '행사',
      place: stop.place ?? stop.address ?? stop.eventPlace ?? '',
      district: stop.district ?? stop.eventDistrict ?? '',
      imageUrl: stop.imageUrl ?? stop.img ?? stop.eventImageUrl ?? '',
      latitude: stop.latitude ?? stop.eventLatitude,
      longitude: stop.longitude ?? stop.eventLongitude,
      order: stop.order ?? stop.stopOrder ?? index,
    }
  }
  const placeType = type === 'restaurant' || String(stop?.placeType).toLowerCase() === 'restaurant' ? 'restaurant' : 'cafe'
  return {
    ...stop,
    type: placeType,
    placeType,
    stopType: 'PLACE',
    stopId: `place:${stop.placeId}`,
    name: stop.name ?? (placeType === 'restaurant' ? '음식점' : '카페'),
    order: stop.order ?? stop.stopOrder ?? index,
  }
}

export function normalizeCourse(course) {
  if (!course) return course
  const stops = Array.isArray(course.stops)
    ? course.stops.map(normalizeCourseStop).sort((a, b) => a.order - b.order)
    : course.stops
  const previewStops = Array.isArray(course.previewStops)
    ? course.previewStops.map(normalizeCourseStop).sort((a, b) => a.order - b.order)
    : course.previewStops
  return {
    ...course,
    title: course.title ?? course.name,
    favorited: Boolean(course.favorited ?? course.favorite ?? course.isFavorite),
    stops,
    previewStops,
  }
}

export async function createCourse(course, signal) {
  const payload = { title: course.title ?? course.name, stops: serializeCourseStops(course.stops) }
  if (getDataMode() === 'mock') return saveLocally({ ...course, ...payload, stops: course.stops })
  const { data } = await api.post('/courses', payload, { signal })
  return normalizeCourse(data)
}

export async function getCourses(signal) {
  if (getDataMode() === 'mock') return readLocalCourses().map(normalizeCourse)
  try {
    const { data } = await api.get('/courses', { signal })
    const courses = Array.isArray(data) ? data : data?.courses || []
    return courses.map(normalizeCourse)
  } catch (error) {
    if (canUseCourseReadMock(error)) return readLocalCourses().map(normalizeCourse)
    throw error
  }
}

export async function getCourseDetail(courseId, signal) {
  const localDetail = () => normalizeCourse(readLocalCourses().find(course => String(course.courseId) === String(courseId)) || null)
  if (getDataMode() === 'mock') return localDetail()
  try {
    const { data } = await api.get(`/courses/${courseId}`, { signal })
    return normalizeCourse(data)
  } catch (error) {
    if (canUseCourseReadMock(error)) return localDetail()
    throw error
  }
}

export async function updateCourse(courseId, course, signal) {
  const payload = { title: course.title ?? course.name, version: Number(course.version), stops: serializeCourseStops(course.stops) }
  if (getDataMode() === 'mock') return updateLocally(courseId, { ...course, ...payload, stops: course.stops, version: payload.version + 1 })
  const { data } = await api.put(`/courses/${courseId}`, payload, { signal })
  return normalizeCourse(data)
}

export async function updateCourseFavorite(courseId, favorited, signal) {
  if (getDataMode() === 'mock') return updateLocally(courseId, { favorited, favorite: favorited })
  const { data } = await api.put(`/courses/${courseId}/favorite`, { favorited }, { signal })
  return normalizeCourse(data)
}

export async function deleteCourse(courseId, signal) {
  if (getDataMode() === 'mock') {
    writeLocalCourses(readLocalCourses().filter(course => String(course.courseId) !== String(courseId)))
    return
  }
  await api.delete(`/courses/${courseId}`, { signal })
}

export async function shareCourse(courseId, signal) {
  if (getDataMode() === 'mock') {
    const shareId = `local-${Date.now()}`
    updateLocally(courseId, { shareId, shared: true })
    return { shareId }
  }
  const { data } = await api.post(`/courses/${courseId}/share`, null, { signal })
  return data
}

export async function unshareCourse(courseId, signal) {
  if (getDataMode() === 'mock') return updateLocally(courseId, { shareId: null, shared: false })
  await api.delete(`/courses/${courseId}/share`, { signal })
}

export async function getSharedCourse(shareId, signal) {
  const localShared = () => normalizeCourse(readLocalCourses().find(course => course.shareId === shareId) || null)
  if (getDataMode() === 'mock') return localShared()
  try {
    const { data } = await api.get(`/courses/shared/${shareId}`, { signal })
    return normalizeCourse(data)
  } catch (error) {
    if (canUseCourseReadMock(error)) return localShared()
    throw error
  }
}

export function getCourseError(error, action = '저장') {
  const status = error.response?.status
  const code = error.response?.data?.code
  if (status === 400) return '코스 이름과 경로를 확인해 주세요.'
  if (status === 401) return '로그인 후 이용해 주세요.'
  if (status === 403) return '이 코스를 변경할 권한이 없습니다.'
  if (status === 404) return '코스를 찾을 수 없습니다.'
  if (status === 409 && code === 'COURSE_VERSION_CONFLICT') return '다른 곳에서 코스가 수정되었습니다. 최신 내용을 다시 연 뒤 수정해 주세요.'
  if (status === 409 && code === 'COURSE_LIMIT_EXCEEDED') return '코스는 최대 50개까지 저장할 수 있습니다.'
  return `코스를 ${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`
}
