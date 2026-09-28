import api from './axios'
import { getNearbyPlaces, getPlaceDetails, getPlacePhotoUrl, getPlacesBetween } from './places'

jest.mock('./axios', () => ({ __esModule: true, default: { get: jest.fn() } }))

beforeEach(() => {
  process.env.REACT_APP_DATA_MODE = 'api'
  api.get.mockReset()
})
afterEach(() => { delete process.env.REACT_APP_DATA_MODE })

test('주변 장소 API에 반복 types와 검색 범위를 전달하고 이미지·영업시간을 정규화한다', async () => {
  api.get.mockResolvedValue({ data: [{ placeId: 'p1', name: '카페', rating: 4.5, latitude: 37.5, longitude: 127.1,
    photoName: 'places/p1/photos/one', regularOpeningHours: { openNow: true, weekdayDescriptions: ['월요일 10:00~22:00'] } }] })
  const result = await getNearbyPlaces({ latitude: 37.5, longitude: 127.1, types: ['cafe', 'restaurant'], radius: 900, maxResults: 12 })
  expect(api.get).toHaveBeenCalledWith('/places/nearby', expect.objectContaining({ signal: undefined }))
  const params = api.get.mock.calls[0][1].params
  expect(params.getAll('types')).toEqual(['cafe', 'restaurant'])
  expect(Object.fromEntries(params)).toEqual(expect.objectContaining({ latitude: '37.5', longitude: '127.1', radius: '900', maxResults: '12' }))
  expect(result.places[0]).toEqual(expect.objectContaining({
    placeId: 'p1', placeType: 'cafe', openNow: true, openingHours: ['월요일 10:00~22:00'],
    imageUrl: '/api/places/photo?name=places%2Fp1%2Fphotos%2Fone&maxWidthPx=640',
  }))
})

test('행사 사이와 사진 API 경로를 계약대로 만든다', async () => {
  api.get.mockResolvedValue({ data: { places: [{ placeId: 'p2', name: '식당' }] } })
  await getPlacesBetween({ eventId1: 'e1', eventId2: 'e2', type: 'restaurant' })
  expect(api.get).toHaveBeenCalledWith('/places/between', { params: { eventId1: 'e1', eventId2: 'e2', type: 'restaurant' }, signal: undefined })
  expect(getPlacePhotoUrl('places/photo name', 500)).toBe('/api/places/photo?name=places%2Fphoto+name&maxWidthPx=500')
})

test('저장된 장소 ID로 최신 상세 정보를 다시 조회한다', async () => {
  api.get.mockResolvedValue({ data: { placeId: 'p1', name: '문화 카페', address: '서울 중구', openNow: true } })
  const place = await getPlaceDetails('p1', 'cafe')
  expect(api.get).toHaveBeenCalledWith('/places/details', { params: { placeId: 'p1' }, signal: undefined })
  expect(place).toEqual(expect.objectContaining({ placeId: 'p1', name: '문화 카페', placeType: 'cafe', openNow: true }))
})

test('실행 중인 장소 서버의 명시적 오류를 샘플 데이터로 숨기지 않는다', async () => {
  process.env.REACT_APP_DATA_MODE = 'auto'
  const error = { response: { status: 503, data: { code: 'PLACES_UNAVAILABLE' } } }
  api.get.mockRejectedValue(error)
  await expect(getNearbyPlaces({ latitude: 37.5, longitude: 127.1, types: ['cafe'] })).rejects.toBe(error)
})
