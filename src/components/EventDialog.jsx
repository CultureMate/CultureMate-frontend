import { useEffect, useRef } from 'react'

export default function EventDialog({ title, id, onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])
  return (
    <dialog ref={ref} aria-labelledby={id} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}
      className="fixed inset-0 m-0 mt-auto md:m-auto w-full max-w-3xl max-h-[90dvh] p-0 rounded-t-3xl md:rounded-3xl bg-white text-[#1A1A2E] shadow-2xl backdrop:bg-black/40">
      <div className="p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id={id} className="font-display text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-10 h-10 rounded-full bg-[#F3F4F6]">✕</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
