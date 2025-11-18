const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const setAccessToken = (t?: string) => t ? localStorage.setItem(ACCESS_KEY, t) : localStorage.removeItem(ACCESS_KEY);
export const setRefreshToken = (t?: string) => t ? localStorage.setItem(REFRESH_KEY, t) : localStorage.removeItem(REFRESH_KEY);
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const clearTokens = () => { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); };
