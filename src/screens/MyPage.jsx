import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentMember } from '../api/auth'
import api from '../api/axios'
import { CATEGORIES, DISTRICTS } from '../data/events'

const CAT_ICONS = {
  '공연': '🎭',
  '전시': '🖼️',
  '교육/체험': '🎨',
  '스포츠': '⚽',
  '음악': '🎵',
  '영화': '🎬',
  '축제/행사': '🎪',
  '문화/예술': '🏛️',
}

export default function MyPage() {
  const navigate = useNavigate()

  const [member, setMember] = useState(null)
  const [nickname, setNickname] = useState('')
  const [residence, setResidence] = useState('')
  const [interests, setInterests] = useState(new Set())

  const [editMode, setEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadMember = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getCurrentMember(controller.signal)

        if (!data) {
          navigate('/login')
          return
        }

        setMember(data)
        setNickname(data.nickname ?? '')
        setResidence(data.residence ?? '')
      } catch (err) {
        if (err.name === 'CanceledError') return

        console.error('회원정보 조회 실패:', err)
        setError('회원정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadMember()

    return () => controller.abort()
  }, [navigate])

  const handleEditStart = () => {
    setNickname(member?.nickname ?? '')
    setResidence(member?.residence ?? '')
    setError('')
    setEditMode(true)
  }

  const handleEditCancel = () => {
    setNickname(member?.nickname ?? '')
    setResidence(member?.residence ?? '')
    setError('')
    setEditMode(false)
  }

  const handleSave = async () => {
    if (nickname.trim().length < 2 || !residence || saving) {
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.put('/auth/me', {
        nickname: nickname.trim(),
        residence,
      })

      setMember(prev => ({
        ...prev,
        nickname: nickname.trim(),
        residence,
      }))

      setEditMode(false)
    } catch (err) {
      console.error('회원정보 수정 실패:', err)

      if (err.response?.status === 401) {
        navigate('/login')
        return
      }

      setError('회원정보 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = category => {
    // TODO: 관심 카테고리 저장 API 확정 후 서버 연동
    setInterests(prev => {
      const next = new Set(prev)

      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }

      return next
    })
  }

  const handleLogout = () => {
    // TODO: 백엔드 로그아웃 API 확정 후 서버 연동
    setError('로그아웃 API 확인 후 연동 예정입니다.')
  }

  const handleDeleteMember = async () => {
    if (deleting) return

    try {
      setDeleting(true)
      setError('')

      await api.delete('/auth/me')

      setShowDeleteConfirm(false)
      navigate('/login')
    } catch (err) {
      console.error('회원탈퇴 실패:', err)

      if (err.response?.status === 401) {
        navigate('/login')
        return
      }

      setError('회원탈퇴 처리에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#FAFAF8] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm font-medium">
          회원정보를 불러오는 중...
        </p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-full bg-[#FAFAF8] flex items-center justify-center px-6">
        <p className="text-[#6B7280] text-sm font-medium text-center">
          {error || '회원정보를 확인할 수 없습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-8 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🦊</span>
            </div>

            <div>
              <h1 className="font-display text-white text-2xl font-bold">
                {member.nickname || '사용자'}
              </h1>

              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-4 h-4 bg-[#FFE500] rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-black text-black">
                    K
                  </span>
                </div>

                <span className="text-white/60 text-xs">
                  카카오 로그인
                </span>
              </div>
            </div>
          </div>

          {/* 확인된 데이터만 표시 */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-xl">📍</span>
              <p className="text-white font-bold text-sm mt-1">
                {member.residence || '-'}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5">
                거주지
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-xl">👤</span>
              <p className="text-white font-bold text-sm mt-1">
                {member.nickname || '-'}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5">
                닉네임
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start pt-5">

          {/* 왼쪽 */}
          <div className="flex flex-col gap-4">

            {/* 회원정보 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
                <p className="font-semibold text-[#1A1A2E] text-sm">
                  👤 회원 정보
                </p>

                {!editMode && (
                  <button
                    type="button"
                    onClick={handleEditStart}
                    className="text-[#FF6B47] text-xs font-semibold border border-[#FF6B47] px-2.5 py-1 rounded-lg"
                  >
                    수정
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="px-4 py-4">
                  <p className="text-xs text-[#6B7280] font-medium mb-2">
                    닉네임
                  </p>

                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    maxLength={10}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF6B47] mb-4"
                  />

                  <p className="text-xs text-[#6B7280] font-medium mb-2">
                    거주 구 선택
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto hide-scrollbar">
                    {DISTRICTS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setResidence(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          d === residence
                            ? 'bg-[#FF6B47] text-white border-[#FF6B47]'
                            : 'bg-white text-[#1A1A2E] border-[#E5E7EB]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280]"
                    >
                      취소
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={
                        saving ||
                        nickname.trim().length < 2 ||
                        !residence
                      }
                      className="flex-1 py-2.5 rounded-xl bg-[#FF6B47] text-white text-sm font-semibold disabled:opacity-40"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-medium">
                      닉네임
                    </p>
                    <p className="text-[#1A1A2E] font-semibold text-base mt-0.5">
                      {member.nickname || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#9CA3AF] text-xs font-medium">
                      거주 구
                    </p>
                    <p className="text-[#1A1A2E] font-semibold text-base mt-0.5">
                      {member.residence || '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 관심 카테고리 */}
            <div className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <p className="font-semibold text-[#1A1A2E] text-sm">
                  ⭐ 관심 카테고리
                </p>
              </div>

              <div className="px-4 py-4 flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const selected = interests.has(cat)

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 border ${
                        selected
                          ? 'bg-[#FF6B47] text-white border-[#FF6B47]'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                      }`}
                    >
                      <span>{CAT_ICONS[cat] ?? '🎪'}</span>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽 */}
          <div className="flex flex-col gap-4 mt-4 lg:mt-0">
            {error && (
              <div className="bg-[#FFF0EC] rounded-xl px-4 py-3">
                <p className="text-[#EF4444] text-xs font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#F3F4F6]"
              >
                <span>🔔</span>
                <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">
                  알림 설정
                </span>
                <span className="text-[#9CA3AF]">›</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-4"
              >
                <span>🔒</span>
                <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">
                  개인정보 처리방침
                </span>
                <span className="text-[#9CA3AF]">›</span>
              </button>
            </div>

            <div className="mb-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#F3F4F6] active:bg-[#F9FAFB]"
              >
                <span>🚪</span>
                <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">
                  로그아웃
                </span>
                <span className="text-[#9CA3AF]">›</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-[#FFF0EC]"
              >
                <span>🗑️</span>
                <span className="text-sm font-medium flex-1 text-left text-[#EF4444]">
                  회원탈퇴
                </span>
                <span className="text-[#9CA3AF]">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl"
            style={{
              maxWidth: 380,
              margin: '0 auto',
            }}
          >
            <h3 className="font-display text-xl font-bold text-[#1A1A2E] mb-2">
              정말 탈퇴하시겠어요?
            </h3>

            <p className="text-[#6B7280] text-sm leading-relaxed mb-5">
              저장된 관심 행사와 모든 개인정보가 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280]"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}