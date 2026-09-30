import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  HashRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Home from './screens/Home'
import EventList from './screens/EventList'
import EventDetail from './screens/EventDetail'
import Search from './screens/Search'
import Course from './screens/Course'
import SharedCourse from './screens/SharedCourse'
import Favorites from './screens/Favorites'
import MyPage from './screens/MyPage'
import Login from './screens/Login'
import LoginPrompt from './screens/LoginPrompt'
import ProfileSetup from './screens/ProfileSetup'
import { getCurrentMember } from './api/auth'
import api from './api/axios'
import useCurrentMember from './hooks/useCurrentMember'
import EventDialog from './components/EventDialog'
import Icon from './components/Icon'
import BrandMark, { BrandWordmark } from './components/BrandMark'
import ScrollManager from './components/ScrollManager'
import SplashScreen, { showSplash } from './components/SplashScreen'
import { clearCourseEditSession } from './utils/courseDraft'

const NAV_ITEMS = [
  { icon: 'home', label: '홈', path: '/' },
  { icon: 'grid', label: '목록', path: '/events' },
  { icon: 'route', label: '코스', path: '/course' },
  { icon: 'heart', label: '관심', path: '/favorites' },
  { icon: 'user', label: '마이', path: '/my' },
]
const AUTH_PATHS = ['/course', '/favorites', '/my']

/**
 * 카카오 로그인 처리
 *
 * 성공:
 * - /?login=success
 * - 세션 없음 -> /login
 * - nickname 또는 residence가 미완성 -> /profile
 * - nickname, residence가 모두 있음 -> /
 * - interestCategories는 비어 있어도 메인 화면 진입 가능
 *
 * 취소:
 * - /?login=cancelled
 * - /login으로 이동하면서 취소 안내 전달
 */
function LoginResultHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const loginResult = params.get('login')

    if (loginResult === 'cancelled') {
      navigate('/login', {
        replace: true,
        state: {
          loginCancelled: true,
        },
      })
      return
    }

    if (loginResult !== 'success') {
      return
    }

    let cancelled = false

    const handleLoginSuccess = async () => {
      try {
        const member = await getCurrentMember()

        if (cancelled) return

        if (!member) {
          navigate('/login', {
            replace: true,
          })
          return
        }

        // 관심 카테고리는 선택 사항이다.
        // 닉네임과 거주지만 설정되어 있으면
        // 관심 카테고리가 없어도 메인 화면으로 이동한다.
        const profileIncomplete =
          !member.nickname?.trim() ||
          !member.residence?.trim()

        if (profileIncomplete) {
          showSplash('CultureMate에 오신 걸 환영해요')
          navigate('/profile', {
            replace: true,
          })
          return
        }

        showSplash(`${member.nickname.trim()}님, 다시 만나 반가워요`)
        navigate('/', {
          replace: true,
        })
      } catch (error) {
        if (cancelled) return

        console.error(
          '로그인 후 회원정보 확인 실패:',
          error
        )

        navigate('/login', {
          replace: true,
        })
      }
    }

    handleLoginSuccess()

    return () => {
      cancelled = true
    }
  }, [location.search, navigate])

  return null
}

