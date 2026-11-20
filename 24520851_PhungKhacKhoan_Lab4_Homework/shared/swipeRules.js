// HW2 — Luật dùng chung client + server cho Swipe Deck.
export const SWIPE_ACTIONS = ["like", "nope", "superlike"];

// Điểm BẤT ĐỐI XỨNG: thích được cộng nhiều hơn mức bị trừ khi bỏ qua,
// "siêu thích" cộng nhiều nhất. (Slide: LIKE +10, còn lại -5; mở rộng thêm superlike.)
export const SCORE_WEIGHTS = { like: 10, superlike: 25, nope: -5 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateSwipePayload(body) {
  const errors = {};
  if (body === null || typeof body !== "object") return { body: "Payload phải là JSON object." };
  if (typeof body.clientId !== "string" || !UUID_RE.test(body.clientId)) errors.clientId = "clientId phải là UUID.";
  if (typeof body.sessionId !== "string" || !UUID_RE.test(body.sessionId)) errors.sessionId = "sessionId phải là UUID.";
  if (typeof body.profileId !== "string" || !body.profileId.trim()) errors.profileId = "Thiếu profileId.";
  if (!SWIPE_ACTIONS.includes(body.action)) errors.action = `action phải là một trong: ${SWIPE_ACTIONS.join(", ")}.`;
  return errors;
}
