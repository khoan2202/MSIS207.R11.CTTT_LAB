const root = document.getElementById("app");
if (!root) {
  throw new Error("Không tìm thấy phần tử #app");
}
root.textContent = "Exercise Lab 2 đã chạy thành công.";
export {};