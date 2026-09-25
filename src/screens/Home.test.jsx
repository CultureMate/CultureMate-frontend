import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import api from '../api/axios'
import Home from './Home'
import EventDetail from './EventDetail'

jest.mock('../api/axios', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }))

const eventId = 'https://culture.seoul.go.kr/event?id=12&name=서울'
const hot = { eventId, title: '인기 전시', viewCount: 1234, imageUrl: null }
const upcoming = { eventId: 'upcoming-1', title: '다가오는 공연', place: '문화회관', startDate: '2026-10-01', dDay: 3 }

function renderHome(props = {}) {
  return render(<MemoryRouter><Home {...props} /></MemoryRouter>)
}

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  api.get.mockReset()
  api.post.mockReset().mockImplementation((path, body, config) => Promise.resolve({ data: { eventId: config.params.eventId, viewCount: 124 } }))
  api.get.mockImplementation(path => Promise.resolve({ data: { events: path.includes('hot-events') ? [hot] : [upcoming] } }))
})

afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('loads the two API sections, keeps server order and links URL-shaped IDs', async () => {
  renderHome()
  expect(screen.getAllByRole('status')).toHaveLength(2)
  const card = await screen.findByRole('link', { name: /인기 전시/ })
  expect(card).toHaveAttribute('href', `/events/${encodeURIComponent(eventId)}`)
  expect(screen.getByLabelText('조회수 1,234')).toHaveTextContent('👁1,234')
  expect(screen.getByText('D-3')).toBeInTheDocument()
  expect(screen.getByText(/문화회관 · 10월 1일/)).toBeInTheDocument()
  expect(api.get).toHaveBeenCalledWith('/main/upcoming-events', expect.objectContaining({ params: { limit: 6 } }))
  expect(api.get).toHaveBeenCalledWith('/main/hot-events', expect.objectContaining({ params: { limit: 6 } }))
  expect(screen.getByRole('link', { name: /어떤 문화행사/ })).toHaveAttribute('href', '/search')
})

test('an error in HOT does not hide upcoming events and retry only reloads HOT', async () => {
  api.get.mockImplementation(path => path.includes('hot-events')
    ? Promise.reject({ response: { status: 502 } })
    : Promise.resolve({ data: { events: [upcoming] } }))
  renderHome()
  expect(await screen.findByRole('alert')).toHaveTextContent('행사를 불러오지 못했습니다.')
  expect(screen.getByText('다가오는 공연')).toBeInTheDocument()
  api.get.mockResolvedValue({ data: { events: [hot] } })
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await screen.findByText('인기 전시')).toBeInTheDocument()
  expect(api.get.mock.calls.filter(([path]) => path.includes('upcoming-events'))).toHaveLength(1)
})

