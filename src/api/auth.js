import api from './axios'

let currentMemberRequest = null
let currentMemberCache = null
let hasCurrentMemberCache = false
let currentMemberCacheVersion = 0

export function setCurrentMemberCache(member) {
  currentMemberCacheVersion += 1
  currentMemberRequest = null
  currentMemberCache = member
  hasCurrentMemberCache = true
}

export function resetCurrentMemberCache() {
  currentMemberCacheVersion += 1
  currentMemberRequest = null
  currentMemberCache = null
  hasCurrentMemberCache = false
}

export function getKakaoLoginUrl() {
  const defaultBaseUrl = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:8080/api'
  const baseUrl = (process.env.REACT_APP_AUTH_BASE_URL || defaultBaseUrl)
    .replace(/\/+$/, '')

  return `${baseUrl}/auth/kakao/start`
}

export function getCurrentMember() {
  if (hasCurrentMemberCache) {
    return Promise.resolve(currentMemberCache)
  }
  if (currentMemberRequest) return currentMemberRequest

  // Component-level AbortSignals must not cancel this shared request. React
  // StrictMode can clean up one consumer while another still needs the result.
  const requestVersion = currentMemberCacheVersion
  const request = api.get('/auth/me')
    .then(({ status, data }) => {
      // 비로그인은 204(본문 없음)로 온다. 아래 catch의 401 처리는 204 이전 백엔드와의 호환용이다.
      const member = status === 204 ? null : data
      if (member !== null && (!member || !Number.isInteger(member.memberId) || member.memberId <= 0)) {
        throw new Error('회원 응답 형식을 확인해 주세요.')
      }
      if (requestVersion !== currentMemberCacheVersion) {
        return hasCurrentMemberCache ? currentMemberCache : member
      }
      currentMemberCache = member
      hasCurrentMemberCache = true
      currentMemberRequest = null
      return member
    })
    .catch(error => {
      if (requestVersion !== currentMemberCacheVersion) {
        if (hasCurrentMemberCache) return currentMemberCache
        throw error
      }
      currentMemberRequest = null
      if (error.response?.status === 401) {
        currentMemberCache = null
        hasCurrentMemberCache = true
        return null
      }
      throw error
    })

  currentMemberRequest = request
  return request
}
