import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Gỡ DOM sau mỗi test để các test không ảnh hưởng nhau.
afterEach(() => cleanup());

// jsdom chưa cài scrollIntoView — giả lập để code UI chạy được trong test.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
