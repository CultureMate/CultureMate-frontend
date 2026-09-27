import api from './axios'

export async function getFavorites(month, signal) {
  const config = { signal }

  if (month) {
    config.params = { month }
  }

  const { data } = await api.get('/favorites', config)

  return Array.isArray(data) ? data : []
}

export async function addFavorite(eventId) {
  const { data } = await api.post('/favorites', {
    eventId,
  })

  return data
}

export async function removeFavorite(eventId) {
  await api.delete('/favorites', {
    params: {
      eventId,
    },
  })
}