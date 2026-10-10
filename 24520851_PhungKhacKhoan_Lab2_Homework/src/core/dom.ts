type Attributes = Record<string, unknown>;

export const handlers =
  new WeakMap<Node, Attributes>();

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: (Node | string | number)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  for (const [name, value] of Object.entries(attributes)) {
    if (["innerHTML", "outerHTML", "srcdoc"].includes(name)) {
      throw new TypeError(`Thuộc tính không an toàn: ${name}`);
    }

    if (/^on/i.test(name)) {
      if (typeof value !== "function") {
        throw new TypeError("Handler phải là hàm");
      }

      continue;
    }

    if (value == null) {
      continue;
    }

    const attribute =
      name === "className" ? "class" : name;

    if (typeof value === "boolean") {
      if (name.startsWith("aria-")) {
        node.setAttribute(attribute, String(value));
      } else if (value) {
        node.setAttribute(attribute, "");
      }

      continue;
    }

    node.setAttribute(attribute, String(value));
  }

  handlers.set(node, attributes);

  node.append(
    ...children.map((child) =>
      child instanceof Node
        ? child
        : document.createTextNode(String(child)),
    ),
  );

  return node;
}