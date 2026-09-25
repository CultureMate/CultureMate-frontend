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

`npm start`는 기본적으로 **auto 모드**입니다. 홈·행사 목록 API 연결 실패·타임아웃 또는 404/500/501/502/503/504 응답이면 해당 목록을 샘플 행사로 표시합니다. 화면에 `데모 데이터`를 표시하며, `서버 다시 연결` 버튼이나 페이지 새로고침으로 실제 API를 다시 조회할 수 있습니다. 400/401/403, 정상 빈 목록, 잘못된 응답 형식은 샘플로 대체하지 않습니다.

샘플 행사에는 별도 ID(`mock-1` 등)를 사용해 클릭 및 상세 새로고침도 백엔드 없이 동작합니다. 일정은 한국의 오늘 날짜 기준으로 생성하며, 조회수·설명은 모두 시연용입니다. 실제 행사 ID의 상세 요청 실패를 다른 샘플 행사로 대체하지 않습니다.

자동 전환 전 최초 API 요청은 발생하므로 터미널에 `Proxy error`가 남을 수 있습니다. API 요청 없이 시연하려면 `.env.local`에 아래를 추가한 뒤 개발 서버를 재시작하세요.

```dotenv
REACT_APP_DATA_MODE=mock
```

| 값 | 동작 |
| --- | --- |
| `auto` | API 우선, 서버 연결 실패 시 홈·행사 목록 샘플 표시 (개발 기본값) |
| `mock` | 홈·행사 목록·샘플 상세를 API 요청 없이 표시 |
| `api` | 실제 API만 사용, 실패 시 오류 표시 (배포 빌드 기본값) |

Git Bash에서는 파일 수정 없이 `REACT_APP_DATA_MODE=mock npm start`로도 실행할 수 있습니다. 환경변수 변경은 재시작 후 적용됩니다.

## 화면

Figma에서 가져온 화면을 URL로 각각 미리 볼 수 있습니다. 홈은 API 조회와 이동을 구현했으며, 나머지 기능의 구현 범위는 아래를 참고하세요.

| URL | 화면 |
| --- | --- |
| `/` | 홈 |
| `/events` | 행사 목록 |
| `/events/hot` | HOT 행사 전체보기 (최대 30건) |
| `/events/filter` | 행사 목록의 필터 레이어 바로 열기 |
| `/events/:id` | 행사 상세 (샘플: `/events/mock-1`) |
| `/search` | 다중 조건·키워드 선택 후 행사 목록으로 이동 |
| `/course` | 코스 목록 |
| `/favorites` | 관심 목록 |
| `/favorites/calendar` | 관심 행사 캘린더 시안 |
| `/my` | 마이페이지 |
| `/login-prompt` | 로그인 안내 |
| `/login` | 로그인 |
| `/profile` | 프로필 설정 |

홈·행사 목록·검색·필터·행사 상세는 기능이 연결되어 있습니다. 코스·관심목록·로그인 화면은 아직 시안입니다. 행사 상세는 원문 링크, 조회수 증가, 카카오맵을 제공합니다(아래 지도 설정 필요). 목록의 기존 비동작 찜·코스 버튼과 동행인 필터는 이번 검색 범위에서 제외했습니다. 댓글·찜·AI 소개문 생성 API 연동은 별도 작업입니다. 지도·이미지·글꼴은 외부 서비스를 사용하므로 인터넷 연결 상태에 따라 표시가 달라질 수 있습니다.

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

### 행사 탭 API (FR-01 · FR-02 · FR-12)

