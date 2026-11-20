import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Gỡ DOM sau mỗi test để các test không ảnh hưởng nhau.
afterEach(() => cleanup());

// jsdom chưa cài scrollIntoView — giả lập để code UI chạy được trong test.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

// jsdom chưa hỗ trợ <dialog>.showModal()/close() — giả lập tối thiểu cho test.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
