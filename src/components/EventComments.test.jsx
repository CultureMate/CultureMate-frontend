import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EventComments from './EventComments'
import { getCurrentMember } from '../api/auth'
import { createComment, deleteComment, getComments, updateComment } from '../api/comments'

jest.mock('../api/auth', () => ({ getCurrentMember: jest.fn() }))
jest.mock('../api/comments', () => ({
  getComments: jest.fn(), createComment: jest.fn(), updateComment: jest.fn(), deleteComment: jest.fn(),
  getCommentError: error => error.message || `HTTP ${error.response?.status}`,
}))

const event = { eventId: 'event-1', title: '행사' }
const root = { commentId: 1, eventId: 'event-1', memberId: 7, parentId: null, content: '첫 댓글', createdAt: '2026-09-25T01:00:00Z', updatedAt: '2026-09-25T01:00:00Z' }
const reply = { commentId: 2, eventId: 'event-1', memberId: 8, parentId: 1, content: '첫 답글', createdAt: '2026-09-25T02:00:00Z', updatedAt: '2026-09-25T02:00:00Z' }
const renderComments = (value = event) => render(<MemoryRouter><EventComments event={value} /></MemoryRouter>)

beforeEach(() => {
  for (const mock of [getCurrentMember, getComments, createComment, updateComment, deleteComment]) mock.mockReset()
  getComments.mockResolvedValue([])
  getCurrentMember.mockResolvedValue(null)
})

test('guests can read threaded comments and receive a login link', async () => {
  getComments.mockResolvedValue([root, reply])
  renderComments()
  expect(await screen.findByText('첫 댓글')).toBeInTheDocument()
  expect(screen.getByText('첫 답글')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
  expect(screen.queryByRole('form', { name: '댓글 작성' })).not.toBeInTheDocument()
  expect(within(screen.getByLabelText('댓글 1의 답글')).getByText('첫 답글')).toBeInTheDocument()
})

test('members create a comment and reply with immediate list updates', async () => {
  getCurrentMember.mockResolvedValue({ memberId: 7, nickname: '문화인' })
  createComment.mockImplementation((eventId, content, parentId) => Promise.resolve({
    commentId: parentId ? 2 : 1, eventId, memberId: 7, parentId, content, createdAt: '2026-09-25T01:00:00Z', updatedAt: '2026-09-25T01:00:00Z',
  }))
  renderComments()
  const form = await screen.findByRole('form', { name: '댓글 작성' })
  fireEvent.change(within(form).getByRole('textbox'), { target: { value: ' 새 댓글 ' } })
  fireEvent.submit(form)
  expect(await screen.findByText('새 댓글')).toBeInTheDocument()
  expect(createComment).toHaveBeenCalledWith('event-1', '새 댓글', null)
  await waitFor(() => expect(screen.getByRole('button', { name: '답글' })).not.toBeDisabled())
  fireEvent.click(screen.getByRole('button', { name: '답글' }))
  const replyForm = screen.getByRole('form', { name: '댓글 1에 답글 작성' })
  fireEvent.change(within(replyForm).getByRole('textbox'), { target: { value: '새 답글' } })
  fireEvent.submit(replyForm)
  await waitFor(() => expect(createComment).toHaveBeenCalledTimes(2))
  expect(createComment).toHaveBeenLastCalledWith('event-1', '새 답글', 1)
  expect(await screen.findByText('새 답글')).toBeInTheDocument()
})

test('only the current member receives edit and delete controls', async () => {
  getCurrentMember.mockResolvedValue({ memberId: 7 })
  getComments.mockResolvedValue([root, reply])
  updateComment.mockResolvedValue({ ...root, content: '수정한 댓글', updatedAt: '2026-09-25T03:00:00Z' })
  deleteComment.mockResolvedValue()
  renderComments()
  await screen.findByText('첫 댓글')
  expect(screen.getAllByRole('button', { name: '수정' })).toHaveLength(1)
  expect(screen.getAllByRole('button', { name: '삭제' })).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: '수정' }))
  const editForm = screen.getByRole('form', { name: '댓글 1 수정' })
  fireEvent.change(within(editForm).getByRole('textbox'), { target: { value: '수정한 댓글' } })
  fireEvent.submit(editForm)
  expect(await screen.findByText('수정한 댓글')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled())
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  await waitFor(() => expect(screen.queryByText('수정한 댓글')).not.toBeInTheDocument())
  expect(deleteComment).toHaveBeenCalledWith(1)
})

test('the current member can also edit and delete a reply', async () => {
  getCurrentMember.mockResolvedValue({ memberId: 7 })
  getComments.mockResolvedValue([{ ...root, memberId: 8 }, { ...reply, memberId: 7 }])
  updateComment.mockResolvedValue({ ...reply, memberId: 7, content: '수정한 답글', updatedAt: '2026-09-25T03:00:00Z' })
  deleteComment.mockResolvedValue()
  renderComments()
  await screen.findByText('첫 답글')
  fireEvent.click(screen.getByRole('button', { name: '수정' }))
  const editForm = screen.getByRole('form', { name: '답글 2 수정' })
  fireEvent.change(within(editForm).getByRole('textbox'), { target: { value: '수정한 답글' } })
  fireEvent.submit(editForm)
  expect(await screen.findByText('수정한 답글')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled())
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  await waitFor(() => expect(screen.queryByText('수정한 답글')).not.toBeInTheDocument())
  expect(deleteComment).toHaveBeenCalledWith(2)
})

test('a 401 mutation switches the composer to login guidance', async () => {
  getCurrentMember.mockResolvedValue({ memberId: 7 })
  createComment.mockRejectedValue({ response: { status: 401 }, message: '로그인 필요' })
  renderComments()
  const form = await screen.findByRole('form', { name: '댓글 작성' })
  fireEvent.change(within(form).getByRole('textbox'), { target: { value: '댓글' } })
  fireEvent.submit(form)
  expect(await screen.findByRole('alert')).toHaveTextContent('로그인 필요')
  expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
})

test('load failure can be retried and old event results are ignored', async () => {
  let resolveOld
  getComments.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    .mockResolvedValueOnce([{ ...root, eventId: 'event-2', content: '새 행사 댓글' }])
  const { rerender } = renderComments()
  await waitFor(() => expect(getComments).toHaveBeenCalledTimes(1))
  const oldSignal = getComments.mock.calls[0][1]
  rerender(<MemoryRouter><EventComments event={{ ...event, eventId: 'event-2' }} /></MemoryRouter>)
  expect(await screen.findByText('새 행사 댓글')).toBeInTheDocument()
  expect(oldSignal.aborted).toBe(true)
  await act(async () => resolveOld([root]))
  expect(screen.queryByText('첫 댓글')).not.toBeInTheDocument()
})

test('mock events show sample comments as read-only without checking auth', async () => {
  getComments.mockResolvedValue([{ ...root, eventId: 'mock-1', isMock: true }])
  renderComments({ ...event, eventId: 'mock-1', isMock: true })
  expect(await screen.findByText('첫 댓글')).toBeInTheDocument()
  expect(screen.getByText('샘플 · 조회만 가능')).toBeInTheDocument()
  expect(getCurrentMember).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: '답글' })).not.toBeInTheDocument()
})
