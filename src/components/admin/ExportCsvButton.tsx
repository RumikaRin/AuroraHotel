"use client";

interface ExportCsvButtonProps {
  totalBookings: number;
  totalRevenue: number;
  adr: number;
  totalAvailableRooms: number;
}

export function ExportCsvButton({
  totalBookings,
  totalRevenue,
  adr,
  totalAvailableRooms,
}: ExportCsvButtonProps) {
  const sanitizeCsvValue = (val: string | number) => {
    const str = String(val);
    if (/^[=+\-@]/.test(str)) {
      return `'${str}`;
    }
    return str;
  };

  const handleExport = () => {
    const rows = [
      ["Chỉ số Báo Cáo", "Giá Trị"],
      ["Tổng Số Đơn Đặt", sanitizeCsvValue(totalBookings)],
      ["Tổng Doanh Thu (VND)", sanitizeCsvValue(totalRevenue)],
      ["Giá Trung Bình Đêm (ADR - VND)", sanitizeCsvValue(adr)],
      ["Tổng Số Phòng Khách Sạn", sanitizeCsvValue(totalAvailableRooms)],
    ];

    const csvBody = rows.map((r) => r.join(",")).join("\n");
    // Prepend UTF-8 BOM \uFEFF for Excel Vietnamese support
    const blob = new Blob(["\uFEFF" + csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Aurora_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="px-4 py-2 rounded-xl bg-aurora-gold text-aurora-midnight text-xs font-bold hover:bg-aurora-gold/80 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Xuất Báo Cáo CSV (Excel)
    </button>
  );
}
