import "./style.css";
import { el } from "./core/dom";
import { setupEventDelegation } from "./core/events";
import { mountHomework1 } from "./homework/hw1";
import { mountHomework2 } from "./homework/hw2";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Không tìm thấy phần tử #root.");
}

const selected =
  new URLSearchParams(window.location.search).get("hw") === "2"
    ? "2"
    : "1";

const navigation = el(
  "nav",
  {
    className: "homework-nav",
    "aria-label": "Chọn bài Homework",
  },
  el(
    "a",
    {
      href: "?hw=1",
      "aria-current": selected === "1" ? "page" : undefined,
    },
    "Homework 1",
  ),
  el(
    "a",
    {
      href: "?hw=2",
      "aria-current": selected === "2" ? "page" : undefined,
    },
    "Homework 2",
  ),
);

root.before(navigation);

let disposeHomework: () => void = () => {};

if (selected === "2") {
  disposeHomework = mountHomework2(root);
} else {
  mountHomework1(root);
}

const removeDelegation = setupEventDelegation(root);

let cleaned = false;

function cleanup(): void {
  if (cleaned) {
    return;
  }

  cleaned = true;

  removeDelegation();
  disposeHomework();
  navigation.remove();

  window.removeEventListener("pagehide", onPageHide);
  window.removeEventListener("pageshow", onPageShow);
}

function onPageHide(event: PageTransitionEvent): void {
  // Nếu vào back-forward cache, khi quay lại sẽ tải lại trang
  // để không dùng engine/hàng đợi đã dispose.
  if (event.persisted) {
    disposeHomework();
  } else {
    cleanup();
  }
}

function onPageShow(event: PageTransitionEvent): void {
  if (event.persisted) {
    window.location.reload();
  }
}

window.addEventListener("pagehide", onPageHide);
window.addEventListener("pageshow", onPageShow);

if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}