import api from './axios'
import { canUseMock, getDataMode } from './dataMode'

const SAMPLE_NAMES = {
  cafe: ['오후의 커피', '서울 로스터리', '담소 카페', '테라스 커피', '어반 브루'],
  restaurant: ['서울 한상', '골목 식당', '키친 온', '오늘의 식탁', '동네 맛집'],
}

const placeType = value => value === 'restaurant' ? 'restaurant' : 'cafe'

function normalizePlace(place, fallbackType) {
  if (!place?.placeId || !place?.name) return null
  const openingHours = place.openingHours ?? place.regularOpeningHours
  const weekdayDescriptions = Array.isArray(openingHours)
    ? openingHours
    : openingHours?.weekdayDescriptions ?? place.weekdayDescriptions ?? []
  const photoName = place.photoName || ''
  return {
    placeId: String(place.placeId),
    name: place.name,
    address: place.address || '',
    rating: Number.isFinite(Number(place.rating)) ? Number(place.rating) : null,
    userRatingCount: Number.isFinite(Number(place.userRatingCount)) ? Number(place.userRatingCount) : 0,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    mapUrl: place.mapUrl || '',
    imageUrl: place.imageUrl || place.photoUrl || (photoName ? getPlacePhotoUrl(photoName) : ''),
    photoName,
    photoAttribution: place.photoAttribution || '',
    businessStatus: place.businessStatus || '',
    openNow: typeof place.openNow === 'boolean' ? place.openNow
      : typeof openingHours?.openNow === 'boolean' ? openingHours.openNow : null,
    openingHours: Array.isArray(weekdayDescriptions) ? weekdayDescriptions : [],
    todayHours: place.todayHours || place.openingHoursText || '',
    placeType: placeType(place.placeType || fallbackType),
  }
}

function mockPlaces({ latitude, longitude, types }) {
  return types.flatMap((type, typeIndex) => SAMPLE_NAMES[placeType(type)].map((name, index) => ({
    placeId: `mock-${type}-${latitude}-${longitude}-${index}`,
    name,
    address: `행사장에서 도보 ${5 + index * 3}분`,
    rating: Number((4.8 - index * 0.1).toFixed(1)),
    userRatingCount: 38 + index * 47,
    latitude: Number(latitude) + (index + 1) * 0.0007,
    longitude: Number(longitude) + (typeIndex + 1) * 0.0006,
    mapUrl: `https://map.kakao.com/?q=${encodeURIComponent(name)}`,
    imageUrl: `https://images.unsplash.com/photo-${placeType(type) === 'cafe' ? '1501339847302-ac426a4a7cbb' : '1517248135467-4c7edcad34c4'}?w=640&h=420&fit=crop&auto=format`,
    openNow: index % 3 !== 2,
    todayHours: '오늘 10:00~22:00',
    placeType: placeType(type),
  })))
}

function parsePlaces(data, types) {
  const values = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : []
  return values.map(place => normalizePlace(place, types[0])).filter(Boolean)
}

export async function getNearbyPlaces({ latitude, longitude, types = ['cafe', 'restaurant'], radius = 1500, maxResults = 20 }, signal) {
  const normalizedTypes = [...new Set(types.map(placeType))]
  const loadMock = () => ({ places: mockPlaces({ latitude, longitude, types: normalizedTypes }), isMock: true })
  if (getDataMode() === 'mock') return loadMock()
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), radius: String(radius), maxResults: String(maxResults) })
  normalizedTypes.forEach(type => params.append('types', type))
  try {
    const { data } = await api.get('/places/nearby', { params, signal })
    return { places: parsePlaces(data, normalizedTypes), isMock: false }
  } catch (error) {
    const placesServiceError = String(error.response?.data?.code || '').startsWith('PLACES_')
    if (!signal?.aborted && !placesServiceError && canUseMock(error)) return loadMock()
    throw error
  }
}

export async function getPlacesBetween({ eventId1, eventId2, type = 'cafe' }, signal) {
  const { data } = await api.get('/places/between', { params: { eventId1, eventId2, type: placeType(type) }, signal })
  return parsePlaces(data, [type])
}

export async function getPlaceDetails(placeId, type = 'cafe', signal) {
  const { data } = await api.get('/places/details', { params: { placeId }, signal })
  return normalizePlace(data, type)
}

export function getPlacePhotoUrl(name, maxWidthPx = 640) {
  const params = new URLSearchParams({ name, maxWidthPx: String(maxWidthPx) })
  return `/api/places/photo?${params}`
}

export function getPlacesError(error) {
  if (error.response?.status === 400) return '행사 위치나 검색 조건을 확인해 주세요.'
  if (error.response?.status === 503) return '주변 장소 검색 서비스가 잠시 지연되고 있어요.'
  return '주변 장소를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
