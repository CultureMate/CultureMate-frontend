import { StrictMode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import EventMap from './EventMap'
import { loadKakaoMaps } from '../api/kakaoMaps'

jest.mock('../api/kakaoMaps', () => ({ loadKakaoMaps: jest.fn() }))

const event = { eventId: 'event-1', title: '문화 행사', place: '코엑스', district: '강남구', latitude: 37.512, longitude: 127.059 }
let maps, marker, map, search
beforeEach(() => {
  marker = { setMap: jest.fn() }
  map = { addControl: jest.fn(), getCenter: jest.fn(() => 'center'), relayout: jest.fn(), setCenter: jest.fn() }
  search = jest.fn()
  maps = {
    LatLng: jest.fn(function (latitude, longitude) { this.latitude = latitude; this.longitude = longitude }),
    Map: jest.fn(() => map), Marker: jest.fn(() => marker), ZoomControl: jest.fn(), ControlPosition: { RIGHT: 'right' },
    services: { Places: jest.fn(() => ({ keywordSearch: search })), Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT', ERROR: 'ERROR' } },
  }
  loadKakaoMaps.mockReset().mockResolvedValue(maps)
})

test('coordinates render a marker without searching; resize and unmount clean up', async () => {
  const { unmount } = render(<StrictMode><EventMap event={event} /></StrictMode>)
  await screen.findByText('행사에서 제공한 위치입니다.')
  expect(maps.Map).toHaveBeenCalledTimes(1)
  expect(maps.LatLng).toHaveBeenCalledWith(37.512, 127.059)
  expect(search).not.toHaveBeenCalled()
  expect(maps.Marker).toHaveBeenCalledWith(expect.objectContaining({ map, title: '코엑스' }))
  expect(screen.getByRole('link')).toHaveAttribute('href', `https://map.kakao.com/link/map/${encodeURIComponent('코엑스')},37.512,127.059`)
  fireEvent(window, new Event('resize'))
  expect(map.relayout).toHaveBeenCalled()
  expect(map.setCenter).toHaveBeenCalledWith(expect.objectContaining({ latitude: 37.512, longitude: 127.059 }))
  unmount()
  expect(marker.setMap).toHaveBeenCalledWith(null)
})

test('missing coordinates use a labelled place search result, with x/y in the right order', async () => {
  search.mockImplementation((query, callback) => callback([
    { x: '129.1', y: '35.1', place_name: '다른 지역', address_name: '부산' },
    { x: '127.059', y: '37.512', place_name: '검색 코엑스', address_name: '서울 강남구 삼성동' },
  ], 'OK'))
  render(<EventMap event={{ ...event, latitude: null, longitude: null }} />)
  await screen.findByText('검색된 장소: 검색 코엑스')
  expect(search).toHaveBeenCalledWith('서울 강남구 코엑스', expect.any(Function), { size: 5 })
  expect(maps.LatLng).toHaveBeenCalledWith(37.512, 127.059)
  expect(screen.getByText(/장소명으로 찾은 위치입니다/)).toBeInTheDocument()
})

test('missing key and missing location give usable guidance without a broken map', async () => {
  loadKakaoMaps.mockRejectedValue(new Error('MAP_KEY_MISSING'))
  const { rerender } = render(<EventMap event={event} />)
  await screen.findByText(/지도 서비스를 준비 중/)
  expect(screen.getByRole('link')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '지도 다시 시도' })).not.toBeInTheDocument()
  rerender(<EventMap event={{ eventId: 'empty' }} />)
  await screen.findByText('행사 위치 정보가 없습니다.')
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(maps.Map).not.toHaveBeenCalled()
})

test('SDK failure can be retried', async () => {
  loadKakaoMaps.mockRejectedValueOnce(new Error('MAP_LOAD_FAILED'))
  render(<EventMap event={event} />)
  fireEvent.click(await screen.findByRole('button', { name: '지도 다시 시도' }))
  await screen.findByText('행사에서 제공한 위치입니다.')
  expect(loadKakaoMaps).toHaveBeenCalledTimes(2)
})

test('zero results keep the external search link and never show an invented marker', async () => {
  search.mockImplementation((query, callback) => callback([], 'ZERO_RESULT'))
  render(<EventMap event={{ ...event, latitude: '', longitude: '' }} />)
  await screen.findByText(/정확한 위치를 찾지 못했습니다/)
  expect(screen.getByRole('link').href).toContain('/link/search/')
  expect(maps.Marker).not.toHaveBeenCalled()
})

test('late place results cannot replace a new event', async () => {
  let oldCallback
  search.mockImplementation((query, callback) => { oldCallback = callback })
  const { rerender } = render(<EventMap event={{ ...event, latitude: '', longitude: '' }} />)
  await waitFor(() => expect(search).toHaveBeenCalled())
  rerender(<EventMap event={{ ...event, eventId: 'next', latitude: 37.57 }} />)
  await screen.findByText('행사에서 제공한 위치입니다.')
  await act(async () => oldCallback([{ x: '127.059', y: '37.512', place_name: '오래된 검색', address_name: '서울 강남구' }], 'OK'))
  expect(maps.LatLng).toHaveBeenCalledTimes(1)
  expect(maps.LatLng).toHaveBeenCalledWith(37.57, 127.059)
  expect(screen.queryByText(/오래된 검색/)).not.toBeInTheDocument()
})
