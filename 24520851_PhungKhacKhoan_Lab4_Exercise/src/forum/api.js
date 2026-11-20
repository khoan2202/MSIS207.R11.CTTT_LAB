// Địa chỉ API đọc từ biến môi trường Vite (VITE_ prefix), mặc định server local.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Lỗi HTTP có kèm status và body để UI hiển thị lỗi theo field.
export class HttpError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

// fetch() KHÔNG reject khi server trả 404/500 — phải tự kiểm tra res.ok.
export async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new HttpError(res.status, body);
  return body;
}
