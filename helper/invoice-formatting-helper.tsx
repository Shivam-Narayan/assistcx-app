interface MetaFieldObject {
  original_text: string;
  confidence_score: number;
  geometry: number[][];
  page_idx: number | null;
}

interface LineItem {
  [key: string]: any;
}

interface StructuredDocument {
  [key: string]: any;
  meta__fields?: Record<string, MetaFieldObject>;
  line_items?: (LineItem | string)[];
}

type StructuredData = StructuredDocument | StructuredDocument[];

interface FormattedField {
  data_field: string;
  data_value: string | string[] | LineItem;
  original_text: string;
  confidence_score: number;
  geometry: number[][];
  page_idx: number | null;
}

interface ProcessedInvoiceData {
  document_type: string;
  doctype_description: string;
  [key: string]: FormattedField | FormattedField[] | string;
}

/**
 * Main entry point - processes structured data (single document or array of documents)
 * Returns the same type as input (single document or array)
 */
function extractFieldsFromStructuredData(
  structuredData: StructuredData
): ProcessedInvoiceData | ProcessedInvoiceData[] {
  if (!structuredData) {
    throw new Error("Invalid structured_data provided");
  }

  if (Array.isArray(structuredData)) {
    if (structuredData.length === 0) {
      throw new Error("structured_data array is empty");
    }

    // console.log(`Processing array of ${structuredData.length} documents...`);

    return structuredData.map((document, index) => {
      // console.log(
      //   `Processing document ${index + 1}/${structuredData.length}...`
      // );
      return processSingleDocument(document, index);
    });
  } else {
    // console.log("Processing single document...");
    return processSingleDocument(structuredData, 0);
  }
}

/**
 * Processes a single document and extracts all fields from meta__fields
 * Validates document structure and calls field processing functions
 */
function processSingleDocument(
  targetDocument: StructuredDocument,
  documentIndex: number
): ProcessedInvoiceData {
  if (!targetDocument || typeof targetDocument !== "object") {
    throw new Error(`Invalid document structure at index ${documentIndex}`);
  }

  if (
    !targetDocument.meta__fields ||
    typeof targetDocument.meta__fields !== "object"
  ) {
    return targetDocument as ProcessedInvoiceData;
  }

  // console.log(`Starting field extraction for document ${documentIndex}...`);

  const result: ProcessedInvoiceData = {
    document_type: targetDocument.document_type || "S_PVI",
    doctype_description:
      targetDocument.doctype_description || "Stamped Plant Vendor Invoice",
  };

  const processedFields = processAllMetaFields(
    targetDocument.meta__fields,
    targetDocument
  );

  Object.keys(processedFields).forEach((fieldKey) => {
    result[fieldKey] = processedFields[fieldKey];
  });

  const requiredEmptyFields = [
    "federal_tax_amount",
    "provincial_tax_amount",
    "total_tax_amount",
  ];
  requiredEmptyFields.forEach((field) => {
    if (!result[field]) {
      result[field] = "";
    }
  });

  // console.log(`Field extraction completed for document ${documentIndex}`);
  // console.log(`Processed ${Object.keys(processedFields).length} fields`);

  return result;
}

/**
 * Processes all meta fields by separating regular fields from line item fields
 * Regular fields are processed individually, line items are processed collectively
 */
