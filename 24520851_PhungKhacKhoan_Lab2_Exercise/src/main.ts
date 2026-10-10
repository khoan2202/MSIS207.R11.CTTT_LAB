import "./style.css";

import { h } from "./core/vnode.ts";
import { renderToDOM } from "./core/dom.ts";
import { setupEventDelegation } from "./core/events.ts";

import { mountExercise1 } from "./exercise/ex1.ts";
import { mountExercise2 } from "./exercise/ex2.ts";
import { mountExercise3 } from "./exercise/ex3.ts";

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
    h("a", { href: "?ex=3" }, "Exercise 3"),
  ),
);

root.before(navigation);

const selected =
  new URL(window.location.href).searchParams.get("ex") ?? "3";

let cleanupApp: () => void;

if (selected === "1") {
  mountExercise1(root);
  cleanupApp = setupEventDelegation(root);
} else if (selected === "2") {
  cleanupApp = mountExercise2(root);
} else {
  cleanupApp = mountExercise3(root);
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