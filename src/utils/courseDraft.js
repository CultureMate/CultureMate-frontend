export const COURSE_DRAFT_KEY = 'culturemate.course-draft.v1'
export const COURSE_BUILDER_KEY = 'culturemate.course-builder.v1'
export const COURSE_EDIT_SESSION_KEY = 'culturemate.course-edit.v1'
export const COURSE_DRAFT_CHANGED = 'culturemate:course-draft-changed'

const eventId = event => String(event?.eventId ?? '').trim()

export function toCourseEvent(event) {
  return {
    eventId: eventId(event),
    title: event?.title || '제목 없음',
    place: event?.place || '',
    district: event?.district || '',
    category: event?.category || '',
    startDate: event?.startDate || '',
    endDate: event?.endDate || '',
    imageUrl: event?.imageUrl || event?.img || '',
    latitude: event?.latitude ?? event?.lat ?? null,
    longitude: event?.longitude ?? event?.lng ?? null,
  }
}

export function readCourseDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(COURSE_DRAFT_KEY) || '[]')
    return Array.isArray(value) ? value.filter(item => eventId(item)).map(toCourseEvent) : []
  } catch {
    return []
  }
}

export function writeCourseDraft(events) {
  const next = events.filter(item => eventId(item)).map(toCourseEvent)
  localStorage.setItem(COURSE_DRAFT_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(COURSE_DRAFT_CHANGED, { detail: next }))
  return next
}

export function toggleCourseEvent(event) {
  const current = readCourseDraft()
  const id = eventId(event)
  if (!id) return current
  return writeCourseDraft(current.some(item => eventId(item) === id)
    ? current.filter(item => eventId(item) !== id)
    : [...current, event])
}

export function readCourseBuilder() {
  try {
    const value = JSON.parse(localStorage.getItem(COURSE_BUILDER_KEY) || '{}')
    const builder = { title: typeof value.title === 'string' ? value.title : '', stops: Array.isArray(value.stops) ? value.stops.map(toCourseBuilderStop) : [] }
    if (JSON.stringify(builder) !== JSON.stringify(value)) localStorage.setItem(COURSE_BUILDER_KEY, JSON.stringify(builder))
    return builder
  } catch {
    return { title: '', stops: [] }
  }
}

export function writeCourseBuilder(builder) {
  const value = {
    title: typeof builder?.title === 'string' ? builder.title : '',
    stops: Array.isArray(builder?.stops) ? builder.stops.map(toCourseBuilderStop) : [],
  }
  localStorage.setItem(COURSE_BUILDER_KEY, JSON.stringify(value))
  return value
}

export function readCourseEditSession() {
  try {
    const value = JSON.parse(localStorage.getItem(COURSE_EDIT_SESSION_KEY) || 'null')
    const courseId = value?.courseId
    const version = Number(value?.version)
    const validCourseId = (typeof courseId === 'string' && courseId.trim()) || Number.isFinite(courseId)
    if (!validCourseId || !Number.isInteger(version) || version < 0) return null
    return { courseId, version }
  } catch {
    return null
  }
}

export function writeCourseEditSession(course) {
  const courseId = course?.courseId
  const version = Number(course?.version)
  const validCourseId = (typeof courseId === 'string' && courseId.trim()) || Number.isFinite(courseId)
  if (!validCourseId || !Number.isInteger(version) || version < 0) {
    localStorage.removeItem(COURSE_EDIT_SESSION_KEY)
    return null
  }
  const value = { courseId, version }
  localStorage.setItem(COURSE_EDIT_SESSION_KEY, JSON.stringify(value))
  return value
}

export function clearCourseEditSession() {
  localStorage.removeItem(COURSE_EDIT_SESSION_KEY)
}

export function readActiveCourseEditSession() {
  const session = readCourseEditSession()
  if (!session) return null
  const builder = readCourseBuilder()
  if (builder.title.trim() || builder.stops.length || readCourseDraft().length) return session
  clearCourseEditSession()
  return null
}

function toCourseBuilderStop(stop) {
  if (stop?.stopType === 'PLACE' || String(stop?.type).toLowerCase() === 'cafe' || String(stop?.type).toLowerCase() === 'restaurant') {
    const placeType = String(stop?.placeType ?? stop?.type).toLowerCase() === 'restaurant' ? 'restaurant' : 'cafe'
    return {
      stopId: stop.stopId || `place:${stop.placeId}`,
      stopType: 'PLACE',
      placeId: String(stop.placeId ?? ''),
      placeType,
    }
  }
  return stop
}
