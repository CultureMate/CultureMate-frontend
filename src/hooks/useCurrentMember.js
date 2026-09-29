import { useEffect, useState } from 'react'
import { getCurrentMember, setCurrentMemberCache } from '../api/auth'

export default function useCurrentMember() {
  const [state, setState] = useState({
    member: undefined,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    getCurrentMember(controller.signal)
      .then(member => {
        if (!controller.signal.aborted) {
          setState({ member, error: null })
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setState({ member: null, error })
        }
      })

    return () => controller.abort()
  }, [])

  const clearMember = () => {
    setCurrentMemberCache(null)
    setState({ member: null, error: null })
  }

  return { ...state, clearMember }
}
