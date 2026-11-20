import { lazy, Suspense } from "react";
import { render, screen } from "@testing-library/react";
import Skeleton from "../src/components/Skeleton.jsx";

describe("Ex 1.1 — React.lazy + Suspense", () => {
  it("hiển thị Skeleton có aria-busy/aria-live trong lúc chunk đang tải", async () => {
    let resolveChunk;
    const Lazy = lazy(() => new Promise((r) => { resolveChunk = r; }));
    render(
      <Suspense fallback={<Skeleton />}>
        <Lazy />
      </Suspense>,
    );
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.getAttribute("aria-live")).toBe("polite");

    resolveChunk({ default: () => <p>Đã tải xong</p> });
    expect(await screen.findByText("Đã tải xong")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
