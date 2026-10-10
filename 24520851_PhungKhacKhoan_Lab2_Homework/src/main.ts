const root = document.getElementById("app");

if (!root) {
  throw new Error("Không tìm thấy #app");
}

root.textContent = "Project Homework Lab 2 đã chạy.";

export {};