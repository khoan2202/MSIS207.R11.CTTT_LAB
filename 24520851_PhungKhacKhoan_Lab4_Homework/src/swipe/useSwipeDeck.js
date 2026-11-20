import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { fetchJson } from "../lib/api.js";
import { computeScore, computeStats, historyReducer, remainingProfiles } from "./swipeLogic.js";

// HW2 — Hook nối logic thuần với server.
// - Tải profiles + lịch sử của phiên (khôi phục sau F5) bằng AbortController.
// - Optimistic update: UI đổi NGAY khi swipe/undo, gọi server ở nền; lỗi thì rollback.
// - Hàng đợi ghi tuần tự (promise chain): nếu swipe rồi undo thật nhanh, DELETE luôn chạy
//   SAU POST. Không có hàng đợi, DELETE có thể tới server trước POST => lượt đã undo bị lưu lại.
export function useSwipeDeck(sessionId) {
  const [load, setLoad] = useState({ key: null, profiles: [], error: null });
  const [history, dispatch] = useReducer(historyReducer, []);
  const [syncError, setSyncError] = useState(null);
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    (async () => {
      try {
        const [profiles, swipes] = await Promise.all([
          fetchJson("/api/profiles", { signal }),
          fetchJson(`/api/swipes?sessionId=${sessionId}`, { signal }),
        ]);
        if (signal.aborted) return;
        dispatch({ type: "load", history: swipes });
        setLoad({ key: sessionId, profiles, error: null });
      } catch (err) {
        if (!signal.aborted) setLoad({ key: sessionId, profiles: [], error: err });
      }
    })();
    return () => controller.abort();
  }, [sessionId]);

  const enqueue = useCallback((task) => {
    queue.current = queue.current.then(task, task);
    return queue.current;
  }, []);

  // ---------- DERIVED STATE ----------
  const loading = load.key !== sessionId;
  const profiles = loading ? [] : load.profiles;
  const remaining = remainingProfiles(profiles, history);
  const top = remaining[0] ?? null;
  const score = computeScore(history);
  const stats = computeStats(history);
  const last = history.at(-1) ?? null;

  const swipe = useCallback(
    (action) => {
      if (!top) return null;
      const entry = { clientId: crypto.randomUUID(), profileId: top.id, action };
      dispatch({ type: "swipe", entry });
      setSyncError(null);
      enqueue(async () => {
        try {
          await fetchJson("/api/swipes", { method: "POST", body: JSON.stringify({ ...entry, sessionId }) });
        } catch (err) {
          dispatch({ type: "remove", clientId: entry.clientId });
          setSyncError(`Không lưu được lượt swipe (${err.message}). Lá bài đã được trả lại.`);
        }
      });
      return entry;
    },
    [top, sessionId, enqueue],
  );

  const undo = useCallback(() => {
    if (!last) return null;
    dispatch({ type: "undo", clientId: last.clientId });
    setSyncError(null);
    enqueue(async () => {
      try {
        await fetchJson(`/api/swipes/${last.clientId}`, { method: "DELETE" });
      } catch (err) {
        dispatch({ type: "restore", entry: last });
        setSyncError(`Không hoàn tác được trên server (${err.message}).`);
      }
    });
    return last;
  }, [last, enqueue]);

  return { loading, error: load.error, profiles, remaining, top, history, score, stats, last, swipe, undo, syncError };
}
