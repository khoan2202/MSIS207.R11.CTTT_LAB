// Địa chỉ API đọc từ biến môi trường Vite; mặc định server local của Homework.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3002";

export class HttpError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

// fetch() không reject khi 4xx/5xx => tự kiểm tra res.ok. 204 không có body.
export async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new HttpError(res.status, body);
  return body;
}
