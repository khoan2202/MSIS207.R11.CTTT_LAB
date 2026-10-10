import { mountExercise1 } from "./exercise/ex1.ts";
import { setupEventDelegation } from "./core/events.ts";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Không tìm thấy #app");
}

mountExercise1(root);

const cleanupEvents = setupEventDelegation(root);

if (import.meta.hot) {
  import.meta.hot.dispose(cleanupEvents);
}

window.addEventListener("pagehide", cleanupEvents, {
  once: true,
});