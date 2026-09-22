import api from './axios'

const CLIENT_ID_KEY = 'culturemate-client-id'

export function getClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY)
  if (existing) return existing
  const created = crypto.randomUUID()
  localStorage.setItem(CLIENT_ID_KEY, created)
  return created
}

function readError(error, fallback) {
  const data = error?.response?.data
  const err = new Error(data?.message || fallback)
  err.status = error?.response?.status
  err.code = data?.code
  return err
}

export async function getEvents(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
      else if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const { data } = await api.get(`/events?${params}`)
    return data
  } catch (error) {
    throw readError(error, '행사 목록을 불러오지 못했습니다.')
  }
}

export async function getEventDetail(eventId) {
  try {
    const { data } = await api.get('/events/detail', { params: { eventId } })
    return data
  } catch (error) {
    throw readError(error, '행사 상세를 불러오지 못했습니다.')
  }
}

export async function getFavorites() {
  try {
    const { data } = await api.get('/favorites', {
      headers: { 'X-Client-Id': getClientId() },
    })
    return data
  } catch (error) {
    throw readError(error, '관심 목록을 불러오지 못했습니다.')
  }
}

export async function addFavorite(eventId) {
  try {
    const { data } = await api.post(
      '/favorites',
      { eventId },
      { headers: { 'X-Client-Id': getClientId() } },
    )
    return data
  } catch (error) {
    throw readError(error, '관심 행사 저장에 실패했습니다.')
  }
}

export async function removeFavorite(eventId) {
  try {
    await api.delete('/favorites', {
      params: { eventId },
      headers: { 'X-Client-Id': getClientId() },
    })
  } catch (error) {
    throw readError(error, '관심 행사 해제에 실패했습니다.')
  }
}

export async function getMe() {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch (error) {
    if (error?.response?.status === 401) return null
    throw readError(error, '로그인 정보를 불러오지 못했습니다.')
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    throw readError(error, '로그아웃에 실패했습니다.')
  }
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api'
export const KAKAO_LOGIN_START = `${API_BASE_URL}/auth/kakao/start`

export async function getComments(eventId) {
  try {
    const { data } = await api.get('/comments', { params: { eventId } })
    return data
  } catch (error) {
    throw readError(error, '댓글을 불러오지 못했습니다.')
  }
}

export async function createComment({ eventId, content, parentId }) {
  try {
    const { data } = await api.post('/comments', { eventId, content, parentId })
    return data
  } catch (error) {
    throw readError(error, '댓글 작성에 실패했습니다.')
  }
}

export async function deleteComment(commentId) {
  try {
    await api.delete(`/comments/${commentId}`)
  } catch (error) {
    throw readError(error, '댓글 삭제에 실패했습니다.')
  }
}

export function formatEventDate(startDate, endDate) {
  if (!startDate && !endDate) return '일정 확인 필요'
  if (!endDate || startDate === endDate) return startDate || endDate
  return `${startDate} ~ ${endDate}`
}

export function eventPath(eventId) {
  return `/events/${encodeURIComponent(eventId)}`
}
