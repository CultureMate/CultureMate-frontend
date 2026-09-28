import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import App from './App'
import { getCurrentMember } from './api/auth'

jest.mock('./api/auth', () => ({
  getCurrentMember: jest.fn(),
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