import { StrictMode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import EventViewCount from './EventViewCount'
import { increaseEventView } from '../api/eventViews'

jest.mock('../api/eventViews', () => ({ increaseEventView: jest.fn() }))

beforeEach(() => { increaseEventView.mockReset() })

test('increments once in StrictMode and displays the server count', async () => {
  increaseEventView.mockResolvedValue(124)
  render(<StrictMode><EventViewCount eventId="event-1" initialCount={123} /></StrictMode>)
  expect(screen.getByLabelText('조회수 123')).toBeInTheDocument()
  expect(await screen.findByLabelText('조회수 124')).toBeInTheDocument()
  expect(increaseEventView).toHaveBeenCalledTimes(1)
  expect(increaseEventView).toHaveBeenCalledWith('event-1', expect.any(AbortSignal))
})

test('mock events retain their sample count without an API request', async () => {
  render(<EventViewCount eventId="mock-1" initialCount={3000} isMock />)
  expect(screen.getByLabelText('조회수 3,000')).toBeInTheDocument()
  await act(async () => {})
  expect(increaseEventView).not.toHaveBeenCalled()
})

test('failures retain the detail count and show a non-blocking status', async () => {
  increaseEventView.mockRejectedValue({ response: { status: 404 } })
  render(<EventViewCount eventId="missing" initialCount={7} />)
  expect(await screen.findByLabelText('조회수 반영 실패')).toBeInTheDocument()
  expect(screen.getByLabelText('조회수 7')).toBeInTheDocument()
})

test('changing events aborts the old request and ignores its late response', async () => {
  let resolveOld
  increaseEventView.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    .mockResolvedValueOnce(21)
  const { rerender } = render(<EventViewCount eventId="event-1" initialCount={10} />)
  await waitFor(() => expect(increaseEventView).toHaveBeenCalledTimes(1))
  const oldSignal = increaseEventView.mock.calls[0][1]
  rerender(<EventViewCount eventId="event-2" initialCount={20} />)
  expect(await screen.findByLabelText('조회수 21')).toBeInTheDocument()
  expect(oldSignal.aborted).toBe(true)
  await act(async () => resolveOld(999))
  expect(screen.queryByLabelText('조회수 999')).not.toBeInTheDocument()
})
