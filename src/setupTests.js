import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 로컬 .env에 키가 있어도 자동 테스트에서는 외부 지도 서비스를 호출하지 않습니다.
delete process.env.REACT_APP_KAKAO_MAP_KEY

// jsdom에는 native dialog 동작이 없어 테스트에서 open 상태만 재현합니다.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
