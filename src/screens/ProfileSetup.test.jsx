import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import api from '../api/axios'
import ProfileSetup from './ProfileSetup'

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}))

function LocationDisplay() {
  const location = useLocation()

  return (
    <output data-testid="location">
      {location.pathname}
    </output>
  )
}

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <LocationDisplay />

      <Routes>
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/" element={<div>메인 화면</div>} />
        <Route path="/login" element={<div>로그인 화면</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function goToInterestStep() {
  fireEvent.change(
    screen.getByPlaceholderText('닉네임 입력'),
    {
      target: { value: '문화인' },
    }
  )

  fireEvent.click(
    screen.getByRole('button', { name: '다음' })
  )

  fireEvent.click(
    screen.getByRole('button', { name: '마포구' })
  )

  fireEvent.click(
    screen.getByRole('button', { name: '다음' })
  )
}

beforeEach(() => {
  api.put.mockReset()
})

test('닉네임이 2자 미만이면 다음 단계로 이동할 수 없다', () => {
  renderProfile()

  const nextButton = screen.getByRole('button', {
    name: '다음',
  })

  expect(nextButton).toBeDisabled()

  fireEvent.change(
    screen.getByPlaceholderText('닉네임 입력'),
    {
      target: { value: '문' },
    }
  )

  expect(
    screen.getByText('닉네임은 2자 이상 입력해주세요.')
  ).toBeInTheDocument()

  expect(nextButton).toBeDisabled()
})

test('거주지와 관심 카테고리를 선택할 수 있다', () => {
  renderProfile()

  goToInterestStep()

  expect(
    screen.getByText('무엇에 관심 있으세요?')
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', { name: /전시/ })
  )

  expect(
    screen.getByRole('button', { name: /전시/ })
  ).toHaveClass('bg-[#FF6B47]')
})

test('개인정보 동의 전에는 완료 버튼이 비활성화된다', () => {
  renderProfile()

  goToInterestStep()

  fireEvent.click(
    screen.getByRole('button', { name: /전시/ })
  )

  expect(
    screen.getByRole('button', { name: '완료' })
  ).toBeDisabled()
})

test('프로필 저장 요청에 닉네임 거주지 관심 카테고리를 포함한다', async () => {
  api.put.mockResolvedValue({
    data: {
      memberId: 1,
      nickname: '문화인',
      residence: '마포구',
      interestCategories: ['전시'],
      favoriteCount: 0,
    },
  })

  renderProfile()

  goToInterestStep()

  fireEvent.click(
    screen.getByRole('button', { name: /전시/ })
  )

  fireEvent.click(
    screen.getByRole('checkbox')
  )

  fireEvent.click(
    screen.getByRole('button', { name: '완료' })
  )

  await waitFor(() => {
    expect(api.put).toHaveBeenCalledWith('/auth/me', {
      nickname: '문화인',
      residence: '마포구',
      interestCategories: ['전시'],
    })
  })
})

test('프로필 저장 성공 후 메인 화면으로 이동한다', async () => {
  api.put.mockResolvedValue({
    data: {
      memberId: 1,
      nickname: '문화인',
      residence: '마포구',
      interestCategories: ['전시'],
      favoriteCount: 0,
    },
  })

  renderProfile()

  goToInterestStep()

  fireEvent.click(
    screen.getByRole('button', { name: /전시/ })
  )

  fireEvent.click(
    screen.getByRole('checkbox')
  )

  fireEvent.click(
    screen.getByRole('button', { name: '완료' })
  )

  expect(
    await screen.findByText('메인 화면')
  ).toBeInTheDocument()

  expect(screen.getByTestId('location')).toHaveTextContent('/')
})

test('프로필 저장 중 401이 발생하면 로그인 화면으로 이동한다', async () => {
  api.put.mockRejectedValue({
    response: {
      status: 401,
    },
  })

  renderProfile()

  goToInterestStep()

  fireEvent.click(
    screen.getByRole('button', { name: /전시/ })
  )

  fireEvent.click(
    screen.getByRole('checkbox')
  )

  fireEvent.click(
    screen.getByRole('button', { name: '완료' })
  )

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()

  expect(screen.getByTestId('location')).toHaveTextContent('/login')
})