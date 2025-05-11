/**
 * AuthContext – persists user & tokens with localStorage
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { setLogout as registerLogout } from '../utils/authService';
import { jwtDecode } from 'jwt-decode';
import api, {
    getAccessToken,
    getRefreshToken,
    storeTokens,
    clearTokens,
    tokenNearExpiry
} from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    /* ------------------------------------------------------------------
     *  Utils
     * ----------------------------------------------------------------*/
    const saveUser = (u) => localStorage.setItem('user', JSON.stringify(u));
    const removeUser = () => localStorage.removeItem('user');

    function loadUserFromStorage() {
        // 1) נסה לשחזר מה-storage
        const persisted = localStorage.getItem('user');
        if (persisted) return JSON.parse(persisted);

        // 2) אחרת – נסה לפענח את ה-JWT
        const token = getAccessToken();
        if (!token) return null;
        try {
            const payload = jwtDecode(token);   // { id,name,email }
            saveUser(payload);
            return payload;
        } catch {
            clearTokens();
            return null;
        }
    }

    /* ------------------------------------------------------------------
     *  State
     * ----------------------------------------------------------------*/
    const [user, setUser] = useState(loadUserFromStorage);
    const [loading, setLoading] = useState(false);

    /* ------------------------------------------------------------------
     *  Auth helpers
     * ----------------------------------------------------------------*/
    const login = async (email, password) => {
        setLoading(true);
        const { data } = await api.post('/auth/login', { email, password });
        storeTokens({ access: data.accessToken, refresh: data.refreshToken });
        saveUser(data.user);
        setUser(data.user);
        setLoading(false);

    };

    const register = async (payload) => {
        setLoading(true);
        const { data } = await api.post('/auth/register', payload);
        storeTokens({ access: data.accessToken, refresh: data.refreshToken });
        saveUser(data.user);
        setUser(data.user);
        setLoading(false);
    };

    const logout = useCallback(() => {
        clearTokens();
        removeUser();
        setUser(null);
    }, []);

    useEffect(() => registerLogout(logout), [logout]);
    /* ------------------------------------------------------------------
     *  Auto-refresh access token
     * ----------------------------------------------------------------*/
    useEffect(() => {
        const id = setInterval(async () => {
            const token = getAccessToken();
            if (token && tokenNearExpiry(token, 60)) {
                try {
                    await api.post('/auth/refresh', { refreshToken: getRefreshToken() });
                    setUser(loadUserFromStorage());
                } catch {
                    logout();
                }
            }
        }, 15_000); // every 15 s

        return () => clearInterval(id);
    }, [logout]);

    /* ------------------------------------------------------------------
     *  Context value
     * ----------------------------------------------------------------*/
    const ctx = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={ctx}>
            {children}
        </AuthContext.Provider>
    );
};
