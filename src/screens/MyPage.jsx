import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentMember, setCurrentMemberCache } from '../api/auth'
import api from '../api/axios'
import { CATEGORIES, DISTRICTS } from '../data/events'
import { clearCourseEditSession } from '../utils/courseDraft'
import Icon from '../components/Icon'

const CAT_ICONS = {
  공연: '🎭',
  전시: '🖼️',
  '교육/체험': '🎨',
  스포츠: '⚽',
  음악: '🎵',
  영화: '🎬',
  '축제/행사': '🎪',
  '문화/예술': '🏛️',
}

export default function MyPage() {
 const navigate = useNavigate()
 const location = useLocation()
 const interestSectionRef = useRef(null)

 const openInterestEdit =
   new URLSearchParams(location.search).get('edit') === 'interests'

  const [member, setMember] = useState(null)
  const [nickname, setNickname] = useState('')
  const [residence, setResidence] = useState('')
  const [interests, setInterests] = useState(new Set())

  const [editMode, setEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadMember = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getCurrentMember(
          controller.signal
        )

        if (!data) {
          navigate('/login', { replace: true })
          return
        }

        setMember(data)
        setNickname(data.nickname ?? '')
        setResidence(data.residence ?? '')
        setInterests(
          new Set(data.interestCategories ?? [])
        )
      } catch (err) {
        if (
          err.name === 'CanceledError' ||
          err.name === 'AbortError'
        ) {
          return
        }

        console.error('회원정보 조회 실패:', err)
        setError('회원정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadMember()

    return () => controller.abort()
  }, [navigate])

 useEffect(() => {
  if (!openInterestEdit || !member) return

  setEditMode(true)
  navigate(location.pathname, { replace: true })

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
if (typeof interestSectionRef.current?.scrollIntoView === 'function') {
  interestSectionRef.current.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}
    })
  })
}, [openInterestEdit, member, navigate, location.pathname])

  const handleEditStart = () => {
    setNickname(member?.nickname ?? '')
    setResidence(member?.residence ?? '')
    setInterests(
      new Set(member?.interestCategories ?? [])
    )
    setError('')
    setEditMode(true)
  }

  const handleEditCancel = () => {
    setNickname(member?.nickname ?? '')
    setResidence(member?.residence ?? '')
    setInterests(
      new Set(member?.interestCategories ?? [])
    )
    setError('')
    setEditMode(false)
  }

  const handleSave = async () => {
    if (
      nickname.trim().length < 2 ||
      !residence ||
      saving
    ) {
      return
    }

    try {
      setSaving(true)
      setError('')

      const { data } = await api.put('/auth/me', {
        nickname: nickname.trim(),
        residence,
        interestCategories: [...interests],
      })

      const updatedMember = {
        ...member,
        ...data,
        nickname:
          data?.nickname ?? nickname.trim(),
        residence:
          data?.residence ?? residence,
        interestCategories:
          data?.interestCategories ??
          [...interests],
      }

      setMember(updatedMember)
      setCurrentMemberCache(updatedMember)
      setNickname(updatedMember.nickname ?? '')
      setResidence(updatedMember.residence ?? '')
      setInterests(
        new Set(
          updatedMember.interestCategories ?? []
        )
      )

      setEditMode(false)
    } catch (err) {
      console.error('회원정보 수정 실패:', err)

      if (err.response?.status === 401) {
        setCurrentMemberCache(null)
        navigate('/login', { replace: true })
        return
      }

      setError('회원정보 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = category => {
    if (!editMode || saving) return

    setInterests(prev => {
      const next = new Set(prev)

      if (next.has(category)) {
        next.delete(category)
      } else {
        if (next.size >= 10) {
          return prev
        }

        next.add(category)
      }

      return next
    })
  }

  const handleLogout = async () => {
    if (loggingOut) return

    try {
      setLoggingOut(true)
      setError('')

      await api.post('/auth/logout')

      setCurrentMemberCache(null)
      clearCourseEditSession()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('로그아웃 실패:', err)

      if (err.response?.status === 401) {
        setCurrentMemberCache(null)
        clearCourseEditSession()
        navigate('/login', { replace: true })
        return
      }

      setError(
        '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setLoggingOut(false)
    }
  }

  const openDeleteConfirm = () => {
    setDeleteError('')
    setShowDeleteConfirm(true)
  }

  const closeDeleteConfirm = () => {
    if (deleting) return

    setDeleteError('')
    setShowDeleteConfirm(false)
  }

  const handleDeleteMember = async () => {
    if (deleting) return

    try {
      setDeleting(true)
      setDeleteError('')

      await api.delete('/auth/me')

      setCurrentMemberCache(null)
      clearCourseEditSession()
      setShowDeleteConfirm(false)
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('회원탈퇴 실패:', err)

      if (err.response?.status === 401) {
        setCurrentMemberCache(null)
        clearCourseEditSession()
        navigate('/login', { replace: true })
        return
      }

      setDeleteError(
        '회원탈퇴 처리에 실패했습니다.'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div role="status" className="min-h-full bg-canvas px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-8 lg:px-10">
        <span className="sr-only">회원정보를 불러오는 중...</span>
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#E9ECEF]" />
            <div className="space-y-2">
              <div className="h-6 w-32 rounded-lg bg-[#E9ECEF]" />
              <div className="h-4 w-20 rounded-lg bg-[#E9ECEF]" />
            </div>
          </div>
          <div className="mt-6 h-20 rounded-2xl bg-[#E9ECEF]" />
          <div className="mt-4 h-40 rounded-2xl bg-[#E9ECEF]" />
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-full bg-canvas flex items-center justify-center px-6">
        <p className="text-ink-muted text-sm font-medium text-center">
          {error ||
            '회원정보를 확인할 수 없습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <header className="bg-white px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-8 md:pt-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="mb-4 text-lg font-bold text-ink md:hidden">마이</p>
          <div className="flex items-center gap-4">
            <div aria-hidden="true" className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A5B] to-[#FF5A3C] text-2xl font-bold text-white">
              {(member.nickname || '사용자').slice(0, 1)}
            </div>

            <div className="min-w-0">
              <h1 className="font-display truncate text-2xl font-bold text-ink">
                {member.nickname || '사용자'}
              </h1>

              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#FEE500]/40 py-0.5 pl-1 pr-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FEE500] text-[8px] font-black text-[#191919]">
                  K
                </span>
                <span className="text-xs font-semibold text-ink-soft">
                  카카오 로그인
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 divide-x divide-black/[0.06] rounded-2xl bg-[#F2F4F6] py-4">
            <div className="flex flex-col items-center gap-1">
              <p className="flex items-center gap-1 text-xs font-medium text-ink-muted">
                <Icon name="pin" size={14} />
                거주지
              </p>
              <p className="text-base font-bold text-ink">
                {member.residence || '-'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/favorites')}
              className="flex flex-col items-center gap-1"
            >
              <span className="flex items-center gap-1 text-xs font-medium text-ink-muted">
                <Icon name="heart" size={14} />
                저장한 행사
              </span>
              <span className="text-base font-bold text-ink">
                {member.favoriteCount ?? 0}개
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start pt-5">
          {/* 왼쪽 */}
          <div className="flex flex-col gap-4">
            {/* 회원정보 */}
            <div className="w-full bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="px-5 pt-5 pb-1 flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-bold text-ink text-base">
                  <Icon name="user" size={18} className="text-ink-muted" />
                  회원 정보
                </p>

                {!editMode && (
                  <button
                    type="button"
                    onClick={handleEditStart}
                    className="rounded-lg bg-[#F2F4F6] px-3 py-1.5 text-xs font-bold text-ink-soft hover:bg-[#E9ECEF]"
                  >
                    수정
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="px-5 py-4">
                  <p className="text-xs text-ink-soft font-semibold mb-2">
                    닉네임
                  </p>

                  <input
                    type="text"
                    value={nickname}
                    onChange={e =>
                      setNickname(e.target.value)
                    }
                    maxLength={10}
                    className="mb-5 h-12 w-full rounded-xl border border-transparent bg-[#F2F4F6] px-4 text-[15px] text-ink outline-none transition-colors focus:border-coral focus:bg-white"
                  />

                  <p className="text-xs text-ink-soft font-semibold mb-2">
                    거주 구 선택
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto hide-scrollbar">
                    {DISTRICTS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          setResidence(d)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          d === residence
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink-soft border-black/10 hover:border-black/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                                  <div
                    ref={interestSectionRef}
                    className="scroll-mt-6"
                  >
                    <p className="text-xs text-ink-soft font-semibold mb-1">
                      관심 카테고리
                    </p>

                    <p className="text-[11px] text-ink-muted mb-2">
                      최대 10개까지 선택할 수 있어요.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {CATEGORIES.map(cat => {
                      const selected =
                        interests.has(cat)

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            toggleInterest(cat)
                          }
                          disabled={
                            saving ||
                            (!selected &&
                              interests.size >= 10)
                          }
                          className={`px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 border transition-colors disabled:opacity-40 ${
                            selected
                              ? 'bg-coral-light text-coral-dark border-coral'
                              : 'bg-white text-ink-soft border-black/10 hover:border-black/20'
                          }`}
                        >
                          <span>
                            {CAT_ICONS[cat] ??
                              '🎪'}
                          </span>
                          {cat}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      disabled={saving}
                      className="flex-1 h-12 rounded-xl bg-[#F2F4F6] text-sm font-bold text-ink-soft"
                    >
                      취소
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={
                        saving ||
                        nickname.trim().length <
                          2 ||
                        !residence
                      }
                      className="flex-1 h-12 rounded-xl bg-coral text-white text-sm font-bold hover:bg-coral-dark disabled:opacity-40"
                    >
                      {saving
                        ? '저장 중...'
                        : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-ink-muted text-xs font-medium">
                      닉네임
                    </p>
                    <p className="text-ink font-semibold text-base mt-1">
                      {member.nickname || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-ink-muted text-xs font-medium">
                      거주 구
                    </p>
                    <p className="text-ink font-semibold text-base mt-1">
                      {member.residence || '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 관심 카테고리 - 조회 모드 */}
            {!editMode && (
              <div className="w-full bg-white rounded-2xl overflow-hidden shadow-card">
                <div className="px-5 pt-5 pb-1">
                  <p className="flex items-center gap-1.5 font-bold text-ink text-base">
                    <Icon name="star" size={18} className="text-ink-muted" />
                    관심 카테고리
                  </p>
                </div>

                <div className="px-5 py-4 flex flex-wrap gap-2">
                  {interests.size === 0 ? (
                    <p className="text-[#9CA3AF] text-sm">
                      선택한 관심 카테고리가
                      없습니다.
                    </p>
                  ) : (
                    [...interests].map(cat => (
                      <span
                        key={cat}
                        className="px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-coral-light text-coral-dark"
                      >
                        <span>
                          {CAT_ICONS[cat] ??
                            '🎪'}
                        </span>
                        {cat}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 */}
          <div className="flex flex-col gap-4 mt-4 lg:mt-0">
            {error && (
              <div
                role="alert"
                className="bg-[#FFF0EC] rounded-xl px-4 py-3"
              >
                <p className="text-[#EF4444] text-xs font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl overflow-hidden shadow-card py-2">
              {[['bell', '알림 설정'], ['shield', '개인정보 처리방침']].map(([icon, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F4F6] text-ink-soft">
                    <Icon name={icon} size={18} />
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-ink">
                    {label}
                  </span>
                  <span className="rounded-full bg-[#F2F4F6] px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                    준비 중
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-2 bg-white rounded-2xl overflow-hidden shadow-card py-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F9FAFB] active:bg-[#F2F4F6] disabled:opacity-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F4F6] text-ink-soft">
                  <Icon name="logout" size={18} />
                </span>
                <span className="text-[15px] font-medium flex-1 text-left text-ink">
                  {loggingOut
                    ? '로그아웃 중...'
                    : '로그아웃'}
                </span>
                <Icon name="chevronRight" size={18} className="text-[#C4CAD1]" />
              </button>

              <button
                type="button"
                onClick={openDeleteConfirm}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FFF5F5] active:bg-[#FFECEC] disabled:opacity-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#E5484D]">
                  <Icon name="trash" size={18} />
                </span>
                <span className="text-[15px] font-medium flex-1 text-left text-[#E5484D]">
                  회원탈퇴
                </span>
                <Icon name="chevronRight" size={18} className="text-[#C4CAD1]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            onClick={closeDeleteConfirm}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-member-title"
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 shadow-lift"
            style={{
              maxWidth: 380,
              margin: '0 auto',
            }}
          >
            <h3
              id="delete-member-title"
              className="font-display text-xl font-bold text-[#1A1A2E] mb-2"
            >
              정말 탈퇴하시겠어요?
            </h3>

            <p className="text-[#6B7280] text-sm leading-relaxed mb-5">
              저장된 관심 행사와 모든 개인정보가
              삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="bg-[#FFF0EC] rounded-xl px-4 py-3 mb-4"
              >
                <p className="text-[#EF4444] text-xs font-medium">
                  {deleteError}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="flex-1 h-12 rounded-xl bg-[#F2F4F6] text-sm font-bold text-ink-soft"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={deleting}
                className="flex-1 h-12 rounded-xl bg-[#E5484D] text-white text-sm font-bold disabled:opacity-50"
              >
                {deleting
                  ? '처리 중...'
                  : '탈퇴하기'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
