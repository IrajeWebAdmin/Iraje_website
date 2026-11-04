// CSV and Excel writers for the report downloads. The columns are the same
// [{ key, header, kind?, width? }] list the table uses, so a file reads like
// the screen. Dates come out in Indian time through the shared formatter.
import ExcelJS from "exceljs";
import { formatDate } from "../formatDate.js";

/** A download stops here and asks for a narrower period. */
export const EXPORT_ROW_CAP = 50000;

const BOM = "﻿";
const ISO_RE = /^\d{4}-\d{2}-\d{2}T/;
// Excel runs a cell that starts with one of these as a formula.
const FORMULA_RE = /^[=+\-@\t\r]/;

/** The text shown for a value: dates in IST, lists joined, empties blank. */
export function cellText(value, column = {}) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date)
    return formatDate(value, { withTime: column.kind !== "date" });
  if (column.kind === "date" || column.kind === "datetime")
    return formatDate(value, { withTime: column.kind !== "date" });
  if (typeof value === "string" && ISO_RE.test(value))
    return formatDate(value, { withTime: true });
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map((v) => cellText(v)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function csvField(value, column) {
  let text = cellText(value, column);
  // Only text typed by people can carry a formula; numbers keep their sign.
  if (typeof value !== "number" && FORMULA_RE.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text) || text !== text.trim())
    return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/**
 * RFC 4180 CSV: CRLF line ends, fields quoted when they need it, quotes
 * doubled, a UTF-8 BOM so Excel reads accented names, and a leading
 * apostrophe on anything Excel would otherwise run as a formula.
 */
export function toCsv(columns, rows) {
  const lines = [columns.map((c) => csvField(c.header, {})).join(",")];
  for (const row of rows)
    lines.push(columns.map((c) => csvField(row[c.key], c)).join(","));
  return `${BOM}${lines.join("\r\n")}\r\n`;
}

function xlsxCell(value, column) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  // Strings are stored as text in the sheet, so no formula guard is needed.
  return cellText(value, column);
}

const sheetSafe = (name) =>
  String(name || "Report")
    .replace(/[\[\]:*?/\\]/g, " ")
    .trim()
    .slice(0, 31) || "Report";

const defaultWidth = (column) =>
  Math.max(12, Math.min(50, String(column.header ?? "").length + 4));

/** An .xlsx workbook with one sheet: bold frozen header, sized columns. */
export async function toXlsx(columns, rows, { sheetName = "Report" } = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Iraje";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetSafe(sheetName));
  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? defaultWidth(c),
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (const row of rows)
    sheet.addRow(columns.map((c) => xlsxCell(row[c.key], c)));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
