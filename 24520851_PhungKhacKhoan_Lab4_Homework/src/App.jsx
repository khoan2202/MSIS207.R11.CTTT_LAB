import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Skeleton from "./components/Skeleton.jsx";

// Mỗi homework là một chunk riêng (code-splitting theo route).
const GalleryPage = lazy(() => import("./gallery/GalleryPage.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<Skeleton lines={6} minHeight={600} />}>
              <GalleryPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
