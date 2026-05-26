import { getChatApiBaseUrl } from './chatApi';

const postJson = async (path, body) => {
  const res = await fetch(`${getChatApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return res.json();
};

export const loginUser = (email, password) =>
  postJson('/login', { email, password });

export const signupUser = (email, password, firstName, lastName = '') =>
  postJson('/signup', {
    email,
    password,
    first_name: firstName,
    last_name: lastName
  });
