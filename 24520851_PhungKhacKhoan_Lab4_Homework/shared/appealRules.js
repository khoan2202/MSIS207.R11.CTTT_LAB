// HW3 — CONTRACT + luật validate đơn khiếu nại, DÙNG CHUNG client và server
// (client báo lỗi real-time; server chạy lại đúng hàm này, không tin client).
//
// Appeal payload:
// { playerId, contactEmail, reason, requestedOutcome, statement, evidenceUrl?, acknowledge }

export const APPEAL_REASONS = [
  { id: "technical-issue", label: "Sự cố kỹ thuật ngoài tầm kiểm soát" },
  { id: "disproportionate", label: "Mức phạt không tương xứng" },
  { id: "procedural", label: "Sai quy trình xử lý" },
  { id: "new-evidence", label: "Có bằng chứng mới" },
];

export const APPEAL_OUTCOMES = [
  { id: "revoke", label: "Hủy toàn bộ án phạt" },
  { id: "reduce", label: "Giảm mức phạt" },
  { id: "review", label: "Xem xét lại bởi hội đồng khác" },
];

export const STATEMENT_LIMITS = { min: 80, max: 2000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const APPEAL_RULES = {
  contactEmail: (v) => {
    if (!String(v ?? "").trim()) return "Vui lòng nhập email liên hệ.";
    return EMAIL_RE.test(String(v).trim()) ? "" : "Email chưa đúng định dạng.";
  },
  reason: (v) => (APPEAL_REASONS.some((r) => r.id === v) ? "" : "Vui lòng chọn lý do khiếu nại."),
  requestedOutcome: (v) => (APPEAL_OUTCOMES.some((o) => o.id === v) ? "" : "Vui lòng chọn kết quả mong muốn."),
  statement: (v) => {
    const len = String(v ?? "").trim().length;
    if (len < STATEMENT_LIMITS.min) return `Trình bày cần ít nhất ${STATEMENT_LIMITS.min} ký tự (hiện có ${len}).`;
    if (len > STATEMENT_LIMITS.max) return `Trình bày tối đa ${STATEMENT_LIMITS.max} ký tự.`;
    return "";
  },
  // Cross-field: lý do "có bằng chứng mới" thì BẮT BUỘC có link bằng chứng.
  evidenceUrl: (v, all) => {
    const value = String(v ?? "").trim();
    if (!value) return all.reason === "new-evidence" ? "Lý do 'Có bằng chứng mới' cần kèm link bằng chứng." : "";
    return isHttpsUrl(value) ? "" : "Link bằng chứng phải là URL https:// hợp lệ.";
  },
  acknowledge: (v) => (v === true ? "" : "Bạn cần xác nhận thông tin là trung thực."),
};

export const APPEAL_INITIAL = {
  contactEmail: "",
  reason: "",
  requestedOutcome: "",
  statement: "",
  evidenceUrl: "",
  acknowledge: false,
};

export function validateAppeal(values, rules = APPEAL_RULES) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values?.[field], values ?? {});
    if (message) errors[field] = message;
  }
  return errors;
}
