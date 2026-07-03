import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hms_access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem("hms_refresh");
  if (!refresh) throw new Error("No refresh token");
  const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
  localStorage.setItem("hms_access", data.access);
  return data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (response && response.status === 401 && !config._retry) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem("hms_access");
        localStorage.removeItem("hms_refresh");
        localStorage.removeItem("hms_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
