import { SCORE_WEIGHTS } from "../../shared/swipeRules.js";

// HW2 — Logic THUẦN của Swipe Deck (không React, không fetch) => test dễ, dùng lại được.
//
// Nguồn sự thật DUY NHẤT là `history`: một STACK (LIFO) các lượt swipe theo thứ tự.
//   history = [{ clientId, profileId, action }, ...]   (phần tử cuối = lượt mới nhất)
// Mọi thứ khác đều SUY RA từ history:
//   - lá bài còn lại  = profiles chưa xuất hiện trong history
//   - điểm số         = tổng trọng số các action
//   - lá trên cùng    = phần tử đầu của danh sách còn lại
// => Undo chỉ cần pop() khỏi stack, lá bài tự "quay lại" bộ bài, điểm tự tính lại.

export const KEY_TO_ACTION = { ArrowLeft: "nope", ArrowRight: "like", ArrowUp: "superlike" };

// Reducer cho useReducer: mọi thay đổi history đi qua đây => dễ kiểm soát, dễ test.
export function historyReducer(history, event) {
  switch (event.type) {
    case "load":
      return event.history;
    case "swipe":
      // Không cho swipe trùng một profile hai lần (vd double-click, phím lặp).
      if (history.some((h) => h.profileId === event.entry.profileId)) return history;
      return [...history, event.entry]; // push (bản sao mới, không mutate)
    case "undo":
      return history.slice(0, -1); // pop phần tử cuối — LIFO
    case "remove":
      // Rollback một lượt cụ thể khi server từ chối lưu.
      return history.filter((h) => h.clientId !== event.clientId);
    case "restore": {
      // Đưa lại lượt đã undo nếu server xóa thất bại (giữ đúng thứ tự LIFO).
      if (history.some((h) => h.clientId === event.entry.clientId)) return history;
      return [...history, event.entry];
    }
    case "reset":
      return [];
    default:
      throw new Error(`Event không hợp lệ: ${event.type}`);
  }
}

export function computeScore(history, weights = SCORE_WEIGHTS) {
  return history.reduce((sum, h) => sum + (weights[h.action] ?? 0), 0);
}

export function computeStats(history) {
  const counts = { like: 0, nope: 0, superlike: 0 };
  for (const h of history) counts[h.action] += 1;
  const positive = counts.like + counts.superlike;
  return { ...counts, total: history.length, likeRate: history.length ? Math.round((positive / history.length) * 100) : 0 };
}

export function remainingProfiles(profiles, history) {
  const swiped = new Set(history.map((h) => h.profileId));
  return profiles.filter((p) => !swiped.has(p.id));
}

// Chuyển độ dời con trỏ (px) thành action; dưới ngưỡng => null (trả lá bài về chỗ cũ).
export function gestureToAction(dx, dy, threshold = 100) {
  if (dy < -threshold && Math.abs(dy) > Math.abs(dx)) return "superlike";
  if (dx > threshold) return "like";
  if (dx < -threshold) return "nope";
  return null;
}
