import {
  buildPreviewColumns,
  compactCells,
  findBestHeaderRow,
  findTableStartRow,
  getColumnIndex,
  getCsvBounds,
  getCsvRows,
  getDetectionWarning,
  isStructuredRow,
  parseCsvRow,
  parseDimensionRef,
  STRUCTURE_SCAN_ROW_LIMIT,
  type FileBounds,
  type PreviewColumnsResult,
  type XlsxScanResult,
} from "./file-parsing-core";

export * from "./file-parsing-core";

export function parseDimensionTag(
  worksheet: Document,
): { totalRows: number; totalColumns: number } | null {
  return parseDimensionRef(
    worksheet.getElementsByTagName("dimension")[0]?.getAttribute("ref"),
  );
}

export function getXlsxBoundsFromWorksheet(worksheet: Document): FileBounds {
  const fromDimension = parseDimensionTag(worksheet);
  if (fromDimension) {
    return { ...fromDimension, source: "dimension" };
  }

  const rows = Array.from(worksheet.getElementsByTagName("row"));
  let maxRow = 0;
  let maxCol = 0;

  for (const row of rows) {
    const cells = Array.from(row.getElementsByTagName("c"));
    const hasValue = cells.some(
      (cell) =>
        (cell.getElementsByTagName("v")[0]?.textContent ?? "").trim() !== "" ||
        (cell.getElementsByTagName("is")[0]?.textContent ?? "").trim() !== "",
    );
    if (!hasValue) continue;

    const rowNum = Number(row.getAttribute("r")) || 0;
    if (rowNum > maxRow) maxRow = rowNum;

    for (const cell of cells) {
      const ref = cell.getAttribute("r") ?? "";
      if (!ref) continue;
      const colIdx = getColumnIndex(ref);
      if (colIdx + 1 > maxCol) maxCol = colIdx + 1;
    }
  }

  return { totalRows: maxRow, totalColumns: maxCol, source: "scan" };
}

export async function scanXlsxFile(file: File): Promise<XlsxScanResult> {
  const PizZipModule = await import("pizzip");
  const PizZip = (PizZipModule.default ?? PizZipModule) as any;

  await waitForPaint();
  const buffer = await file.arrayBuffer();
  await waitForPaint();

  const zip = new PizZip(buffer);
  await waitForPaint();

  const parser = new DOMParser();

  const readXml = (path: string): Document | null => {
    const content = zip.file(path)?.asText();
    return content ? parser.parseFromString(content, "application/xml") : null;
  };

  const workbook = readXml("xl/workbook.xml");
  const relationships = readXml("xl/_rels/workbook.xml.rels");
  const firstSheet = workbook?.getElementsByTagName("sheet")[0];
  const firstSheetRelId = firstSheet?.getAttribute("r:id");
  let firstSheetPath = "xl/worksheets/sheet1.xml";

  if (firstSheetRelId && relationships) {
    const relation = Array.from(
      relationships.getElementsByTagName("Relationship"),
    ).find((node) => node.getAttribute("Id") === firstSheetRelId);
    const target = relation?.getAttribute("Target");
    if (target) {
      firstSheetPath = target.startsWith("/")
        ? target.slice(1)
        : `xl/${target.replace(/^\.?\//, "")}`;
    }
  }

  const sharedStrings = readXml("xl/sharedStrings.xml");
  await waitForPaint();

  const sharedValues = sharedStrings
    ? Array.from(sharedStrings.getElementsByTagName("si")).map((node) =>
        Array.from(node.getElementsByTagName("t"))
          .map((textNode) => textNode.textContent ?? "")
          .join(""),
      )
    : [];

  const worksheet = readXml(firstSheetPath);
  await waitForPaint();

  if (!worksheet) {
    return {
      header: { cells: [], rowNumber: null },
      bounds: { totalRows: 0, totalColumns: 0, source: "scan" },
    };
  }

  const bounds = getXlsxBoundsFromWorksheet(worksheet);
  await waitForPaint();

  const rows = Array.from(worksheet.getElementsByTagName("row")).slice(
    0,
    STRUCTURE_SCAN_ROW_LIMIT,
  );

  if (rows.length === 0) {
    return { header: { cells: [], rowNumber: null }, bounds };
  }

  const resolveCellValue = (cell: Element): string => {
    const type = cell.getAttribute("t");
    const value = cell.getElementsByTagName("v")[0]?.textContent ?? "";
    const inline =
      cell.getElementsByTagName("is")[0]?.textContent?.trim() ?? "";
    return type === "s" ? (sharedValues[Number(value)] ?? "") : inline || value;
  };

  const buildRowCells = (row: Element): string[] => {
    const cells: string[] = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell, fallbackIdx) => {
      const ref = cell.getAttribute("r") ?? "";
      const index = ref ? getColumnIndex(ref) : fallbackIdx;
      cells[index] = resolveCellValue(cell);
    });
    return cells;
  };

  const candidates: { cells: string[]; rowNumber: number }[] = [];
  for (const [index, row] of rows.entries()) {
    const cells = buildRowCells(row);
    if (isStructuredRow(cells)) {
      const candidate = {
        cells,
        rowNumber: Number(row.getAttribute("r")) || index + 1,
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

  await waitForPaint();
  return {
    header: findTableStartRow(candidates, bounds.totalColumns) ?? {
      cells: [],
      rowNumber: null,
    },
    bounds,
  };
}

export async function getPreviewColumns(
  file: File,
  hasHeader: boolean,
): Promise<PreviewColumnsResult & { bounds?: FileBounds }> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    const PREVIEW_BYTE_LIMIT = 256 * 1024;
    const text = await file.slice(0, PREVIEW_BYTE_LIMIT).text();
    await waitForPaint();

    const bounds = getCsvBounds(text);
    const rows = getCsvRows(text, STRUCTURE_SCAN_ROW_LIMIT);
    const candidates: { cells: string[]; rowNumber: number }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = parseCsvRow(rows[i]);
      if (isStructuredRow(cells)) {
        candidates.push({ cells, rowNumber: i + 1 });
      }
    }

    await waitForPaint();
    const structuredRow = findBestHeaderRow(candidates);

    return {
      columns: structuredRow
        ? buildPreviewColumns(structuredRow.cells, hasHeader)
        : [],
      detectedRowNumber: structuredRow?.rowNumber ?? null,
      warning: getDetectionWarning(structuredRow?.rowNumber ?? null, bounds),
      bounds,
    };
  }

  if (fileName.endsWith(".xlsx")) {
    const { header, bounds } = await scanXlsxFile(file);

    return {
      columns: buildPreviewColumns(header.cells, hasHeader),
      detectedRowNumber: header.rowNumber,
      warning: getDetectionWarning(header.rowNumber, bounds),
      bounds,
    };
  }

  return { columns: [], detectedRowNumber: null, warning: null };
}

