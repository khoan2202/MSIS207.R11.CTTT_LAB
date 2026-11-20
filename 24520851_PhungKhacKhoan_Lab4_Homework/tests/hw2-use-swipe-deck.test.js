import { renderHook, act, waitFor } from "@testing-library/react";
import { useSwipeDeck } from "../src/swipe/useSwipeDeck.js";

const PROFILES = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }];
const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });

function mockServer({ swipes = [], failPost = false } = {}) {
  const log = [];
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    const method = opts.method ?? "GET";
    log.push(`${method} ${url.replace(/^https?:\/\/[^/]+/, "")}`);
    if (url.endsWith("/api/profiles")) return json(PROFILES);
    if (url.includes("/api/swipes?")) return json(swipes);
    if (method === "POST") { await new Promise((r) => setTimeout(r, 20)); return failPost ? json({ error: "DB down" }, 500) : json({}, 201); }
    if (method === "DELETE") return { ok: true, status: 204, json: async () => null };
    return json({ error: "?" }, 404);
  });
  return log;
}

const SESSION = "11111111-1111-4111-8111-111111111111";

describe("HW2 — useSwipeDeck", () => {
  it("khôi phục lịch sử phiên từ server => bộ bài và điểm đúng", async () => {
    mockServer({ swipes: [{ clientId: "x", profileId: "a", action: "superlike" }] });
    const { result } = renderHook(() => useSwipeDeck(SESSION));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.top.id).toBe("b");
    expect(result.current.score).toBe(25);
  });

  it("swipe rồi undo thật nhanh: DELETE luôn gửi SAU POST (hàng đợi tuần tự)", async () => {
    const log = mockServer();
    const { result } = renderHook(() => useSwipeDeck(SESSION));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.swipe("like"); });
    expect(result.current.top.id).toBe("b"); // optimistic
    act(() => { result.current.undo(); });
    expect(result.current.top.id).toBe("a");
    await waitFor(() => expect(log.some((l) => l.startsWith("DELETE"))).toBe(true));
    const writes = log.filter((l) => !l.startsWith("GET"));
    expect(writes[0]).toMatch(/^POST/);
    expect(writes[1]).toMatch(/^DELETE \/api\/swipes\//);
  });

  it("server lỗi khi POST => rollback lá bài và báo lỗi", async () => {
    mockServer({ failPost: true });
    const { result } = renderHook(() => useSwipeDeck(SESSION));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.swipe("nope"); });
    expect(result.current.score).toBe(-5);
    await waitFor(() => expect(result.current.syncError).toMatch(/DB down/));
    expect(result.current.top.id).toBe("a");
    expect(result.current.score).toBe(0);
  });

  it("unmount trong lúc tải => request bị abort", () => {
    const signals = [];
    globalThis.fetch = vi.fn((_u, { signal }) => { signals.push(signal); return new Promise(() => {}); });
    const { unmount } = renderHook(() => useSwipeDeck(SESSION));
    unmount();
    expect(signals.every((s) => s.aborted)).toBe(true);
  });
});
