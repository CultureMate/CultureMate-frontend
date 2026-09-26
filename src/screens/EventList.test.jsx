import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import EventList from './EventList'
import Search from './Search'
import EventDetail from './EventDetail'

jest.mock('../api/axios', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }))
jest.mock('../api/comments', () => ({ getComments: () => Promise.resolve([]), createComment: jest.fn(), updateComment: jest.fn(), deleteComment: jest.fn(), getCommentError: () => '댓글 오류' }))
jest.mock('../api/auth', () => ({ getCurrentMember: () => Promise.resolve(null) }))
const eventId = 'https://culture.seoul.go.kr/event?id=12&name=서울'
const event = { eventId, title: '서울 사진 전시', category: '전시/미술', district: '마포구', place: '문화회관', startDate: '2026-10-10', endDate: '2026-10-12' }
const result = events => ({ data: { events, count: events.length, totalCount: events.length } })

function LocationControls() {
  const navigate = useNavigate()
  const location = useLocation()
  return <><output data-testid="url">{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>브라우저 뒤로</button></>
}
function renderEvents(initial = '/events') {
  return render(<MemoryRouter initialEntries={[initial]}><LocationControls /><Routes>
    <Route path="/events" element={<EventList />} />
    <Route path="/events/filter" element={<EventList initialFilterOpen />} />
    <Route path="/search" element={<Search />} />
    <Route path="/events/:id" element={<EventDetail />} />
  </Routes></MemoryRouter>)
}

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  api.get.mockReset()
  api.post.mockReset().mockImplementation((path, body, config) => Promise.resolve({
    data: path === '/events/summary'
      ? { eventId: config.params.eventId, summary: '행사 소개문' }
      : { eventId: config.params.eventId, viewCount: 1 },
  }))
  api.get.mockResolvedValue(result([event]))
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-24T01:00:00Z').getTime())
})
afterEach(() => { delete process.env.REACT_APP_DATA_MODE; jest.restoreAllMocks() })

test('loads real results and preserves filters when returning from URL-ID detail', async () => {
  api.get.mockImplementation(path => Promise.resolve(path === '/events/detail' ? { data: event } : result([event])))
  renderEvents('/events?district=마포구&keyword=사진')
  expect(within(screen.getByRole('region', { name: '행사 검색 결과' })).getByRole('status')).toHaveTextContent('불러오는 중')
  const card = await screen.findByRole('link', { name: /서울 사진 전시/ })
  expect(screen.getByText('1개의 행사')).toBeInTheDocument()
  fireEvent.click(card)
  expect(await screen.findByRole('heading', { name: '서울 사진 전시' })).toBeInTheDocument()
  expect(api.get).toHaveBeenCalledWith('/events/detail', expect.objectContaining({ params: { eventId } }))
  fireEvent.click(screen.getAllByRole('button', { name: '목록으로' })[0])
  await screen.findByRole('link', { name: /서울 사진 전시/ })
  expect(screen.getByRole('searchbox')).toHaveValue('사진')
  expect(screen.getByRole('button', { name: '마포구 조건 해제' })).toBeInTheDocument()
})

test('filter changes are drafts until Apply, cancel discards them, dates support multiple months', async () => {
  renderEvents()
  await screen.findByText('1개의 행사')
  fireEvent.click(screen.getByRole('button', { name: '필터' }))
  let dialog = within(screen.getByRole('dialog', { name: '필터' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: '강남구' }))
  expect(api.get).toHaveBeenCalledTimes(1)
  fireEvent.click(dialog.getByRole('button', { name: '취소' }))
  fireEvent.click(screen.getByRole('button', { name: '필터' }))
  dialog = within(screen.getByRole('dialog', { name: '필터' }))
  expect(dialog.getByRole('checkbox', { name: '강남구' })).not.toBeChecked()
  fireEvent.click(dialog.getByRole('button', { name: '자치구 더보기' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: '강남구' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: '마포구' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: '전시' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: '공연' }))
  fireEvent.click(dialog.getByRole('button', { name: '2026-09-30' }))
  fireEvent.click(dialog.getByRole('button', { name: '다음 달' }))
  fireEvent.click(dialog.getByRole('button', { name: '2026-10-01' }))
  fireEvent.click(dialog.getByRole('button', { name: '필터 적용하기' }))
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  const params = api.get.mock.calls[1][1].params
  expect(params.getAll('district')).toEqual(['강남구', '마포구'])
  expect(params.getAll('category')).toEqual(['전시', '공연'])
  expect(params.get('from')).toBe('2026-09-30')
  expect(params.get('to')).toBe('2026-10-01')
  expect(screen.getByRole('button', { name: '2026-09-30 ~ 2026-10-01 조건 해제' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '마포구 조건 해제' }))
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(3))
  expect(api.get.mock.calls[2][1].params.getAll('district')).toEqual(['강남구'])
  fireEvent.click(screen.getByRole('button', { name: '2026-09-30 ~ 2026-10-01 조건 해제' }))
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(4))
  expect(api.get.mock.calls[3][1].params.has('from')).toBe(false)
  expect(api.get.mock.calls[3][1].params.has('to')).toBe(false)
})

