import {
  isVNode,
  type Props,
  type VNode,
} from "./contracts.ts";

export const handlers = new WeakMap<Node, Props>();

export function renderToDOM(vnode: VNode): Node {
  if (!isVNode(vnode)) {
    throw new TypeError("VNode không hợp lệ");
  }

  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(
      String(vnode.props.nodeValue ?? ""),
    );
  }

  const dom = document.createElement(vnode.type);

  for (const [name, value] of Object.entries(vnode.props)) {
    if (["children", "nodeValue", "key"].includes(name)) {
      continue;
    }

    if (["innerHTML", "outerHTML", "srcdoc"].includes(name)) {
      throw new TypeError(`Prop không an toàn: ${name}`);
    }

    if (/^on/i.test(name)) {
      if (typeof value !== "function") {
        throw new TypeError("Event handler phải là hàm");
      }

      // Callback sẽ được xử lý bằng delegation tại root.
      continue;
    }

    if (
      (name === "href" || name === "src") &&
      /^\s*(javascript|data):/i.test(String(value))
    ) {
      throw new TypeError("URL không an toàn");
    }

    if (name === "style") {
      if (value && typeof value === "object") {
        Object.assign(dom.style, value);
      }

      continue;
    }

    if (value == null) {
      continue;
    }

    if (
      typeof value === "boolean" &&
      !name.startsWith("aria-")
    ) {
      if (value) {
        dom.setAttribute(name, "");
      }

      continue;
    }

    const attribute =
      name === "className" ? "class" : name;

    dom.setAttribute(attribute, String(value));
  }

  handlers.set(dom, vnode.props);

  for (const child of vnode.props.children) {
    dom.appendChild(renderToDOM(child));
  }

  return dom;
}