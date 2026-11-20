import { HttpError, fetchJson } from "./api.js";

// Live Defense #3 — Auto-Retry với Exponential Backoff.
// Lần thử thứ n (n = 0,1,2,...) chờ baseDelay * 2^n (+ jitter ngẫu nhiên nhỏ)
// trước khi thử lại: 300ms, 600ms, 1200ms ...
// - Chỉ retry lỗi TẠM THỜI: lỗi mạng (TypeError) và HTTP 5xx / 429.
// - KHÔNG retry 4xx (vd 404, 400): thử lại cũng vô ích.
// - Tôn trọng AbortSignal: hủy ngay cả khi đang "ngủ" giữa hai lần thử.

export function isRetryable(err) {
  if (err?.name === "AbortError") return false;
  if (err instanceof HttpError) return err.status >= 500 || err.status === 429;
  return err instanceof TypeError; // fetch ném TypeError khi mất mạng / CORS / server tắt
}

export function backoffDelay(attempt, baseDelay, random = Math.random) {
  return baseDelay * 2 ** attempt + Math.floor(random() * baseDelay * 0.25);
}

// setTimeout có thể bị hủy bởi signal.
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function fetchWithRetry(url, { signal, retries = 3, baseDelay = 300, onRetry = () => {}, ...init } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchJson(url, { ...init, signal });
    } catch (err) {
      if (signal?.aborted || attempt >= retries || !isRetryable(err)) throw err;
      const delay = backoffDelay(attempt, baseDelay);
      onRetry({ attempt: attempt + 1, delay, error: err });
      await sleep(delay, signal);
    }
  }
}
