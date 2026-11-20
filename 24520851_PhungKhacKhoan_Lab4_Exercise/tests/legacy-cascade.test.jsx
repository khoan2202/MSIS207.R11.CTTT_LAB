import { Profiler } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LegacyForm from "../src/form/legacy/LegacyForm.jsx";

// Đo số commit để chứng minh cascade (không dùng StrictMode để số đo ổn định).
describe("Ex 1.3 — useEffect waterfall", () => {
  it("một lần gõ phím gây ra nhiều commit liên tiếp", () => {
    Element.prototype.scrollIntoView = () => {};
    let commits = 0;
    render(<Profiler id="legacy" onRender={() => { commits += 1; }}><LegacyForm /></Profiler>);
    commits = 0;
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a" } });
    console.log("[legacy] commits per keystroke:", commits);
    expect(commits).toBeGreaterThanOrEqual(4);
  });
});
