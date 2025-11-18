import axios from "axios"
import { getAccessToken, clearTokens, getRefreshToken, setAccessToken } from "../utils/storage";


const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
})


api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})


let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string | null) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => prom[error ? "reject" : "resolve"](token));
    failedQueue = [];
};

api.interceptors.response.use(
    res => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
            // try refresh
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return axios(original);
                });
            }

            original._retry = true;
            isRefreshing = true;
            try {
                const refreshToken = getRefreshToken();
                const resp = await axios.post(`${import.meta.env.VITE_API_URL}/v1/api/auth/refresh`, { refreshToken });
                const newAccess = resp.data.accessToken;
                setAccessToken(newAccess);
                processQueue(null, newAccess);
                original.headers.Authorization = `Bearer ${newAccess}`;
                return axios(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                clearTokens();
                window.location.href = "/login";
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    }
);

export default api;