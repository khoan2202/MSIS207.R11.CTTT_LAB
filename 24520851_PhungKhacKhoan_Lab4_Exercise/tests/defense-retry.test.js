import { fetchWithRetry, backoffDelay, isRetryable } from "../src/forum/fetchWithRetry.js";
import { HttpError } from "../src/forum/api.js";

const res = (status, body = {}) => ({ ok: status < 400, status, json: async () => body });

describe("Live Defense #3 — exponential backoff", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("delay tăng gấp đôi mỗi lần", () => {
    const noJitter = () => 0;
    expect([0, 1, 2].map((a) => backoffDelay(a, 300, noJitter))).toEqual([300, 600, 1200]);
  });

  it("phân loại lỗi: retry 5xx/429/mất mạng, không retry 4xx", () => {
    expect(isRetryable(new HttpError(503))).toBe(true);
    expect(isRetryable(new HttpError(429))).toBe(true);
    expect(isRetryable(new TypeError("Failed to fetch"))).toBe(true);
    expect(isRetryable(new HttpError(404))).toBe(false);
  });

  it("503, 503 rồi 200 => thành công sau 2 lần retry", async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(res(503)).mockResolvedValueOnce(res(503)).mockResolvedValueOnce(res(200, ["ok"]));
    const p = fetchWithRetry("/x", { baseDelay: 100 });
    await vi.runAllTimersAsync();
    await expect(p).resolves.toEqual(["ok"]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("404 không retry", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(res(404, { error: "no" }));
    await expect(fetchWithRetry("/x")).rejects.toMatchObject({ status: 404 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("abort trong lúc chờ backoff => dừng ngay, không gọi fetch nữa", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(res(503));
    const controller = new AbortController();
    const p = fetchWithRetry("/x", { signal: controller.signal, baseDelay: 1000 });
    const assertion = expect(p).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(10);   // đang chờ lần retry 1
    controller.abort();
    await assertion;
    await vi.runAllTimersAsync();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("hết số lần retry => ném lỗi cuối cùng", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(res(500));
    const p = fetchWithRetry("/x", { retries: 2, baseDelay: 10 });
    const assertion = expect(p).rejects.toMatchObject({ status: 500 });
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
