import "./style.css";
import { el } from "./core/dom";
import { setupEventDelegation } from "./core/events";
import { mountHomework1 } from "./homework/hw1";
import { mountHomework2 } from "./homework/hw2";
import { mountHomework3 } from "./homework/hw3";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Không tìm thấy phần tử #root.");
}

const requested =
  new URLSearchParams(window.location.search).get("hw");

const selected =
  requested === "2" || requested === "3"
    ? requested
    : "1";

const navigation = el(
  "nav",
  {
    className: "homework-nav",
    "aria-label": "Chọn bài Homework",
  },
  ...["1", "2", "3"].map((number) =>
    el(
      "a",
      {
        href: `?hw=${number}`,
        "aria-current":
          selected === number ? "page" : undefined,
      },
      `Homework ${number}`,
    ),
  ),
);

root.before(navigation);

let disposeHomework: () => void = () => {};

switch (selected) {
  case "2":
    disposeHomework = mountHomework2(root);
    break;

  case "3":
    disposeHomework = mountHomework3(root);
    break;

  default:
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