import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './screens/Home'
import EventList from './screens/EventList'
import EventDetail from './screens/EventDetail'
import Search from './screens/Search'
import Favorites from './screens/Favorites'
import MyPage from './screens/MyPage'
import Login from './screens/Login'
import ProfileSetup from './screens/ProfileSetup'

const NAV_ITEMS = [
  { icon: '🏠', label: '홈', path: '/' },
  { icon: '📋', label: '목록', path: '/events' },
  { icon: '🔍', label: '검색', path: '/search' },
  { icon: '❤️', label: '관심목록', path: '/favorites' },
  { icon: '👤', label: '마이', path: '/my' },
]

function AppLayout() {
  const { pathname } = useLocation()
  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <div className="flex min-h-dvh bg-[#FAFAF8]">
      <nav aria-label="주 메뉴" className="hidden md:flex flex-col bg-[#1A1A2E] md:w-16 lg:w-[220px] flex-shrink-0 sticky top-0 h-screen z-20">
        <div className="px-3 lg:px-5 py-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B47] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎪</span>
            </div>
            <span className="hidden lg:block font-display text-white font-bold text-lg leading-tight">CultureMate</span>
          </Link>
        </div>
        <div className="flex flex-col gap-1 p-2 lg:p-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl ${isActive(item.path) ? 'bg-[#FF6B47] text-white' : 'text-white/50 hover:text-white'}`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="hidden lg:block text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          <Outlet />
        </main>
        <nav
          aria-label="모바일 주 메뉴"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] flex z-20"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} aria-label={item.label} className="flex-1 flex flex-col items-center gap-0.5 py-3">
              <span className={`w-10 h-8 flex items-center justify-center rounded-xl text-xl ${isActive(item.path) ? 'bg-[#FFF0EC]' : ''}`}>{item.icon}</span>
              <span className={`text-[10px] font-semibold ${isActive(item.path) ? 'text-[#FF6B47]' : 'text-[#9CA3AF]'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

function LoginRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const login = new URLSearchParams(window.location.search).get('login')
    if (login === 'success') {
      window.history.replaceState({}, '', window.location.pathname)
      navigate('/my', { replace: true })
    } else if (login === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname)
      navigate('/login', { replace: true, state: { cancelled: true } })
    }
  }, [navigate])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <LoginRedirect />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my" element={<MyPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
