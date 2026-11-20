import { Link } from "react-router";

export default function NotFound({ message = "Không tìm thấy trang bạn yêu cầu." }) {
  return (
    <section className="card" role="alert">
      <h2>404</h2>
      <p>{message}</p>
      <Link to="/">Về trang chủ</Link>
    </section>
  );
}
