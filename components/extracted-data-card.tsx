import React, { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { getCardHeaderTitle } from "@/helper/helper-function";

interface Geometry {
  [0]: number;
  [1]: number;
}

interface DocumentField {
  data_field: string;
  data_value: string;
  original_text: string;
  geometry: Geometry[][];
  page_idx: number | null;
}

interface FieldWithGeometry {
  value: any;
  original_text?: string;
  confidence_score?: number;
  geometry?: Geometry[][];
  page_idx?: number | null;
}

interface NestedCardProps {
  title: string;
  data: any;
  onHover: (field: DocumentField | null) => void;
  level?: number;
  isParentRecord?: boolean;
  recordIndex?: number;
  expandedRecordIndex?: number | null;
  onRecordToggle?: (index: number | null) => void;
}

const getColorClass = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const ConfidenceBadge: React.FC<{ score: number }> = React.memo(({ score }) => (
  <span
    className={`text-xs px-2 py-1 rounded font-medium ${getColorClass(score)}`}
  >
    {score}%
  </span>
));
ConfidenceBadge.displayName = "ConfidenceBadge";

const NAText: React.FC = () => (
  <span className="text-muted-foreground">N/A</span>
);

const renderValueOrNA = (value: any) => (value ? String(value) : <NAText />);

const FieldCard: React.FC<{
  fieldKey: string;
  fieldData: FieldWithGeometry;
  onHover: (field: DocumentField | null) => void;
}> = React.memo(({ fieldKey, fieldData, onHover }) => {
  const hoverTarget = useMemo<DocumentField>(
    () => ({
      data_field: fieldKey,
      data_value: String(fieldData.value),
      original_text: fieldData.original_text || String(fieldData.value),
      geometry: (fieldData.geometry || []) as Geometry[][],
      page_idx: fieldData.page_idx ?? null,
    }),
    [fieldKey, fieldData]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onHover(hoverTarget);
    },
    [onHover, hoverTarget]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onHover(null);
    },
    [onHover]
  );

  return (
    <Card
      className="shadow-none p-0 gap-0 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="px-4 !py-2 flex flex-row items-center justify-between border-b rounded-t-xl">
        <p className="text-base font-medium text-muted-foreground">
          {getCardHeaderTitle(fieldKey)}
        </p>
        {fieldData.confidence_score != null && (
          <ConfidenceBadge score={fieldData.confidence_score} />
        )}
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-sm">{renderValueOrNA(fieldData.value)}</div>
      </CardContent>
    </Card>
  );
});
FieldCard.displayName = "FieldCard";

const hasGeometry = (val: any): val is FieldWithGeometry => {
  return (
    typeof val === "object" &&
    val !== null &&
    "value" in val &&
    "geometry" in val
  );
};

