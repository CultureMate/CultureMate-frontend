export function getDataMode() {
  return process.env.REACT_APP_DATA_MODE || (process.env.NODE_ENV === 'production' ? 'api' : 'auto')
}

export function canUseMock(error) {
  if (getDataMode() !== 'auto' || error.code === 'ERR_CANCELED') return false
  // CRA의 ECONNREFUSED 프록시 오류는 브라우저에 HTTP 500으로 전달됩니다.
  return ['ERR_NETWORK', 'ECONNREFUSED', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
    || [404, 500, 501, 502, 503, 504].includes(error.response?.status)
}
