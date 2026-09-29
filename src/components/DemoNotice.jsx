export default function DemoNotice({ onRetry }) {
  return (
    <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#FFF8E7] px-4 py-3 text-sm text-[#8A5A00]">
      <p><strong>데모 데이터</strong> · 화면 확인용 샘플입니다. 행사 일정과 조회수는 실제 정보가 아닙니다.</p>
      {onRetry && <button type="button" onClick={onRetry} className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-bold">서버 다시 연결</button>}
    </div>
  )
}
