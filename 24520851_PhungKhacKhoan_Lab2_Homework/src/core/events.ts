import { handlers } from "./dom.ts";

export function setupEventDelegation(
  root: HTMLElement,
): () => void {
  const controller = new AbortController();

  const events: Record<string, string> = {
    click: "onClick",
    input: "onInput",
    change: "onChange",
    keydown: "onKeyDown",
    focusin: "onFocusIn",
    submit: "onSubmit",
  };

  for (const [type, prop] of Object.entries(events)) {
    root.addEventListener(
      type,

      (event) => {
        for (const item of event.composedPath()) {
          if (item instanceof Node) {
            if (
              item instanceof HTMLButtonElement &&
              item.disabled
            ) {
              break;
            }

            const callback = handlers.get(item)?.[prop];

            if (typeof callback === "function") {
              const result = callback(event);

              if (result instanceof Promise) {
                void result.catch((error) => {
                  console.error("Lỗi handler async:", error);
                });
              }
            }
          }

          if (event.cancelBubble || item === root) {
            break;
          }
        }
      },

      { signal: controller.signal },
    );
  }

  return () => controller.abort();
}