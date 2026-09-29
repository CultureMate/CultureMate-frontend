import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'

import App from './App'
import { getCurrentMember } from './api/auth'
import api from './api/axios'

jest.mock('./api/auth', () => ({
  getCurrentMember: jest.fn(),
  setCurrentMemberCache: jest.fn(),
}))

jest.mock('./api/axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

jest.mock('./screens/Home', () => () => (
  <div>HOME_PAGE</div>
))

jest.mock('./screens/EventList', () => () => (
  <div>EVENT_LIST_PAGE</div>
))

jest.mock('./screens/EventDetail', () => () => (
  <div>EVENT_DETAIL_PAGE</div>
))

jest.mock('./screens/Search', () => () => (
  <div>SEARCH_PAGE</div>
))

jest.mock('./screens/Course', () => () => (
  <div>COURSE_PAGE</div>
))

jest.mock('./screens/SharedCourse', () => () => (
  <div>SHARED_COURSE_PAGE</div>
))

jest.mock('./screens/Favorites', () => () => (
  <div>FAVORITES_PAGE</div>
))

jest.mock('./screens/MyPage', () => () => (
  <div>MYPAGE_PAGE</div>
))

jest.mock('./screens/Login', () => () => (
  <div>LOGIN_PAGE</div>
))

jest.mock('./screens/LoginPrompt', () => () => (
  <div>LOGIN_PROMPT_PAGE</div>
))

jest.mock('./screens/ProfileSetup', () => () => (
  <div>PROFILE_PAGE</div>
))

describe('로그인 성공 후 프로필 완성 여부 확인', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    window.history.replaceState(
      {},
      '',
      '/?login=success'
    )
  })

  test('nickname이 없으면 /profile로 이동한다', async () => {
    getCurrentMember.mockResolvedValue({
      memberId: 1,
      nickname: '',
      residence: '마포구',
      interestCategories: ['전시'],
      favoriteCount: 0,
    })

    render(<App />)

    expect(
      await screen.findByText('PROFILE_PAGE')
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe(
      '/profile'
    )
  })

  test('residence가 없으면 /profile로 이동한다', async () => {
    getCurrentMember.mockResolvedValue({
      memberId: 1,
      nickname: '테스트유저',
      residence: '',
      interestCategories: ['전시'],
      favoriteCount: 0,
    })

    render(<App />)

    expect(
      await screen.findByText('PROFILE_PAGE')
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe(
      '/profile'
    )
  })

  test('interestCategories가 비어 있어도 /로 이동한다', async () => {
    getCurrentMember.mockResolvedValue({
      memberId: 1,
      nickname: '테스트유저',
      residence: '마포구',
      interestCategories: [],
      favoriteCount: 0,
    })

    render(<App />)

    expect(
      await screen.findByText('HOME_PAGE')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
      expect(window.location.search).toBe('')
    })
  })

  test('프로필이 모두 완성되어 있으면 /로 이동한다', async () => {
    getCurrentMember.mockResolvedValue({
      memberId: 1,
      nickname: '테스트유저',
      residence: '마포구',
      interestCategories: ['전시', '공연'],
      favoriteCount: 0,
    })

    render(<App />)

    expect(
      await screen.findByText('HOME_PAGE')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
      expect(window.location.search).toBe('')
    })
  })
})

describe('로그인 필요 탭 보호', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each(['/course', '/favorites', '/my', '/shared/courses/share-1'])(
    '비로그인 상태에서 %s 진입 시 로그인 안내 화면으로 이동한다',
    async path => {
      getCurrentMember.mockResolvedValue(null)
      window.history.replaceState({}, '', path)

      render(<App />)

      expect(await screen.findByText('LOGIN_PROMPT_PAGE')).toBeInTheDocument()
      expect(window.location.pathname).toBe('/login-prompt')
    }
  )

  test('비로그인 상태에서 보호된 탭을 여러 번 눌러도 로그인 안내가 기록에 쌓이지 않는다', async () => {
    getCurrentMember.mockResolvedValue(null)
    window.history.replaceState({}, '', '/')

    render(<App />)
    await screen.findByText('HOME_PAGE')
    const startLength = window.history.length
    const mobileNav = screen.getByRole('navigation', { name: '모바일 주 메뉴' })

    for (const tab of ['관심', '마이', '코스']) {
      fireEvent.click(within(mobileNav).getByRole('link', { name: tab }))
      expect(await screen.findByText('LOGIN_PROMPT_PAGE')).toBeInTheDocument()
    }

    expect(window.history.length).toBe(startLength + 1)
    expect(within(mobileNav).getByRole('link', { name: '코스' })).toHaveAttribute('aria-current', 'page')
  })

  test('로그인 상태에서는 코스 탭에 진입한다', async () => {
    getCurrentMember.mockResolvedValue({ memberId: 1 })
    window.history.replaceState({}, '', '/course')

    render(<App />)

    expect(await screen.findByText('COURSE_PAGE')).toBeInTheDocument()
  })

  test('로그인 상태에서는 공유 코스 화면에 진입한다', async () => {
    getCurrentMember.mockResolvedValue({ memberId: 1 })
    window.history.replaceState({}, '', '/shared/courses/share-1')

    render(<App />)

    expect(await screen.findByText('SHARED_COURSE_PAGE')).toBeInTheDocument()
  })
})

describe('앱 메뉴 로그인 상태', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.replaceState({}, '', '/')
  })

  test('비로그인 상태에서는 로그인 링크를 표시한다', async () => {
    getCurrentMember.mockResolvedValue(null)
    render(<App />)

    expect(await screen.findByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument()
  })

  test('태블릿과 데스크톱 주 메뉴는 화면 높이로 고정된다', async () => {
    getCurrentMember.mockResolvedValue(null)
    render(<App />)

    const navigation = await screen.findByRole('navigation', { name: '주 메뉴' })
    expect(navigation).toHaveClass('sticky', 'top-0', 'h-dvh', 'self-start')
    expect(navigation.parentElement).toHaveClass('overflow-x-clip')
    expect(navigation.parentElement).not.toHaveClass('overflow-x-hidden')
  })

  test('로그인 상태에서는 확인 후 로그아웃한다', async () => {
    getCurrentMember.mockResolvedValue({ memberId: 1 })
    api.post.mockResolvedValue({ status: 204 })
    localStorage.setItem('culturemate.course-edit.v1', JSON.stringify({ courseId: 1, version: 3 }))
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: '로그아웃' }))
    const dialog = screen.getByRole('dialog', { name: '로그아웃' })
    expect(within(dialog).getByText('로그아웃 하시겠어요?')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: '로그아웃' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/logout'))
    expect(await screen.findByText('HOME_PAGE')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument()
    expect(localStorage.getItem('culturemate.course-edit.v1')).toBeNull()
  })
})
