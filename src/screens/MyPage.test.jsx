import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import MyPage from './MyPage'
import { getCurrentMember } from '../api/auth'
import api from '../api/axios'

jest.mock('../api/auth', () => ({
  getCurrentMember: jest.fn(),
}))

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const MEMBER = {
  memberId: 1,
  nickname: '테스트유저',
  residence: '마포구',
  interestCategories: ['전시', '공연'],
  favoriteCount: 3,
}

function renderMyPage() {
  return render(
    <MemoryRouter initialEntries={['/my']}>
      <Routes>
        <Route
          path="/my"
          element={<MyPage />}
        />

        <Route
          path="/login"
          element={<div>로그인 화면</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  getCurrentMember.mockReset()
  api.put.mockReset()
  api.post.mockReset()
  api.delete.mockReset()

  getCurrentMember.mockResolvedValue(MEMBER)
})

test('로그인한 회원정보와 저장한 행사 수를 표시한다', async () => {
  renderMyPage()

  const nicknames =
    await screen.findAllByText('테스트유저')

  expect(nicknames.length).toBeGreaterThan(0)

  expect(
    screen.getAllByText('마포구').length
  ).toBeGreaterThan(0)

  expect(
    screen.getByText('3개')
  ).toBeInTheDocument()

  expect(
    screen.getByText('저장한 행사')
  ).toBeInTheDocument()
})

test('기존 관심 카테고리를 표시한다', async () => {
  renderMyPage()

  await screen.findAllByText('테스트유저')

  expect(
    screen.getByText('전시')
  ).toBeInTheDocument()

  expect(
    screen.getByText('공연')
  ).toBeInTheDocument()
})

test('닉네임 거주지 관심사를 함께 수정한다', async () => {
  api.put.mockResolvedValue({
    data: {
      ...MEMBER,
      nickname: '수정유저',
      residence: '강남구',
      interestCategories: ['전시', '음악'],
    },
  })

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: '수정',
    })
  )

  const nicknameInput =
    screen.getByDisplayValue('테스트유저')

  fireEvent.change(nicknameInput, {
    target: {
      value: '수정유저',
    },
  })

  fireEvent.click(
    screen.getByRole('button', {
      name: '강남구',
    })
  )

  // 기존 관심사 공연 해제
  fireEvent.click(
    screen.getByRole('button', {
      name: /공연/,
    })
  )

  // 새 관심사 음악 추가
  fireEvent.click(
    screen.getByRole('button', {
      name: /음악/,
    })
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: '저장',
    })
  )

  await waitFor(() => {
    expect(api.put).toHaveBeenCalledWith(
      '/auth/me',
      {
        nickname: '수정유저',
        residence: '강남구',
        interestCategories: [
          '전시',
          '음악',
        ],
      }
    )
  })

  const updatedNicknames =
    await screen.findAllByText('수정유저')

  expect(
    updatedNicknames.length
  ).toBeGreaterThan(0)

  expect(
    screen.getByText('음악')
  ).toBeInTheDocument()
})

test('회원정보 저장 실패 시 기존 회원정보를 유지한다', async () => {
  api.put.mockRejectedValue(
    new Error('save failed')
  )

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: '수정',
    })
  )

  fireEvent.change(
    screen.getByDisplayValue('테스트유저'),
    {
      target: {
        value: '실패유저',
      },
    }
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: '저장',
    })
  )

  expect(
    await screen.findByText(
      '회원정보 수정에 실패했습니다.'
    )
  ).toBeInTheDocument()

  expect(
    screen.getByDisplayValue('실패유저')
  ).toBeInTheDocument()

  expect(
    screen.getByRole('heading', {
      name: '테스트유저',
    })
  ).toBeInTheDocument()
})

test('회원정보 조회 결과가 없으면 로그인 화면으로 이동한다', async () => {
  getCurrentMember.mockResolvedValue(null)

  renderMyPage()

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('회원정보 저장 중 401이 발생하면 로그인 화면으로 이동한다', async () => {
  api.put.mockRejectedValue({
    response: {
      status: 401,
    },
  })

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: '수정',
    })
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: '저장',
    })
  )

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('로그아웃 API 호출 후 로그인 화면으로 이동한다', async () => {
  api.post.mockResolvedValue({
    status: 204,
  })

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: /로그아웃/,
    })
  )

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      '/auth/logout'
    )
  })

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('회원탈퇴 취소 시 탈퇴 API를 호출하지 않는다', async () => {
  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: /회원탈퇴/,
    })
  )

  expect(
    screen.getByRole('dialog')
  ).toBeInTheDocument()

  expect(
    screen.getByText(
      '정말 탈퇴하시겠어요?'
    )
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', {
      name: '취소',
    })
  )

  expect(
    api.delete
  ).not.toHaveBeenCalled()

  expect(
    screen.queryByRole('dialog')
  ).not.toBeInTheDocument()
})

test('회원탈퇴 성공 후 로그인 화면으로 이동한다', async () => {
  api.delete.mockResolvedValue({
    status: 204,
  })

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: /회원탈퇴/,
    })
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: '탈퇴하기',
    })
  )

  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith(
      '/auth/me'
    )
  })

  expect(
    await screen.findByText('로그인 화면')
  ).toBeInTheDocument()
})

test('회원탈퇴 실패 메시지를 탈퇴 확인 모달 내부에 표시한다', async () => {
  api.delete.mockRejectedValue(
    new Error('delete failed')
  )

  renderMyPage()

  await screen.findAllByText('테스트유저')

  fireEvent.click(
    screen.getByRole('button', {
      name: /회원탈퇴/,
    })
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: '탈퇴하기',
    })
  )

  const dialog =
    await screen.findByRole('dialog')

  expect(
    await within(dialog).findByText(
      '회원탈퇴 처리에 실패했습니다.'
    )
  ).toBeInTheDocument()

  expect(
    within(dialog).getByRole('alert')
  ).toBeInTheDocument()
})