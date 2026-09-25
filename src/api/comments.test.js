import api from './axios'
import { createComment, deleteComment, getCommentError, getComments, updateComment } from './comments'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }))

const eventId = 'https://culture.seoul.go.kr/event?id=12&name=서울'
const comment = { commentId: 1, eventId, memberId: 7, parentId: null, content: ' 댓글 ', createdAt: '2026-09-25T01:00:00Z', updatedAt: '2026-09-25T01:00:00Z' }

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  for (const method of ['get', 'post', 'put', 'delete']) api[method].mockReset()
})
afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('loads public comments with a URL-shaped event ID', async () => {
  api.get.mockResolvedValue({ data: [comment] })
  const controller = new AbortController()
  await expect(getComments(eventId, controller.signal)).resolves.toEqual([{ ...comment, content: '댓글' }])
  expect(api.get).toHaveBeenCalledWith('/comments', { params: { eventId }, signal: controller.signal })
})

test('creates comments and optional replies with the documented body', async () => {
  api.post.mockResolvedValueOnce({ data: comment }).mockResolvedValueOnce({ data: { ...comment, commentId: 2, parentId: 1 } })
  await createComment(eventId, ' 댓글 ', null)
  await createComment(eventId, ' 답글 ', 1)
  expect(api.post.mock.calls[0]).toEqual(['/comments', { eventId, content: '댓글' }, { signal: undefined }])
  expect(api.post.mock.calls[1]).toEqual(['/comments', { eventId, content: '답글', parentId: 1 }, { signal: undefined }])
})

test('updates and deletes by numeric comment ID', async () => {
  api.put.mockResolvedValue({ data: { ...comment, content: '수정 댓글' } })
  await expect(updateComment(comment, ' 수정 댓글 ')).resolves.toMatchObject({ content: '수정 댓글' })
  expect(api.put).toHaveBeenCalledWith('/comments/1', { content: '수정 댓글' }, { signal: undefined })
  api.delete.mockResolvedValue({ status: 204 })
  await deleteComment(1)
  expect(api.delete).toHaveBeenCalledWith('/comments/1', { signal: undefined })
})

test('mock comments are read locally without an API call', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  const comments = await getComments('mock-1')
  expect(comments).toHaveLength(2)
  expect(comments[1].parentId).toBe(comments[0].commentId)
  expect(comments.every(item => item.isMock)).toBe(true)
  expect(api.get).not.toHaveBeenCalled()
})

test('malformed comment responses are rejected', async () => {
  for (const data of [{}, [{ ...comment, eventId: 'other' }], [{ ...comment, memberId: null }], [{ ...comment, content: ' ' }]]) {
    api.get.mockResolvedValueOnce({ data })
    await expect(getComments(eventId)).rejects.toThrow('응답 형식')
  }
})

test('comment errors distinguish authentication and ownership failures', () => {
  expect(getCommentError({ response: { status: 401 } })).toContain('로그인')
  expect(getCommentError({ response: { status: 403 } })).toContain('본인')
  expect(getCommentError({ response: { status: 404 } })).toContain('찾을 수 없습니다')
  expect(getCommentError({ response: { status: 400 } })).toContain('내용')
  expect(getCommentError({ code: 'ECONNABORTED' }, '작성')).toContain('지연')
})
