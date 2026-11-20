// Dữ liệu mẫu (giả lập) cho Master-Detail.
// id là chuỗi vì useParams() luôn trả về chuỗi — so sánh p.id === id không cần ép kiểu.
export const PEOPLE = [
  { id: "p01", name: "Nguyễn An", role: "Frontend Engineer", team: "Web Platform", email: "an.nguyen@example.com" },
  { id: "p02", name: "Trần Bình", role: "Backend Engineer", team: "API Core", email: "binh.tran@example.com" },
  { id: "p03", name: "Lê Chi", role: "QA Engineer", team: "Quality", email: "chi.le@example.com" },
  { id: "p04", name: "Phạm Dũng", role: "DevOps Engineer", team: "Infrastructure", email: "dung.pham@example.com" },
  { id: "p05", name: "Võ Em", role: "UX Designer", team: "Design System", email: "em.vo@example.com" },
];
