import { useState } from "react";
import { SimpleForm } from "../form/SimpleForm.jsx";
import { ShowData } from "../form/ShowData.jsx";
import LegacyForm from "../form/legacy/LegacyForm.jsx";
import CommitCounter from "../components/CommitCounter.jsx";

// Trang Sprint 2: form mới + inspector, và khối so sánh với form cũ (Ex 1.3).
export default function FormPage() {
  const [submitted, setSubmitted] = useState(null);

  return (
    <>
      <h2>Sprint 2 — Context Form Engine</h2>
      <div className="form-grid">
        <SimpleForm onValidSubmit={setSubmitted} />
        {submitted ? (
          <ShowData data={submitted} />
        ) : (
          <p className="card">Gửi form hợp lệ để xem dữ liệu trong <code>&lt;ShowData /&gt;</code>.</p>
        )}
      </div>

      <h2>So sánh số commit (Ex 1.3)</h2>
      <p>Gõ đúng 1 ký tự vào mỗi form rồi bấm "Xem số commit".</p>
      <div className="form-grid">
        <CommitCounter id="legacy"><LegacyForm /></CommitCounter>
        <CommitCounter id="modern"><SimpleForm title="Form mới (để đo commit)" /></CommitCounter>
      </div>
    </>
  );
}