function processAllMetaFields(
  metaFields: Record<string, MetaFieldObject>,
  structuredDocument: StructuredDocument
): Record<string, FormattedField | FormattedField[]> {
  const processedFields: Record<string, FormattedField | FormattedField[]> = {};

  const lineItemFields: { [key: string]: MetaFieldObject } = {};
  const regularFields: { [key: string]: MetaFieldObject } = {};

  // Separate line item fields from regular fields
  Object.keys(metaFields).forEach((metaFieldKey) => {
    if (isLineItemField(metaFieldKey)) {
      lineItemFields[metaFieldKey] = metaFields[metaFieldKey];
    } else {
      regularFields[metaFieldKey] = metaFields[metaFieldKey];
    }
  });

  // Process regular fields individually
  Object.keys(regularFields).forEach((metaFieldKey) => {
    try {
      const metaFieldData = regularFields[metaFieldKey];
      const formattedField = processMetaField(
        metaFieldKey,
        metaFieldData,
        structuredDocument
      );

      if (formattedField) {
        processedFields[metaFieldKey] = formattedField;
        // console.log(` Processed field: ${metaFieldKey}`);
      }
    } catch (error) {
      console.error(`Error processing meta field ${metaFieldKey}:`, error);
    }
  });

  // Process line items collectively as a single array
  if (
    structuredDocument.line_items &&
    Array.isArray(structuredDocument.line_items) &&
    structuredDocument.line_items.length > 0
  ) {
    const lineItemsArray = processLineItemsCollectively(
      lineItemFields,
      structuredDocument
    );
    if (lineItemsArray && lineItemsArray.length > 0) {
      processedFields["line_items"] = lineItemsArray;
      // console.log(
      //   ` Processed line_items array with ${lineItemsArray.length} items`
      // );
    }
  }

  return processedFields;
}

/**
 * Checks if a meta field key represents a line item field
 * Only supports line_items[index].field_key format
 */
function isLineItemField(metaFieldKey: string): boolean {
  return /^line_items\[\d+\]\./.test(metaFieldKey);
}

/**
 * Processes individual meta field (non-line item fields)
 * Handles both single values and array values
 */
function processMetaField(
  metaFieldKey: string,
  metaFieldData: MetaFieldObject,
  structuredDocument: StructuredDocument
): FormattedField | FormattedField[] | null {
  if (isLineItemField(metaFieldKey)) {
    return null;
  }

  const structuredValue = structuredDocument[metaFieldKey];

  if (structuredValue === undefined) {
    console.warn(
      `No matching value found in structured_document for key: ${metaFieldKey}`
    );
    return null;
  }

  // Handle array values (like gr_number, sap_gr_number)
  if (Array.isArray(structuredValue)) {
    return structuredValue.map((value) => ({
      data_field: metaFieldKey,
      data_value: String(value),
      original_text: metaFieldData.original_text,
      confidence_score: metaFieldData.confidence_score,
      geometry: metaFieldData.geometry,
      page_idx: metaFieldData.page_idx,
    }));
  }

  // Handle single values
  return {
    data_field: metaFieldKey,
    data_value: String(structuredValue),
    original_text: metaFieldData.original_text,
    confidence_score: metaFieldData.confidence_score,
    geometry: metaFieldData.geometry,
    page_idx: metaFieldData.page_idx,
  };
}

/**
 * Processes all line item fields collectively to create a single line_items array
 * Parses line items from JSON strings or objects and creates formatted fields
 */
