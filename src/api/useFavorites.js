import { useCallback, useEffect, useRef, useState } from 'react'
import { addFavorite, getFavorites, removeFavorite } from './culture'

export function useFavorites() {
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [busyIds, setBusyIds] = useState(() => new Set())
  const savedRef = useRef(savedIds)
  const busyRef = useRef(busyIds)
  savedRef.current = savedIds
  busyRef.current = busyIds

  useEffect(() => {
    let cancelled = false
    getFavorites()
      .then((items) => {
        if (!cancelled) setSavedIds(new Set(items.map((item) => item.eventId)))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const isSaved = useCallback((eventId) => savedIds.has(eventId), [savedIds])
  const isBusy = useCallback((eventId) => busyIds.has(eventId), [busyIds])

  const toggle = useCallback(async (eventId) => {
    if (busyRef.current.has(eventId)) return { saved: savedRef.current.has(eventId), skipped: true }
    const wasSaved = savedRef.current.has(eventId)
    setBusyIds((prev) => new Set(prev).add(eventId))
    try {
      if (wasSaved) {
        await removeFavorite(eventId)
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(eventId)
          return next
        })
        return { saved: false }
      }
      await addFavorite(eventId)
      setSavedIds((prev) => new Set(prev).add(eventId))
      return { saved: true }
    } catch (err) {
      if (err.status === 409) {
        setSavedIds((prev) => new Set(prev).add(eventId))
        return { saved: true, duplicate: true }
      }
      return { saved: wasSaved, error: err.message }
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    }
  }, [])

  return { isSaved, isBusy, toggle, savedIds }
}
