# CultureMate UI

업데이트된 ZIP의 서울 문화행사 React 화면을 현재 프로젝트에 옮긴 시연용 UI입니다.

## 실행

Node.js 20 이상에서:

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다. 배포용 빌드는 `npm run build`로 만듭니다.

### 백엔드 없이 화면 확인

`npm start`는 기본적으로 **auto 모드**입니다. 홈 API 연결 실패·타임아웃 또는 404/500/501/502/503/504 응답이면 해당 목록을 샘플 행사로 표시합니다. 화면에 `데모 데이터`를 표시하며, `서버 다시 연결` 버튼이나 페이지 새로고침으로 실제 API를 다시 조회할 수 있습니다. 400/401/403, 정상 빈 목록, 잘못된 응답 형식은 샘플로 대체하지 않습니다.

샘플 행사에는 별도 ID(`mock-1` 등)를 사용해 클릭 및 상세 새로고침도 백엔드 없이 동작합니다. 일정은 한국의 오늘 날짜 기준으로 생성하며, 조회수·설명은 모두 시연용입니다. 실제 행사 ID의 상세 요청 실패를 다른 샘플 행사로 대체하지 않습니다.

자동 전환 전 최초 API 요청은 발생하므로 터미널에 `Proxy error`가 남을 수 있습니다. API 요청 없이 시연하려면 `.env.local`에 아래를 추가한 뒤 개발 서버를 재시작하세요.

```dotenv
REACT_APP_DATA_MODE=mock
```

| 값 | 동작 |
| --- | --- |
| `auto` | API 우선, 서버 연결 실패 시 홈 샘플 표시 (개발 기본값) |
| `mock` | 홈·샘플 상세를 API 요청 없이 표시 |
| `api` | 실제 API만 사용, 실패 시 오류 표시 (배포 빌드 기본값) |

Git Bash에서는 파일 수정 없이 `REACT_APP_DATA_MODE=mock npm start`로도 실행할 수 있습니다. 환경변수 변경은 재시작 후 적용됩니다.

## 화면

Figma에서 가져온 화면을 URL로 각각 미리 볼 수 있습니다. 홈은 API 조회와 이동을 구현했으며, 나머지 기능의 구현 범위는 아래를 참고하세요.

| URL | 화면 |
| --- | --- |
| `/` | 홈 |
| `/events` | 행사 목록 |
| `/events/hot` | HOT 행사 전체보기 (최대 30건) |
| `/events/filter` | 필터 선택 상태 시안 |
| `/events/1` | 행사 상세 시안 |
| `/search` | 검색 |
| `/course` | 코스 목록 |
| `/favorites` | 관심 목록 |
| `/favorites/calendar` | 관심 행사 캘린더 시안 |
| `/my` | 마이페이지 |
| `/login-prompt` | 로그인 안내 |
| `/login` | 로그인 |
| `/profile` | 프로필 설정 |

홈은 실제 API 응답을 표시합니다. 검색 배너와 주 메뉴는 해당 화면으로 이동하며, 검색·필터·코스·관심목록·로그인 화면은 아직 시안입니다. 홈 카드에서 진입하는 상세는 실제 행사 정보를 조회하고 원문·카카오맵 검색 링크를 제공합니다. 상세의 샘플 댓글·저장 버튼은 실제 데이터 화면에서 제외했으며, 댓글·찜·AI 소개문 생성·조회수 증가 API 연동은 별도 작업입니다. 이미지와 글꼴은 외부 URL을 사용하므로 인터넷 연결 상태에 따라 표시가 달라질 수 있습니다.

## API 통신

API 요청을 작성할 때는 [src/api/axios.js](src/api/axios.js)의 공통 Axios 인스턴스를 가져와 사용합니다. 개발 중 `/api` 요청은 CRA 프록시를 통해 `http://localhost:8080`으로 전달됩니다. 다른 API 주소를 사용한다면 `REACT_APP_API_BASE_URL` 환경 변수를 설정하세요. 이 값은 브라우저에 노출되므로 비밀키를 넣으면 안 됩니다.

```js
import api from './api/axios'

// 실제 API 경로와 응답 형식이 정해진 뒤 페이지에서 사용
const { data } = await api.get('/events')
```

### 홈 API (FR-07)

요구사항명세서 4차 수정본의 홈 계약을 [src/api/home.js](src/api/home.js)에 연결했습니다.

| 요청 | 응답 |
| --- | --- |
| `GET /api/main/hot-events?limit=6` | `{ events: [{ eventId, title, imageUrl, viewCount }] }` |
| `GET /api/main/upcoming-events?limit=6` | `{ events: [{ eventId, title, place, startDate, dDay }] }` |
| `GET /api/events/detail?eventId=...` | 실제 백엔드 상세 응답 (`imageUrl`, `organization` 등) |

HOT 전체보기는 같은 API에 `limit=30`을 보냅니다. 목록 순서는 서버 응답 그대로 유지합니다(HOT: 조회수 내림차순, 근처: 시작일 임박순). `district`를 생략해 회원 거주지 또는 서울 전체 선택을 서버에 맡깁니다. 인증 쿠키는 공통 Axios의 `withCredentials`로 전송하며 토큰을 브라우저 저장소에 추가하지 않습니다.

**백엔드 연결 상태:** 2026-09-23 확인한 [백엔드 develop API 계약](https://github.com/CultureMate/CultureMate-backend/blob/develop/docs/api-contract.md)에는 HOT/근처 전용 API가 아직 없습니다. 개발 기본값인 `auto`에서는 연결 실패 시 샘플 행사를 표시하며, `api`에서는 오류·재시도를 표시합니다. 명세의 인증 조건은 일부 상충하므로 프론트는 선제 로그인 차단 없이 요청하고, 서버가 401을 반환하면 해당 영역에 로그인 안내를 표시합니다.

두 목록은 각각 로딩·빈 결과·오류·재시도를 처리합니다. 페이지를 떠날 때 요청을 취소해 이전 응답이 새 화면을 덮지 않도록 합니다. D-Day는 서버의 숫자 `dDay`를 우선 사용하고, 없으면 한국 날짜와 `startDate`로 계산합니다. 선택 필드가 없는 카드도 표시할 수 있으며 URL 형태의 `eventId`도 상세까지 전달됩니다.

### 검증

```bash
npm ci
npm test -- --watchAll=false --runInBand
npm run build
```
