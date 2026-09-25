import api from './axios'

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
