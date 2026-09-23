export default function DemoNotice({ onRetry }) {
  return (
    <div role="status" className="rounded-xl bg-[#FFF8E7] border border-[#F59E0B]/30 px-4 py-3 mb-4 text-sm text-[#92400E]">
      <p><strong>데모 데이터</strong> · 화면 확인용 샘플입니다. 행사 일정과 조회수는 실제 정보가 아닙니다.</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">서버 다시 연결</button>}
    </div>
  )
}
