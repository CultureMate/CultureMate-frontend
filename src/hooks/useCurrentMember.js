import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentMember } from '../api/auth'

const CurrentMemberContext = createContext(null)

// 로그인 확인(/auth/me)은 앱 전체에서 한 번만 하고 모든 화면이 같은 결과를 쓴다.
// 회원정보를 바꾸거나 로그아웃·탈퇴하면 setMember / clearMember로 이 상태도 함께 바꿔야 한다.
export function CurrentMemberProvider({ children }) {
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

  const value = useMemo(() => ({
    ...state,
    setMember: member => setState({ member, error: null }),
    clearMember: () => setState({ member: null, error: null }),
  }), [state])

  return (
    <CurrentMemberContext.Provider value={value}>
      {children}
    </CurrentMemberContext.Provider>
  )
}

export default function useCurrentMember() {
  const value = useContext(CurrentMemberContext)
  if (!value) {
    throw new Error('useCurrentMember는 CurrentMemberProvider 안에서만 사용할 수 있습니다.')
  }
  return value
}
