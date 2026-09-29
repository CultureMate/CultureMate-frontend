import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../api/axios'
import useCurrentMember from '../hooks/useCurrentMember'
import {
  CATEGORIES,
  DISTRICTS,
} from '../data/events'

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

const STEPS = [
  'nickname',
  'residence',
  'interests',
]

export default function ProfileSetup() {
  const navigate = useNavigate()

  const [stepIdx, setStepIdx] = useState(0)
  const [nickname, setNickname] = useState('')
  const [residence, setResidence] = useState('')
  const [interests, setInterests] =
    useState(new Set())

  const [privacyAgreed, setPrivacyAgreed] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /*
   * /profile 직접 접근 시 먼저 로그인 상태를 확인합니다.
   * 확인이 끝나기 전에는 프로필 입력 화면을 노출하지 않습니다.
   * 인증 상태를 확인할 수 없는 경우에도 로그인 화면으로 보냅니다.
   */
  const {
    member,
    error: memberError,
    setMember,
    clearMember,
  } = useCurrentMember()
  const authChecking = !member

  useEffect(() => {
    if (member !== null) return

    if (memberError) {
      console.error(
        '로그인 상태 확인 실패:',
        memberError
      )
    }

    navigate('/login', {
      replace: true,
    })
  }, [member, memberError, navigate])

  const step = STEPS[stepIdx]

  const toggleInterest = category => {
    setInterests(prev => {
      const next = new Set(prev)

      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }

      return next
    })

    setError('')
  }

  const canProceed = () => {
    if (step === 'nickname') {
      return nickname.trim().length >= 2
    }

    if (step === 'residence') {
      return Boolean(residence)
    }

    /*
     * 관심 카테고리는 선택 사항입니다.
     * 아무것도 선택하지 않아도 개인정보 동의만 하면
     * 프로필 설정을 완료할 수 있습니다.
     */
    if (step === 'interests') {
      return privacyAgreed
    }

    return false
  }

  const handleNext = async () => {
    if (!canProceed() || loading) return

    setError('')

    if (stepIdx < STEPS.length - 1) {
      setStepIdx(prev => prev + 1)
      return
    }

    try {
      setLoading(true)

      /*
       * 관심 카테고리가 하나도 선택되지 않은 경우에도
       * 빈 배열을 전송하여 프로필 설정을 완료합니다.
       */
      const { data } = await api.put('/auth/me', {
        nickname: nickname.trim(),
        residence,
        interestCategories: [
          ...interests,
        ],
      })

      setMember({
        ...member,
        ...data,
        nickname: data?.nickname ?? nickname.trim(),
        residence: data?.residence ?? residence,
        interestCategories:
          data?.interestCategories ?? [...interests],
      })
      navigate('/', {
        replace: true,
      })
    } catch (err) {
      console.error(
        '프로필 저장 실패:',
        err
      )

      if (err.response?.status === 401) {
        navigate('/login', {
          replace: true,
        })
        clearMember()
        return
      }

      setError(
        '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (loading || stepIdx === 0) return

    setError('')
    setStepIdx(prev => prev - 1)
  }

  /*
   * 인증 확인이 끝나기 전에 프로필 입력 폼이
   * 잠깐 보이는 현상을 방지합니다.
   */
  if (authChecking) {
    return (
      <div className="min-h-dvh bg-[#FAFAF8] flex items-center justify-center">
        <p
          role="status"
          className="text-[#6B7280] text-sm font-medium"
        >
          로그인 상태를 확인하고 있습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-6 pt-14 pb-8 md:px-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIdx
                    ? 'bg-[#FF6B47] text-white'
                    : i === stepIdx
                      ? 'bg-white text-[#1A1A2E]'
                      : 'bg-white/20 text-white/40'
                }`}
              >
                {i < stepIdx
                  ? '✓'
                  : i + 1}
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded-full ${
                    i < stepIdx
                      ? 'bg-[#FF6B47]'
                      : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-white/50 text-sm font-medium mb-1">
          {stepIdx + 1} / {STEPS.length}
        </p>

        <h1 className="font-display text-white text-2xl md:text-3xl font-bold">
          {step === 'nickname' &&
            '어떻게 불러드릴까요?'}

          {step === 'residence' &&
            '어디에 살고 계세요?'}

          {step === 'interests' &&
            '무엇에 관심 있으세요?'}
        </h1>

        <p className="text-white/50 text-sm mt-1">
          {step === 'nickname' &&
            '2자 이상의 닉네임을 입력해주세요'}

          {step === 'residence' &&
            '근처 행사를 먼저 추천해드릴게요'}

          {step === 'interests' &&
            '선택하지 않고 넘어가도 괜찮아요 (복수 선택 가능)'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-10 pt-8 pb-32 max-w-lg mx-auto w-full">
        {/* Step 1: 닉네임 */}
        {step === 'nickname' && (
          <div>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={e => {
                  setNickname(
                    e.target.value
                  )
                  setError('')
                }}
                placeholder="닉네임 입력"
                maxLength={10}
                autoFocus
                className="w-full bg-white border-2 border-[#E5E7EB] rounded-2xl px-5 py-4 pr-16 text-lg font-semibold text-[#1A1A2E] placeholder-[#D1D5DB] outline-none focus:border-[#FF6B47]"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                {nickname.length}/10
              </span>
            </div>

            {nickname.length > 0 &&
              nickname.trim().length < 2 && (
                <p className="text-[#FF6B47] text-sm mt-2">
                  닉네임은 2자 이상 입력해주세요.
                </p>
              )}
          </div>
        )}

        {/* Step 2: 거주지 */}
        {step === 'residence' && (
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setResidence(d)
                  setError('')
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  residence === d
                    ? 'bg-[#FF6B47] text-white border-[#FF6B47]'
                    : 'bg-white text-[#374151] border-[#E5E7EB]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: 관심 분야 */}
        {step === 'interests' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                      selected
                        ? 'bg-[#FF6B47] border-[#FF6B47]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <span className="text-2xl">
                      {CAT_ICONS[cat] ??
                        '🎪'}
                    </span>

                    <span
                      className={`text-xs font-semibold text-center leading-tight ${
                        selected
                          ? 'text-white'
                          : 'text-[#374151]'
                      }`}
                    >
                      {cat}
                    </span>
                  </button>
                )
              })}
            </div>

            {interests.size === 0 && (
              <p className="text-[#9CA3AF] text-xs mt-3 text-center">
                관심 카테고리는 나중에 마이페이지에서도 설정할 수 있어요.
              </p>
            )}

            {/* 개인정보 동의 */}
            <label className="flex items-start gap-3 mt-8 p-4 bg-white border border-[#E5E7EB] rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={e => {
                  setPrivacyAgreed(
                    e.target.checked
                  )
                  setError('')
                }}
                className="mt-0.5 w-4 h-4 accent-[#FF6B47]"
              />

              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">
                  개인정보 수집 및 이용에 동의합니다.
                </p>

                <p className="text-xs text-[#9CA3AF] mt-1">
                  맞춤 문화행사 추천을 위한 프로필 정보를 저장합니다.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* API 오류 메시지 */}
        {error && (
          <p
            role="alert"
            className="text-[#FF6B47] text-sm font-medium mt-5"
          >
            {error}
          </p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-6 py-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          {stepIdx > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="w-24 py-3.5 rounded-xl font-bold text-base bg-[#F3F4F6] text-[#6B7280] disabled:opacity-50"
            >
              이전
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={
              !canProceed() ||
              loading
            }
            className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-colors ${
              canProceed() && !loading
                ? 'bg-[#FF6B47] text-white'
                : 'bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed'
            }`}
          >
            {loading
              ? '저장 중...'
              : stepIdx ===
                  STEPS.length - 1
                ? '완료'
                : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}