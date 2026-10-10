import "./style.css";

import { h } from "./core/vnode.ts";
import { renderToDOM } from "./core/dom.ts";
import { setupEventDelegation } from "./core/events.ts";

import { mountExercise1 } from "./exercise/ex1.ts";
import { mountExercise2 } from "./exercise/ex2.ts";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Không tìm thấy #app");
}

const navigation = renderToDOM(
  h(
    "nav",
    {
      className: "exercise-navigation",
      "aria-label": "Chọn bài Exercise",
    },

    h("a", { href: "?ex=1" }, "Exercise 1"),
    h("a", { href: "?ex=2" }, "Exercise 2"),
  ),
);

root.before(navigation);

const selected =
  new URL(window.location.href).searchParams.get("ex") ?? "2";

let cleanupApp: () => void;

if (selected === "1") {
  mountExercise1(root);
  cleanupApp = setupEventDelegation(root);
} else {
  cleanupApp = mountExercise2(root);
}

function dispose(): void {
  cleanupApp();
  navigation.parentNode?.removeChild(navigation);
}

if (import.meta.hot) {
  import.meta.hot.dispose(dispose);
}

window.addEventListener("pagehide", dispose, {
  once: true,
});