import { useNavigate } from 'react-router-dom'
import { getKakaoLoginUrl } from '../api/auth'
import BrandMark from '../components/BrandMark'
import Icon from '../components/Icon'

const BENEFITS = [
  { icon: 'heart', text: '관심 행사 저장' },
  { icon: 'route', text: '나만의 코스 만들기' },
  { icon: 'sparkle', text: '댓글 확인 및 작성' },
  { icon: 'user', text: '맞춤 추천 프로필' },
]

export default function LoginPromptScreen() {
  const navigate = useNavigate()
  // 이전 화면은 로그인이 필요한 경로라 그대로 돌아가면 다시 이 화면으로 온다.
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/', { replace: true })
  }

  return (
    <div aria-label="로그인 필요 안내" className="relative flex min-h-full w-full min-w-0 max-w-full flex-col overflow-hidden bg-white">
      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col px-5 pb-24 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6 md:pb-10 md:pt-8">
        <button type="button" onClick={goBack}
          className="-ml-3 flex h-10 w-fit items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-soft hover:bg-[#F2F4F6]">
          <Icon name="arrowLeft" size={18} />
          돌아가기
        </button>

        <div className="flex flex-1 flex-col justify-center py-10">
          <BrandMark size={56} />
          <h1 className="mt-6 font-display text-[28px] font-bold leading-[1.3] text-ink">
            로그인하고<br />
            <span className="text-coral">더 많은 기능을 써보세요</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            로그인 후 이용 가능한 서비스입니다. 카카오 계정으로 간편하게 시작해보세요.
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-2">
            {BENEFITS.map(benefit => (
              <li key={benefit.text} className="flex items-center gap-2.5 rounded-2xl bg-[#F7F8FA] px-3 py-3.5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-coral-light text-coral">
                  <Icon name={benefit.icon} size={17} />
                </span>
                <span className="text-sm font-semibold text-ink-soft">{benefit.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = getKakaoLoginUrl() }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-base font-bold text-[#191919] transition-[filter] hover:brightness-[0.97] active:brightness-95"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.7c.4 0 .8.1 1.2.1 5 0 9-3.2 9-7.1S17 3.5 12 3.5z" />
          </svg>
          카카오로 시작하기
        </button>
      </div>
    </div>
  )
}
