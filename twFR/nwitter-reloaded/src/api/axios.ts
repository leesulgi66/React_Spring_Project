import axios from "axios";
import CsrfToken from "./csrfTokenGet";
// @ts-ignore
import store from "../store"


const instance = axios.create({
  baseURL: "http://localhost:8080", 
  headers: {
    
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  async config => {
    const state = store.getState();
    let csrfToken = state.csrfToken;

    if (!csrfToken) {
      csrfToken = await CsrfToken();
      store.dispatch({ type: "SET_STRING", payload: csrfToken });
    }
    
    if(csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }return config;
  }
);

export default instance;