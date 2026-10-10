import {
  isVNode,
  type Child,
  type Props,
  type VNode,
} from "./contracts.ts";

export function createTextElement(text: string | number): VNode {
  return Object.freeze({
    type: "TEXT_ELEMENT",
    props: Object.freeze({
      nodeValue: String(text),
      children: Object.freeze([]),
    }),
  });
}

export function createElement(
  type: string,
  props: Props | null,
  ...children: Child[]
): VNode {
  const normalizedChildren: VNode[] = [];
  const ancestors = new Set<Child[]>();

  function normalize(child: Child): void {
    if (Array.isArray(child)) {
      if (ancestors.has(child)) {
        throw new TypeError("Children chứa mảng có vòng lặp");
      }
      ancestors.add(child);
      child.forEach(normalize);
      ancestors.delete(child);
      return;
    }
    if (child == null || typeof child === "boolean") {
      return;
    }
    if (isVNode(child)) {
      normalizedChildren.push(child);
      return;
    }
    if (typeof child === "string" || typeof child === "number") {
      normalizedChildren.push(createTextElement(child));
      return;
    }
    throw new TypeError("Child không đúng contract");
  }
  children.forEach(normalize);
  return Object.freeze({
    type,
    props: Object.freeze({
      ...(props ?? {}),
      children: Object.freeze(normalizedChildren),
    }),
  });
}
export const h = createElement;