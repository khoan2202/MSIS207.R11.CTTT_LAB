// Luật validate tin nhắn DÙNG CHUNG cho client và server
// (Full-Stack Verification Contract: "client & server validation parity").
// Client dùng để báo lỗi ngay khi gõ; server dùng lại đúng hàm này để không tin client.
export const MESSAGE_LIMITS = { author: 40, text: 500 };

export function validateMessagePayload(body) {
  const errors = {};
  if (body === null || typeof body !== "object") return { body: "Payload phải là JSON object." };
  for (const field of ["author", "text"]) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) errors[field] = `Thiếu trường ${field}.`;
    else if (value.trim().length > MESSAGE_LIMITS[field]) errors[field] = `${field} tối đa ${MESSAGE_LIMITS[field]} ký tự.`;
  }
  return errors;
}
