// React Native auth: in-memory session (no sessionStorage / window).

const TOKEN_KEY = 'nexus_token';
const USER_KEY = 'nexus_user';

let _token = null;
let _user = null;
let _onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  _onUnauthorized = handler;
};

export const getToken = () => _token;

export const setToken = (token) => {
  _token = token || null;
};

export const clearAuth = () => {
  _token = null;
  _user = null;
};

export const getCurrentUser = () => _user;

export const setStoredUser = (user) => {
  _user = user || null;
};

export const getCurrentUserId = () => _user?.user_id ?? null;

export const apiFetch = async (url, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (_token) headers.Authorization = `Bearer ${_token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    _onUnauthorized?.();
  }
  return res;
};

export const withTokenParam = (wsUrl) => {
  if (!_token) return wsUrl;
  const sep = wsUrl.includes('?') ? '&' : '?';
  return `${wsUrl}${sep}token=${encodeURIComponent(_token)}`;
};
