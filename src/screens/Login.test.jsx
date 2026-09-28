import { render, screen } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './Login'

jest.mock('../api/auth', () => ({
  getKakaoLoginUrl: jest.fn(() => 'http://localhost/kakao-login'),
}))

function renderLogin(state = null) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/login',
          state,
        },
      ]}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  )
}

test('로그인 화면을 정상적으로 표시한다', () => {
  renderLogin()

  expect(
    screen.getByRole('button', {
      name: /카카오로 시작하기/,
    })
  ).toBeInTheDocument()

  expect(
    screen.getByRole('link', { name: '홈으로' })
  ).toHaveAttribute('href', '/')

  expect(
    screen.queryByText('카카오 로그인이 취소되었습니다.')
  ).not.toBeInTheDocument()
})

test('카카오 로그인이 취소된 경우 취소 안내를 표시한다', () => {
  renderLogin({
    loginCancelled: true,
  })

  expect(
    screen.getByRole('alert')
  ).toBeInTheDocument()

  expect(
    screen.getByText('카카오 로그인이 취소되었습니다.')
  ).toBeInTheDocument()

  expect(
    screen.getByText(
      '다시 로그인하려면 아래 버튼을 눌러주세요.'
    )
  ).toBeInTheDocument()
})
