// Dữ liệu GIẢ LẬP cho HW3 — case study hư cấu phục vụ bài tập.
// Tên người chơi lấy theo đề bài; vi phạm, số liệu và tiền lệ đều do sinh viên tự đặt ra,
// KHÔNG phản ánh sự việc có thật.
const HOUR = 3600 * 1000;

// Hạn khiếu nại tính TƯƠNG ĐỐI theo thời điểm seed => lúc demo luôn còn hạn.
export function buildDossiers(now = new Date()) {
  const t = now.getTime();
  return [
    {
      _id: "himass",
      displayName: "Himass",
      team: "Team Sao Băng (hư cấu)",
      tournament: "Giải sinh viên UIT Esports Open (giả lập)",
      offense: {
        caseId: "FP-2026-0142",
        title: "Rời trận đấu xếp hạng (AFK) 2 lần trong một ngày",
        detectedBy: "Hệ thống tự động",
        severity: 2,
      },
      penalty: { banDays: 14, pointDeduction: 300 },
      issuedAt: new Date(t - 20 * HOUR),
      appealDeadline: new Date(t + 52 * HOUR), // cửa sổ 72 giờ
      evidence: [
        { label: "Log máy chủ trận #A17", note: "Mất kết nối 4 phút ở phút 12" },
        { label: "Log máy chủ trận #A21", note: "Mất kết nối 6 phút ở phút 3" },
      ],
      precedents: [
        { caseId: "FP-2025-0890", severity: 2, banDays: 3 },
        { caseId: "FP-2025-1021", severity: 2, banDays: 5 },
        { caseId: "FP-2026-0033", severity: 3, banDays: 7 },
        { caseId: "FP-2026-0101", severity: 1, banDays: 1 },
      ],
    },
    {
      _id: "tanvuu",
      displayName: "TanVuu",
      team: "Team Gió Lốc (hư cấu)",
      tournament: "Giải sinh viên UIT Esports Open (giả lập)",
      offense: {
        caseId: "FP-2026-0157",
        title: "Check-in trễ 12 phút ở vòng bảng",
        detectedBy: "Trọng tài trận đấu",
        severity: 1,
      },
      penalty: { banDays: 2, pointDeduction: 50 },
      issuedAt: new Date(t - 66 * HOUR),
      appealDeadline: new Date(t + 6 * HOUR), // gần hết hạn để demo đồng hồ SLA
      evidence: [{ label: "Biên bản trọng tài", note: "Check-in lúc 19:12, quy định 19:00" }],
      precedents: [
        { caseId: "FP-2025-0702", severity: 1, banDays: 1 },
        { caseId: "FP-2025-0955", severity: 1, banDays: 2 },
        { caseId: "FP-2026-0011", severity: 2, banDays: 3 },
      ],
    },
  ];
}
