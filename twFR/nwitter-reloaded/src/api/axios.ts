import axios from "axios";
import CsrfToken from "./csrfTokenGet";
// @ts-ignore - 가능하다면 store의 타입 정의를 추가하는 것이 좋습니다.
import store from "../store";

// 액션 타입을 상수로 정의하여 오타 방지 및 가독성 향상
const SET_CSRF_TOKEN = "csrf/SET_TOKEN";
const CLEAR_CSRF_TOKEN = "csrf/CLEAR_TOKEN";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

// 경쟁 상태를 방지하기 위해 토큰 요청 Promise를 저장할 변수
let csrfTokenPromise:any = null;

const getCsrfToken = async () => {
  // 이미 토큰을 가져오는 중이라면, 새로운 요청을 보내지 않고 기존 Promise를 반환
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Redux 스토어에서 토큰을 먼저 확인
  let csrfToken = store.getState().csrfToken;
  if (csrfToken) {
    return Promise.resolve(csrfToken);
  }

  // 토큰이 없다면 서버에 요청하고, 그 Promise를 저장
  csrfTokenPromise = CsrfToken().then(token => {
    store.dispatch({ type: SET_CSRF_TOKEN, payload: token });
    csrfTokenPromise = null; // 완료 후 Promise 초기화
    return token;
  }).catch(error => {
    csrfTokenPromise = null; // 실패 시에도 Promise 초기화
    return Promise.reject(error);
  });

  return csrfTokenPromise;
};


// 요청 인터셉터
instance.interceptors.request.use(
  async config => {
    // GET 요청 등 CSRF 보호가 필요 없는 메소드는 토큰을 추가하지 않을 수 있습니다. (서버 정책에 따라 다름)
    // if (config.method === 'get') return config;

    try {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
      }
    } catch (error) {
      console.error("CSRF 토큰을 가져오는 데 실패했습니다.", error);
      // 토큰을 가져오지 못했을 때 요청을 중단시키려면 에러를 던져야 합니다.
      return Promise.reject(error);
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (토큰 만료 처리)
instance.interceptors.response.use(
  response => response, // 성공한 응답은 그대로 반환
  async error => {
    const originalRequest = error.config;

    // CSRF 토큰 오류(보통 403 또는 419)이고, 재시도한 요청이 아닐 경우
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정 (무한 루프 방지)

      try {
        console.log("CSRF 토큰이 만료되어 갱신을 시도합니다.");
        // 스토어의 토큰을 비우고 새로운 토큰을 강제로 요청
        store.dispatch({ type: CLEAR_CSRF_TOKEN });
        const newCsrfToken = await getCsrfToken();

        // 원래 요청의 헤더를 새 토큰으로 교체
        originalRequest.headers["X-CSRF-TOKEN"] = newCsrfToken;

        // 원래 요청을 재시도
        return instance(originalRequest);
      } catch (e) {
        // 토큰 갱신 실패 시, 로그인 페이지로 리다이렉트 또는 다른 처리
        console.error("토큰 갱신 및 재시도 실패", e);
        // window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);


export default instance;