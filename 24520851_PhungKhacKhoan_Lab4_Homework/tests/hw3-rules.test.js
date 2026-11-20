import { validateAppeal, APPEAL_INITIAL } from "../shared/appealRules.js";
import { computeMatrix, median } from "../src/tribunal/matrix.js";

const valid = {
  contactEmail: "team@example.com",
  reason: "technical-issue",
  requestedOutcome: "reduce",
  statement: "x".repeat(90),
  evidenceUrl: "",
  acknowledge: true,
};

describe("HW3 — validateAppeal (shared)", () => {
  it("form rỗng báo lỗi đủ các trường bắt buộc", () => {
    expect(Object.keys(validateAppeal(APPEAL_INITIAL))).toEqual(["contactEmail", "reason", "requestedOutcome", "statement", "acknowledge"]);
  });
  it("hợp lệ => {}", () => expect(validateAppeal(valid)).toEqual({}));
  it("cross-field: new-evidence bắt buộc evidenceUrl", () => {
    expect(validateAppeal({ ...valid, reason: "new-evidence" }).evidenceUrl).toMatch(/cần kèm link/);
    expect(validateAppeal({ ...valid, reason: "new-evidence", evidenceUrl: "https://clips.example.com/1" })).toEqual({});
  });
  it("chỉ chấp nhận https và đếm ký tự statement", () => {
    expect(validateAppeal({ ...valid, evidenceUrl: "http://a.com" }).evidenceUrl).toMatch(/https/);
    expect(validateAppeal({ ...valid, evidenceUrl: "javascript:alert(1)" }).evidenceUrl).toMatch(/https/);
    expect(validateAppeal({ ...valid, statement: "ngắn" }).statement).toMatch(/hiện có 4/);
  });
  it("acknowledge phải đúng boolean true (chuỗi 'true' từ client giả mạo bị từ chối)", () => {
    expect(validateAppeal({ ...valid, acknowledge: "true" }).acknowledge).toBeTruthy();
  });
});

describe("HW3 — ma trận bất tương xứng (derived)", () => {
  const dossier = {
    offense: { severity: 2 },
    penalty: { banDays: 14 },
    precedents: [
      { caseId: "P1", severity: 2, banDays: 3 },
      { caseId: "P2", severity: 3, banDays: 7 },
      { caseId: "P3", severity: 1, banDays: 2 },
    ],
  };
  it("median đúng cho số phần tử chẵn/lẻ", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });
  it("tính ratio, delta, chỉ số và cờ bất tương xứng", () => {
    const m = computeMatrix(dossier);
    expect(m.currentRatio).toBe(7);
    expect(m.rows.map((r) => r.ratio)).toEqual([1.5, 2.33, 2]);
    expect(m.baseline).toBe(2);
    expect(m.index).toBe(3.5);
    expect(m.disproportionate).toBe(true);
    expect(m.rows[0].delta).toBe(5.5);
  });
  it("không có tiền lệ => index null, không gắn cờ", () => {
    expect(computeMatrix({ ...dossier, precedents: [] })).toMatchObject({ index: null, disproportionate: false });
  });
});