function processLineItemsCollectively(
  lineItemFields: Record<string, MetaFieldObject>,
  structuredDocument: StructuredDocument
): FormattedField[] | null {
  const lineItems = structuredDocument.line_items;

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    console.warn("line_items not found or empty in structured_document");
    return null;
  }

  const parsedLineItems: LineItem[] = [];

  // Parse each line item from string or object format
  for (let i = 0; i < lineItems.length; i++) {
    const lineItemRaw = lineItems[i];

    if (typeof lineItemRaw === "string") {
      const parsedItem = parseLineItemString(lineItemRaw);
      if (parsedItem) {
        parsedLineItems.push(parsedItem);
      } else {
        console.warn(`Failed to parse line item at index ${i}: ${lineItemRaw}`);
      }
    } else if (typeof lineItemRaw === "object" && lineItemRaw !== null) {
      parsedLineItems.push(lineItemRaw);
    } else {
      console.warn(`Invalid line item at index ${i}`);
    }
  }

  if (parsedLineItems.length === 0) {
    return null;
  }

  // Create formatted field objects for each parsed line item
  const formattedLineItems: FormattedField[] = parsedLineItems.map(
    (lineItem, index) => {
      // Transform each field in the line item to include geometry data
      const enrichedLineItem: LineItem = {};

      // Get default metadata from the first available meta field for this line item
      const firstLineItemField = Object.keys(lineItemFields).find((key) =>
        key.startsWith(`line_items[${index}].`)
      );
      const defaultMetaData = firstLineItemField
        ? lineItemFields[firstLineItemField]
        : lineItemFields[Object.keys(lineItemFields)[0]];

      Object.keys(lineItem).forEach((fieldKey) => {
        const metaFieldKey = `line_items[${index}].${fieldKey}`;
        const metaFieldData = lineItemFields[metaFieldKey];

        if (metaFieldData) {
          // Create object with value and geometry from specific meta field
          enrichedLineItem[fieldKey] = {
            value: lineItem[fieldKey],
            original_text: metaFieldData.original_text,
            confidence_score: metaFieldData.confidence_score,
            geometry: metaFieldData.geometry,
            page_idx: metaFieldData.page_idx,
          };
        } else {
          // If no geometry data found, use default metadata structure
          enrichedLineItem[fieldKey] = {
            value: lineItem[fieldKey],
            original_text: defaultMetaData?.original_text || "",
            confidence_score: defaultMetaData?.confidence_score ?? null,
            geometry: defaultMetaData?.geometry || [],
            page_idx: defaultMetaData?.page_idx || null,
          };
        }
      });

      return {
        data_field: "line_items",
        data_value: enrichedLineItem,
        original_text: defaultMetaData?.original_text || "",
        confidence_score: defaultMetaData?.confidence_score ?? null,
        geometry: defaultMetaData?.geometry || [],
        page_idx: defaultMetaData?.page_idx || null,
      };
    }
  );

  return formattedLineItems;
}

/**
 * Parses line item from JSON string format
 * Falls back to CSV parsing if JSON parsing fails
 */
function parseLineItemString(lineItemString: string): LineItem | null {
  try {
    const parsed = JSON.parse(lineItemString);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch (error) {
    console.warn(`Failed to parse line item as JSON: ${lineItemString}`);
  }

  return parseLineItemCSV(lineItemString);
}

/**
 * Parses line item from comma-separated values format
 * Maps to standard fields: description, quantity, unit_price, amount, currency
 */
function parseLineItemCSV(lineItemString: string): LineItem | null {
  try {
    const parts = lineItemString.split(",").map((part) => part.trim());

    if (parts.length < 4) {
      return null;
    }

    return {
      item_description: parts[0] || "",
      quantity: parts[1] || "",
      unit_price: parts[2] || "",
      amount: parts[3] || "",
      currency: parts[4] || "USD",
    };
  } catch (error) {
    console.warn(`Failed to parse line item as CSV: ${lineItemString}`);
    return null;
  }
}

/**
 * Legacy function for backward compatibility
 * Always returns an array of processed documents
 */
function extractFieldsFromAllDocuments(
  structuredData: StructuredData
): ProcessedInvoiceData[] {
  const result = extractFieldsFromStructuredData(structuredData);

  if (Array.isArray(result)) {
    return result;
  } else {
    return [result];
  }
}

/**
 * Utility function to analyze processed results
 * Returns summary of field types and counts
 */
function getProcessingSummary(result: ProcessedInvoiceData): {
  totalFields: number;
  arrayFields: string[];
  singleFields: string[];
  emptyFields: string[];
  lineItemFields: string[];
} {
  const totalFields = Object.keys(result).length - 2;
  const arrayFields: string[] = [];
  const singleFields: string[] = [];
  const emptyFields: string[] = [];
  const lineItemFields: string[] = [];

  Object.keys(result).forEach((key) => {
    if (key === "document_type" || key === "doctype_description") return;

    if (isLineItemField(key)) {
      lineItemFields.push(key);
    } else {
      const value = result[key];
      if (Array.isArray(value)) {
        arrayFields.push(key);
      } else if (value === "") {
        emptyFields.push(key);
      } else {
        singleFields.push(key);
      }
    }
  });

  return {
    totalFields,
    arrayFields,
    singleFields,
    emptyFields,
    lineItemFields,
  };
}

export {
  extractFieldsFromStructuredData,
  extractFieldsFromAllDocuments,
  getProcessingSummary,
};
