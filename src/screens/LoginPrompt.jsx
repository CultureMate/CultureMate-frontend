export default function LoginPromptScreen() {
  return (
    <div className="flex flex-col min-h-full bg-[#1A1A2E]">
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-[#FF6B47]/10 pointer-events-none" />
      <div className="absolute bottom-40 left-[-30px] w-48 h-48 rounded-full bg-[#8B5CF6]/10 pointer-events-none" />

      <div className="relative z-10 px-6 pt-14">
        <button className="flex items-center gap-1.5 text-white/50 text-sm font-medium mb-10">
          ← 돌아가기
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center mb-5 shadow-2xl shadow-[#FF6B47]/30">
            <span className="text-4xl">🎪</span>
          </div>
          <h1 className="font-display text-white text-3xl font-bold text-center leading-tight">
            로그인이<br />
            <em className="text-[#FF6B47] not-italic">필요한 서비스예요</em>
          </h1>
          <p className="text-white/50 text-sm text-center mt-3 leading-relaxed">
            카카오 계정으로 간편하게 로그인하고<br />
            모든 서비스를 이용해보세요
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-10 max-w-xs mx-auto">
          {[
            { icon: '❤️', text: '관심 행사 저장' },
            { icon: '🗺️', text: '나만의 코스 만들기' },
            { icon: '💬', text: '댓글 확인 및 작성' },
            { icon: '👤', text: '맞춤 추천 프로필' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base">{f.icon}</span>
              </div>
              <span className="text-white/70 text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        <button
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-base"
          style={{ backgroundColor: '#FFE500', color: '#1A1A2E', boxShadow: '0 8px 24px rgba(255,229,0,0.3)' }}
        >
          <div className="w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">K</span>
          </div>
          카카오로 시작하기
        </button>
      </div>
    </div>
  )
}

// ─── 앱 셸 ───────────────────────────────────────────────────────────────────


