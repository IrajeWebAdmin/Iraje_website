import { FiDownload } from "react-icons/fi";
import { exportHref } from "@/lib/reports/filters";
import DropdownMenu from "./DropdownMenu";

// One "Export" button that opens a menu: Excel or CSV of the current report
// with the current filters, every matching row, not just this page.
export default function ExportMenu({ report, filters, extra }) {
  return (
    <DropdownMenu
      label="Export"
      icon={<FiDownload className="h-4 w-4" aria-hidden="true" />}
      items={[
        {
          href: exportHref(report, filters, "xlsx", extra),
          label: "Excel workbook (.xlsx)",
          hint: "Opens in Excel with the heading row fixed",
        },
        {
          href: exportHref(report, filters, "csv", extra),
          label: "CSV file (.csv)",
          hint: "Plain text for any spreadsheet or tool",
        },
      ]}
      note="Includes every row that matches the current filters."
    />
  );
}
