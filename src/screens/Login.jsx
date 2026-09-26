import { useState } from 'react'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleKakaoLogin = () => {
    if (loading) return

    setLoading(true)

    // 카카오 OAuth는 백엔드에서 처리
    window.location.href =
      'http://localhost:8080/api/auth/kakao/start'
  }

  return (
    <div className="min-h-dvh flex">

      {/* 왼쪽 패널 (데스크탑) */}
      <div className="hidden lg:flex flex-1 bg-[#1A1A2E] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-80 h-80 rounded-full bg-[#FF6B47]/10" />
        <div className="absolute bottom-[-60px] left-[-40px] w-60 h-60 rounded-full bg-[#8B5CF6]/10" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#00C4A0]/10" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎪</span>
          </div>
          <span className="font-display text-white text-2xl font-bold">
            서울문화
          </span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-white text-5xl font-bold leading-tight mb-6">
            서울의 모든<br />
            문화생활을<br />
            <em className="text-[#FF6B47] not-italic">
              한 눈에
            </em>
          </h2>

          <p className="text-white/50 text-lg leading-relaxed">
            수도권 20-30대를 위한 맞춤 문화행사 추천.<br />
            자치구·분야·날짜로 원하는 행사를 바로 찾아보세요.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {[
              '🔍 자치구·분야 검색',
              '❤️ 관심행사 저장',
              '📅 캘린더 관리',
              '✨ AI 소개문',
              '💬 댓글',
            ].map(f => (
              <span
                key={f}
                className="text-sm font-medium text-white/60 bg-white/10 px-4 py-2 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm relative z-10">
          © 2026 서울문화 · Seoul Cultural Events
        </p>
      </div>

      {/* 오른쪽 패널 / 모바일 전체 */}
      <div className="flex-1 lg:max-w-md bg-[#1A1A2E] lg:bg-white flex flex-col relative overflow-hidden">
        <div className="lg:hidden absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-[#FF6B47]/10 pointer-events-none" />
        <div className="lg:hidden absolute bottom-40 right-[-30px] w-48 h-48 rounded-full bg-[#00C4A0]/10 pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-8 lg:px-10 pt-16 lg:pt-0">

          {/* 모바일 로고 */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center mb-5 shadow-2xl shadow-[#FF6B47]/30">
              <span className="text-4xl">🎪</span>
            </div>

            <h1 className="font-display text-white text-4xl font-bold text-center leading-tight">
              서울 문화생활<br />
              <em className="text-[#FF6B47] not-italic">
                한 눈에
              </em>
            </h1>

            <p className="text-white/50 text-sm text-center mt-3 leading-relaxed">
              수도권 20-30대를 위한 맞춤 문화행사 추천
            </p>
          </div>

          {/* 데스크탑 제목 */}
          <div className="hidden lg:block mb-10">
            <h2 className="font-display text-[#1A1A2E] text-3xl font-bold">
              시작하기
            </h2>
            <p className="text-[#6B7280] text-sm mt-2">
              카카오 계정으로 간편하게 로그인하세요
            </p>
          </div>

          {/* 카카오 로그인 버튼 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 active:opacity-90 transition-opacity font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#FFE500',
              color: '#1A1A2E',
              boxShadow: '0 8px 24px rgba(255,229,0,0.3)',
            }}
          >
            <div className="w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">
                K
              </span>
            </div>

            {loading
              ? '카카오 로그인으로 이동 중...'
              : '카카오로 시작하기'}
          </button>
        </div>

        <p className="text-center text-white/30 lg:text-[#9CA3AF] text-xs pb-10 px-8 leading-relaxed">
          로그인 시{' '}
          <span className="underline">이용약관</span>
          {' '}및{' '}
          <span className="underline">개인정보 처리방침</span>
          에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}