import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import Skeleton from "./components/Skeleton.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import PeopleLayout from "./people/PeopleLayout.jsx";
import PeopleIndex from "./people/PeopleIndex.jsx";
import { PEOPLE } from "./data/people.js";

// Ex 1.1 — Code-splitting theo route:
// import() động khiến Vite tách About.jsx ra một chunk JS riêng,
// chỉ tải khi người dùng thật sự vào /about.
const About = lazy(() => import("./pages/About.jsx"));
const PersonDetail = lazy(() => import("./people/PersonDetail.jsx"));

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
        {/* Ex 1.2.2 — Route lồng 2 cấp: /people (layout) -> index | :id */}
        <Route path="people" element={<PeopleLayout people={PEOPLE} />}>
          <Route index element={<PeopleIndex />} />
          {/* :id là tham số động, đọc bằng useParams() trong PersonDetail */}
          <Route
            path=":id"
            element={
              // Skeleton cao 190px ≈ chiều cao thẻ hồ sơ thật => không nhảy layout
              <Suspense fallback={<Skeleton lines={4} minHeight={190} />}>
                <PersonDetail people={PEOPLE} />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
