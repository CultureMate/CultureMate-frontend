import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getKakaoLoginUrl } from '../api/auth'
import BrandMark from '../components/BrandMark'
import Icon from '../components/Icon'

const FEATURES = [
  { icon: 'search', title: '자치구·분야·날짜로 검색', body: '서울 곳곳의 전시, 공연, 축제를 조건대로 찾아요.' },
  { icon: 'heart', title: '관심행사 저장과 캘린더', body: '가고 싶은 행사를 모아 날짜별로 확인해요.' },
  { icon: 'route', title: '행사 코스 만들기', body: '행사 사이 카페와 음식점까지 한 번에 동선을 짜요.' },
]

export default function Login() {
  const { state } = useLocation()

  const [loading, setLoading] = useState(false)

  const loginCancelled =
    state?.loginCancelled === true

  const handleKakaoLogin = () => {
    if (loading) return

    setLoading(true)

    // 카카오 OAuth는 백엔드에서 처리
    window.location.href = getKakaoLoginUrl()
  }

  return (
    <div className="flex min-h-dvh bg-white">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FF7A52] via-[#FF6B47] to-[#F2553A] p-14 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-black/5" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="rounded-2xl bg-white p-1 shadow-lg"><BrandMark size={40} /></span>
          <span className="text-2xl font-bold text-white">CultureMate</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-5xl font-bold leading-[1.2] text-white">
            서울의 문화생활,<br />
            코스로 즐겨요
          </h2>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(feature => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Icon name={feature.icon} size={20} />
                </span>
                <span>
                  <span className="block text-base font-bold text-white">{feature.title}</span>
                  <span className="mt-0.5 block text-sm text-white/75">{feature.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © 2026 CultureMate · Seoul Cultural Events
        </p>
      </div>

      <div className="relative flex flex-1 flex-col lg:max-w-md">
        <div className="flex items-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:px-6 lg:pt-6">
          <Link
            to="/"
            aria-label="홈으로"
            className="flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-soft hover:bg-[#F2F4F6]"
          >
            <Icon name="arrowLeft" size={18} />
            홈으로
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 pb-6 lg:px-10">
          <div className="mb-10 lg:hidden">
            <BrandMark size={56} />
            <h1 className="mt-6 font-display text-[32px] font-bold leading-[1.25] text-ink">
              서울 문화생활,<br />
              <span className="text-coral">코스로 즐겨요</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              행사 검색부터 저장, 동선 짜기까지 한 번에.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map(feature => (
                <li key={feature.title} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-coral-light text-coral">
                    <Icon name={feature.icon} size={18} />
                  </span>
                  <span className="text-[15px] font-semibold text-ink-soft">{feature.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="font-display text-3xl font-bold text-ink">
              시작하기
            </h2>

            <p className="mt-2 text-[15px] text-ink-muted">
              카카오 계정으로 3초 만에 시작할 수 있어요
            </p>
          </div>

          {loginCancelled && (
            <div
              role="alert"
              className="mb-4 rounded-2xl bg-coral-light px-4 py-3"
            >
              <p className="text-sm font-bold text-coral-dark">
                카카오 로그인이 취소되었습니다.
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                다시 로그인하려면 아래 버튼을 눌러주세요.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-base font-bold text-[#191919] transition-[filter] hover:brightness-[0.97] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.7c.4 0 .8.1 1.2.1 5 0 9-3.2 9-7.1S17 3.5 12 3.5z" />
            </svg>

            {loading
              ? '카카오 로그인으로 이동 중...'
              : '카카오로 시작하기'}
          </button>
        </div>

        <p className="px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] text-center text-xs leading-relaxed text-ink-muted">
          로그인 시{' '}
          <span className="underline">
            이용약관
          </span>{' '}
          및{' '}
          <span className="underline">
            개인정보 처리방침
          </span>
          에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
