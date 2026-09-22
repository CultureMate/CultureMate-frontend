import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createComment,
  deleteComment,
  formatEventDate,
  getComments,
  getEventDetail,
  getMe,
} from '../api/culture'
import { useFavorites } from '../api/useFavorites'

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <p className="text-[#9CA3AF] text-[11px] font-medium">{label}</p>
        <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5 leading-tight">{value || '-'}</p>
      </div>
    </div>
  )
}

function formatCommentTime(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return value
  }
}

export default function EventDetail() {
  const { id } = useParams()
  const eventId = decodeURIComponent(id || '')
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [comments, setComments] = useState([])
  const [me, setMe] = useState(null)
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [error, setError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { isSaved, isBusy, toggle } = useFavorites()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getEventDetail(eventId), getComments(eventId).catch(() => []), getMe().catch(() => null)])
      .then(([detail, commentList, member]) => {
        if (cancelled) return
        setEvent(detail)
        setComments(commentList || [])
        setMe(member)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  const roots = useMemo(() => comments.filter((c) => !c.parentId), [comments])
  const repliesOf = (parentId) => comments.filter((c) => c.parentId === parentId)

  const submitComment = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (!me) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    setCommentError('')
    try {
      const created = await createComment({
        eventId,
        content: draft.trim(),
        parentId: replyTo || undefined,
      })
      setComments((prev) => [...prev, created])
      setDraft('')
      setReplyTo(null)
    } catch (err) {
      if (err.status === 401) navigate('/login')
      else setCommentError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.commentId !== commentId && c.parentId !== commentId))
    } catch (err) {
      setCommentError(err.message)
    }
  }

  if (loading) {
    return <p className="p-8 text-sm text-[#6B7280]">행사 정보를 불러오는 중…</p>
  }

  if (error || !event) {
    return (
      <div className="p-8">
        <p className="text-sm text-[#FF6B47] mb-4">{error || '행사를 찾을 수 없습니다.'}</p>
        <Link to="/events" className="text-[#FF6B47] font-semibold text-sm">
          ← 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="hidden lg:flex items-center px-5 md:px-8 lg:px-10 pt-4 pb-2 max-w-5xl mx-auto w-full">
        <button
          type="button"
          aria-label="목록으로"
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-sm"
        >
          <span className="text-[#1A1A2E] text-lg">←</span>
        </button>
      </div>

      <div className="relative h-56 md:h-72 lg:h-80 bg-gray-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-[#FFF0EC]">🎭</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <button
          type="button"
          aria-label="목록으로"
          onClick={() => navigate(-1)}
          className="lg:hidden absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-white text-lg">←</span>
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2 bg-[#D97706]">
            {event.category || '문화행사'}
          </span>
          <h1 className="font-display text-white text-2xl font-bold leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar">
        <div className="lg:flex lg:gap-6 lg:items-start max-w-5xl mx-auto px-5 md:px-8 lg:px-10 py-4">
          <div className="lg:flex-1 lg:min-w-0">
            <div className="bg-white rounded-2xl py-4 px-4 border border-[#F3F4F6] mb-4">
              <div className="grid grid-cols-2 gap-4">
                <Field icon="📅" label="기간" value={formatEventDate(event.startDate, event.endDate)} />
                <Field icon="📍" label="장소" value={event.place} />
                <Field icon="🏢" label="기관" value={event.organization} />
                <Field icon="💰" label="요금" value={event.fee || '확인 필요'} />
                <Field icon="🗺️" label="자치구" value={event.district} />
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">🔗</span>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-medium">원문 링크</p>
                    {event.originalUrl ? (
                      <a
                        href={event.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF6B47] text-sm font-semibold mt-0.5 leading-tight underline"
                      >
                        바로가기 →
                      </a>
                    ) : (
                      <p className="text-[#1A1A2E] text-sm font-semibold mt-0.5">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl py-4 px-4 border border-[#F3F4F6] mb-4">
              <h2 className="font-semibold text-[#1A1A2E] text-sm mb-3">댓글 {comments.length}</h2>
              {commentError && <p className="text-xs text-[#FF6B47] mb-2">{commentError}</p>}
              <div className="flex flex-col gap-4 mb-4">
                {roots.map((comment) => (
                  <div key={comment.commentId}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A2E]">회원 {comment.memberId}</p>
                        <p className="text-sm text-[#374151] mt-1 whitespace-pre-wrap">{comment.content}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-1">{formatCommentTime(comment.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button type="button" className="text-xs text-[#6B7280]" onClick={() => setReplyTo(comment.commentId)}>
                          답글
                        </button>
                        {me?.memberId === comment.memberId && (
                          <button type="button" className="text-xs text-[#EF4444]" onClick={() => onDelete(comment.commentId)}>
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-[#F3F4F6] pl-3">
                      {repliesOf(comment.commentId).map((reply) => (
                        <div key={reply.commentId} className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#1A1A2E]">회원 {reply.memberId}</p>
                            <p className="text-sm text-[#374151] mt-0.5 whitespace-pre-wrap">{reply.content}</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-1">{formatCommentTime(reply.createdAt)}</p>
                          </div>
                          {me?.memberId === reply.memberId && (
                            <button type="button" className="text-xs text-[#EF4444]" onClick={() => onDelete(reply.commentId)}>
                              삭제
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {roots.length === 0 && <p className="text-sm text-[#9CA3AF]">아직 댓글이 없습니다.</p>}
              </div>

              <form onSubmit={submitComment} className="flex flex-col gap-2">
                {replyTo && (
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>답글 작성 중</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="text-[#FF6B47]">
                      취소
                    </button>
                  </div>
                )}
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder={me ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#FF6B47]"
                />
                <button
                  type="submit"
                  disabled={submitting || !draft.trim()}
                  className="self-end px-4 py-2 rounded-xl bg-[#FF6B47] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {me ? '등록' : '로그인하고 작성'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:w-72 flex-shrink-0">
            <button
              type="button"
              disabled={isBusy(event.eventId)}
              onClick={() => toggle(event.eventId)}
              className="w-full py-3.5 rounded-2xl font-bold text-base bg-[#FF6B47] text-white shadow-lg shadow-[#FF6B47]/30 disabled:opacity-50"
            >
              {isSaved(event.eventId) ? '❤️ 관심 해제' : '🤍 관심 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