`feature/events`는 홈 PR이 병합된 `develop`에서 시작했습니다. [수업의 CommentPage](https://github.com/Unpart/LG_CNS_INSPIRE_6TH/blob/main/fe/react-app/src/pages/sample/CommentPage.jsx)처럼 `useEffect`에서 Axios로 조회하고 `useState`로 상태를 갱신해 카드 목록을 렌더링합니다. 별도 상태관리·UI 라이브러리는 추가하지 않았습니다.

```http
GET /api/events?district=강남구&district=마포구&category=전시&category=공연&from=2026-10-10&to=2026-10-11&keyword=서울&page=0&size=6
```

- 자치구·분야는 각각 다중 선택하며 같은 이름의 쿼리 파라미터를 반복합니다. 같은 조건 내 OR, 서로 다른 조건 간 AND입니다. 날짜는 `from`~`to` 범위와 행사 기간이 하루라도 겹치는지 검사하며 양 끝 날짜를 포함합니다.
- 날짜를 한 번 선택하면 시작일·종료일이 같은 날짜가 됩니다. 두 번째 선택 시 두 날짜를 빠른 순으로 정렬합니다. 범위 선택 후 다시 누르면 새 범위를 시작하며, 날짜 선택 해제로 범위를 지울 수 있습니다. 기존 `date` 쿼리 링크는 가장 빠른 날짜~가장 늦은 날짜로 읽습니다.
- 키워드는 제출 시 제목·장소를 검색합니다. 분야 빠른 선택, 적용된 태그 해제, 전체 초기화도 가능합니다.
- 필터 레이어의 변경은 적용 버튼을 눌러야 반영됩니다. 취소·닫기·Escape는 편집 중인 값을 버립니다. 날짜 달력은 실제 월별 일수와 요일을 사용하며, 다른 달에서도 선택을 이어갈 수 있습니다.
- URL에 검색 조건과 페이지를 저장합니다. 새로고침·브라우저 뒤로가기·상세의 목록 복귀 시 유지하며, 조건 변경 시 첫 페이지로 돌아갑니다.
- 한 페이지에 6건을 표시하고 전체 건수는 서버의 `totalCount`를 사용합니다. 서버가 시작일 오름차순 정렬 후 페이지를 나눕니다. 목록 응답에 없는 요금·기관 정보를 얻기 위한 추가 상세 요청은 하지 않습니다.
- 로딩·오류·재시도·결과 없음 안내 모달과 조건 변경을 제공합니다. 페이지를 벗어나거나 조건을 변경하면 이전 요청을 취소합니다.
- 목업도 동일한 조건 필터링 → 시작일 정렬 → 페이지 분할을 적용합니다. 실제 인증 오류와 정상 빈 결과는 목업으로 바꾸지 않습니다.

목록·검색 계약은 [백엔드 API 명세](https://github.com/CultureMate/CultureMate-backend/blob/develop/docs/api-contract.md)와 `EventService`를 확인했습니다. 실제 서울시 데이터를 사용하는 통합 검증에는 백엔드 실행과 서울시 API 키 설정이 필요합니다.

### 카카오맵 연동 (FR-13)

상세 화면의 `EventMap`에서 카카오맵 JavaScript SDK로 지도·위치 마커·확대/축소 버튼을 표시합니다. 별도 React 지도 라이브러리는 추가하지 않았습니다.

1. 카카오 디벨로퍼스 앱에서 **카카오맵 사용 설정을 ON**으로 설정합니다.
2. **JavaScript 키**의 SDK 도메인에 `http://localhost:3000`을 등록합니다. `http://127.0.0.1:3000`이나 배포 주소로 접속할 경우 해당 주소도 등록합니다.
3. `.env`에 아래 설정을 추가하고 `npm start`를 재시작합니다. `.env.example`에는 값 없이 필요한 변수만 제공합니다.

```dotenv
KAKAO_MAP_KEY=카카오_JavaScript_키
REACT_APP_KAKAO_MAP_KEY=${KAKAO_MAP_KEY}
```

`REACT_APP_KAKAO_MAP_KEY`는 브라우저에서 사용하는 공개 JavaScript 키입니다. `KAKAO_REST_KEY`, `KAKAO_CLIENT_SECRET`을 이 값에 넣지 않습니다. 설정은 [카카오 지도 가이드](https://apis.map.kakao.com/web/guide/)와 [카카오맵 사용 설정](https://developers.kakao.com/docs/ko/kakaomap/common)을 참고하세요.

- 상세 응답의 `latitude`/`longitude`(숫자 또는 숫자 문자열)를 우선 사용합니다. `lat`/`lng`도 지원하며, 빈 값·잘못된 범위·(0, 0)은 위치로 사용하지 않습니다.
- 2026-09-24 확인한 백엔드 `develop`의 `EventDetailResponseDTO` 및 `SeoulEvent`에는 좌표가 아직 없습니다. BE에서 서울시 원본 좌표를 정규화해 상세 응답에 `latitude`/`longitude`를 추가하면 장소 검색 없이 해당 좌표를 표시합니다. 이는 프론트가 준비한 필드명이며 백엔드와 합의가 필요합니다.
- 좌표가 없는 현재 응답과 Mock 행사에는 `서울 + 자치구 + 장소명`으로 카카오 장소 검색을 사용합니다. 자치구가 있는 경우 해당 자치구의 검색 결과만 사용하며, 검색된 이름·주소와 “장소명으로 찾은 위치” 안내를 표시합니다. 검색 결과를 실제 행사 좌표로 간주하지 않습니다.
- 검색 결과가 없거나 위치 정보가 없는 경우 임의 좌표·샘플 위치를 표시하지 않습니다. 안내와 카카오맵 검색 링크를 제공합니다. 키 미설정·SDK 로딩 실패·검색 실패도 상세 정보 표시에는 영향을 주지 않습니다.
- SDK는 중복 로딩을 방지하고 로딩/검색 시간 제한과 재시도를 지원합니다. 다른 행사로 이동하면 이전 결과를 무시하고 마커·화면 크기 감시를 정리합니다. 모바일/데스크톱 크기 변경 시 지도 크기를 다시 계산합니다.
- Mock 모드에서도 지도는 실제 카카오 서비스와 JavaScript 키·네트워크 연결이 필요합니다.

### 상세 조회수 API (FR-11)

실제 행사 상세 화면에 진입하면 다음 API를 한 번 호출하고, 서버가 반환한 증가 후 조회수를 즉시 표시합니다. `eventId`는 URL일 수 있으므로 query parameter로 전달합니다.

```http
POST /api/events/views?eventId={eventId}
```

```json
{
  "eventId": "https://culture.seoul.go.kr/...",
  "viewCount": 124
}
```

- 상세 조회 응답의 기존 `viewCount`를 먼저 표시하고 증가 요청이 완료되면 서버 응답 값으로 교체합니다. 값이 없거나 올바른 정수가 아니면 화면에서는 `0`으로 처리합니다.
- 개발 환경의 React StrictMode가 effect를 점검용으로 두 번 실행해도 증가 POST는 한 번만 전송합니다.
- 다른 행사로 이동하면 이전 요청을 취소하고 늦게 도착한 응답이 새 행사의 조회수를 덮지 않도록 합니다.
- Mock 행사는 시연용 조회수를 그대로 표시하고 증가 API를 호출하지 않습니다.
- 실패 시 상세 화면을 막지 않고 기존 조회수를 유지하며 조회수 옆에 실패 표시를 제공합니다. 응답 유실 뒤 재호출하면 중복 증가할 수 있으므로 자동 재시도하지 않습니다.
- 백엔드 계약상 로그인 없이 호출할 수 있으며, 존재하지 않는 행사는 `404`를 반환합니다.

### 검증

```bash
npm ci
npm test -- --watchAll=false --runInBand
npm run build
```
