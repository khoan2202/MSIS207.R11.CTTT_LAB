import { Link } from "react-router";

export default function NotFound({ message = "Không tìm thấy trang bạn yêu cầu." }) {
  return (
    <section className="card" role="alert">
      <h1>404</h1>
      <p>{message}</p>
      <Link to="/">Về trang chủ</Link>
    </section>
  );
}
