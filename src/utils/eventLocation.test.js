import { getEventCoordinates, getKakaoMapLink, searchEventLocation } from './eventLocation'

test('coordinates reject missing, nonnumeric, out-of-range and zero points', () => {
  for (const latitude of [null, '', '  ', 'NaN', true, Infinity, 91, -91]) {
    expect(getEventCoordinates({ latitude, longitude: 127 })).toBeNull()
  }
  expect(getEventCoordinates({ latitude: 37, longitude: 181 })).toBeNull()
  expect(getEventCoordinates({ latitude: 0, longitude: 0 })).toBeNull()
  expect(getEventCoordinates({ latitude: '37.5', longitude: '127.1' })).toEqual({ latitude: 37.5, longitude: 127.1 })
  expect(getEventCoordinates({ lat: 37.5, lng: 127.1 })).toEqual({ latitude: 37.5, longitude: 127.1 })
})

test('map URLs encode labels and never search just a district when the venue is missing', () => {
  expect(getKakaoMapLink({ place: 'DDP 건축투어 2026, A/B', latitude: 37, longitude: 127 }))
    .toBe('https://map.kakao.com/link/map/DDP%20%EA%B1%B4%EC%B6%95%ED%88%AC%EC%96%B4%202026%20A%20B,37,127')
  expect(getKakaoMapLink({ district: '중구', place: 'DDP/디자인랩, 1층' }))
    .toBe('https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EC%A4%91%EA%B5%AC%20DDP%20%EB%94%94%EC%9E%90%EC%9D%B8%EB%9E%A9%201%EC%B8%B5')
  expect(getKakaoMapLink({ district: '강남구' })).toBeNull()
})

test('place search timeout and cancellation settle without late result changes', async () => {
  jest.useFakeTimers()
  const maps = { services: { Places: jest.fn(() => ({ keywordSearch: jest.fn() })) } }
  const event = { place: '코엑스' }
  const request = searchEventLocation(maps, event)
  const assertion = expect(request).rejects.toThrow('MAP_SEARCH_FAILED')
  jest.advanceTimersByTime(10000)
  await assertion
  const controller = new AbortController()
  const canceled = searchEventLocation(maps, event, controller.signal)
  controller.abort()
  await expect(canceled).rejects.toThrow('MAP_ABORTED')
  expect(jest.getTimerCount()).toBe(0)
  jest.useRealTimers()
})
