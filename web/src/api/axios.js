/**
 * Axios singleton for all API calls.
 * Injects the Bearer token on every request and optionally tries to refresh
 * it once if the server returns 401 Unauthorized.
 */

import axios from 'axios';
import { navigate } from '../utils/navigationService';
import { doLogout } from '../utils/authService';
import { jwtDecode } from 'jwt-decode';

// ---- helpers --------------------------------------------------------------

/** Return access token (string|null) from localStorage */
export const getAccessToken = () => localStorage.getItem('accessToken');

/** Return refresh token (string|null) from localStorage */
export const getRefreshToken = () => localStorage.getItem('refreshToken');

/** Write new tokens to storage */
export const storeTokens = ({ access, refresh }) => {
    if (access) localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
};

/** Clear tokens from storage */
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

/** Decode token & return exp (epoch seconds) or 0 if invalid */
export const getTokenExpiry = (token) => {
    try { return jwtDecode(token).exp ?? 0; }
    catch { return 0; }
};

/** Return true if the token expires within N seconds */
export const tokenNearExpiry = (token, marginSec = 30) =>
    getTokenExpiry(token) - Date.now() / 1000 < marginSec;

// ---- axios instance -------------------------------------------------------

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10_000
});

// --- request interceptor: add Authorization header -------------------------
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- response interceptor: handle 401 --------------------------------------
let refreshPromise = null;   // to avoid multiple parallel refreshes

api.interceptors.response.use(
    (res) => res,              // ❶ onFulfilled – pass through
    async (err) => {           // ❷ onRejected – maybe retry
        const { config, response } = err;
        if (!response || response.status !== 401 || config._retry) {
            // not 401 or already retried → reject
            return Promise.reject(err);
        }

        // mark original request to avoid infinite loop
        config._retry = true;

        // hit refresh endpoint only once for concurrent 401’s
        if (!refreshPromise) refreshPromise = refreshAccessToken();

        try {
            await refreshPromise;
            refreshPromise = null;
            // attach new token & retry original call
            const newToken = getAccessToken();
            if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
            return api(config);
        } catch (refreshErr) {
            refreshPromise = null;
            // refresh failed → clear auth & bubble up
            clearTokens();
            // window.location.pathname = '/login';
            doLogout();
            navigate('/login', { replace: true });
            return Promise.reject(refreshErr);
        }
    }
);

/** Request /auth/refresh with the stored refresh token */
async function refreshAccessToken() {
    const rToken = getRefreshToken();
    if (!rToken) throw new Error('Missing refresh token');

    const res = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken: rToken }
    );

    storeTokens({
        access: res.data.accessToken,
        refresh: res.data.refreshToken ?? rToken // take new if provided
    });
}

// ---------------------------------------------------------------------------
export default api;
