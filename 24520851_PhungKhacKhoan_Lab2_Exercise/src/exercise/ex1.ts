import { h } from "../core/vnode.ts";
import { renderToDOM } from "../core/dom.ts";

export function mountExercise1(root: HTMLElement): void {
  const tree = h(
    "section",
    { id: "exercise-1" },

    h(
      "header",
      null,
      h("h1", null, "Exercise 1: Mini React"),
      h(
        "p",
        null,
        "Tự xây VNode và chuyển thành DOM thật.",
      ),
    ),

    h(
      "section",
      { "aria-labelledby": "security-heading" },

      h("h2", { id: "security-heading" }, "Kiểm tra XSS"),

      h("p", null, "<script>alert(1)</script>"),

      h("p", null, "<img src=x onerror=alert(1)>"),
    ),

    h(
      "section",
      { "aria-labelledby": "children-heading" },

      h(
        "h2",
        { id: "children-heading" },
        "Chuẩn hóa children",
      ),

      h(
        "p",
        { id: "normalized-text" },
        ["Giá trị: ", [0, null, false, [" OK"]]],
      ),
    ),

    h(
      "section",
      { "aria-labelledby": "event-heading" },

      h(
        "h2",
        { id: "event-heading" },
        "Kiểm tra sự kiện",
      ),

      h(
        "button",
        {
          type: "button",

          onClick: () => {
            console.log("Ping");

            const message =
              root.querySelector("#ping-status");

            if (message) {
              message.textContent =
                "Đã nhận sự kiện click tại root.";
            }
          },
        },

        h("span", null, "Click để Ping"),
      ),

      h(
        "p",
        { id: "ping-status", role: "status" },
        "Chưa click.",
      ),
    ),
  );

  root.replaceChildren(renderToDOM(tree));

  console.assert(
    root.querySelector("h1")?.textContent ===
      "Exercise 1: Mini React",
    "Cây DOM không đúng",
  );

  console.assert(
    root.querySelectorAll("script, img").length === 0,
    "Text child đã bị parse thành HTML",
  );

  console.assert(
    root.querySelector("#normalized-text")?.textContent ===
      "Giá trị: 0 OK",
    "Chuẩn hóa children không đúng",
  );

  console.log("VNode Exercise 1:", tree);
}