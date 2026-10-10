import { mountExercise1 } from "./exercise/ex1.ts";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Không tìm thấy #app");
}

mountExercise1(root);