import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFavorites, getMe, logout } from '../api/culture'

export default function MyPage() {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [favCount, setFavCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getMe(), getFavorites().catch(() => [])])
      .then(([member, favorites]) => {
        if (cancelled) return
        setMe(member)
        setFavCount(favorites?.length || 0)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onLogout = async () => {
    try {
      await logout()
      setMe(null)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <p className="p-8 text-sm text-[#6B7280]">불러오는 중…</p>
  }

  if (!me) {
    return (
      <div className="flex flex-col min-h-full bg-[#FAFAF8]">
        <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-8 bg-[#1A1A2E]">
          <h1 className="font-display text-white text-2xl font-bold">마이페이지</h1>
          <p className="text-white/50 text-sm mt-2">로그인하면 관심 행사와 댓글을 이용할 수 있어요.</p>
        </div>
        <div className="px-5 md:px-8 lg:px-10 py-10 max-w-md">
          {error && <p className="text-sm text-[#FF6B47] mb-3">{error}</p>}
          <Link
            to="/login"
            className="block text-center w-full py-3.5 rounded-2xl font-bold bg-[#FF6B47] text-white"
          >
            카카오 로그인
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="px-5 md:px-8 lg:px-10 pt-12 md:pt-8 pb-8 bg-[#1A1A2E]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🦊</span>
            </div>
            <div>
              <h1 className="font-display text-white text-2xl font-bold">{me.nickname || 'CultureMate 회원'}</h1>
              <p className="text-white/50 text-sm mt-0.5">회원번호 {me.memberId}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-4 h-4 bg-[#FFE500] rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-black text-black">K</span>
                </div>
                <span className="text-white/60 text-xs">카카오 로그인</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            <Link to="/favorites" className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-xl">❤️</span>
              <p className="text-white font-bold text-lg mt-1">{favCount}</p>
              <p className="text-white/50 text-[10px] mt-0.5">저장한 행사</p>
            </Link>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-xl">📍</span>
              <p className="text-white font-bold text-base mt-1 truncate">{me.residence || '미설정'}</p>
              <p className="text-white/50 text-[10px] mt-0.5">거주지</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="max-w-5xl mx-auto px-5 md:px-8 lg:px-10 pt-5">
          {error && <p className="text-sm text-[#FF6B47] mb-3">{error}</p>}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm max-w-lg">
            <button type="button" onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4">
              <span className="text-base">🚪</span>
              <span className="text-sm font-medium flex-1 text-left text-[#1A1A2E]">로그아웃</span>
              <span className="text-[#9CA3AF] text-sm">›</span>
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-4">프로필 수정·회원탈퇴 API는 아직 준비 중입니다.</p>
        </div>
      </div>
    </div>
  )
}
