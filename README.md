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
| `/course` | 코스 만들기 |
| `/favorites` | 관심 목록 |
| `/favorites/calendar` | 관심 행사 캘린더 시안 |
| `/my` | 마이페이지 |
| `/login-prompt` | 로그인 안내 |
| `/login` | 로그인 |
| `/profile` | 프로필 설정 |

홈·행사 목록·검색·필터·행사 상세·코스 만들기는 기능이 연결되어 있습니다. 관심목록·로그인 화면은 아직 시안입니다. 행사 상세는 원문 링크, AI 소개문 요청, 조회수 증가, 댓글·대댓글, 카카오맵을 제공합니다(아래 지도 설정 필요). 찜 API 연동은 별도 작업입니다. 지도·이미지·글꼴은 외부 서비스를 사용하므로 인터넷 연결 상태에 따라 표시가 달라질 수 있습니다.

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
- 기본 요청은 서버 날짜 필터의 `from` 하한을 한국의 오늘 날짜로 설정해 오늘 종료되는 행사를 포함한 현재·예정 행사만 조회합니다. `지난 행사 보기`를 켜면 URL에 `includePast=true`를 저장하고 API 요청의 자동 날짜 하한을 제거한 뒤 첫 페이지부터 다시 조회합니다.
- 한 페이지에 6건을 표시하고 전체 건수는 서버의 `totalCount`를 사용합니다. 페이지 번호는 최대 10개씩 표시하며 이전/다음은 앞뒤 10페이지 구간으로 이동합니다. 번호 클릭과 페이지 직접 입력도 지원합니다. 서버가 시작일 오름차순 정렬 후 페이지를 나눕니다.
- 목록 응답의 `viewCount`를 카드에 표시합니다. 값이 없거나 숫자가 아니면 `-`로 표시하고, 목록에서 조회수 증가 API를 추가 호출하지 않습니다.
- 로딩·오류·재시도·결과 없음 안내 모달과 조건 변경을 제공합니다. 페이지를 벗어나거나 조건을 변경하면 이전 요청을 취소합니다.
- 목업도 종료된 행사와 다가오는 행사를 함께 제공하고 동일한 조건 필터링 → 시작일 정렬 → 페이지 분할을 적용합니다. 실제 인증 오류와 정상 빈 결과는 목업으로 바꾸지 않습니다.

