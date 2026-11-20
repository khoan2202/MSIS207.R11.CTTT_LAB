import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw new Error("Không tìm thấy phần tử #root.");

createRoot(root).render(
  <StrictMode>
    <p>Lab 4 Exercise — đang khởi tạo.</p>
  </StrictMode>,
);
