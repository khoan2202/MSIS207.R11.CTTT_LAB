import { Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

// Ex 1.2 — Cú pháp khai báo React Router v7:
// - <Routes> thay cho <Switch> (thuật toán khớp theo độ cụ thể, không cần "exact").
// - element={<X />} thay cho component={X}.
// - Route lồng nhau: Layout là cha, các trang là con và hiện trong <Outlet />.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
