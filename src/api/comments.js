import api from './axios'
import { getDataMode } from './dataMode'

const MOCK_COMMENTS = [
  { commentId: 1, eventId: 'mock-1', memberId: 101, parentId: null, content: '관심 있던 행사인데 소개를 보니 더 기대돼요!', createdAt: '2026-09-24T01:00:00Z', updatedAt: '2026-09-24T01:00:00Z' },
  { commentId: 2, eventId: 'mock-1', memberId: 102, parentId: 1, content: '저도 주말에 방문해 보려고요.', createdAt: '2026-09-24T02:00:00Z', updatedAt: '2026-09-24T02:00:00Z' },
]

function normalizeComment(comment, eventId) {
  const parentValid = comment?.parentId == null || (Number.isInteger(comment.parentId) && comment.parentId > 0)
  if (!comment || !Number.isInteger(comment.commentId) || comment.commentId <= 0
    || String(comment.eventId) !== String(eventId)
    || !Number.isInteger(comment.memberId) || comment.memberId <= 0
    || !parentValid || typeof comment.content !== 'string' || !comment.content.trim()) {
    throw new Error('댓글 응답 형식을 확인해 주세요.')
  }
  return { ...comment, content: comment.content.trim() }
}

export async function getComments(eventId, signal) {
  const mode = getDataMode()
  if (mode === 'mock' || (mode === 'auto' && eventId.startsWith('mock-'))) {
    return MOCK_COMMENTS.filter(comment => comment.eventId === eventId).map(comment => ({ ...comment, isMock: true }))
  }
  const { data } = await api.get('/comments', { params: { eventId }, signal })
  if (!Array.isArray(data)) throw new Error('댓글 응답 형식을 확인해 주세요.')
  return data.map(comment => normalizeComment(comment, eventId))
}

export async function createComment(eventId, content, parentId, signal) {
  const body = { eventId, content: content.trim() }
  if (parentId != null) body.parentId = parentId
  const { data } = await api.post('/comments', body, { signal })
  return normalizeComment(data, eventId)
}

export async function updateComment(comment, content, signal) {
  const { data } = await api.put(`/comments/${comment.commentId}`, { content: content.trim() }, { signal })
  return normalizeComment(data, comment.eventId)
}

export async function deleteComment(commentId, signal) {
  await api.delete(`/comments/${commentId}`, { signal })
}

export function getCommentError(error, action = '불러오기') {
  const status = error.response?.status
  if (status === 401) return '로그인이 필요하거나 로그인 시간이 만료되었습니다.'
  if (status === 403) return '본인이 작성한 댓글만 변경할 수 있습니다.'
  if (status === 404) return '댓글 또는 행사를 찾을 수 없습니다.'
  if (status === 400) return '댓글 내용을 확인해 주세요.'
  if (error.code === 'ECONNABORTED') return `댓글 ${action} 요청이 지연되고 있습니다.`
  return `댓글 ${action}에 실패했습니다. 잠시 후 다시 시도해 주세요.`
}
