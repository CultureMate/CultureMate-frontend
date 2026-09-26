import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const STEPS = ['nickname', 'residence', 'interests']

export default function ProfileSetup() {
  const navigate = useNavigate()

  const [stepIdx, setStepIdx] = useState(0)
  const [nickname, setNickname] = useState('')
  const [residence, setResidence] = useState('')
  const [interests, setInterests] = useState(new Set())
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const step = STEPS[stepIdx]

  const toggleInterest = (category) => {
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

    if (step === 'interests') {
      return interests.size >= 1 && privacyAgreed
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

      // 현재 백엔드에서 확인된 회원정보 수정 API
      await api.put('/auth/me', {
        nickname: nickname.trim(),
        residence,
      })

      navigate('/')
    } catch (err) {
      console.error('프로필 저장 실패:', err)

      if (err.response?.status === 401) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.')
      } else {
        setError('프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (loading || stepIdx === 0) return

    setError('')
    setStepIdx(prev => prev - 1)
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-6 pt-14 pb-8 md:px-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIdx
                    ? 'bg-[#FF6B47] text-white'
                    : i === stepIdx
                      ? 'bg-white text-[#1A1A2E]'
                      : 'bg-white/20 text-white/40'
                }`}
              >
                {i < stepIdx ? '✓' : i + 1}
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded-full ${
                    i < stepIdx ? 'bg-[#FF6B47]' : 'bg-white/20'
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
          {step === 'nickname' && '어떻게 불러드릴까요?'}
          {step === 'residence' && '어디에 살고 계세요?'}
          {step === 'interests' && '무엇에 관심 있으세요?'}
        </h1>

        <p className="text-white/50 text-sm mt-1">
          {step === 'nickname' && '2자 이상의 닉네임을 입력해주세요'}
          {step === 'residence' && '근처 행사를 먼저 추천해드릴게요'}
          {step === 'interests' &&
            '1개 이상 선택해주세요 (복수 선택 가능)'}
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
                onChange={(e) => {
                  setNickname(e.target.value)
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

            {nickname.length > 0 && nickname.trim().length < 2 && (
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
                const selected = interests.has(cat)

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                      selected
                        ? 'bg-[#FF6B47] border-[#FF6B47]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <span className="text-2xl">
                      {CAT_ICONS[cat] ?? '🎪'}
                    </span>

                    <span
                      className={`text-xs font-semibold text-center leading-tight ${
                        selected ? 'text-white' : 'text-[#374151]'
                      }`}
                    >
                      {cat}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 개인정보 동의 */}
            <label className="flex items-start gap-3 mt-8 p-4 bg-white border border-[#E5E7EB] rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => {
                  setPrivacyAgreed(e.target.checked)
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
          <p className="text-[#FF6B47] text-sm font-medium mt-5">
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
            disabled={!canProceed() || loading}
            className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-colors ${
              canProceed() && !loading
                ? 'bg-[#FF6B47] text-white'
                : 'bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed'
            }`}
          >
            {loading
              ? '저장 중...'
              : stepIdx === STEPS.length - 1
                ? '완료'
                : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}