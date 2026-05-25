import { getChatApiBaseUrl } from './chatApi';

export const loginUser = async (email, password) => {
  const res = await fetch(`${getChatApiBaseUrl()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

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

