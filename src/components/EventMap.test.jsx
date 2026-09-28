import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
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

test('missing coordinates hide the map and show the location fallback', () => {
  render(<EventMap event={{ ...event, latitude: null, longitude: null }} />)
  expect(screen.getByText('위치 정보 없음')).toBeInTheDocument()
  expect(screen.queryByLabelText('행사 위치 지도')).not.toBeInTheDocument()
  expect(loadKakaoMaps).not.toHaveBeenCalled()
  expect(screen.getByRole('link', { name: /카카오맵에서 보기/ })).toHaveAttribute(
    'href',
    `https://map.kakao.com/link/search/${encodeURIComponent('서울 강남구 코엑스')}`
  )
})

test('missing coordinates and place show no empty map link', () => {
  render(<EventMap event={{ ...event, place: '', latitude: null, longitude: null }} />)
  expect(screen.getByText('위치 정보 없음')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /카카오맵에서 보기/ })).not.toBeInTheDocument()
  expect(loadKakaoMaps).not.toHaveBeenCalled()
})

test('missing key gives usable guidance without a broken map', async () => {
  loadKakaoMaps.mockRejectedValue(new Error('MAP_KEY_MISSING'))
  render(<EventMap event={event} />)
  await screen.findByText(/지도 서비스를 준비 중/)
  expect(screen.getByRole('link')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '지도 다시 시도' })).not.toBeInTheDocument()
})

test('SDK failure can be retried', async () => {
  loadKakaoMaps.mockRejectedValueOnce(new Error('MAP_LOAD_FAILED'))
  render(<EventMap event={event} />)
  fireEvent.click(await screen.findByRole('button', { name: '지도 다시 시도' }))
  await screen.findByText('행사에서 제공한 위치입니다.')
  expect(loadKakaoMaps).toHaveBeenCalledTimes(2)
})

test('one missing coordinate also hides the map', () => {
  render(<EventMap event={{ ...event, longitude: null }} />)
  expect(screen.getByText('위치 정보 없음')).toBeInTheDocument()
  expect(maps.Map).not.toHaveBeenCalled()
})
