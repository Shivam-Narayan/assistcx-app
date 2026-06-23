export const STRUCTURE_SCAN_ROW_LIMIT = 100;
export const MIN_STRUCTURED_CELLS = 2;

export interface PreviewColumnsResult {
  columns: string[];
  detectedRowNumber: number | null;
  warning: string | null;
}

export interface FileBounds {
  totalRows: number;
  totalColumns: number;
  source: "dimension" | "scan";
}

export interface XlsxScanResult {
  header: { cells: string[]; rowNumber: number | null };
  bounds: FileBounds;
}

interface MatchableColumn {
  name: string;
}

export function parseCsvRow(row: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const next = row[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function getCsvRows(text: string, limit: number): string[] {
  const normalized = text.replace(/^\uFEFF/, "");
  return normalized.split(/\r?\n/).slice(0, limit);
}

export function compactCells(cells: string[]): string[] {
  return cells.map((cell) => String(cell ?? "").trim()).filter(Boolean);
}

export function isStructuredRow(cells: string[]): boolean {
  return compactCells(cells).length >= MIN_STRUCTURED_CELLS;
}

export function getCsvBounds(text: string): FileBounds {
  const normalized = text.replace(/^\uFEFF/, "");
  const rows = normalized.split(/\r?\n/);

  let totalRows = 0;
  let totalColumns = 0;

  for (const row of rows) {
    if (row.trim() === "") continue;
    const populated = compactCells(parseCsvRow(row)).length;
    if (populated === 0) continue;
    totalRows++;
    if (populated > totalColumns) totalColumns = populated;
  }

  return { totalRows, totalColumns, source: "scan" };
}

export function getColumnIndex(cellRef: string): number {
  const letters = cellRef.match(/^[A-Z]+/i)?.[0]?.toUpperCase() ?? "";
  return (
    letters.split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) -
    1
  );
}

export function parseDimensionRef(
  ref: string | null | undefined,
): { totalRows: number; totalColumns: number } | null {
  if (!ref) return null;

  const parts = ref.split(":");
  const endCell = parts.length === 2 ? parts[1] : parts[0];
  const colLetters = endCell.match(/^[A-Z]+/i)?.[0]?.toUpperCase();
  const rowNum = endCell.match(/\d+$/)?.[0];

  if (!colLetters || !rowNum) return null;

  const totalColumns = colLetters
    .split("")
    .reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0);

  return { totalRows: Number(rowNum), totalColumns };
}

export function findTableStartRow(
  candidates: { cells: string[]; rowNumber: number }[],
  expectedColumnCount?: number,
): { cells: string[]; rowNumber: number } | null {
  if (candidates.length === 0) return null;

  if (expectedColumnCount && expectedColumnCount >= MIN_STRUCTURED_CELLS) {
    const fullWidthRow = candidates.find(
      (candidate) =>
        compactCells(candidate.cells).length >= expectedColumnCount,
    );
    if (fullWidthRow) return fullWidthRow;
  }

  let best = candidates[0];
  let bestScore = compactCells(best.cells).length;

  for (let i = 1; i < candidates.length; i++) {
    const score = compactCells(candidates[i].cells).length;
    if (score > bestScore) {
      best = candidates[i];
      bestScore = score;
    }
  }

  return best;
}

export const findBestHeaderRow = findTableStartRow;

export function buildPreviewColumns(
  cells: string[],
  hasHeader: boolean,
): string[] {
  if (hasHeader) return compactCells(cells);

  const lastNonEmpty = cells.reduce(
    (last, cell, idx) => (String(cell ?? "").trim() ? idx : last),
    -1,
  );
  return cells.slice(0, lastNonEmpty + 1).map((cell, idx) => {
    const value = String(cell ?? "").trim();
    return value || `Column ${idx + 1}`;
  });
}

export function getDetectionWarning(
  rowNumber: number | null,
  bounds?: FileBounds,
): string | null {
  const boundsInfo = bounds
    ? ` File contains ${bounds.totalRows.toLocaleString()} rows and ${bounds.totalColumns} columns.`
    : "";

  if (!rowNumber) {
    return `Column header detection failed. We scanned the first ${STRUCTURE_SCAN_ROW_LIMIT} rows but could not find a structured row with at least ${MIN_STRUCTURED_CELLS} populated cells. Remove title/notes above the data or upload a file with a clear header row.${boundsInfo}`;
  }

  if (rowNumber > 1) {
    return `Column header detected at row ${rowNumber}. Rows above it appear to be titles or notes and were ignored while preparing column mapping.${boundsInfo}`;
  }

  return null;
}

export function normalizeColumnName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function findBestMatchingColumn<TColumn extends MatchableColumn>(
  fileColumn: string,
  index: number,
  columns: TColumn[],
  hasHeader: boolean,
): TColumn | undefined {
  if (!hasHeader) return columns[index];

  const normalizedFileColumn = normalizeColumnName(fileColumn);
  if (!normalizedFileColumn) return undefined;

  return columns.find(
    (column) => normalizeColumnName(column.name) === normalizedFileColumn,
  );
}
