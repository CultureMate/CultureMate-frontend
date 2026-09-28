import api from './axios'

export function getKakaoLoginUrl() {
  const defaultBaseUrl = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:8080/api'
  const baseUrl = (process.env.REACT_APP_AUTH_BASE_URL || defaultBaseUrl)
    .replace(/\/+$/, '')

  return `${baseUrl}/auth/kakao/start`
}

export async function getCurrentMember(signal) {
  try {
    const { data } = await api.get('/auth/me', { signal })
    if (!data || !Number.isInteger(data.memberId) || data.memberId <= 0) {
      throw new Error('회원 응답 형식을 확인해 주세요.')
    }
    return data
  } catch (error) {
    if (error.response?.status === 401) return null
    throw error
  }
}