function AppLayout() {
  const { pathname, search, state } = useLocation()
  const navigate = useNavigate()
  const onLoginPrompt = pathname === '/login-prompt'
  const activePath = onLoginPrompt ? state?.from ?? '' : pathname
  const { member, clearMember } = useCurrentMember()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const isActive = path =>
    path === '/'
      ? activePath === '/'
      : activePath.startsWith(path)

  const scrollTopOnSameTab = (event, path) => {
    if (pathname !== path || search) return
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')

    try {
      await api.post('/auth/logout')
      clearMember()
      clearCourseEditSession()
      setLogoutOpen(false)
      navigate('/', { replace: true })
    } catch (error) {
      if (error.response?.status === 401) {
        clearMember()
        clearCourseEditSession()
        setLogoutOpen(false)
        navigate('/', { replace: true })
        return
      }
      setLogoutError('로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-dvh w-full max-w-full overflow-x-clip bg-canvas">
      <nav
        aria-label="주 메뉴"
        className="sticky top-0 z-20 hidden h-dvh flex-shrink-0 self-start flex-col border-r border-black/[0.06] bg-white md:flex md:w-[72px] lg:w-[232px]"
      >
        <Link to="/" aria-label="CultureMate 홈" className="flex items-center gap-3 px-4 py-5 lg:px-5">
          <BrandMark size={40} />
          <BrandWordmark className="hidden lg:flex" />
        </Link>

        <div className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={event => scrollTopOnSameTab(event, item.path)}
                replace={onLoginPrompt}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors md:justify-center lg:justify-start ${
                  active ? 'bg-coral-light text-coral' : 'text-ink-soft hover:bg-[#F2F4F6] hover:text-ink'
                }`}
              >
                <Icon name={item.icon} size={22} filled={active && item.icon !== 'grid' && item.icon !== 'route'} strokeWidth={active ? 2 : 1.8} />
                <span className={`hidden text-[15px] lg:block ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {AUTH_PATHS.includes(item.path) && !member && (
                  <Icon name="lock" size={14} className="ml-auto hidden text-ink-muted/70 lg:block" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="border-t border-black/[0.06] p-3">
          {member === undefined ? <div
            aria-label="로그인 상태 확인 중"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink-muted md:justify-center lg:justify-start"
          >
            <span className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-[#F2F4F6]" />
            <span className="hidden text-sm lg:block">확인 중...</span>
          </div> : member ? <button
            type="button"
            onClick={() => { setLogoutError(''); setLogoutOpen(true) }}
            aria-label="로그아웃"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#F2F4F6] md:justify-center lg:justify-start"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-coral-light text-sm font-bold text-coral">
              {member.nickname?.trim()?.[0] ?? <Icon name="user" size={16} />}
            </span>
            <span className="hidden min-w-0 flex-1 lg:block">
              <span className="block truncate text-sm font-semibold text-ink">{member.nickname || '회원'}</span>
              <span className="block text-xs text-ink-muted">로그아웃</span>
            </span>
            <Icon name="logout" size={18} className="hidden text-ink-muted lg:block" />
          </button> : <Link
            to="/login"
            aria-label="로그인"
            className="flex items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-white transition-colors hover:bg-black md:justify-center lg:justify-start"
          >
            <Icon name="login" size={20} />
            <span className="hidden text-sm font-semibold lg:block">로그인</span>
          </Link>}
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </main>

        {pathname.startsWith('/events/') &&
        ![
          '/events/hot',
          '/events/filter',
        ].includes(pathname) ? null : (
          <nav
            aria-label="모바일 주 메뉴"
            className="fixed bottom-0 left-0 right-0 z-20 flex w-full max-w-full overflow-hidden border-t border-black/[0.06] bg-white/95 backdrop-blur-md md:hidden"
            style={{
              paddingBottom:
                'env(safe-area-inset-bottom)',
            }}
          >
            {NAV_ITEMS.map(item => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={event => scrollTopOnSameTab(event, item.path)}
                  replace={onLoginPrompt}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors active:bg-black/[0.03] ${
                    active ? 'text-ink' : 'text-[#B0B8C1]'
                  }`}
                >
                  <Icon name={item.icon} size={24} filled={active && item.icon !== 'grid' && item.icon !== 'route'} strokeWidth={active ? 2.1 : 1.8} className={active ? 'text-coral' : ''} />
                  <span className={`text-[11px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      {logoutOpen && <EventDialog size="sm" title="로그아웃" id="logout-confirm-title" onClose={() => !loggingOut && setLogoutOpen(false)}>
        <p className="text-[15px] text-ink-soft">로그아웃 하시겠어요?</p>
        {logoutError && <p role="alert" className="mt-3 text-sm text-[#B93820]">{logoutError}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" disabled={loggingOut} onClick={() => setLogoutOpen(false)}
            className="rounded-2xl bg-[#F2F4F6] py-3.5 text-[15px] font-semibold text-ink-soft disabled:opacity-50">
            취소
          </button>
          <button type="button" disabled={loggingOut} onClick={handleLogout}
            className="rounded-2xl bg-coral py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
            {loggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      </EventDialog>}
    </div>
  )
}

function RequireAuth({ children }) {
  const location = useLocation()
  const { member, error } = useCurrentMember()

  if (member === undefined) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-[#6B7280]">
        로그인 상태를 확인하고 있습니다.
      </div>
    )
  }

  if (!member) {
    return (
      <Navigate
        to="/login-prompt"
        replace
        state={{ from: location.pathname, authError: Boolean(error) }}
      />
    )
  }

  return children
}

export default function App() {
  const Router = process.env.REACT_APP_DATA_MODE === 'mock'
    ? HashRouter
    : BrowserRouter

  return (
    <Router>
      <SplashScreen />
      <LoginResultHandler />
      <ScrollManager />

      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/events"
            element={<EventList />}
          />

          <Route
            path="/events/hot"
            element={<Home showAllHot />}
          />

          <Route
            path="/events/filter"
            element={
              <EventList initialFilterOpen />
            }
          />

          <Route
            path="/events/:id"
            element={<EventDetail />}
          />

          <Route
            path="/search"
            element={<Search />}
          />

          <Route
            path="/course"
            element={<RequireAuth><Course /></RequireAuth>}
          />

          <Route
            path="/shared/courses/:shareId"
            element={<RequireAuth><SharedCourse /></RequireAuth>}
          />

          <Route
            path="/favorites"
            element={<RequireAuth><Favorites /></RequireAuth>}
          />

          <Route
            path="/favorites/calendar"
            element={
              <RequireAuth><Favorites view="calendar" /></RequireAuth>
            }
          />

          <Route
            path="/my"
            element={<RequireAuth><MyPage /></RequireAuth>}
          />

          <Route
            path="/login-prompt"
            element={<LoginPrompt />}
          />
        </Route>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/profile"
          element={<ProfileSetup />}
        />

        <Route
          path="*"
          element={<Home />}
        />
      </Routes>
    </Router>
  )
}
