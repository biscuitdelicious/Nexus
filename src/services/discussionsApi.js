import { getChatApiBaseUrl } from './chatApi';
import { apiFetch, withTokenParam } from './auth';

/**
 * REST + WebSocket client for the Discussions module.
 * All HTTP paths go through the same proxy as chatApi (vite /chat-api -> :8002).
 * WebSocket builds an absolute ws:// URL from the configured base.
 */

const getWsBaseUrl = () => {
  const base = getChatApiBaseUrl();
  // If base is absolute (http://host:port) -> swap protocol to ws.
  // If it's a relative path like '/chat-api', build using window.location.
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/^http/i, 'ws');
  }
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${loc.host}${base}`;
};

const json = async (res) => {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
};

export const fetchDiscussions = () =>
  apiFetch(`${getChatApiBaseUrl()}/discussions`).then(json);

export const fetchDiscussionDetail = (id) =>
  apiFetch(`${getChatApiBaseUrl()}/discussions/${id}`).then(json);

const getCurrentUserId = () => {
  try {
    const raw = sessionStorage.getItem('nexus_user');
    return raw ? (JSON.parse(raw)?.user_id ?? null) : null;
  } catch { return null; }
};

export const createDiscussion = (payload) =>
  apiFetch(`${getChatApiBaseUrl()}/discussions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, user_id: getCurrentUserId() })
  }).then(json);

export const postComment = (discussionId, authorDisplay, message) =>
  apiFetch(`${getChatApiBaseUrl()}/discussions/${discussionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author_display: authorDisplay,
      message,
      user_id: getCurrentUserId()
    })
  }).then(json);

export const changeDiscussionStatus = (discussionId, status, authorDisplay) =>
  apiFetch(`${getChatApiBaseUrl()}/discussions/${discussionId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      author_display: authorDisplay,
      user_id: getCurrentUserId()
    })
  }).then(json);

/**
 * Subscribe to live updates for one discussion.
 * Calls onEvent({ type: 'comment'|'status'|'hello', data }) for each message.
 * Automatically reconnects with exponential backoff on close (unless closeRef.closed).
 *
 * @returns {() => void} unsubscribe function
 */
export const subscribeToDiscussion = (discussionId, onEvent) => {
  const wsUrl = withTokenParam(`${getWsBaseUrl()}/ws/discussions/${discussionId}`);
  const state = { closed: false, ws: null, retryMs: 1000, pingTimer: null };

  const open = () => {
    if (state.closed) return;
    const ws = new WebSocket(wsUrl);
    state.ws = ws;

    ws.onopen = () => {
      state.retryMs = 1000;
      // periodic ping to keep connection alive
      state.pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };

    ws.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        onEvent?.(payload);
      } catch (err) {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      if (state.pingTimer) { clearInterval(state.pingTimer); state.pingTimer = null; }
      if (state.closed) return;
      // reconnect with backoff capped at 10s
      setTimeout(open, state.retryMs);
      state.retryMs = Math.min(state.retryMs * 2, 10000);
    };

    ws.onerror = () => {
      try { ws.close(); } catch {}
    };
  };

  open();

  return () => {
    state.closed = true;
    if (state.pingTimer) clearInterval(state.pingTimer);
    if (state.ws && state.ws.readyState <= 1) {
      try { state.ws.close(); } catch {}
    }
  };
};