const ObjectAccordion: React.FC<{
  objectData: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onHover: (field: DocumentField | null) => void;
  label?: string;
}> = React.memo(
  ({ objectData, index, isExpanded, onToggle, onHover, label = "Item" }) => {
    const entries = useMemo(
      () =>
        typeof objectData === "object" && objectData !== null
          ? Object.entries(objectData)
          : [],
      [objectData]
    );

    return (
      <div className="border rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {label} {index + 1}
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="p-3 flex flex-col gap-2">
            {entries.map(([key, val]) =>
              hasGeometry(val) ? (
                <FieldCard
                  key={key}
                  fieldKey={key}
                  fieldData={val}
                  onHover={onHover}
                />
              ) : (
                <Card key={key} className="shadow-none p-0 gap-0">
                  <CardHeader className="px-4 !py-2 flex flex-row items-center justify-between border-b rounded-t-xl">
                    <p className="text-base font-medium text-muted-foreground">
                      {getCardHeaderTitle(key)}
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <div className="text-sm">{renderValueOrNA(val)}</div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);
ObjectAccordion.displayName = "ObjectAccordion";

const ArrayValue: React.FC<{
  value: any[];
  onHover: (field: DocumentField | null) => void;
}> = React.memo(({ value, onHover }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const arrayMetadata = useMemo(() => {
    const hasObjectItems = value.some(
      (item) =>
        typeof item === "object" &&
        item.data_field &&
        typeof item.data_value === "object"
    );

    const firstItem = value[0];
    const arrayLabel =
      hasObjectItems && firstItem?.data_field
        ? getCardHeaderTitle(firstItem.data_field)
        : "Item";

    const isGrOrSapGrArray = value.every(
      (item) =>
        typeof item === "object" &&
        ["gr", "sap_gr", "gr_number", "sap_gr_number"].includes(item.data_field)
    );

    return { hasObjectItems, arrayLabel, isGrOrSapGrArray };
  }, [value]);

  const toggleItem = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  }, []);

  const hoverTarget = useMemo<DocumentField | null>(() => {
    if (!arrayMetadata.isGrOrSapGrArray || !value[0]) return null;

    const firstItem = value[0];
    const dataField =
      firstItem.data_field === "gr"
        ? "gr_number"
        : firstItem.data_field === "sap_gr"
        ? "sap_gr_number"
        : firstItem.data_field;

    return {
      data_field: dataField,
      data_value: value.map((v) => v.data_value).join(", "),
      original_text:
        firstItem.original_text || value.map((v) => v.data_value).join(", "),
      geometry: firstItem.geometry || [],
      page_idx: firstItem.page_idx ?? null,
    };
  }, [arrayMetadata.isGrOrSapGrArray, value]);

  const handleMouseEnter = useCallback(
    () => hoverTarget && onHover(hoverTarget),
    [hoverTarget, onHover]
  );
  const handleMouseLeave = useCallback(
    () => hoverTarget && onHover(null),
    [hoverTarget, onHover]
  );

  if (arrayMetadata.hasObjectItems) {
    return (
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <ObjectAccordion
            key={index}
            objectData={item.data_value}
            index={index}
            isExpanded={expandedItems.has(index)}
            onToggle={() => toggleItem(index)}
            onHover={onHover}
            label={arrayMetadata.arrayLabel}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-row flex-wrap gap-x-4 text-sm text-muted-foreground"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {value.map((item, index) => {
        const displayValue =
          typeof item === "object" && item.data_field
            ? item.data_value
            : typeof item === "object"
            ? Object.values(item)[0] || item
            : item;

        return (
          <div
            key={index}
            className={`whitespace-nowrap ${
              arrayMetadata.isGrOrSapGrArray
                ? "bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium"
                : ""
            }`}
          >
            {String(displayValue)}
          </div>
        );
      })}
    </div>
  );
});
ArrayValue.displayName = "ArrayValue";

const ObjectValue: React.FC<{
  value: any;
  onHover: (field: DocumentField | null) => void;
}> = React.memo(({ value, onHover }) => {
  const entries = useMemo(() => Object.entries(value), [value]);
  const lastIndex = entries.length - 1;

  return (
    <div className="flex flex-col pt-1 pb-1 text-sm">
      {entries.map(([entryKey, entryValue], entryIndex) => {
        if (hasGeometry(entryValue)) {
          const hoverTarget: DocumentField = {
            data_field: entryKey,
            data_value: String(entryValue.value),
            original_text: entryValue.original_text || String(entryValue.value),
            geometry: (entryValue.geometry || []) as Geometry[][],
            page_idx: entryValue.page_idx ?? null,
          };

          return (
            <div key={entryKey}>
              <div
                className="flex sm:flex-row flex-col sm:items-center cursor-pointer hover:bg-blue-50 rounded px-2"
                onMouseEnter={() => onHover(hoverTarget)}
                onMouseLeave={() => onHover(null)}
              >
                <span className="sm:w-1/2 text-base font-medium text-muted-foreground">
                  {getCardHeaderTitle(entryKey)}
                </span>
                <span className="sm:w-1/2 text-sm break-word">
                  {renderValueOrNA(entryValue.value)}
                </span>
              </div>
              {entryIndex !== lastIndex && (
                <div className="border-t border-border"></div>
              )}
            </div>
          );
        }

        return (
          <div
            key={entryKey}
            className="flex sm:flex-row flex-col gap-2 px-2 mx-1"
          >
            <span className="sm:w-1/2 font-medium">
              {getCardHeaderTitle(entryKey)}:
            </span>
            <span className="sm:w-1/2 text-muted-foreground break-words">
              {entryValue ? String(entryValue) : "N/A"}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ObjectValue.displayName = "ObjectValue";

const ExtractedDataCard: React.FC<NestedCardProps> = ({
  title,
  data,
  onHover,
  level = 0,
  isParentRecord = false,
  recordIndex,
  expandedRecordIndex,
  onRecordToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Derived values
  const effectiveIsExpanded = isParentRecord
    ? expandedRecordIndex === recordIndex
    : isExpanded;
  const isNestedData =
    Array.isArray(data) || (typeof data === "object" && !data?.data_field);
  const isFieldCard = !isNestedData;
  const isRecordTitle = title.toLowerCase().startsWith("record");
  const confidenceScore = data?.confidence_score ?? null;

  // Event handlers
  const handleCardHover = useCallback(
    (hover: boolean, e?: React.MouseEvent) => {
      if (!isFieldCard) return;
      e?.stopPropagation();
      setIsHovered(hover);
      if (data?.data_field) onHover(hover ? data : null);
    },
    [isFieldCard, data, onHover]
  );

  const handleToggle = useCallback(() => {
    if (isParentRecord && onRecordToggle && recordIndex !== undefined) {
      onRecordToggle(effectiveIsExpanded ? null : recordIndex);
    } else if (isNestedData) {
      setIsExpanded((prev) => !prev);
    }
  }, [
    isParentRecord,
    onRecordToggle,
    recordIndex,
    effectiveIsExpanded,
    isNestedData,
  ]);

  // Value rendering
  const renderValue = useCallback(
    (value: any): React.ReactNode => {
      if (!value) return null;

      if (Array.isArray(value)) {
        return <ArrayValue value={value} onHover={onHover} />;
      }

      if (typeof value === "object" && value.data_field) {
        const val = value.data_value;
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          return <ObjectValue value={val} onHover={onHover} />;
        }
        return <div className="text-sm">{renderValueOrNA(val)}</div>;
      }

      if (typeof value === "object") {
        const nestedCards = Object.entries(value)
          .filter(
            ([key]) =>
              key !== "meta__fields" &&
              key !== "meta__document" &&
              getCardHeaderTitle(key)
          )
          .map(([key, val]) => (
            <ExtractedDataCard
              key={key}
              title={getCardHeaderTitle(key)}
              data={val}
              onHover={onHover}
              level={level + 1}
            />
          ));

        return nestedCards.length > 0 ? (
          <div className="mt-2 flex flex-col gap-2">{nestedCards}</div>
        ) : null;
      }

      return <div className="text-sm">{renderValueOrNA(value)}</div>;
    },
    [onHover, level]
  );

  if (!data) return null;

  // Dynamic class names
  const cardClasses = `shadow-none p-0 gap-0 ${
    isHovered ? "border-blue-500 bg-blue-50 shadow-md" : ""
  }`;
  const headerClasses = `px-4 !py-2 flex flex-row items-center justify-between
    ${effectiveIsExpanded ? "border-b rounded-t-xl" : "rounded-xl"}
    ${isNestedData ? "cursor-pointer" : ""}
    ${isRecordTitle ? "bg-gray-50" : ""}`;

  return (
    <Card
      className={cardClasses}
      onMouseEnter={(e) => handleCardHover(true, e)}
      onMouseLeave={(e) => handleCardHover(false, e)}
    >
      <CardHeader
        className={headerClasses}
        onClick={() => isNestedData && handleToggle()}
      >
        <div className="flex items-center gap-3">
          {isNestedData && (
            <div className="w-4 h-4">
              {effectiveIsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
          <p
            className={
              isRecordTitle
                ? "font-semibold"
                : "text-base font-medium text-muted-foreground"
            }
          >
            {getCardHeaderTitle(title)}
          </p>
        </div>
        {confidenceScore !== null && (
          <ConfidenceBadge score={confidenceScore} />
        )}
      </CardHeader>
      {effectiveIsExpanded && (
        <CardContent className="px-4 py-2 flex flex-col overflow-wrap-anywhere">
          {renderValue(data)}
        </CardContent>
      )}
    </Card>
  );
};

export default ExtractedDataCard;
