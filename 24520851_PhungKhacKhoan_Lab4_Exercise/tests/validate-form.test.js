import { renderHook } from "@testing-library/react";
import { validateForm, INITIAL_VALUES } from "../src/form/validateForm.js";
import { useFormContext } from "../src/form/FormContext.js";

const valid = { fullName: "Khoan", email: "khoan@uit.edu.vn", age: "20", password: "abc12345" };

describe("Sprint 2 — validateForm (pure)", () => {
  it("form rỗng báo lỗi ở mọi field bắt buộc", () => {
    expect(Object.keys(validateForm(INITIAL_VALUES))).toEqual(["fullName", "email", "age", "password"]);
  });
  it("dữ liệu hợp lệ => object lỗi rỗng", () => {
    expect(validateForm(valid)).toEqual({});
  });
  it.each([
    ["email", "khoan@", /định dạng/],
    ["age", "15", /16 đến 100/],
    ["age", "20.5", /số nguyên/],
    ["password", "abcdefgh", /chữ và số/],
    ["fullName", " K ", /2 ký tự/],
  ])("%s = %j bị bắt lỗi", (field, value, msg) => {
    expect(validateForm({ ...valid, [field]: value })[field]).toMatch(msg);
  });
  it("là hàm thuần: gọi 2 lần cho cùng kết quả, không đổi input", () => {
    const input = { ...valid, email: "x" };
    const frozen = Object.freeze({ ...input });
    expect(validateForm(frozen)).toEqual(validateForm(input));
  });
});

describe("Sprint 2 — useFormContext", () => {
  it("ném lỗi rõ ràng khi dùng ngoài Provider", () => {
    expect(() => renderHook(() => useFormContext())).toThrow(/bên trong <FormContext.Provider>/);
  });
});
