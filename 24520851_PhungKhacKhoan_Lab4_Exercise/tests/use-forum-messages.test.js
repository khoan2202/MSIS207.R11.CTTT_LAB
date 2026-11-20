import { renderHook, act, waitFor } from "@testing-library/react";
import { useForumMessages } from "../src/forum/useForumMessages.js";

// fetch giả: mỗi request chờ được "resolve" thủ công, và reject AbortError khi bị hủy.
function installFakeFetch() {
  const calls = [];
  globalThis.fetch = vi.fn((url, { signal } = {}) => {
    return new Promise((resolve, reject) => {
      const call = { url, signal, respond: (body, status = 200) =>
        resolve({ ok: status < 400, status, json: async () => body }) };
      calls.push(call);
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  });
  return calls;
}

describe("Sprint 3 — useForumMessages", () => {
  it("đổi kênh nhanh: request cũ bị abort, dữ liệu cũ không ghi đè kênh mới", async () => {
    const calls = installFakeFetch();
    const { result, rerender } = renderHook(({ id }) => useForumMessages(id), { initialProps: { id: "nasa" } });
    expect(result.current.loading).toBe(true);

    rerender({ id: "notNasa" });
    expect(calls[0].signal.aborted).toBe(true);   // nasa bị hủy
    expect(calls[1].url).toContain("/notNasa");

    // Kể cả khi response nasa "về muộn", nó không được ghi vào state.
    await act(async () => { calls[0].respond([{ id: "old", text: "nasa" }]); });
    await act(async () => { calls[1].respond([{ id: "n1", text: "notNasa" }]); });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([{ id: "n1", text: "notNasa" }]);
  });

  it("unmount => abort request đang chạy (không memory leak)", () => {
    const calls = installFakeFetch();
    const { unmount } = renderHook(() => useForumMessages("nasa"));
    unmount();
    expect(calls[0].signal.aborted).toBe(true);
  });

  it("HTTP 404 được đưa vào error thay vì coi là dữ liệu", async () => {
    const calls = installFakeFetch();
    const { result } = renderHook(() => useForumMessages("mars"));
    await act(async () => { calls[0].respond({ error: "Không có kênh" }, 404); });
    expect(result.current.error?.status).toBe(404);
  });

  it("postMessage xong thì tự refetch", async () => {
    const calls = installFakeFetch();
    const { result } = renderHook(() => useForumMessages("nasa"));
    await act(async () => { calls[0].respond([]); });
    let p;
    act(() => { p = result.current.postMessage({ author: "k", text: "hi" }); });
    await act(async () => { calls[1].respond({ id: "x" }, 201); await p; });
    await waitFor(() => expect(calls).toHaveLength(3));
    expect(result.current.loading).toBe(true);
  });
});
