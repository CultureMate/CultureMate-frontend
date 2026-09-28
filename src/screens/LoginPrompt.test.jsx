import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../App'
import { getCurrentMember, getKakaoLoginUrl } from '../api/auth'

jest.mock('../api/auth', () => ({ getCurrentMember: jest.fn(), getKakaoLoginUrl: jest.fn() }))
jest.mock('../api/axios', () => ({ __esModule: true, default: { post: jest.fn(), get: jest.fn() } }))
jest.mock('./Home', () => () => <div>HOME_PAGE</div>)
jest.mock('./Search', () => () => <div>SEARCH_PAGE</div>)
jest.mock('./Course', () => () => <div>COURSE_PAGE</div>)

beforeEach(() => getCurrentMember.mockResolvedValue(null))

test('돌아가기 returns to the screen before the protected tab instead of looping', async () => {
  window.history.replaceState(null, '', '/search')
  render(<App />)
  await screen.findByText('SEARCH_PAGE')

  fireEvent.click(screen.getAllByRole('link', { name: /코스/ })[0])
  fireEvent.click(await screen.findByRole('button', { name: /돌아가기/ }))

  expect(await screen.findByText('SEARCH_PAGE')).toBeInTheDocument()
  expect(window.location.pathname).toBe('/search')
})

test('카카오로 시작하기 starts Kakao login right away instead of opening another login page', async () => {
  getKakaoLoginUrl.mockReturnValue('#kakao-start')
  window.history.replaceState(null, '', '/course')
  render(<App />)

  fireEvent.click(await screen.findByRole('button', { name: /카카오로 시작하기/ }))

  expect(getKakaoLoginUrl).toHaveBeenCalled()
  expect(window.location.hash).toBe('#kakao-start')
  window.history.replaceState(null, '', '/')
})

test('돌아가기 goes home when the protected tab was opened directly', async () => {
  window.history.replaceState(null, '', '/course')
  render(<App />)

  fireEvent.click(await screen.findByRole('button', { name: /돌아가기/ }))

  expect(await screen.findByText('HOME_PAGE')).toBeInTheDocument()
  expect(window.location.pathname).toBe('/')
  await act(async () => {})
})
