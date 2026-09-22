import { Link, useLocation } from 'react-router-dom'
import { KAKAO_LOGIN_START } from '../api/culture'

export default function Login() {
  const location = useLocation()
  const cancelled = Boolean(location.state?.cancelled)

  return (
    <div className="min-h-dvh flex">
      <div className="hidden lg:flex flex-1 bg-[#1A1A2E] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-80 h-80 rounded-full bg-[#FF6B47]/10" />
        <div className="absolute bottom-[-60px] left-[-40px] w-60 h-60 rounded-full bg-[#8B5CF6]/10" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎪</span>
          </div>
          <span className="font-display text-white text-2xl font-bold">CultureMate</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-white text-5xl font-bold leading-tight mb-6">
            서울의 모든
            <br />
            문화생활을
            <br />
            <em className="text-[#FF6B47] not-italic">한 눈에</em>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            자치구·분야·날짜로 원하는 행사를 찾고
            <br />
            관심 행사와 댓글을 남길 수 있어요.
          </p>
        </div>

        <p className="text-white/20 text-sm relative z-10">© 2026 CultureMate</p>
      </div>

      <div className="flex-1 lg:max-w-md bg-[#1A1A2E] lg:bg-white flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-10 pt-16 lg:pt-0">
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center mb-5 shadow-2xl shadow-[#FF6B47]/30">
              <span className="text-4xl">🎪</span>
            </div>
            <h1 className="font-display text-white text-4xl font-bold text-center leading-tight">
              CultureMate
              <br />
              <em className="text-[#FF6B47] not-italic">시작하기</em>
            </h1>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="font-display text-[#1A1A2E] text-3xl font-bold">시작하기</h2>
            <p className="text-[#6B7280] text-sm mt-2">카카오 계정으로 간편하게 로그인하세요</p>
          </div>

          {cancelled && (
            <p className="mb-4 text-sm text-[#FF6B47] bg-[#FFF0EC] rounded-xl px-3 py-2">로그인이 취소되었습니다. 다시 시도해 주세요.</p>
          )}

          <a
            href={KAKAO_LOGIN_START}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-base"
            style={{ backgroundColor: '#FFE500', color: '#1A1A2E', boxShadow: '0 8px 24px rgba(255,229,0,0.3)' }}
          >
            <div className="w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">K</span>
            </div>
            카카오로 시작하기
          </a>

          <Link to="/" className="mt-4 text-center text-sm text-white/50 lg:text-[#6B7280] font-medium">
            로그인 없이 둘러보기
          </Link>
        </div>

        <p className="text-center text-white/30 lg:text-[#9CA3AF] text-xs pb-10 px-8 leading-relaxed">
          로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
