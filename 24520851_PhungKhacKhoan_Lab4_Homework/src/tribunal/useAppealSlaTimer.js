import { useEffect, useState } from "react";
import { fetchJson } from "../lib/api.js";

// HW3 — useAppealSlaTimer(deadline): đồng hồ đếm ngược hạn khiếu nại "zero-drift".
//
// Vì sao đồng hồ kiểu `setInterval(() => setLeft(l => l - 1000), 1000)` bị TRÔI?
//  1. setTimeout/setInterval không đúng giờ tuyệt đối: mỗi nhịp trễ vài ms, cộng dồn theo thời gian.
//  2. Tab chạy nền bị trình duyệt hãm (throttle) còn ~1 nhịp/phút => quay lại tab thấy sai hàng phút.
//  3. Đồng hồ máy người dùng có thể chạy nhanh/chậm so với server.
//
// Cách làm ở đây:
//  - KHÔNG BAO GIỜ trừ dồn. Mỗi lần render: remaining = deadline - (Date.now() + offset).
//    Nhịp timer chỉ là "lời nhắc render lại", trễ bao nhiêu cũng không làm sai số tích lũy.
//  - offset = đồng hồ server - đồng hồ client, đo qua GET /api/time có bù nửa thời gian khứ hồi (RTT/2).
//  - Page Visibility API: khi tab hiện lại (visibilitychange -> visible) thì đồng bộ lại offset
//    và tính lại ngay, không chờ nhịp timer bị hãm.
//  - Hẹn nhịp kế tiếp đúng vào ranh giới giây của `remaining` => số giây nhảy đều, không "nhảy cóc".

export function computeOffset({ t0, t1, serverNow }) {
  // Giả định thời gian đi = thời gian về => server đọc đồng hồ ở giữa khoảng [t0, t1].
  return serverNow + (t1 - t0) / 2 - t1;
}

export function splitDuration(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function formatDuration(ms) {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${days > 0 ? `${days} ngày ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Mức cảnh báo đổi rất ít lần => dùng cho aria-live (không đọc mỗi giây).
export function slaLevel(remaining) {
  if (remaining <= 0) return "expired";
  if (remaining <= 10 * 60 * 1000) return "critical";
  if (remaining <= 60 * 60 * 1000) return "warning";
  return "ok";
}

export function useAppealSlaTimer(deadline, { syncPath = "/api/time" } = {}) {
  const deadlineMs = deadline ? new Date(deadline).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  const [offset, setOffset] = useState({ value: 0, synced: false, error: null });

  // (1) Đồng bộ đồng hồ với server: khi mount và mỗi khi tab hiện lại.
  useEffect(() => {
    let controller = null;

    const sync = async () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      const t0 = Date.now();
      try {
        const { now: serverNow } = await fetchJson(syncPath, { signal, cache: "no-store" });
        const t1 = Date.now();
        if (!signal.aborted) setOffset({ value: computeOffset({ t0, t1, serverNow }), synced: true, error: null });
      } catch (error) {
        // Không đồng bộ được: vẫn chạy theo đồng hồ máy, báo cho người dùng biết.
        if (!signal.aborted) setOffset((o) => ({ ...o, error }));
      }
      if (!signal.aborted) setNow(Date.now());
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now()); // tính lại ngay theo đồng hồ hiện tại
        sync(); // rồi hiệu chỉnh lại offset với server
      }
    };

    sync();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      controller?.abort();
    };
  }, [syncPath]);

  // ---------- DERIVED ----------
  const remaining = deadlineMs === null ? null : Math.max(0, deadlineMs - (now + offset.value));
  const expired = remaining === 0;

  // (2) Hẹn nhịp kế tiếp vào đúng ranh giới giây. Dừng hẳn khi đã hết hạn.
  useEffect(() => {
    if (remaining === null || remaining <= 0) return undefined;
    const delay = remaining % 1000 || 1000;
    const id = setTimeout(() => setNow(Date.now()), delay + 5);
    return () => clearTimeout(id);
  }, [remaining]);

  return {
    remaining,
    expired,
    level: remaining === null ? null : slaLevel(remaining),
    parts: remaining === null ? null : splitDuration(remaining),
    text: remaining === null ? "" : formatDuration(remaining),
    synced: offset.synced,
    offsetMs: Math.round(offset.value),
    syncError: offset.error,
  };
}