export function waitForPaint(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

let workerInstance: Worker | null = null;
let workerIdCounter = 0;

function getParsingWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  if (workerInstance) return workerInstance;

  try {
    workerInstance = new Worker(
      new URL("./file-parsing.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerInstance.onerror = () => {
      workerInstance?.terminate();
      workerInstance = null;
    };
    return workerInstance;
  } catch {
    return null;
  }
}

export async function getPreviewColumnsAsync(
  file: File,
  hasHeader: boolean,
): Promise<PreviewColumnsResult & { bounds?: FileBounds }> {
  const worker = getParsingWorker();

  if (!worker) {
    return getPreviewColumns(file, hasHeader);
  }

  const fileName = file.name.toLowerCase();
  const PREVIEW_BYTE_LIMIT = 512 * 1024;
  const slice = fileName.endsWith(".csv")
    ? file.slice(0, PREVIEW_BYTE_LIMIT)
    : file;
  const buffer = await slice.arrayBuffer();
  const id = `parse_${++workerIdCounter}_${Date.now()}`;

  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.id !== id) return;
      worker.removeEventListener("message", handler);
      worker.removeEventListener("error", errorHandler);

      if (event.data.error) {
        resolve({
          columns: [],
          detectedRowNumber: null,
          warning: event.data.error,
        });
        return;
      }

      const rowNumber = event.data.detectedRowNumber ?? null;
      const bounds: FileBounds | undefined = event.data.bounds ?? undefined;

      resolve({
        columns: event.data.columns ?? [],
        detectedRowNumber: rowNumber,
        warning: getDetectionWarning(rowNumber, bounds),
        bounds,
      });
    };

    const errorHandler = () => {
      worker.removeEventListener("message", handler);
      worker.removeEventListener("error", errorHandler);
      workerInstance?.terminate();
      workerInstance = null;
      resolve({
        columns: [],
        detectedRowNumber: null,
        warning: "File parsing failed in the background worker.",
      });
    };

    worker.addEventListener("message", handler);
    worker.addEventListener("error", errorHandler);
    worker.postMessage(
      { id, fileName: file.name.toLowerCase(), buffer, hasHeader },
      [buffer],
    );
  });
}
