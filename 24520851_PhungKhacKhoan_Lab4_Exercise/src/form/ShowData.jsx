// Sprint 2 contract — ShowData: "JSON inspector" bằng <dl> semantic
// thay cho <pre>{JSON.stringify(data)}</pre> (khó đọc với trình đọc màn hình).
// Mỗi cặp dt/dd được bọc trong <div> — HTML cho phép <div> làm con trực tiếp của <dl>.
export function ShowData({ data, title = "Dữ liệu đã gửi", maskKeys = ["password", "confirmPassword"] }) {
  return (
    <section className="card" aria-labelledby="show-data-title">
      <h3 id="show-data-title">{title}</h3>
      <dl className="json-inspector">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="data-row">
            <dt>{key}</dt>
            {/* Không in mật khẩu ra màn hình */}
            <dd>{maskKeys.includes(key) ? "••••••••" : String(val)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
