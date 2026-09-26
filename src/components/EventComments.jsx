import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentMember } from '../api/auth'
import { createComment, deleteComment, getCommentError, getComments, updateComment } from '../api/comments'

function formatCommentDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function CommentForm({ label, placeholder, initialValue = '', submitting, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialValue)
  const submit = async event => {
    event.preventDefault()
    if (submitting) return
    const value = content.trim()
    if (!value) return
    if (await onSubmit(value)) setContent('')
  }
  return <form aria-label={label} onSubmit={submit} className="mt-3">
    <textarea value={content} onChange={event => setContent(event.target.value)} required rows="3" placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A1A2E] focus:border-[#FF6B47] focus:outline-none" />
    <div className="mt-2 flex justify-end gap-3">
      {onCancel && <button type="button" onClick={onCancel} disabled={submitting} className="text-sm text-[#6B7280] disabled:opacity-50">취소</button>}
      <button type="submit" disabled={submitting || !content.trim()} className="rounded-xl bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {submitting ? '처리 중' : '등록'}
      </button>
    </div>
  </form>
}

function CommentItem({ comment, replies, member, submitting, onReply, onUpdate, onDelete }) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const mine = member?.memberId === comment.memberId
  const edited = comment.updatedAt && comment.createdAt && comment.updatedAt !== comment.createdAt
  return <article className="border-t border-[#F3F4F6] py-4 first:border-t-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#374151]">{mine ? '나' : `회원 ${comment.memberId}`}</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">{formatCommentDate(comment.createdAt)}{edited ? ' · 수정됨' : ''}</p>
      </div>
      <div className="flex shrink-0 gap-3 text-xs">
        {member && <button type="button" disabled={submitting} onClick={() => setReplying(value => !value)} className="text-[#6B7280] disabled:opacity-50">답글</button>}
        {mine && <button type="button" disabled={submitting} onClick={() => setEditing(true)} className="text-[#6B7280] disabled:opacity-50">수정</button>}
        {mine && <button type="button" disabled={submitting} onClick={() => onDelete(comment)} className="text-[#FF6B47] disabled:opacity-50">삭제</button>}
      </div>
    </div>
    {editing ? <CommentForm label={`댓글 ${comment.commentId} 수정`} initialValue={comment.content} submitting={submitting}
      onSubmit={async content => { const ok = await onUpdate(comment, content); if (ok) setEditing(false); return false }} onCancel={() => setEditing(false)} />
      : <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#1A1A2E]">{comment.content}</p>}
    {replying && <CommentForm label={`댓글 ${comment.commentId}에 답글 작성`} placeholder="답글을 입력하세요" submitting={submitting}
      onSubmit={async content => { const ok = await onReply(comment.commentId, content); if (ok) setReplying(false); return ok }} onCancel={() => setReplying(false)} />}
    {replies.length > 0 && <div aria-label={`댓글 ${comment.commentId}의 답글`} className="mt-4 space-y-3 border-l-2 border-[#FFF0EC] pl-4">
      {replies.map(reply => <ReplyItem key={reply.commentId} reply={reply} member={member} submitting={submitting} onUpdate={onUpdate} onDelete={onDelete} />)}
    </div>}
  </article>
}

