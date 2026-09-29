import { useEffect, useRef } from 'react'
import Icon from './Icon'

const SIZES = { sm: 'md:max-w-md', md: 'md:max-w-3xl' }

export default function EventDialog({ title, id, onClose, children, size = 'md' }) {
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
      className={`fixed inset-0 m-0 mt-auto w-full max-w-full max-h-[90dvh] rounded-t-[28px] bg-white p-0 text-ink shadow-lift backdrop:bg-black/45 backdrop:backdrop-blur-[2px] md:m-auto md:rounded-3xl ${SIZES[size] ?? SIZES.md}`}>
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 md:p-6">
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E5E8EB] md:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={id} className="font-display text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F4F6] text-ink-soft transition-colors hover:bg-[#E5E8EB]">
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
