# REACT_APP_* 값은 빌드할 때 번들에 들어가므로 값이 바뀌면 이미지를 다시 빌드한다.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_BASE_URL=/api
ARG REACT_APP_AUTH_BASE_URL=/api
ARG REACT_APP_DATA_MODE=api
ARG REACT_APP_KAKAO_MAP_KEY=
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL \
    REACT_APP_AUTH_BASE_URL=$REACT_APP_AUTH_BASE_URL \
    REACT_APP_DATA_MODE=$REACT_APP_DATA_MODE \
    REACT_APP_KAKAO_MAP_KEY=$REACT_APP_KAKAO_MAP_KEY
RUN CI=true npm test -- --watchAll=false
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
