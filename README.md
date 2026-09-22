# CultureMate UI

업데이트된 ZIP의 서울 문화행사 React 화면을 현재 프로젝트에 옮긴 시연용 UI입니다.

## 실행

Node.js 20 이상에서:

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다. 배포용 빌드는 `npm run build`로 만듭니다.

## 화면

Figma에서 가져온 화면을 URL로 각각 미리 볼 수 있습니다. 메뉴·카드·버튼은 디자인 시안이며 클릭 동작은 연결되어 있지 않습니다.

| URL | 화면 |
| --- | --- |
| `/` | 홈 |
| `/events` | 행사 목록 |
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

ZIP의 화면 변경만 반영한 UI 시안입니다. 새 ZIP의 스크립트와 상태 관리 코드는 가져오지 않았습니다. 행사 데이터와 사용자 정보는 화면 표시용 샘플입니다. 검색, 필터, 코스 생성, 관심 목록 저장, 로그인, 댓글, 탭 전환, 원문·지도 이동은 구현되어 있지 않습니다. 이미지와 글꼴은 외부 URL을 사용하므로 인터넷 연결 상태에 따라 표시가 달라질 수 있습니다.

## API 통신

API 요청을 작성할 때는 [src/api/axios.js](src/api/axios.js)의 공통 Axios 인스턴스를 가져와 사용합니다. 개발 중 `/api` 요청은 CRA 프록시를 통해 `http://localhost:8080`으로 전달됩니다. 다른 API 주소를 사용한다면 `REACT_APP_API_BASE_URL` 환경 변수를 설정하세요. 이 값은 브라우저에 노출되므로 비밀키를 넣으면 안 됩니다.

```js
import api from './api/axios'

// 실제 API 경로와 응답 형식이 정해진 뒤 페이지에서 사용
const { data } = await api.get('/events')
```

현재 시안 화면은 API를 호출하지 않습니다. Axios 인스턴스와 개발 프록시 설정만 남겨 두었습니다.

## React 수업 방식과 연결

[참고 저장소의 `fe/react-app`](https://github.com/Unpart/LG_CNS_INSPIRE_6TH/tree/main/fe/react-app)처럼 `Routes`와 `Route`로 화면 파일을 구분하고, 페이지 코드는 `src/screens`, Axios 설정은 `src/api/axios.js`에 두었습니다. 이후 기능 구현 시 각 화면에서 `useState`로 입력 상태를 관리하고 `useEffect`에서 데이터를 불러오며, 공통 API 인스턴스를 사용해 통신할 수 있습니다.

Figma UI의 Tailwind 스타일은 유지합니다. 수업 저장소에 있는 Bootstrap·styled-components 스타일은 이 화면에 섞지 않았습니다.

현재 환경에 설치되어 있던 Create React App과 Tailwind CSS 3을 사용합니다. ZIP에 들어 있던 Figma Make 전용 설정과 문서는 실행 구성에 포함하지 않았습니다.
