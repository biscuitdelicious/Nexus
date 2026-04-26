const SESSION_STORAGE_KEY = 'nexus_chat_session_id';

export const getChatSessionId = () => {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const generated = `session-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
};

export const sendChatMessage = async (apiBaseUrl, prompt, sessionId) => {
  const res = await fetch(`${apiBaseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, session_id: sessionId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const resetChatSession = async (apiBaseUrl, sessionId) => {
  const res = await fetch(`${apiBaseUrl}/chat/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const getChatApiBaseUrl = () =>
  import.meta.env.VITE_CHAT_API_BASE_URL || '/chat-api';
