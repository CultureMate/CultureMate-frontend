import api from './axios'
import { getDataMode } from './dataMode'
import { getMockEvents } from '../data/mockEvents'

const DEMO_FAVORITES_KEY = 'culturemate.demo-favorites.v1'

function readFavoriteIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(DEMO_FAVORITES_KEY) || '[]')
    return Array.isArray(ids) ? ids.map(String) : []
  } catch {
    return []
  }
}

function writeFavoriteIds(ids) {
  localStorage.setItem(DEMO_FAVORITES_KEY, JSON.stringify([...new Set(ids.map(String))]))
}

function demoFavorites(month) {
  const ids = new Set(readFavoriteIds())
  return getMockEvents()
    .filter(event => ids.has(String(event.eventId)))
    .filter(event => !month || (event.startDate <= `${month}-31` && event.endDate >= `${month}-01`))
    .map(event => ({ ...event, savedAt: new Date().toISOString() }))
}

export async function getFavorites(month, signal) {
  if (getDataMode() === 'mock') return demoFavorites(month)
  const config = { signal }

  if (month) {
    config.params = { month }
  }

  const { data } = await api.get('/favorites', config)

  return Array.isArray(data) ? data : []
}

export async function addFavorite(eventId) {
  if (getDataMode() === 'mock') {
    writeFavoriteIds([...readFavoriteIds(), eventId])
    return { eventId }
  }
  const { data } = await api.post('/favorites', {
    eventId,
  })

  return data
}

export async function removeFavorite(eventId) {
  if (getDataMode() === 'mock') {
    writeFavoriteIds(readFavoriteIds().filter(id => id !== String(eventId)))
    return
  }
  await api.delete('/favorites', {
    params: {
      eventId,
    },
  })
}
