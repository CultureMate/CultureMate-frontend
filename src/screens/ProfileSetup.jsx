import { CATEGORIES, DISTRICTS } from '../data/events'

const CAT_ICONS = {
  '공연': '🎭', '전시': '🖼️', '교육/체험': '🎨', '스포츠': '⚽',
  '음악': '🎵', '영화': '🎬', '축제/행사': '🎪', '문화/예술': '🏛️',
}

const STEPS = ['nickname', 'residence', 'interests']

export default function ProfileSetup() {
  const step     = 'nickname'
  const stepIdx  = 0
  const nickname = ''
  const residence = ''
  const interests = new Set()

  return (
    <div className="min-h-dvh bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-6 pt-14 pb-8 md:px-10">
        {/* Progress */}
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
        <p className="text-white/50 text-sm font-medium mb-1">{stepIdx + 1} / {STEPS.length}</p>
        <h1 className="font-display text-white text-2xl md:text-3xl font-bold">
          {step === 'nickname' && '어떻게 불러드릴까요?'}
          {step === 'residence' && '어디에 살고 계세요?'}
          {step === 'interests' && '무엇에 관심 있으세요?'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {step === 'nickname' && '2자 이상의 닉네임을 입력해주세요'}
          {step === 'residence' && '근처 행사를 먼저 추천해드릴게요'}
          {step === 'interests' && '1개 이상 선택해주세요 (복수 선택 가능)'}
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
                readOnly
                placeholder="닉네임 입력"
                maxLength={10}
                className="w-full bg-white border-2 border-[#E5E7EB] rounded-2xl px-5 py-4 text-lg font-semibold text-[#1A1A2E] placeholder-[#D1D5DB] outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">0/10</span>
            </div>
          </div>
        )}

        {/* Step 2: 거주지 */}
        {step === 'residence' && (
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map(d => (
              <button key={d}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${
                  residence === d ? 'bg-[#FF6B47] text-white border-[#FF6B47]' : 'bg-white text-[#374151] border-[#E5E7EB]'
                }`}
              >{d}</button>
            ))}
          </div>
        )}

        {/* Step 3: 관심 분야 */}
        {step === 'interests' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => {
              const selected = interests.has(cat)
              return (
                <button key={cat}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${
                    selected ? 'bg-[#FF6B47] border-[#FF6B47]' : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <span className="text-2xl">{CAT_ICONS[cat] ?? '🎪'}</span>
                  <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-white' : 'text-[#374151]'}`}>{cat}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-6 py-4 pb-8 flex gap-3 max-w-lg mx-auto">
        <button
          disabled
          className="flex-1 py-3.5 rounded-xl font-bold text-base bg-[#F3F4F6] text-[#D1D5DB]"
        >
          다음
        </button>
      </div>
    </div>
  )
}
