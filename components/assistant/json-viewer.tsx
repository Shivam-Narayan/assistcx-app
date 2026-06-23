import React from "react";
import { highlight } from "sugar-high";

interface JsonViewerProps {
  jsonString?: string; // Accept a JSON string or already formatted JSON string
}

const JsonViewer: React.FC<JsonViewerProps> = ({ jsonString }) => {
  if (!jsonString) {
    return (
      <div className="rounded-b-lg whitespace-pre-wrap break-all text-sm">
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          <code>No data provided</code>
        </pre>
      </div>
    );
  }

  // Use the JSON string as-is (standard JSON format)
  const formattedJsonString = jsonString;
  // Highlight the formatted JSON string
  const codeHTML = highlight(formattedJsonString);

  return (
    <div className="rounded-b-lg whitespace-pre-wrap break-all text-sm">
      <pre
        style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
        dangerouslySetInnerHTML={{ __html: codeHTML }}
      />
    </div>
  );
};

export default JsonViewer;
