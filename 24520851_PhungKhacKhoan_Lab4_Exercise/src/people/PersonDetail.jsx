import { useParams } from "react-router";
import NotFound from "../pages/NotFound.jsx";

// Sprint 1 contract — PersonDetail.
// 1) useParams() đọc :id từ URL /people/:id (luôn là string hoặc undefined).
// 2) people.find() tìm bản ghi; không thấy => trả về 404 thay vì crash
//    (truy cập person.name khi person là undefined sẽ ném TypeError).
// 3) <dl>/<dt>/<dd> là cấu trúc semantic cho cặp "thuộc tính — giá trị".
export default function PersonDetail({ people }) {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return <NotFound message={`404: Không tìm thấy nhân sự có mã "${id}".`} />;
  }

  return (
    <article className="card" aria-labelledby="person-title">
      <h2 id="person-title">{person.name}</h2>
      <dl className="person-details">
        <dt>Mã</dt><dd>{person.id}</dd>
        <dt>Vai trò</dt><dd>{person.role}</dd>
        <dt>Nhóm</dt><dd>{person.team}</dd>
        <dt>Email</dt><dd><a href={`mailto:${person.email}`}>{person.email}</a></dd>
      </dl>
    </article>
  );
}
