/*
 * Tiny dependency-free CSV reader/writer. Handles quoting, embedded commas,
 * newlines and doubled quotes — enough for spreadsheets exported from / imported
 * into Excel and Google Sheets. Not a full RFC-4180 parser, but robust for the
 * flat rows this tool produces and consumes.
 */

/** Quote a single field if it needs it. */
function quote(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Serialise rows (array of objects) to a CSV string with the given columns. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(quote).join(',');
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const v = row[col];
        return quote(v === undefined || v === null ? '' : String(v));
      })
      .join(','),
  );
  // Excel opens UTF-8 CSVs correctly when a BOM is present.
  return `﻿${[header, ...body].join('\r\n')}\r\n`;
}

/** Parse a CSV string into an array of row objects keyed by header. */
export function parseCsv(text: string): Record<string, string>[] {
  const clean = text.replace(/^﻿/, '');
  const records = splitRecords(clean);
  if (!records.length) return [];
  const header = records[0] as string[];
  return records.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    header.forEach((key, i) => {
      row[key] = (cells[i] ?? '').trim();
    });
    return row;
  });
}

/** Split raw CSV text into records of cells, honouring quotes. */
function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      // Handle CRLF as a single break.
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) records.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((c) => c !== '')) records.push(row);
  }
  return records;
}
