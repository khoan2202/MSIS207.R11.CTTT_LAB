import {
  isVNode,
  type Props,
  type VNode,
} from "./contracts.ts";

export const handlers = new WeakMap<Node, Props>();

export function applyProps(
  dom: HTMLElement,
  props: Props,
  previous: Props = {},
): void {
  for (const name of Object.keys(previous)) {
    if (
      name in props ||
      ["children", "nodeValue", "key"].includes(name) ||
      /^on/i.test(name)
    ) {
      continue;
    }

    const attribute =
      name === "className" ? "class" : name;

    dom.removeAttribute(attribute);

    if (name === "value") {
      (dom as HTMLInputElement).value = "";
    }

    if (name === "checked") {
      (dom as HTMLInputElement).checked = false;
    }

    if (name === "disabled") {
      (dom as HTMLButtonElement).disabled = false;
    }
  }

  for (const [name, value] of Object.entries(props)) {
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

      continue;
    }

    if (
      (name === "href" || name === "src") &&
      /^\s*(javascript|data):/i.test(String(value))
    ) {
      throw new TypeError("URL không an toàn");
    }

    if (name === "style") {
      dom.removeAttribute("style");

      if (value && typeof value === "object") {
        Object.assign(dom.style, value);
      }

      continue;
    }

    if (name === "value") {
      const input = dom as HTMLInputElement;
      const nextValue = String(value ?? "");

      if (input.value !== nextValue) {
        input.value = nextValue;
      }

      continue;
    }

    if (name === "checked") {
      (dom as HTMLInputElement).checked = Boolean(value);
      continue;
    }

    if (name === "disabled") {
      (dom as HTMLButtonElement).disabled = Boolean(value);
      continue;
    }

    const attribute =
      name === "className" ? "class" : name;

    if (value == null) {
      dom.removeAttribute(attribute);
      continue;
    }

    if (typeof value === "boolean") {
      if (name.startsWith("aria-")) {
        dom.setAttribute(attribute, String(value));
      } else if (value) {
        dom.setAttribute(attribute, "");
      } else {
        dom.removeAttribute(attribute);
      }

      continue;
    }

    dom.setAttribute(attribute, String(value));
  }

  handlers.set(dom, props);
}

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

  applyProps(dom, vnode.props);

  for (const child of vnode.props.children) {
    dom.appendChild(renderToDOM(child));
  }

  return dom;
}