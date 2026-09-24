let sdkPromise

// StrictMode와 상세 화면 재진입에서도 SDK는 한 번만 내려받습니다.
export function loadKakaoMaps() {
  const key = process.env.REACT_APP_KAKAO_MAP_KEY?.trim()
  if (!key) return Promise.reject(new Error('MAP_KEY_MISSING'))
  if (sdkPromise) return sdkPromise
  if (window.kakao?.maps?.Map && window.kakao.maps.services?.Places) return Promise.resolve(window.kakao.maps)

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'culturemate-kakao-maps-sdk'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`
    let settled = false
    const finish = error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      script.onload = null
      script.onerror = null
      if (error) {
        script.remove()
        reject(error)
      } else resolve(window.kakao.maps)
    }
    const timer = setTimeout(() => finish(new Error('MAP_LOAD_TIMEOUT')), 10000)
    script.onerror = () => finish(new Error('MAP_LOAD_FAILED'))
    script.onload = () => {
      try {
        if (!window.kakao?.maps?.load) throw new Error('MAP_LOAD_FAILED')
        window.kakao.maps.load(() => {
          const ready = window.kakao?.maps?.Map && window.kakao.maps.services?.Places
          finish(ready ? null : new Error('MAP_LOAD_FAILED'))
        })
      } catch (error) { finish(error) }
    }
    document.head.appendChild(script)
  }).catch(error => {
    sdkPromise = undefined
    throw error
  })
  return sdkPromise
}
