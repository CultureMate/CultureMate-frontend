import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Course from './Course'
import { COURSE_DRAFT_KEY, writeCourseDraft } from '../utils/courseDraft'

const renderCourse = () => render(<MemoryRouter><Course /></MemoryRouter>)

afterEach(() => localStorage.clear())

test('shows the events added with "코스에 담기" in order and lets the user remove them', () => {
  writeCourseDraft([
    { eventId: 'a', title: '사진 전시', place: '서울 전시장', startDate: '2026-10-10', endDate: '2026-10-12' },
    { eventId: 'b', title: '가을 공연', place: '서울 공연장', startDate: '2026-10-11', endDate: '2026-10-11' },
  ])
  renderCourse()

  const list = screen.getByRole('list')
  expect(screen.getByRole('heading', { name: /코스에 담은 행사 2개/ })).toBeInTheDocument()
  expect(within(list).getAllByRole('listitem').map(item => item.textContent)).toEqual([
    expect.stringContaining('사진 전시'),
    expect.stringContaining('가을 공연'),
  ])
  expect(within(list).getByRole('link', { name: /사진 전시/ })).toHaveAttribute('href', '/events/a')

  fireEvent.click(screen.getByRole('button', { name: '사진 전시 코스에서 빼기' }))
  expect(screen.getByRole('heading', { name: /코스에 담은 행사 1개/ })).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(COURSE_DRAFT_KEY)).map(item => item.eventId)).toEqual(['b'])

  fireEvent.click(screen.getByRole('button', { name: '모두 비우기' }))
  expect(screen.getByText(/아직 담은 행사가 없어요/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '행사 담으러 가기' })).toHaveAttribute('href', '/events')
})