test('a single date submits the same start and end, then an earlier date completes the range', async () => {
  renderEvents('/search')
  fireEvent.click(screen.getByRole('button', { name: '2026-09-24' }))
  expect(screen.getByLabelText('시작일')).toHaveTextContent('2026-09-24')
  expect(screen.getByLabelText('종료일')).toHaveTextContent('2026-09-24')
  fireEvent.click(screen.getByRole('button', { name: '행사 검색' }))
  await screen.findByText('1개의 행사')
  expect(api.get.mock.calls[0][1].params.get('from')).toBe('2026-09-24')
  expect(api.get.mock.calls[0][1].params.get('to')).toBe('2026-09-24')
  fireEvent.click(screen.getByRole('button', { name: '필터 1' }))
  const dialog = within(screen.getByRole('dialog', { name: '필터' }))
  fireEvent.click(dialog.getByRole('button', { name: '2026-09-20' }))
  expect(dialog.getByLabelText('시작일')).toHaveTextContent('2026-09-20')
  expect(dialog.getByLabelText('종료일')).toHaveTextContent('2026-09-24')
  expect(dialog.getByRole('button', { name: '2026-09-22' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(dialog.getByRole('button', { name: '필터 적용하기' }))
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  expect(api.get.mock.calls[1][1].params.get('from')).toBe('2026-09-20')
  expect(api.get.mock.calls[1][1].params.get('to')).toBe('2026-09-24')
})

test('completed ranges restart on the third click; clearing and reset restart selection', () => {
  renderEvents('/search')
  const pick = date => fireEvent.click(screen.getByRole('button', { name: date }))
  pick('2026-09-24')
  pick('2026-09-20')
  pick('2026-09-28')
  expect(screen.getByLabelText('시작일')).toHaveTextContent('2026-09-28')
  expect(screen.getByLabelText('종료일')).toHaveTextContent('2026-09-28')
  pick('2026-09-28')
  pick('2026-09-25')
  expect(screen.getByLabelText('종료일')).toHaveTextContent('2026-09-25')
  fireEvent.click(screen.getByRole('button', { name: /날짜 선택 해제/ }))
  expect(screen.getByLabelText('시작일')).toHaveTextContent('선택 안 함')
  pick('2026-09-20')
  fireEvent.click(screen.getByRole('button', { name: '초기화' }))
  pick('2026-09-24')
  expect(screen.getByLabelText('시작일')).toHaveTextContent('2026-09-24')
  expect(screen.getByLabelText('종료일')).toHaveTextContent('2026-09-24')
})

test('keyword submit resets page, and browser Back restores the previous query', async () => {
  renderEvents('/events?page=2&district=마포구')
  await screen.findByText('1개의 행사')
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  사진  ' } })
  expect(api.get).toHaveBeenCalledTimes(1)
  fireEvent.submit(screen.getByRole('form', { name: '행사 검색' }))
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  expect(api.get.mock.calls[1][1].params.get('page')).toBe('0')
  expect(api.get.mock.calls[1][1].params.get('keyword')).toBe('사진')
  fireEvent.click(screen.getByRole('button', { name: '브라우저 뒤로' }))
  await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
  expect(screen.getByTestId('url')).toHaveTextContent('page=2')
})

test('pagination requests another page and categories return to page zero', async () => {
  api.get.mockResolvedValue({ data: { events: [event], count: 1, totalCount: 10 } })
  renderEvents()
  await screen.findByText('10개의 행사')
  fireEvent.click(screen.getByRole('button', { name: '다음' }))
  await screen.findByText('2 / 2')
  expect(api.get.mock.calls[1][1].params.get('page')).toBe('1')
  expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '전시' }))
  await screen.findByText('1 / 2')
  expect(api.get.mock.calls[2][1].params.getAll('category')).toEqual(['전시'])
})

test('no results opens condition guidance and a 401 is an error with retry', async () => {
  api.get.mockResolvedValueOnce(result([]))
  renderEvents()
  const dialog = await screen.findByRole('dialog', { name: '검색 결과가 없습니다' })
  expect(screen.getByText('0개의 행사')).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: '조건 변경하기' }))
  const filter = within(screen.getByRole('dialog', { name: '필터' }))
  fireEvent.click(filter.getByRole('checkbox', { name: '전시' }))
  api.get.mockRejectedValueOnce({ response: { status: 401 } })
  fireEvent.click(filter.getByRole('button', { name: '필터 적용하기' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('로그인이 필요')
  expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await screen.findByText('1개의 행사')).toBeInTheDocument()
})

test('a late request cannot replace the new search result', async () => {
  let resolveOld
  api.get.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
  renderEvents()
  const signal = api.get.mock.calls[0][1].signal
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '사진' } })
  fireEvent.submit(screen.getByRole('form', { name: '행사 검색' }))
  await screen.findByText('1개의 행사')
  await act(async () => resolveOld(result([{ ...event, title: '오래된 응답' }])))
  expect(signal.aborted).toBe(true)
  expect(screen.queryByText('오래된 응답')).not.toBeInTheDocument()
})

test('search screen transfers selected conditions to results with mock filtering', async () => {
  process.env.REACT_APP_DATA_MODE = 'mock'
  renderEvents('/search')
  fireEvent.click(screen.getByRole('checkbox', { name: '강남구' }))
  fireEvent.click(screen.getByRole('checkbox', { name: '전시' }))
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '아트페어' } })
  fireEvent.click(screen.getByRole('button', { name: '행사 검색' }))
  expect(await screen.findByText('1개의 행사')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /강남 아트페어/ })).toBeInTheDocument()
  expect(screen.getByText('데모 데이터')).toBeInTheDocument()
  expect(api.get).not.toHaveBeenCalled()
})

test('direct filter route is usable and closing it returns to the list URL', async () => {
  renderEvents('/events/filter?district=강남구')
  const dialog = screen.getByRole('dialog', { name: '필터' })
  expect(within(dialog).getByRole('checkbox', { name: '강남구' })).toBeChecked()
  fireEvent.click(within(dialog).getByRole('button', { name: '닫기' }))
  expect(decodeURIComponent(screen.getByTestId('url').textContent)).toBe('/events?district=강남구')
  await screen.findByText('1개의 행사')
})
