import "./style.css";

import { setupEventDelegation } from "./core/events.ts";
import { mountHomework1 } from "./homework/hw1.ts";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Không tìm thấy #app");
}

mountHomework1(root);

const cleanupEvents = setupEventDelegation(root);

if (import.meta.hot) {
  import.meta.hot.dispose(cleanupEvents);
}

window.addEventListener("pagehide", cleanupEvents, {
  once: true,
});