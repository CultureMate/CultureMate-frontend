const STEPS = ['nickname', 'residence', 'interests']

export default function ProfileSetup() {
  // Shows step 1 (nickname) as static UI
  const stepIdx = 0
  const nickname = '김서울'

  return (
    <div className="min-h-dvh bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-6 pt-14 pb-8 md:px-10">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < stepIdx ? 'bg-[#FF6B47] text-white' :
                i === stepIdx ? 'bg-white text-[#1A1A2E]' :
                'bg-white/20 text-white/40'
              }`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 rounded-full ${i < stepIdx ? 'bg-[#FF6B47]' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-white/50 text-sm font-medium mb-1">1 / 3</p>
        <h1 className="font-display text-white text-2xl md:text-3xl font-bold">어떻게 불러드릴까요?</h1>
        <p className="text-white/50 text-sm mt-1">2자 이상의 닉네임을 입력해주세요</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-10 pt-8 pb-32 max-w-lg mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            defaultValue={nickname}
            placeholder="닉네임 입력"
            maxLength={10}
            className="w-full bg-white border-2 rounded-2xl px-5 py-4 text-lg font-semibold text-[#1A1A2E] placeholder-[#D1D5DB] outline-none"
            style={{ borderColor: '#FF6B47' }}
            readOnly
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">{nickname.length}/10</span>
        </div>
        <p className="text-[#00C4A0] text-sm mt-2 ml-1 font-medium">✓ {nickname}님, 반갑습니다!</p>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-6 py-4 pb-8 flex gap-3 max-w-lg mx-auto">
        <button className="flex-1 py-3.5 rounded-xl font-bold text-base bg-[#FF6B47] text-white shadow-lg shadow-[#FF6B47]/30">
          다음
        </button>
      </div>
    </div>
  )
}