test('empty results and unauthorized responses show separate guidance', async () => {
  api.get.mockImplementation(path => path.includes('hot-events')
    ? Promise.resolve({ data: { events: [] } })
    : Promise.reject({ response: { status: 401 } }))
  renderHome()
  expect(await screen.findByText('표시할 행사가 없습니다.')).toBeInTheDocument()
  expect(await screen.findByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
  expect(screen.queryByText('서울 재즈 페스티벌 2026')).not.toBeInTheDocument()
})

test('malformed API response is an error rather than an empty result', async () => {
  api.get.mockResolvedValue({ data: '<html>not an API</html>' })
  renderHome()
  expect(await screen.findAllByRole('alert')).toHaveLength(2)
  expect(screen.queryByText('표시할 행사가 없습니다.')).not.toBeInTheDocument()
})

test('full HOT page requests 30 events and does not request upcoming', async () => {
  renderHome({ showAllHot: true })
  await screen.findByText('인기 전시')
  expect(api.get).toHaveBeenCalledTimes(1)
  expect(api.get).toHaveBeenCalledWith('/main/hot-events', expect.objectContaining({ params: { limit: 30 } }))
  expect(screen.queryByText('📍 다가오는 근처 행사')).not.toBeInTheDocument()
})

test('late responses from a previous view cannot overwrite current events', async () => {
  let resolveOld
  api.get.mockImplementation(path => path.includes('hot-events')
    ? new Promise(resolve => { resolveOld = resolve })
    : Promise.resolve({ data: { events: [] } }))
  const { rerender } = renderHome()
  const oldSignal = api.get.mock.calls[0][1].signal
  api.get.mockResolvedValue({ data: { events: [{ ...hot, title: '새 목록' }] } })
  rerender(<MemoryRouter><Home showAllHot /></MemoryRouter>)
  expect(await screen.findByText('새 목록')).toBeInTheDocument()
  expect(oldSignal.aborted).toBe(true)
  await act(async () => resolveOld({ data: { events: [hot] } }))
  expect(screen.queryByText('인기 전시')).not.toBeInTheDocument()
})

test('clicking a home card fetches that exact event ID and displays real detail', async () => {
  api.get.mockImplementation(path => Promise.resolve({ data: path === '/events/detail'
    ? { ...hot, place: '실제 전시장', organization: '서울시', originalUrl: 'https://culture.seoul.go.kr' }
    : { events: path.includes('hot-events') ? [hot] : [] } }))
  render(<MemoryRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events/:id" element={<EventDetail />} />
  </Routes></MemoryRouter>)
  fireEvent.click(await screen.findByRole('link', { name: /인기 전시/ }))
  expect(await screen.findByRole('heading', { name: '인기 전시' })).toBeInTheDocument()
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/events/detail', expect.objectContaining({ params: { eventId } })))
  expect(screen.getByRole('link', { name: '바로가기 →' })).toHaveAttribute('href', 'https://culture.seoul.go.kr')
})

test('broken images render a fallback without losing the event link', async () => {
  api.get.mockResolvedValue({ data: { events: [{ ...hot, imageUrl: '/missing.jpg' }] } })
  renderHome({ showAllHot: true })
  const card = await screen.findByRole('link', { name: /인기 전시/ })
  fireEvent.error(card.querySelector('img'))
  expect(within(card).getByText('이미지 없음')).toBeInTheDocument()
})

test('offline home opens its sample and supports a direct detail visit', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  api.get.mockRejectedValue({ response: { status: 500 } })
  const { unmount } = render(<MemoryRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events/:id" element={<EventDetail />} />
  </Routes></MemoryRouter>)
  const card = await within(screen.getByRole('region', { name: /HOT한 행사/ })).findByRole('link', { name: /서울 재즈 페스티벌/ })
  expect(screen.getAllByText('데모 데이터')).toHaveLength(2)
  expect(card).toHaveAttribute('href', '/events/mock-1')
  fireEvent.click(card)
  expect(await screen.findByRole('heading', { name: '서울 재즈 페스티벌 2026' })).toBeInTheDocument()
  expect(screen.getByText('데모 데이터')).toBeInTheDocument()
  expect(screen.getByText('샘플 소개문')).toBeInTheDocument()
  expect(api.get).not.toHaveBeenCalledWith('/events/detail', expect.anything())
  unmount()
  render(<MemoryRouter initialEntries={['/events/mock-1']}><Routes>
    <Route path="/events/:id" element={<EventDetail />} />
  </Routes></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: '서울 재즈 페스티벌 2026' })).toBeInTheDocument()
})

test('reconnecting replaces only the failed demo section with real data', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  api.get.mockImplementation(path => path.includes('hot-events')
    ? Promise.reject({ code: 'ERR_NETWORK' })
    : Promise.resolve({ data: { events: [upcoming] } }))
  renderHome()
  expect(await screen.findByText('데모 데이터')).toBeInTheDocument()
  expect(screen.getByText('다가오는 공연')).toBeInTheDocument()
  api.get.mockResolvedValue({ data: { events: [hot] } })
  fireEvent.click(screen.getByRole('button', { name: '서버 다시 연결' }))
  expect(await screen.findByText('인기 전시')).toBeInTheDocument()
  expect(screen.queryByText('데모 데이터')).not.toBeInTheDocument()
  expect(api.get.mock.calls.filter(([path]) => path.includes('upcoming-events'))).toHaveLength(1)
})
