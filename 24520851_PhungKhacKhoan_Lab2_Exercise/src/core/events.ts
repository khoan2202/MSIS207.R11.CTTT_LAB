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
    submit: "onSubmit",
  };

  for (const [eventType, propName] of Object.entries(events)) {
    root.addEventListener(
      eventType,

      (event) => {
        const path = event.composedPath();

        for (const item of path) {
          if (item instanceof Node) {
            if (
              item instanceof HTMLButtonElement &&
              item.disabled
            ) {
              break;
            }

            const callback =
              handlers.get(item)?.[propName];

            if (typeof callback === "function") {
              const result = callback(event);

              if (result instanceof Promise) {
                void result.catch((error) => {
                  console.error(
                    "Lỗi callback async:",
                    error,
                  );
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