function ReplyItem({ reply, member, submitting, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const mine = member?.memberId === reply.memberId
  return <div className="rounded-xl bg-[#FAFAF8] p-3">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-semibold text-[#374151]">{mine ? '나' : `회원 ${reply.memberId}`}</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">{formatCommentDate(reply.createdAt)}{reply.updatedAt && reply.updatedAt !== reply.createdAt ? ' · 수정됨' : ''}</p></div>
      {mine && <div className="flex gap-3 text-xs">
        <button type="button" disabled={submitting} onClick={() => setEditing(true)} className="text-[#6B7280] disabled:opacity-50">수정</button>
        <button type="button" disabled={submitting} onClick={() => onDelete(reply)} className="text-[#FF6B47] disabled:opacity-50">삭제</button>
      </div>}
    </div>
    {editing ? <CommentForm label={`답글 ${reply.commentId} 수정`} initialValue={reply.content} submitting={submitting}
      onSubmit={async content => { const ok = await onUpdate(reply, content); if (ok) setEditing(false); return false }} onCancel={() => setEditing(false)} />
      : <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#1A1A2E]">{reply.content}</p>}
  </div>
}

export default function EventComments({ event }) {
  const [retry, setRetry] = useState(0)
  const [comments, setComments] = useState([])
  const [member, setMember] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError(null)
      setActionError(null)
      try {
        const data = await getComments(event.eventId, controller.signal)
        if (!controller.signal.aborted) setComments(data)
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [event.eventId, retry])

  useEffect(() => {
    if (event.isMock) { setMember(null); return undefined }
    const controller = new AbortController()
    setMember(undefined)
    getCurrentMember(controller.signal)
      .then(data => { if (!controller.signal.aborted) setMember(data) })
      .catch(() => { if (!controller.signal.aborted) setMember(null) })
    return () => controller.abort()
  }, [event.eventId, event.isMock])

  const roots = useMemo(() => {
    const topLevelIds = new Set(comments.filter(comment => comment.parentId == null).map(comment => comment.commentId))
    return comments.filter(comment => comment.parentId == null || !topLevelIds.has(comment.parentId))
  }, [comments])
  const repliesFor = commentId => comments.filter(comment => comment.parentId === commentId)

  const runAction = async action => {
    setSubmitting(true)
    setActionError(null)
    try {
      await action()
      return true
    } catch (requestError) {
      setActionError(requestError)
      if (requestError.response?.status === 401) setMember(null)
      return false
    } finally { setSubmitting(false) }
  }
  const add = (parentId, content) => runAction(async () => {
    const created = await createComment(event.eventId, content, parentId)
    setComments(items => [...items, created])
  })
  const update = (comment, content) => {
    if (content === null) return false
    return runAction(async () => {
      const updated = await updateComment(comment, content)
      setComments(items => items.map(item => item.commentId === updated.commentId ? updated : item))
    })
  }
  const remove = comment => runAction(async () => {
    await deleteComment(comment.commentId)
    setComments(items => items.filter(item => item.commentId !== comment.commentId))
  })

  return <section aria-label="댓글" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 mb-4">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-bold text-[#1A1A2E]">댓글 <span className="text-[#FF6B47]">{comments.length}</span></h2>
      {event.isMock && <span className="text-xs text-[#9CA3AF]">샘플 · 조회만 가능</span>}
    </div>
    {!event.isMock && member === undefined && <p role="status" className="mt-3 text-sm text-[#6B7280]">로그인 상태를 확인하고 있습니다.</p>}
    {!event.isMock && member === null && <p className="mt-3 text-sm text-[#6B7280]"><Link to="/login" className="font-semibold text-[#FF6B47] underline">로그인</Link> 후 댓글과 답글을 작성할 수 있습니다.</p>}
    {member && <CommentForm label="댓글 작성" placeholder="행사에 대한 이야기를 남겨보세요" submitting={submitting} onSubmit={content => add(null, content)} />}
    {actionError && <p role="alert" className="mt-3 rounded-xl bg-[#FFF0EC] px-3 py-2 text-sm text-[#B93820]">{getCommentError(actionError, '처리')}</p>}
    <div className="mt-4">
      {loading && <p role="status" className="py-5 text-sm text-[#6B7280]">댓글을 불러오는 중입니다.</p>}
      {error && <div role="alert" className="py-5 text-sm text-[#6B7280]"><p>{getCommentError(error)}</p>
        <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 font-semibold text-[#FF6B47]">다시 시도</button></div>}
      {!loading && !error && comments.length === 0 && <p className="py-5 text-sm text-[#6B7280]">첫 댓글을 남겨보세요.</p>}
      {!loading && !error && roots.map(comment => <CommentItem key={comment.commentId} comment={comment} replies={repliesFor(comment.commentId)}
        member={member} submitting={submitting} onReply={(parentId, content) => add(parentId, content)} onUpdate={update} onDelete={remove} />)}
    </div>
  </section>
}
