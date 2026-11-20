import { renderHook, act } from "@testing-library/react";
import { useAppealSlaTimer, computeOffset, formatDuration, slaLevel } from "../src/tribunal/useAppealSlaTimer.js";

const T0 = Date.UTC(2026, 10, 20, 8, 0, 0);
const HOUR = 3600_000;

function serverClock(skewMs = 0) {
  globalThis.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ now: Date.now() + skewMs }) }));
}
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe("HW3 — useAppealSlaTimer (zero-drift)", () => {
  beforeEach(() => vi.useFakeTimers({ now: T0, toFake: ["setTimeout", "clearTimeout", "Date"] }));
  afterEach(() => vi.useRealTimers());

  it("hàm phụ: offset bù RTT/2, format và mức cảnh báo", () => {
    expect(computeOffset({ t0: 1000, t1: 1200, serverNow: 6100 })).toBe(5000);
    expect(formatDuration(2 * 86400_000 + 3 * HOUR + 4 * 60_000 + 5_000)).toBe("2 ngày 03:04:05");
    expect([slaLevel(2 * HOUR), slaLevel(HOUR / 2), slaLevel(5 * 60_000), slaLevel(0)]).toEqual(["ok", "warning", "critical", "expired"]);
  });

  it("dùng đồng hồ SERVER: client chậm 5 giây so với server => còn lại ít hơn 5 giây", async () => {
    serverClock(5000);
    const { result } = renderHook(() => useAppealSlaTimer(new Date(T0 + HOUR)));
    await flush();
    expect(result.current.synced).toBe(true);
    expect(result.current.offsetMs).toBe(5000);
    expect(result.current.remaining).toBe(HOUR - 5000);
  });

  it("nhịp timer bị trễ liên tục vẫn KHÔNG cộng dồn sai số", async () => {
    serverClock(0);
    const deadline = T0 + HOUR;
    const { result } = renderHook(() => useAppealSlaTimer(new Date(deadline)));
    await flush();
    // 120 nhịp, mỗi nhịp trễ thêm 37ms (mô phỏng event loop bận).
    // Kiểu "trừ dồn 1000ms mỗi nhịp" sẽ lệch 120 × 37ms ≈ 4.4 giây.
    let maxError = 0;
    for (let i = 0; i < 120; i++) {
      await act(async () => { vi.advanceTimersByTime(1000 + 37); });
      maxError = Math.max(maxError, Math.abs(result.current.remaining - (deadline - Date.now())));
    }
    // Sai số luôn < 1 nhịp hiển thị (≈1s) và KHÔNG tăng theo số nhịp.
    expect(maxError).toBeLessThan(1050);
    await act(async () => { vi.advanceTimersByTime(1005); });
    expect(Math.ceil(result.current.remaining / 1000)).toBe(Math.ceil((deadline - Date.now()) / 1000));
  });

  it("tab chạy nền bị hãm timer: quay lại (visibilitychange) => đúng ngay lập tức + đồng bộ lại server", async () => {
    serverClock(0);
    const deadline = T0 + 6 * HOUR;
    const { result } = renderHook(() => useAppealSlaTimer(new Date(deadline)));
    await flush();
    // Tab ẩn 2 giờ: thời gian thực trôi nhưng không timer nào chạy.
    vi.setSystemTime(T0 + 2 * HOUR);
    expect(result.current.remaining).toBe(6 * HOUR); // UI còn giá trị cũ (đúng như trình duyệt hãm timer)
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    await flush();
    expect(result.current.remaining).toBe(4 * HOUR);
    expect(fetch).toHaveBeenCalledTimes(2); // mount + lúc tab hiện lại
  });

  it("hết hạn => expired=true, remaining=0 và dừng hẹn timer", async () => {
    serverClock(0);
    const { result } = renderHook(() => useAppealSlaTimer(new Date(T0 + 2500)));
    await flush();
    for (let i = 0; i < 5; i++) await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.expired).toBe(true);
    expect(result.current.remaining).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("không gọi được /api/time => vẫn chạy theo đồng hồ máy và báo lỗi", async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    const { result } = renderHook(() => useAppealSlaTimer(new Date(T0 + HOUR)));
    await flush();
    expect(result.current.synced).toBe(false);
    expect(result.current.syncError).toBeTruthy();
    expect(result.current.remaining).toBe(HOUR);
  });
});
