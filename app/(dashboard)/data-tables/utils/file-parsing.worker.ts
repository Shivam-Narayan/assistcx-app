import {
  buildPreviewColumns,
  compactCells,
  findBestHeaderRow,
  findTableStartRow,
  getColumnIndex,
  getCsvBounds,
  getCsvRows,
  isStructuredRow,
  parseCsvRow,
  parseDimensionRef,
  STRUCTURE_SCAN_ROW_LIMIT,
  type FileBounds,
  type XlsxScanResult,
} from "./file-parsing-core";

interface ParseRequest {
  id: string;
  fileName: string;
  buffer: ArrayBuffer;
  hasHeader: boolean;
}

function normalizeSheetPath(target: string) {
  if (target.startsWith("/")) return target.slice(1);
  const cleaned = target.replace(/^\.\//, "");
  return cleaned.startsWith("xl/") ? cleaned : `xl/${cleaned}`;
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function getAttribute(tag: string, name: string) {
  const escapedName = name.replace(":", "\\:");
  const match = tag.match(new RegExp(`${escapedName}=["']([^"']*)["']`));
  return match?.[1] ?? null;
}

function getElements(xml: string, tagName: string) {
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*(?:/>|>[\\s\\S]*?</${tagName}>)`,
    "g",
  );
  return xml.match(pattern) ?? [];
}

function getFirstElement(xml: string, tagName: string) {
  return getElements(xml, tagName)[0] ?? null;
}

function getTextContent(xml: string, tagName: string) {
  const values: string[] = [];
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
    "g",
  );
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(xml)) !== null) {
    values.push(decodeXml(match[1]));
  }

  return values.join("");
}

function getXlsxBoundsFromWorksheetXml(worksheetXml: string): FileBounds {
  const dimensionTag = getFirstElement(worksheetXml, "dimension");
  const fromDimension = parseDimensionRef(
    dimensionTag ? getAttribute(dimensionTag, "ref") : null,
  );
  if (fromDimension) return { ...fromDimension, source: "dimension" };

  const rows = getElements(worksheetXml, "row");
  let maxRow = 0;
  let maxCol = 0;

  for (const row of rows) {
    const cells = getElements(row, "c");
    const hasValue = cells.some(
      (cell) =>
        getTextContent(cell, "v").trim() !== "" ||
        getTextContent(cell, "is").trim() !== "" ||
        getTextContent(cell, "t").trim() !== "",
    );
    if (!hasValue) continue;

    const rowNumber = Number(getAttribute(row, "r")) || 0;
    if (rowNumber > maxRow) maxRow = rowNumber;

    for (const cell of cells) {
      const ref = getAttribute(cell, "r") ?? "";
      if (!ref) continue;
      const colIdx = getColumnIndex(ref);
      if (colIdx + 1 > maxCol) maxCol = colIdx + 1;
    }
  }

  return { totalRows: maxRow, totalColumns: maxCol, source: "scan" };
}

async function scanXlsxBuffer(buffer: ArrayBuffer): Promise<XlsxScanResult> {
  const PizZipModule = await import("pizzip");
  const PizZip = (PizZipModule.default ?? PizZipModule) as any;
  const zip = new PizZip(buffer);

  const readXml = (path: string) => zip.file(path)?.asText() ?? "";
  const workbook = readXml("xl/workbook.xml");
  const relationships = readXml("xl/_rels/workbook.xml.rels");
  const firstSheet = getFirstElement(workbook, "sheet");
  const firstSheetRelId = firstSheet ? getAttribute(firstSheet, "r:id") : null;
  let firstSheetPath = "xl/worksheets/sheet1.xml";

  if (firstSheetRelId && relationships) {
    const relation = getElements(relationships, "Relationship").find(
      (node) => getAttribute(node, "Id") === firstSheetRelId,
    );
    const target = relation ? getAttribute(relation, "Target") : null;
    if (target) firstSheetPath = normalizeSheetPath(target);
  }

  const sharedStrings = readXml("xl/sharedStrings.xml");
  const sharedValues = sharedStrings
    ? getElements(sharedStrings, "si").map((node) => getTextContent(node, "t"))
    : [];

  const worksheet = readXml(firstSheetPath);
  if (!worksheet) {
    return {
      header: { cells: [], rowNumber: null },
      bounds: { totalRows: 0, totalColumns: 0, source: "scan" },
    };
  }

  const bounds = getXlsxBoundsFromWorksheetXml(worksheet);
  const rows = getElements(worksheet, "row").slice(0, STRUCTURE_SCAN_ROW_LIMIT);

  if (rows.length === 0) {
    return { header: { cells: [], rowNumber: null }, bounds };
  }

  const resolveCellValue = (cell: string) => {
    const type = getAttribute(cell, "t");
    const value = getTextContent(cell, "v");
    const inlineValue = getTextContent(cell, "t").trim();
    return type === "s"
      ? (sharedValues[Number(value)] ?? "")
      : inlineValue || value;
  };

  const buildRowCells = (row: string) => {
    const cells: string[] = [];
    getElements(row, "c").forEach((cell, fallbackIdx) => {
      const ref = getAttribute(cell, "r") ?? "";
      const index = ref ? getColumnIndex(ref) : fallbackIdx;
      cells[index] = resolveCellValue(cell);
    });
    return cells;
  };

  const candidates: { cells: string[]; rowNumber: number }[] = [];
  for (const [rowIndex, row] of rows.entries()) {
    const cells = buildRowCells(row);
    if (isStructuredRow(cells)) {
      const candidate = {
        cells,
        rowNumber: Number(getAttribute(row, "r")) || rowIndex + 1,
      };
      if (
        bounds.totalColumns > 0 &&
        compactCells(cells).length >= bounds.totalColumns
      ) {
        return { header: candidate, bounds };
      }
      candidates.push(candidate);
    }
  }

  return {
    header: findTableStartRow(candidates, bounds.totalColumns) ?? {
      cells: [],
      rowNumber: null,
    },
    bounds,
  };
}

self.onmessage = async (event: MessageEvent<ParseRequest>) => {
  const { id, fileName, buffer, hasHeader } = event.data;

  try {
    if (fileName.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer);
      const bounds = getCsvBounds(text);
      const rows = getCsvRows(text, STRUCTURE_SCAN_ROW_LIMIT);
      const candidates: { cells: string[]; rowNumber: number }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const cells = parseCsvRow(rows[i]);
        if (isStructuredRow(cells)) {
          candidates.push({ cells, rowNumber: i + 1 });
        }
      }

      const best = findBestHeaderRow(candidates);
      self.postMessage({
        id,
        columns: best ? buildPreviewColumns(best.cells, hasHeader) : [],
        detectedRowNumber: best?.rowNumber ?? null,
        bounds,
      });
      return;
    }

    if (fileName.endsWith(".xlsx")) {
      const { header, bounds } = await scanXlsxBuffer(buffer);
      self.postMessage({
        id,
        columns: buildPreviewColumns(header.cells, hasHeader),
        detectedRowNumber: header.rowNumber ?? null,
        bounds,
      });
      return;
    }

    self.postMessage({
      id,
      columns: [],
      detectedRowNumber: null,
      bounds: null,
    });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    });
  }
};
