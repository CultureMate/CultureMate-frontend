export const EVENT_PAGE_SIZE = 6

export function isEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function includePastForSelectedDate(filters, now = Date.now()) {
  const today = new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return filters.from && filters.from < today
    ? { ...filters, includePast: true }
    : filters
}

export function readEventFilters(search = '') {
  const params = new URLSearchParams(search)
  const values = key => [...new Set(params.getAll(key).map(value => value.trim()).filter(Boolean))]
  const page = Number(params.get('page') || 0)
  // 이전에 공유한 date 쿼리도 시작일~종료일 범위로 읽습니다.
  const range = [params.get('from'), params.get('to')].filter(isEventDate).sort()
  const dates = range.length ? range : values('date').filter(isEventDate).sort()
  return {
    district: values('district'),
    category: values('category'),
    from: dates[0] || '',
    to: dates[dates.length - 1] || '',
    keyword: (params.get('keyword') || '').trim(),
    includePast: params.get('includePast') === 'true',
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
  }
}

// Spring의 List<String> 파라미터에 맞게 district=A&district=B 형식으로 전달합니다.
export function createEventParams(filters, includePaging = true) {
  const normalized = includePastForSelectedDate(filters)
  const params = new URLSearchParams()
  for (const key of ['district', 'category']) {
    for (const value of [...new Set(normalized[key] || [])]) {
      if (value.trim()) params.append(key, value.trim())
    }
  }
  for (const key of ['from', 'to']) {
    if (normalized[key]) params.set(key, normalized[key])
  }
  if (normalized.keyword?.trim()) params.set('keyword', normalized.keyword.trim())
  if (normalized.includePast) params.set('includePast', 'true')
  if (includePaging) {
    params.set('page', String(normalized.page || 0))
    params.set('size', String(EVENT_PAGE_SIZE))
  }
  return params
}

export function toggleValue(values, value) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value]
}
