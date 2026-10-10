import {
  applyProps,
  renderToDOM,
} from "./dom.ts";

import type { VNode } from "./contracts.ts";

export function patch(
  parent: Node,
  dom: Node,
  previous: VNode,
  next: VNode,
): Node {
  if (
    previous.type !== next.type ||
    previous.props.key !== next.props.key
  ) {
    const replacement = renderToDOM(next);

    parent.replaceChild(replacement, dom);

    return replacement;
  }

  if (next.type === "TEXT_ELEMENT") {
    if (
      previous.props.nodeValue !== next.props.nodeValue
    ) {
      dom.nodeValue = String(next.props.nodeValue ?? "");
    }

    return dom;
  }

  applyProps(
    dom as HTMLElement,
    next.props,
    previous.props,
  );

  const oldChildren = previous.props.children;
  const oldNodes = Array.from(dom.childNodes);

  const keyed = new Map<unknown, number>();

  oldChildren.forEach((child, index) => {
    if (child.props.key != null) {
      keyed.set(child.props.key, index);
    }
  });

  const used = new Set<number>();
  const nextKeys = new Set<unknown>();

  next.props.children.forEach((child, index) => {
    const key = child.props.key;

    if (key != null) {
      if (nextKeys.has(key)) {
        throw new Error("Trùng key trong danh sách children");
      }

      nextKeys.add(key);
    }

    const oldIndex =
      key != null
        ? keyed.get(key)
        : oldChildren[index]?.props.key == null
          ? index
          : undefined;

    let node: Node;

    if (
      oldIndex !== undefined &&
      oldNodes[oldIndex] &&
      !used.has(oldIndex)
    ) {
      used.add(oldIndex);

      node = patch(
        dom,
        oldNodes[oldIndex],
        oldChildren[oldIndex],
        child,
      );
    } else {
      node = renderToDOM(child);
    }

    const atIndex = dom.childNodes[index] ?? null;

    if (atIndex !== node) {
      dom.insertBefore(node, atIndex);
    }
  });

  oldNodes.forEach((node, index) => {
    if (
      !used.has(index) &&
      node.parentNode === dom
    ) {
      dom.removeChild(node);
    }
  });

  return dom;
}