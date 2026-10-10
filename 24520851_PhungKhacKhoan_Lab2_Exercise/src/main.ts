import { h } from "./core/vnode.ts";
const root = document.getElementById("app");
if (!root) {
  throw new Error("Không tìm thấy #app");
}

const tree = h(
  "section",
  { id: "demo" },
  h("h1", null, "Mini React"),
  ["Giá trị: ", [0, null, false, " OK"]],
);
console.log("VNode:", tree);
console.assert(
  tree.props.children.length === 4,
  "Số children sau khi chuẩn hóa không đúng",
);
console.assert(
  tree.props.children[2].props.nodeValue === "0",
  "Giá trị 0 đã bị bỏ mất",
);
console.assert(
  tree.props.children.every(
    (child) => typeof child.type === "string",
  ),
  "Có child chưa được chuẩn hóa thành VNode",
);
root.textContent =
  "Đã tạo VNode. Mở F12 → Console để kiểm tra.";