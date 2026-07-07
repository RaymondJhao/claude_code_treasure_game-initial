export interface UserSession {
  username: string;
  score: number;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data as T;
}

export function signUp(username: string, password: string): Promise<UserSession> {
  return postJson<UserSession>('/api/signup', { username, password });
}

export function signIn(username: string, password: string): Promise<UserSession> {
  return postJson<UserSession>('/api/signin', { username, password });
}

export function logOut(): Promise<{ ok: true }> {
  return postJson<{ ok: true }>('/api/logout');
}

export async function whoAmI(): Promise<UserSession | null> {
  const res = await fetch('/api/me', { credentials: 'same-origin' });
  const data = await res.json();
  return data.user === null ? null : (data as UserSession);
}

export function saveScore(score: number): Promise<{ score: number }> {
  return postJson<{ score: number }>('/api/score', { score });
}
