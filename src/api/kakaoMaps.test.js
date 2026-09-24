let loadKakaoMaps
beforeEach(() => {
  jest.resetModules()
  jest.useFakeTimers()
  delete window.kakao
  process.env.REACT_APP_KAKAO_MAP_KEY = 'test-javascript-key'
  loadKakaoMaps = require('./kakaoMaps').loadKakaoMaps
})
afterEach(() => {
  document.getElementById('culturemate-kakao-maps-sdk')?.remove()
  delete window.kakao
  delete process.env.REACT_APP_KAKAO_MAP_KEY
  jest.useRealTimers()
})

test('missing key never inserts a remote script', async () => {
  delete process.env.REACT_APP_KAKAO_MAP_KEY
  await expect(loadKakaoMaps()).rejects.toThrow('MAP_KEY_MISSING')
  expect(document.getElementById('culturemate-kakao-maps-sdk')).toBeNull()
})

test('concurrent callers share one SDK and wait for maps.load readiness', async () => {
  const first = loadKakaoMaps()
  expect(loadKakaoMaps()).toBe(first)
  const script = document.getElementById('culturemate-kakao-maps-sdk')
  expect(new URL(script.src).searchParams.get('libraries')).toBe('services')
  expect(new URL(script.src).searchParams.get('autoload')).toBe('false')
  let ready
  window.kakao = { maps: { load: callback => { ready = callback } } }
  script.onload()
  window.kakao.maps.Map = jest.fn()
  window.kakao.maps.services = { Places: jest.fn() }
  ready()
  await expect(first).resolves.toBe(window.kakao.maps)
  expect(jest.getTimerCount()).toBe(0)
})

test('network errors and timeouts remove failed scripts and permit a retry', async () => {
  const first = loadKakaoMaps()
  const firstAssertion = expect(first).rejects.toThrow('MAP_LOAD_FAILED')
  document.getElementById('culturemate-kakao-maps-sdk').onerror()
  await firstAssertion
  expect(document.getElementById('culturemate-kakao-maps-sdk')).toBeNull()
  const second = loadKakaoMaps()
  const secondAssertion = expect(second).rejects.toThrow('MAP_LOAD_TIMEOUT')
  jest.advanceTimersByTime(10000)
  await secondAssertion
  expect(document.getElementById('culturemate-kakao-maps-sdk')).toBeNull()
})
