import type { VNode } from "./contracts.ts";

import { renderToDOM } from "./dom.ts";
import { patch } from "./patch.ts";

import {
  clearStore,
  resetCursor,
  setRenderer,
} from "./store.ts";

import { setupEventDelegation } from "./events.ts";

export function renderApp(
  App: () => VNode,
  root: HTMLElement,
): () => void {
  clearStore();

  let previous: VNode | undefined;
  let dom: Node | undefined;

  let queued = false;
  let alive = true;

  function render(): void {
    if (!alive) {
      return;
    }

    resetCursor();

    const next = App();

    if (!previous || !dom) {
      dom = renderToDOM(next);
      root.replaceChildren(dom);
    } else {
      dom = patch(root, dom, previous, next);
    }

    previous = next;
  }

  setRenderer(() => {
    if (!alive || queued) {
      return;
    }

    queued = true;

    queueMicrotask(() => {
      queued = false;
      render();
    });
  });

  const cleanupEvents = setupEventDelegation(root);

  render();

  return () => {
    alive = false;

    cleanupEvents();
    clearStore();

    root.replaceChildren();
  };
}