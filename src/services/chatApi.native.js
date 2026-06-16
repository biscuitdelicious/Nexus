import { USE_MOCK_API } from './apiConfig';
import { MOCK_CHAT_REPLIES } from './mockApi';

export const getChatSessionId = () => `mobile-${Date.now()}`;

export const getChatApiBaseUrl = () =>
  process.env.EXPO_PUBLIC_CHAT_API_BASE_URL || 'http://127.0.0.1:8002';

export const sendChatMessage = async (apiBaseUrl, prompt, sessionId) => {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 400));
    const reply = MOCK_CHAT_REPLIES[Math.floor(Math.random() * MOCK_CHAT_REPLIES.length)];
    return { reply: `[demo] ${reply}`, session_id: sessionId };
  }
  const res = await fetch(`${apiBaseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const resetChatSession = async (apiBaseUrl, sessionId) => {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 200));
    return { ok: true, session_id: sessionId };
  }
  const res = await fetch(`${apiBaseUrl}/chat/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
