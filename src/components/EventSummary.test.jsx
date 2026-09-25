import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import EventSummary from './EventSummary'
import { getEventSummary } from '../api/eventSummary'

jest.mock('../api/eventSummary', () => ({
  getEventSummary: jest.fn(),
  getEventSummaryError: error => error.message,
}))

const event = { eventId: 'event-1', title: '행사' }
beforeEach(() => { getEventSummary.mockReset() })

test('shows loading and then the returned AI summary', async () => {
  let resolveSummary
  getEventSummary.mockImplementation(() => new Promise(resolve => { resolveSummary = resolve }))
  render(<EventSummary event={event} />)
  expect(screen.getByRole('status')).toHaveTextContent('작성하고 있습니다')
  await waitFor(() => expect(getEventSummary).toHaveBeenCalledTimes(1))
  await act(async () => resolveSummary({ eventId: 'event-1', summary: 'AI가 만든 소개문', isMock: false }))
  expect(screen.getByText('AI가 만든 소개문')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'AI 소개문' })).toBeInTheDocument()
})

test('sample summaries have an explicit label', async () => {
  getEventSummary.mockResolvedValue({ eventId: 'mock-1', summary: '샘플 설명', isMock: true })
  render(<EventSummary event={{ ...event, eventId: 'mock-1' }} />)
  expect(await screen.findByText('샘플 설명')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '샘플 소개문' })).toBeInTheDocument()
})

test('failure displays guidance and retry starts a fresh request', async () => {
  getEventSummary.mockRejectedValueOnce(new Error('소개문 생성 실패'))
    .mockResolvedValueOnce({ eventId: 'event-1', summary: '재시도 성공', isMock: false })
  render(<EventSummary event={event} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('소개문 생성 실패')
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await screen.findByText('재시도 성공')).toBeInTheDocument()
  expect(getEventSummary).toHaveBeenCalledTimes(2)
})

test('changing events aborts the previous request and ignores its late result', async () => {
  let resolveOld
  getEventSummary.mockImplementationOnce((id, signal) => new Promise(resolve => {
    resolveOld = resolve
    expect(id).toBe('event-1')
    expect(signal.aborted).toBe(false)
  })).mockResolvedValueOnce({ eventId: 'event-2', summary: '새 행사 소개', isMock: false })
  const { rerender } = render(<EventSummary event={event} />)
  await waitFor(() => expect(getEventSummary).toHaveBeenCalledTimes(1))
  const oldSignal = getEventSummary.mock.calls[0][1]
  rerender(<EventSummary event={{ ...event, eventId: 'event-2' }} />)
  expect(await screen.findByText('새 행사 소개')).toBeInTheDocument()
  expect(oldSignal.aborted).toBe(true)
  await act(async () => resolveOld({ eventId: 'event-1', summary: '오래된 소개', isMock: false }))
  expect(screen.queryByText('오래된 소개')).not.toBeInTheDocument()
})
