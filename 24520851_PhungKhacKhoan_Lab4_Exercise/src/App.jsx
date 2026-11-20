import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import Skeleton from "./components/Skeleton.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Ex 1.1 — Code-splitting theo route:
// import() động khiến Vite tách About.jsx ra một chunk JS riêng,
// chỉ tải khi người dùng thật sự vào /about.
const About = lazy(() => import("./pages/About.jsx"));

// Ex 1.2 — Cú pháp khai báo React Router v7:
// - <Routes> thay cho <Switch> (thuật toán khớp theo độ cụ thể, không cần "exact").
// - element={<X />} thay cho component={X}.
// - Route lồng nhau: Layout là cha, các trang là con và hiện trong <Outlet />.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="about"
          element={
            // Suspense hiển thị fallback trong lúc chunk About đang tải.
            <Suspense fallback={<Skeleton lines={1} minHeight={120} />}>
              <About />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