목록·검색 계약은 [백엔드 API 명세](https://github.com/CultureMate/CultureMate-backend/blob/develop/docs/api-contract.md)와 `EventService`를 확인했습니다. 실제 서울시 데이터를 사용하는 통합 검증에는 백엔드 실행과 서울시 API 키 설정이 필요합니다.

### 코스 만들기·주변 장소 API

행사 목록의 `코스에 담기`로 고른 행사를 `/course`에서 불러옵니다. 행사·카페·음식점은 하나의 동선으로 관리하므로 드래그 또는 위·아래 버튼으로 종류와 관계없이 순서를 바꿀 수 있습니다. 작성 중인 이름과 동선은 브라우저에 임시 저장되어 행사 목록을 다시 다녀와도 유지됩니다.

| 기능 | 요청 |
| --- | --- |
| 행사 주변 장소 | `GET /api/places/nearby?latitude=...&longitude=...&types=cafe&radius=1500&maxResults=20` |
| 두 행사 사이 장소 | `GET /api/places/between?eventId1=...&eventId2=...&type=restaurant` |
| 장소 상세 | `GET /api/places/details?placeId=...` |
| 장소 사진 | `GET /api/places/photo?name=...&maxWidthPx=640` |
| 코스 저장 | `POST /api/courses` |
| 내 코스 목록 | `GET /api/courses` |
| 코스 상세 | `GET /api/courses/{courseId}` |
| 코스 수정 | `PUT /api/courses/{courseId}` |
| 코스 삭제 | `DELETE /api/courses/{courseId}` |
| 코스 즐겨찾기 | `PUT /api/courses/{courseId}/favorite` |
| 코스 공유 시작·중지 | `POST /api/courses/{courseId}/share` · `DELETE /api/courses/{courseId}/share` |
| 공유 코스 조회 | `GET /api/courses/shared/{shareId}` |

- 주변 장소 응답은 `placeId`, `name`, `address`, `rating`, `userRatingCount`, `latitude`, `longitude`, `mapUrl`, `photoName`, `authorAttributions`, `businessStatus`, `openNow`를 사용합니다. 사진을 표시할 때 모든 저작자 이름과 제공 URI를 사진 가까이에 표시하고, Google 장소 정보에는 Google Maps 출처를 표시합니다.
- 검색 후보는 기본 이미지를 먼저 표시하며 사용자가 `사진 보기`를 누른 경우에만 사진 `<img>`를 렌더링합니다. 코스·공유 상세 사진은 화면에 들어왔을 때 사진 API URL을 `src`로 지정해 302 리다이렉트를 브라우저가 직접 처리하도록 합니다. 같은 실행 화면의 동일 장소 상세 요청은 호출자별 AbortSignal과 분리된 메모리 Promise로 합칩니다. `photoName`과 Google 사진 URL은 코스 초안이나 로컬 코스에 저장하지 않습니다.
- 행사 좌표가 없으면 임의 위치로 검색하지 않고 안내를 표시합니다. 좌표가 있는 다른 행사를 기준으로 선택할 수 있습니다.
- 코스 저장 payload는 `{ title, stops }`입니다. 각 stop은 행사 `{ type: "event", eventId }`, 카페 `{ type: "cafe", placeId }`, 음식점 `{ type: "restaurant", placeId }` 형식입니다. 수정 요청에는 현재 `version`도 함께 보냅니다.
- 코스 목록은 응답의 `previewStops`를 순서대로 4곳까지 표시하고, 나머지 행사·카페·음식점은 합계 `+n`으로 표시합니다. 행사는 행사 이미지를 사용하고 카페·음식점은 아이콘만 표시하므로 목록에서 Google 사진을 요청하지 않습니다. `previewStops`가 없는 이전 응답은 `firstEventImageUrl`을 사용합니다.
- `auto` 모드의 코스 조회 API만 실제 네트워크 연결 실패 또는 CRA 프록시의 `ECONNREFUSED` 응답에서 개발용 로컬 코스로 전환합니다. 생성·수정·삭제·즐겨찾기·공유 같은 변경 요청과 타임아웃은 로컬 성공으로 대체하지 않습니다. `mock` 모드는 API 요청 없이 로컬 코스를 사용합니다.
- `auto` 모드에서도 실행 중인 서버가 `PLACES_UNAVAILABLE` 또는 `PLACES_QUOTA_EXCEEDED`를 반환하면 샘플 장소로 바꾸지 않고 오류를 표시합니다. 서버가 실제로 연결되지 않을 때만 데모 장소로 대체합니다.
- 장소 API의 `429 PLACES_MEMBER_DAILY_LIMITED`는 회원별 일일 장소 정보 조회 한도, `429 PLACES_RATE_LIMITED`는 일시적인 장소 정보 요청 제한으로 구분해 안내합니다.

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
- 위도 또는 경도 중 하나라도 없거나 유효하지 않으면 지도 영역을 렌더링하지 않고 `위치 정보 없음`을 표시합니다. 좌표를 추정하거나 임의 좌표·샘플 위치를 표시하지 않으며, 장소 정보가 있으면 `서울 + 자치구 + 장소명`으로 카카오맵 외부 검색 링크를 제공합니다.
- SDK 키 미설정·로딩 실패는 상세 정보 표시에 영향을 주지 않으며, 재시도를 지원합니다. 다른 행사로 이동하면 이전 결과를 무시하고 마커·화면 크기 감시를 정리합니다. 모바일/데스크톱 크기 변경 시 지도 크기를 다시 계산합니다.
- Mock 모드에서도 지도는 실제 카카오 서비스와 JavaScript 키·네트워크 연결이 필요합니다.

### AI 소개문 API (FR-03)

행사 상세 정보를 불러온 뒤 다음 API로 AI 소개문을 요청합니다. `eventId`는 URL일 수 있으므로 query parameter로 전달하며 Axios가 한 번만 인코딩하게 합니다.

```http
POST /api/events/summary?eventId={eventId}
```

```json
{
  "eventId": "https://culture.seoul.go.kr/...",
  "summary": "행사 소개문",
  "createdAt": "2026-09-25T10:00:00"
}
```

- 소개문 요청 중에는 작성 중 상태를 표시하고, 성공하면 응답의 `summary`를 표시합니다.
- 공통 Axios 제한 시간은 10초이지만 소개문 요청만 35초로 설정하여 백엔드의 OpenAI 응답 대기 시간 30초를 수용합니다.
- 실패·지연 시에도 기간·장소·요금 등 행사 기본 정보와 지도는 그대로 표시합니다. 오류 안내와 다시 시도 버튼을 제공합니다.
- 상세 화면을 벗어나거나 다른 행사로 이동하면 이전 요청을 취소하고 늦게 도착한 결과를 무시합니다.
- Mock 행사에는 샘플 소개문임을 표시하며 API를 호출하지 않습니다. 실제 행사 요청 실패를 관계없는 샘플 소개문으로 대체하지 않습니다.
- OpenAI API 키와 프롬프트는 백엔드에서만 관리합니다. 프론트에는 `OPENAI_API_KEY`를 노출하지 않습니다.
- 백엔드가 `501 NOT_IMPLEMENTED`를 반환하면 “AI 소개문 기능 준비 중”으로 안내하고, 정상 응답에는 저장되거나 새로 생성된 소개문을 표시합니다.

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

### 댓글·대댓글 API (FR-10)

행사 상세 화면에서 댓글 목록을 공개 조회하고, 로그인 회원은 댓글과 한 단계 답글을 작성할 수 있습니다. 현재 회원은 `GET /api/auth/me`로 확인하며 공통 Axios 설정의 세션 쿠키를 사용합니다.

| 기능 | 요청 |
| --- | --- |
| 목록 조회 | `GET /api/comments?eventId={eventId}` |
| 댓글 작성 | `POST /api/comments` `{ eventId, content }` |
| 답글 작성 | `POST /api/comments` `{ eventId, content, parentId }` |
| 수정 | `PUT /api/comments/{commentId}` `{ content }` |
| 삭제 | `DELETE /api/comments/{commentId}` |

- 댓글 목록은 비로그인 사용자도 볼 수 있습니다. 작성·수정·삭제는 세션 로그인이 필요합니다.
- 응답의 `memberId`와 현재 회원 ID를 비교해 본인 댓글과 답글에만 수정·삭제 버튼을 표시합니다. 현재 백엔드 응답에는 닉네임이 없어 다른 작성자는 `회원 {memberId}`로 표시합니다.
- 작성·답글·수정·삭제 성공 결과는 새로고침 없이 목록에 반영합니다. 빈 내용은 전송하지 않습니다.
- `401`은 로그인 안내, `403`은 본인 댓글 권한 안내, `400`·`404`와 지연·일반 오류는 동작별 메시지로 처리합니다.
- 행사나 화면이 바뀌면 목록·로그인 확인 요청을 취소하고 이전 응답이 새 행사 댓글을 덮지 않도록 합니다.
- Mock 행사에는 댓글과 답글 구조를 확인할 수 있는 읽기 전용 샘플을 표시하며 실제 댓글 API와 로그인 API를 호출하지 않습니다.
- 백엔드 계약상 댓글 응답은 `commentId`, `eventId`, `memberId`, `parentId`, `content`, `createdAt`, `updatedAt`을 포함하는 배열입니다.

### 검증

```bash
npm ci
npm test -- --watchAll=false --runInBand
npm run build
```
