// Central auth helper: JWT storage + an authenticated fetch wrapper.
// The token is issued by chat_api on login/signup and accepted by both the
// Go API (:8080) and chat_api (:8002), which verify it with a shared secret.

const TOKEN_KEY = 'nexus_token';
const USER_KEY = 'nexus_user';

export const getToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
  try { if (token) sessionStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
};

export const clearAuth = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
};

export const getCurrentUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
};

export const getCurrentUserId = () => getCurrentUser()?.user_id ?? null;

// Drop-in replacement for fetch that attaches the Bearer token and, on a 401,
// clears the session and signals the app to bounce back to login.
export const apiFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.dispatchEvent(new CustomEvent('nexus:unauthorized'));
  }
  return res;
};

// Append the token as a query param for WebSocket URLs (browsers can't set
// headers on a WebSocket handshake).
export const withTokenParam = (wsUrl) => {
  const token = getToken();
  if (!token) return wsUrl;
  const sep = wsUrl.includes('?') ? '&' : '?';
  return `${wsUrl}${sep}token=${encodeURIComponent(token)}`;
};
