export const COURSE_DRAFT_KEY = 'culturemate.course-draft.v1'
export const COURSE_DRAFT_CHANGED = 'culturemate:course-draft-changed'

const getEventId = event => String(event?.eventId ?? '').trim()

export function toCourseEvent(event) {
  return {
    eventId: getEventId(event),
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
    return Array.isArray(value)
      ? value.filter(item => getEventId(item)).map(toCourseEvent)
      : []
  } catch {
    return []
  }
}

export function writeCourseDraft(events) {
  const next = events.filter(item => getEventId(item)).map(toCourseEvent)
  localStorage.setItem(COURSE_DRAFT_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(COURSE_DRAFT_CHANGED, { detail: next }))
  return next
}

export function toggleCourseEvent(event) {
  const current = readCourseDraft()
  const id = getEventId(event)
  if (!id) return current

  return writeCourseDraft(
    current.some(item => getEventId(item) === id)
      ? current.filter(item => getEventId(item) !== id)
      : [...current, event]
  )
}
