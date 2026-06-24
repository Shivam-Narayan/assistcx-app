import { SchemaField } from "@/app/(dashboard)/tools/properties-form";
import { Badge } from "@/components/ui/badge";
import { INTEGRATION_ICON_SRC, tagColors } from "@/lib/constants";
import {
  SETTINGS_ACCOUNTS,
  SETTINGS_CLASS_GROUP,
  SETTINGS_DATA_TEMPLATE,
  SETTINGS_MAILBOX_POLLINGS,
  SETTINGS_ROLES,
  SETTINGS_TEAM_MEMBER,
} from "@/lib/urls";
import { saveAs } from "file-saver";
import {
  Baseline,
  Binary,
  Braces,
  Brackets,
  CopyIcon,
  File,
  FileText,
  Hash,
  Paperclip,
  Variable,
} from "lucide-react";
import moment from "moment";
import { useCallback, useState } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import SyntaxHighlighter from "react-syntax-highlighter";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";

/** Fallback when Clipboard API is unavailable (non-HTTPS) */
function copyTextViaExecCommand(text: string): void {
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.border = "0";
  textarea.style.padding = "0";
  textarea.style.margin = "0";
  textarea.style.position = "absolute";
  textarea.style[isRTL ? "right" : "left"] = "-9999px";
  textarea.style.top = `${window.pageYOffset || document.documentElement.scrollTop}px`;
  document.body.appendChild(textarea);
  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const successful = document.execCommand("copy");
    if (!successful) throw new Error("execCommand copy failed");
  } finally {
    document.body.removeChild(textarea);
  }
}

/** Copies text using the Clipboard API when possible, otherwise execCommand. */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) throw new Error("Nothing to copy");
  try {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        copyTextViaExecCommand(text);
      }
    } else {
      copyTextViaExecCommand(text);
    }
  } catch (err) {
    console.error("Copy failed:", err);
    throw err;
  }
}

export const useCopyToClipboard = (resetDelay = 1500) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!text) return Promise.reject("Nothing to copy");

      try {
        await copyTextToClipboard(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), resetDelay);
      } catch (err) {
        console.error("Copy failed:", err);
        throw err;
      }
    },
    [resetDelay],
  );

  return [isCopied, copyToClipboard] as const;
};

// Re-export from shared auth utility for backward compatibility
export { decodeJWT } from "@/lib/auth-utils";

//=====================[FUNCTION: Syntax highlighter]===========================================//
export const renderSyntaxHighlight = (data: any) => {
  let language = "text"; // Default to plain text
  let formattedData = data;
  let isSimpleString = false;

  // Handle numeric data by converting it to a string
  if (typeof data === "number") {
    formattedData = data.toString();
    language = "text"; // Use plain text for numbers
    isSimpleString = true;
  } else if (typeof data === "string") {
    // Check if the string is likely XML
    if (data.trim().startsWith("<") && data.trim().endsWith(">")) {
      language = "xml";
    } else {
      // Attempt to parse the string as JSON
      try {
        formattedData = JSON.stringify(JSON.parse(data), null, 2);
        language = "json"; // Successfully parsed as JSON
      } catch (error) {
        // Not JSON or XML, treat as plain text
        formattedData = data;
        isSimpleString = true;
      }
    }
  } else if (typeof data === "object") {
    // Object data is treated as JSON
    formattedData = JSON.stringify(data, null, 2);
    language = "json";
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            type="button"
            aria-label="Copy to clipboard"
            onClick={async () => {
              try {
                await copyTextToClipboard(String(formattedData));
                toast.success("Copied to Clipboard", {
                  duration: 1000,
                  position: "top-center",
                });
              } catch {
                toast.error("Unable to copy to clipboard");
              }
            }}
            className="rounded-lg border-0 bg-transparent p-0"
          >
            <CopyIcon className="cursor-pointer h-8 w-8 p-2 rounded-lg bg-white shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted" />
          </button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={docco}
          wrapLongLines={true}
          wrapLines={true}
          codeTagProps={{
            style: {
              wordBreak: isSimpleString ? "normal" : "break-all",
              whiteSpace: "pre-wrap",
              overflowWrap: isSimpleString ? "anywhere" : "normal",
            },
          }}
          customStyle={{
            overflow: "hidden",
            background: "transparent",
            wordWrap: isSimpleString ? "break-word" : "normal",
            maxHeight: "none",
            height: "auto",
          }}
        >
          {formattedData}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

//=====================[FUNCTION: Get Render JSON Object]===========================================//
export const renderJsonSyntaxHighlight = (jsonObject: any) => {
  return (
    <SyntaxHighlighter
      language="json"
      style={docco}
      wrapLongLines={true}
      wrapLines={true}
      codeTagProps={{
        style: {
          wordBreak: "break-all",
          padding: 0,
          margin: 0,
        },
      }}
      customStyle={{
        overflow: "hidden",
        padding: 0,
        margin: 0,
        wordBreak: "break-all",
        background: "transparent",
      }}
    >
      {typeof jsonObject === "string"
        ? jsonObject
        : JSON.stringify(jsonObject, null, 2)}
    </SyntaxHighlighter>
  );
};

//=====================[FUNCTION: Get Local Datetime String by UNIX datetime string]===================//
export const UTCToLocalTimezon = (datetime: any) => {
  var stillUtc = moment.utc(datetime).toDate();
  var local = moment(stillUtc).local().format("MMM DD, YYYY hh:mm A"); //MMM D YYYY, h:mm a
  return local;
};

//=====================[FUNCTION: Get Tool Type by unque key]=====================================//
export const getToolType = (value: string) => {
  let toolType = "";
  if (value == "REST_TOOL") {
    toolType = "Rest Tool";
  } else if (value == "ODATA_TOOL") {
    toolType = "OData Tool";
  } else if (value == "BASE_TOOL") {
    toolType = "Base Tool";
  } else if (value == "MAIL_TOOL") {
    toolType = "Mail Tool";
  } else {
    toolType = "";
  }
  return toolType;
};

//=====================[FUNCTION: Get Disting Object from array of object by unque key]===================//
export const getDistinctObjects = (array: any, property: any) => {
  return array.filter(
    (obj: any, index: any, self: any) =>
      index ===
      self.findIndex((element: any) => element[property] === obj[property]),
  );
};

//=====================[FUNCTION: To handle errors]=======================================================//
const toastErrorStyle = {
  style: {
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
  },
};

export const errorMessageHandler = (error: any) => {
  let message: string | null = null;

  if (typeof error === "string") {
    message = error;
  } else if (
    error?.response?.status !== 401 &&
    error?.response?.data?.detail != undefined &&
    error?.response?.data?.detail != null
  ) {
    message = error.response.data.detail;
  }

  toast.error(message || "Something went wrong", toastErrorStyle);
};

/** Top-level agent form sections (tabs). */
const AGENT_FORM_SECTION_LABELS: Record<string, string> = {
  profile: "Profile",
  tools: "Tools",
  knowledge: "Knowledge",
  planning: "Planning",
  output: "Output",
  settings: "Settings",
};

/** Field keys → readable labels for publish validation toasts. */
const AGENT_FORM_FIELD_LABELS: Record<string, string> = {
  name: "Agent name",
  goal: "Goal",
  style: "Style / tone",
  description: "Description",
  instructions: "Instructions",
  icon: "Icon",
  rule: "Rule",
  criterion: "Success criterion",
  skillHeading: "Skill title",
  skillDescription: "Skill description",
  step_name: "Step name",
  condition: "Condition",
  tool: "Tools",
  action: "Actions",
  rules: "Rules",
  data_type: "Data type",
  availability: "Availability",
  index_name: "Index name",
  assignment_type: "Assignment type",
  agent_llm: "Agent LLM",
  mailbox: "Mailbox",
  storage_type: "Storage type",
  mount_path: "Mount path",
  bucket_name: "Bucket name",
  folder_name: "Folder name",
};

function humanizeAgentErrorPath(pathParts: string[]): string {
  if (pathParts.length === 0) return "Form";

  const bits: string[] = [];
  for (let i = 0; i < pathParts.length; i++) {
    const currentPath = pathParts[i];
    if (/^\d+$/.test(currentPath)) {
      const prev = pathParts[i - 1] ?? "";
      if (prev === "planning") {
        bits.push(`Step ${Number(currentPath) + 1}`);
      } else {
        bits.push(`Item ${Number(currentPath) + 1}`);
      }
      continue;
    }
    const isRoot = i === 0;
    const label =
      (isRoot ? AGENT_FORM_SECTION_LABELS[currentPath] : undefined) ??
      AGENT_FORM_FIELD_LABELS[currentPath] ??
      currentPath.replace(/_/g, " ");
    bits.push(label);
  }
  return bits.join(" → ");
}

/**
 * Turns react-hook-form / Zod errors from the agent manage form into short, user-facing text.
 * Use when publish (or full-form submit) fails validation.
 */
export function formatAgentPublishValidationErrors(
  errors: FieldErrors<FieldValues>,
): string {
  const lines: string[] = [];

  const walk = (node: unknown, pathParts: string[]) => {
    if (!node || typeof node !== "object") return;
    const errorNode = node as Record<string, unknown>;
    if (typeof errorNode.message === "string" && errorNode.message.length) {
      const where = humanizeAgentErrorPath(pathParts);
      lines.push(`${where}: ${errorNode.message}`);
      return;
    }
    for (const key of Object.keys(errorNode)) {
      if (key === "ref" || key === "type" || key === "types" || key === "root")
        continue;
      walk(errorNode[key], [...pathParts, key]);
    }
  };

  walk(errors, []);

  if (lines.length === 0) {
    return "Some information is missing or invalid. Review the Profile, Planning, Output, and other tabs, then try again.";
  }

  const maxShow = 4;
  const head = lines.slice(0, maxShow);
  const more = lines.length - maxShow;
  const bulletBlock = head.map((line) => `• ${line}`).join("\n");
  const suffix =
    more > 0 ? `\n• …and ${more} more issue${more === 1 ? "" : "s"}.` : "";
  return `We couldn't publish yet:\n${bulletBlock}${suffix}`;
}

//  old function  export const errorMessageHandler = (error: any) => {
//   if (error != null && error != undefined && error != "") {
//     if (
//       error?.response?.status != 401 &&
//       error?.response?.data?.detail != undefined &&
//       error?.response?.data?.detail != null
//     ) {
//       toast.error(error.response.data.detail, toastErrorStyle);
//     }
//   }
// };

//=====================[FUNCTION: To handle errors]=======================================================//
// export const errorMsgHandler = (errorMessage: any) => {
//   if (errorMessage != null && errorMessage != undefined && errorMessage != "") {
//     toast.error(errorMessage, {
//       style: {
//         borderRadius: "10px",
//         background: "#333",
//         color: "#fff",
//       },
//     });
//   }
// };

//=====================[FUNCTION: To handle errors]=======================================================//
export const successMessageHandler = (successMessage: string) => {
  if (
    successMessage != null &&
    successMessage != undefined &&
    successMessage != ""
  ) {
    toast.success(successMessage, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  }
};

//=====================[FUNCTION: To Swap Objects]=======================================================//
export const swapObjects = (array: any, index1: number, index2: number) => {
  // Check if indices are valid
  if (
    index1 < 0 ||
    index1 >= array.length ||
    index2 < 0 ||
    index2 >= array.length
  ) {
    console.error("Invalid indices");
    return;
  }

  // Swap the objects
  const temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;

  return array;
};

//=====================[FUNCTION: To check Keys NullEmptyArray]=======================================================//
export const checkKeysNullEmptyArray = (obj: any) => {
  for (let key in obj) {
    if (obj[key] !== null && !Array.isArray(obj[key])) {
      return false; // If a non-null, non-empty array value is found, return false
    }
    if (Array.isArray(obj[key]) && obj[key].length !== 0) {
      return false; // If a non-empty array value is found, return false
    }
  }
  return true; // If all keys are null or empty arrays, return true
};

//=====================[FUNCTION: Return Object with group by]=======================================================//
export const groupBy = (arr: any, key: any) => {
  const initialValue = {};
  return arr.reduce((acc: any, row: any) => {
    const myAttribute = row[key];
    acc[myAttribute] = [...(acc[myAttribute] || []), row];
    // acc[myAttribute] = row["field_restrictions"];
    return acc;
  }, initialValue);
};

//=====================[FUNCTION: To Check object has all null value ]=======================================================//
export const allValuesUndefinedNullOrEmpty = (obj: any) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];
      if (value !== undefined && value !== null && value !== "") {
        return false; // If any value is not undefined, null, or empty, return false
      }
    }
  }
  return true; // If all values are undefined, null, or empty, return true
};

//=====================[FUNCTION: To Set Dynamic Options ]=======================================================//
export const setOptions = (optionsArr: any, fields: any) => {
  let optionList: any[] = [];
  if (
    optionsArr &&
    optionsArr != null &&
    optionsArr.length != 0 &&
    fields &&
    fields != null &&
    fields != ""
  ) {
    let fieldsList = fields.split("|");
    for (let fieldIndex = 0; fieldIndex < fieldsList.length; fieldIndex++) {
      const fieldToken = fieldsList[fieldIndex];
      let filterObj = optionsArr.filter(
        (item: any) => item["value"] == fieldToken,
      );
      if (filterObj.length != 0) {
        let label = filterObj[0]["label"];
        optionList.push(label.includes("@") ? label.toLowerCase() : label);
      }
    }
    // console.log(optionList);
    return optionList;
  }
  return optionList;
};
export const setOptionsWithValue = (optionsArr: any, fields: any) => {
  let optionList: any[] = [];
  if (
    optionsArr &&
    optionsArr != null &&
    optionsArr.length != 0 &&
    fields &&
    fields != null &&
    fields != ""
  ) {
    let fieldsList = fields.split("|");
    for (let fieldIndex = 0; fieldIndex < fieldsList.length; fieldIndex++) {
      const fieldToken = fieldsList[fieldIndex];
      let filterObj = optionsArr.filter(
        (item: any) => item["value"] == fieldToken,
      );
      filterObj.length != 0 ? optionList.push(filterObj[0]["value"]) : null;
    }
    // console.log(optionList);
    return optionList;
  }
  return optionList;
};

//=====================[FUNCTION: To Set Dropdown Options Formatter ]=======================================================//
export const setOptionsFormatter = (arr: any) => {
  let optionArr = arr;
  return optionArr && optionArr != null && optionArr.length != 0
    ? optionArr.map((item: any) => {
        return { label: item, value: item };
      })
    : [];
};

//=====================[FUNCTION: To Set Capitaliz header ]=======================================================//
export const getCardHeaderTitle = (label: any) => {
  // Don't render if label is meta__fields or meta__document
  if (label === "meta__fields" || label === "meta__document") {
    return "";
  }
  if (label.includes("@")) {
    return label.toLowerCase();
  }

  return label && label != null && label != ""
    ? label.replace(/_/g, " ").replace(/\w+/g, (word: any) => {
        return word.charAt(0).toUpperCase() + word.substr(1);
      })
    : "";
};

//=====================[FUNCTION: To Set Capitaliz header ]=======================================================//
export const settingSidebar = (accessControl: any): string => {
  if (accessControl && accessControl.length != 0) {
    if (accessControl.includes(SETTINGS_MAILBOX_POLLINGS)) {
      return SETTINGS_MAILBOX_POLLINGS;
    } else if (accessControl.includes(SETTINGS_DATA_TEMPLATE)) {
      return SETTINGS_DATA_TEMPLATE;
    } else if (accessControl.includes(SETTINGS_CLASS_GROUP)) {
      return SETTINGS_CLASS_GROUP;
    } else if (accessControl.includes(SETTINGS_TEAM_MEMBER)) {
      return SETTINGS_TEAM_MEMBER;
    } else if (accessControl.includes(SETTINGS_ROLES)) {
      return SETTINGS_ROLES;
    } else if (accessControl.includes(SETTINGS_ACCOUNTS)) {
      return SETTINGS_ACCOUNTS;
    } else {
      return "";
    }
  }
  return "";
};

//=====================[FUNCTION: To Set Capitaliz header ]=======================================================//
export const capitalizeMessage = (message: any) => {
  if (message && message != null && message != "") {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }
  return "";
};

//=====================[FUNCTION: To Download Base64 file ]=======================================================//
export const downloadBase64File = (
  base64Data: any,
  fileName: any,
  fileType: any,
) => {
  if (
    base64Data &&
    fileName &&
    fileType &&
    base64Data != null &&
    fileName != null &&
    fileType != null &&
    base64Data != "" &&
    fileName != "" &&
    fileType != ""
  ) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters).map((char) =>
      char.charCodeAt(0),
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = fileName;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    saveAs(blob, fileName);
  }
};

//=====================[FUNCTION: To Download Markdown file ]=======================================================//
export const downloadMarkdownFile = (
  content: string,
  fileId: string,
  fileName?: string,
) => {
  if (!content || !fileId) {
    console.error("Content and file ID are required");
    return false;
  }

  try {
    const markdownContent = content;
    const blob = new Blob([markdownContent], {
      type: "text/markdown;charset=utf-8",
    });
    const defaultFileName = fileName
      ? `${fileName.replace(/\.[^/.]+$/, "")}.md`
      : `file-${fileId}.md`;
    saveAs(blob, defaultFileName);
    return true;
  } catch (error) {
    errorMessageHandler(error);
    return false;
  }
};

/**
 * Get the appropriate CSS class for a status badge based on status text
 * Works for email, task, and agent statuses
 */
export const getStatusColor = (status: string = "") => {
  status = status.toUpperCase();

  if (
    status === "SUCCESSFUL" ||
    status === "COMPLETED" ||
    status === "PROCESSED" ||
    status === "PUBLISHED"
  )
    return "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-400";

  if (status === "QUEUED" || status === "PENDING")
    return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-400";

  if (status === "FAILED" || status === "CANCELLED")
    return "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-400";

  if (
    status === "PROCESSING" ||
    status === "EXECUTING" ||
    status === "PARSING" ||
    status === "IN PROGRESS"
  )
    return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-400";

  if (status === "INDEXING")
    return "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-700/20 dark:text-violet-400";

  if (status === "ARCHIVED")
    return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700/20 dark:text-gray-400";

  if (status === "UNLISTED" || status === "INCOMPLETE")
    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-700/20 dark:text-orange-400";

  if (status === "EXTRACTING") {
    return "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-700/20 dark:text-cyan-400";
  }

  if (status === "RESOLVED")
    return "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-700/20 dark:text-zinc-400";

  // Default
  return "bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-600/20 dark:text-gray-300";
};

export const getAttachmentIcon = (
  fileType: string,
  className = "w-4 h-4 mr-1 shrink-0",
) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf"))
    return (
      <FileText className={`${className} text-red-500 dark:text-red-400`} />
    );
  if (type.includes("doc") || type.includes("docx"))
    return (
      <FileText className={`${className} text-blue-500 dark:text-blue-400`} />
    );
  if (type.includes("xls") || type.includes("xlsx"))
    return (
      <FileText className={`${className} text-green-500 dark:text-green-400`} />
    );
  return (
    <Paperclip className={`${className} text-gray-500 dark:text-gray-400`} />
  );
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];

// Simulated today (you can use `new Date()` for real-time)
const today = new Date();

export function getDateRange(option: string) {
  const from = new Date(today);
  const to = new Date(today);

  switch (option) {
    case "Today":
      break;

    case "Yesterday":
      from.setDate(from.getDate() - 1);
      to.setDate(to.getDate() - 1);
      break;

    case "Last 7 days":
      from.setDate(from.getDate() - 6);
      break;

    case "Last 30 days":
      from.setDate(from.getDate() - 29);
      break;

    default:
      return null; // Invalid option
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export function formatDateRange(firstDate: string, lastDate: string): string {
  // Parse dates as local timezone
  const [startYear, startMonth, startDay] = firstDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = lastDate.split("-").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const startMonthName = monthNames[start.getMonth()];
  const endMonthName = monthNames[end.getMonth()];

  if (sameDay) {
    return `${startMonthName} ${start.getDate()}, ${start.getFullYear()}`;
  }

  if (sameMonth && sameYear) {
    return `${startMonthName} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${startMonthName} ${start.getDate()} - ${endMonthName} ${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${startMonthName} ${start.getDate()}, ${start.getFullYear()} - ${endMonthName} ${end.getDate()}, ${end.getFullYear()}`;
}

export function convertToUnixTimestamp(
  dateStr: string,
  day: "start" | "end",
): number {
  const [year, month, dayNum] = dateStr.split("-").map(Number);
  const time = day === "start" ? [0, 0, 0, 0] : [23, 59, 59, 999];
  const date = new Date(year, month - 1, dayNum, ...time); // local time
  return Math.floor(date.getTime() / 1000);
}

export const formatLabel = (text: string) => {
  if (!text) return "";

  return text
    .split("_") // split by underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
    .join(" "); // join with space
};

export const getTimeAgo = (date: string): string => {
  // Get the current time in UTC
  const now = moment.utc();

  // Parse the incoming date string as UTC
  const updated = moment.utc(date);

  // The rest of the logic remains the same, as we are now comparing two UTC moments.
  const years = now.diff(updated, "years");
  if (years >= 1) return `${years} ${years === 1 ? "year" : "years"} ago`;

  const months = now.diff(updated, "months");
  if (months >= 1) return `${months} ${months === 1 ? "month" : "months"} ago`;

  const days = now.diff(updated, "days");
  if (days >= 1) return `${days} ${days === 1 ? "day" : "day"} ago`;

  const hours = now.diff(updated, "hours");
  if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const minutes = now.diff(updated, "minutes");
  if (minutes >= 1)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;

  return "just now";
};

export const formatRoleName = (roleKey: string) => {
  if (!roleKey) return "";

  return roleKey
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getFileType = (fileName: string) => {
  if (!fileName) return "N/A";

  // Extract extension safely
  const parts = fileName.split(".");
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() ?? "N/A";
  }

  return "N/A";
};

// Random Hex generator
export const getRandomHexColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Random Hex selector
export const getRandomTagColor = () => {
  const randomIndex = Math.floor(Math.random() * tagColors.length);
  return tagColors[randomIndex];
};

// config filetring
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

export function removeMetadata<T extends JsonValue>(
  jsonObj: T,
  customMetadataFields: string[] = [],
): T {
  const defaultMetadataFields: string[] = [
    "id",
    "_id",
    "uuid",
    "created_at",
    "createdAt",
    "created",
    "updated_at",
    "updatedAt",
    "updated",
    "modified_at",
    "modifiedAt",
    "deleted_at",
    "deletedAt",
    "deleted",
    "timestamp",
    "ts",
    "version",
    "__v",
    "revision",
    "rev",
    "etag",
    "last_modified",
    "created_by",
    "createdBy",
    "author",
    "updated_by",
    "updatedBy",
    "modifier",
    "schema_version",
    "schemaVersion",
  ];

  const metadataFields: string[] = [
    ...defaultMetadataFields,
    ...customMetadataFields,
  ];

  function cleanValue(value: JsonValue): JsonValue {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => cleanValue(item)) as JsonArray;
    }

    const cleaned: JsonObject = {};
    for (const [key, val] of Object.entries(value)) {
      if (
        !metadataFields.some(
          (field) => field.toLowerCase() === key.toLowerCase(),
        )
      ) {
        cleaned[key] = cleanValue(val);
      }
    }

    return cleaned;
  }

  return cleanValue(jsonObj) as T;
}

export const handleJsonFormatting = (agentObj: any) => {
  // Destructure and exclude unwanted keys
  const {
    //   agent_config,
    //   agent_mailbox,
    //   data_store,
    //   data_templates,
    //   intent_class,
    agent_llm,
    reviewers,
    ...filtered
  } = agentObj;

  // Clean up tools
  if (Array.isArray(filtered.tools)) {
    filtered.tools = filtered.tools.map((tool: any) => ({
      name: tool.name,
      action: tool.action,
    }));
  }

  // Clean up knowledge_base
  if (Array.isArray(filtered.knowledge_base)) {
    filtered.knowledge_base = filtered.knowledge_base.map((kb: any) => ({
      name: kb.name,
      index_name: kb.index_name,
      collection_id: kb.collection_id,
    }));
  }

  // Clean up plan
  if (Array.isArray(filtered.plan)) {
    filtered.plan = filtered.plan.map(({ id, ...rest }: any) => rest);
  }

  return filtered;
};
interface Tag {
  id: string;
  name: string;
  color: string;
}
export const getSortedTags = (selectedTags: Tag[]): Tag[] => {
  return [...selectedTags]
    .filter((tag): tag is Tag => !!tag && !!tag.name)
    .sort((tagA, tagB) => tagA.name?.localeCompare(tagB.name));
};

export const SUCCESS_CRITERIA_PAYLOAD_SEPARATOR = "\n";

/**
 * Parses API payload success_criteria (string, string[], or { criterion }[]) into string[].
 */
export function successCriteriaToStringArray(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (typeof value === "string") {
    return parseSuccessCriteriaIncomingString(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    const first = value[0];
    if (typeof first === "object" && first !== null && "criterion" in first) {
      return (value as { criterion?: string }[])
        .map((item) => (item.criterion ?? "").trim())
        .filter(Boolean);
    }
    return value
      .map((val) => (val == null ? "" : String(val).trim()))
      .filter(Boolean);
  }
  return [];
}

function parseSuccessCriteriaIncomingString(successCriteria: string): string[] {
  const trimmedCriteria = successCriteria.trim();
  if (!trimmedCriteria) return [];
  if (trimmedCriteria.includes("/n")) {
    return trimmedCriteria
      .split("/n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const byNewline = trimmedCriteria
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  return trimmedCriteria
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * response: string[] for UI / redux
 */
export const normalizeSuccessCriteria = (
  value: unknown,
  type: "payload" | "response" = "response",
): string | string[] => {
  const parts = successCriteriaToStringArray(value);
  if (type === "payload") {
    return parts.join(SUCCESS_CRITERIA_PAYLOAD_SEPARATOR);
  }
  return parts;
};
export const normalizeActions = (action: any): string[] => {
  if (!action) return [];
  if (typeof action === "string") return [action];
  if (Array.isArray(action)) return action;
  return [];
};

export const normalizeTools = (
  tool: any,
): { label: string; value: string; description?: string }[] => {
  if (!tool) return [];
  const toolArray = Array.isArray(tool) ? tool : [tool];
  return toolArray.map((toolItem) => {
    if (typeof toolItem === "string")
      return { label: toolItem.replace(/_/g, " "), value: toolItem };

    const rawLabel = toolItem.label ?? toolItem.name ?? String(toolItem);

    return {
      label: rawLabel.replace(/_/g, " "),
      value: toolItem.value ?? rawLabel,
    };
  });
};

// Get formatted data type in Tools Input Schema
export const getTypeLabel = (value: any) => {
  if (!value) return "—";

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  if (value.type) {
    if (value.type === "array" && value.items?.type) {
      return `${capitalize(value.type)}<${capitalize(value.items.type)}>`;
    }
    return capitalize(value.type);
  }

  if (Array.isArray(value.anyOf)) {
    return value.anyOf
      .map((subSchema: any) => {
        if (subSchema.type === "array" && subSchema.items?.type) {
          return `${capitalize(subSchema.type)}<${capitalize(subSchema.items.type)}>`;
        }
        return capitalize(subSchema.type);
      })
      .join(" | ");
  }

  return "—";
};
// Get matching icon based on the data type in Tools Input Schema
export const getTypeIcon = (value: any) => {
  let type = value?.type;

  if (!type && Array.isArray(value?.anyOf)) {
    const firstType = value.anyOf[0]?.type;
    if (firstType) type = firstType;
  }

  switch (type) {
    case "string":
      // return <TextInitial className="h-5 w-5 text-primary" />; // build issue : unbale to export "TextInitial" from "lucide-react"
      return <Baseline className="h-4 w-4 text-primary" />;
    case "number":
    case "integer":
      return <Hash className="h-4 w-4 text-primary" />;
    case "boolean":
      return <Binary className="h-4 w-4 text-primary" />;
    case "array":
      return <Brackets className="h-4 w-4 text-primary" />;
    case "object":
      return <Braces className="h-4 w-4 text-primary" />;
    default:
      return <Variable className="h-4 w-4 text-primary" />;
  }
};
// Check if the field is required in Tools Input Schema (ignores null types)
export const isFieldRequired = (value: any): boolean => {
  const type =
    value?.type ||
    (Array.isArray(value?.anyOf)
      ? value.anyOf.map((subSchema: any) => subSchema.type).filter(Boolean)
      : []);

  const hasNull = Array.isArray(type) ? type.includes("null") : type === "null";

  return !hasNull;
};

//--tool executing file Helper function--//

export function isFieldRequiredFromAnyOf(field: SchemaField): boolean {
  const hasNullType = field.anyOf?.some(
    (anyOfMember) => anyOfMember.type === "null",
  );
  return !hasNullType;
}

// Helper function to determine field type
export function getFieldType(
  field: SchemaField,
):
  | "simple-array"
  | "array-of-objects"
  | "object"
  | "object-or-array"
  | "number"
  | "string" {
  const hasObject = field.anyOf?.some(
    (subSchema) =>
      subSchema.type === "object" || subSchema.additionalProperties === true,
  );
  const hasArrayOfObjects = field.anyOf?.some(
    (subSchema) =>
      subSchema.type === "array" && subSchema.items?.type === "object",
  );

  // If it has both object and array of objects, it can accept either
  if (hasObject && hasArrayOfObjects) {
    return "object-or-array";
  }

  const isArray =
    field.anyOf?.some((subSchema) => subSchema.type === "array") ||
    field.type === "array";

  if (isArray) {
    const hasObjectItems =
      field.anyOf?.some(
        (subSchema) =>
          subSchema.type === "array" && subSchema.items?.type === "object",
      ) || field.items?.type === "object";

    return hasObjectItems ? "array-of-objects" : "simple-array";
  }

  const isObject =
    field.anyOf?.some(
      (subSchema) =>
        subSchema.type === "object" || subSchema.additionalProperties === true,
    ) ||
    field.type === "object" ||
    field.additionalProperties === true;

  if (isObject) return "object";

  if (field.type === "integer" || field.type === "number") return "number";

  return "string";
}

//Helper function to convert hex to hsl
export function hexToHSL(hex: string) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((digit) => digit + digit)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
//Helper function to convert hsl to hex
export function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export const hslStringToHex = (hslString: string): string => {
  const [h, s, l] = hslString.split(" ").map((val) => parseFloat(val));
  return hslToHex(h, s, l);
};

export const getFormattedValues = (values: any) => {
  return values
    ? values.reduce((accumulator: any, row: any) => {
        accumulator[row.your_key] = row.value;
        return accumulator;
      }, {})
    : null;
};

/*Helper function for file viewer in knowledge collection */
// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const bytesPerUnit = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(bytesPerUnit));
  return (
    parseFloat((bytes / Math.pow(bytesPerUnit, unitIndex)).toFixed(2)) +
    " " +
    sizes[unitIndex]
  );
};

export const formatNumberUS = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return String(value);
  return new Intl.NumberFormat("en-US").format(numericValue);
};

// Component to render metadata value based on type
export const getPreviewContent = (content: string) => {
  const cleanContent = content
    .replace(/^Knowledge Topic.*?:\n/i, "") // Remove knowledge topic header
    .replace(/^\*\*.*?\*\*\n/gm, "") // Remove bold headers
    .replace(/^#+\s/gm, "") // Remove markdown headers
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  return cleanContent.length > 150
    ? cleanContent.substring(0, 150) + "..."
    : cleanContent;
};
export const docFieldPriority = [
  "doc_title",
  "doc_filename",
  "doc_type",
  "doc_overview",
  "doc_entities",
  "doc_keywords",
];
export const sortedMetadataEntries = (rawMetadataEntries: [string, any][]) => {
  return rawMetadataEntries.sort(([keyA], [keyB]) => {
    const isDocA = keyA.startsWith("doc_");
    const isDocB = keyB.startsWith("doc_");

    // If both are doc_ fields, sort by priority
    if (isDocA && isDocB) {
      const priorityA = docFieldPriority.indexOf(keyA);
      const priorityB = docFieldPriority.indexOf(keyB);

      // If both are in priority list, sort by priority
      if (priorityA !== -1 && priorityB !== -1) {
        return priorityA - priorityB;
      }

      // If only A is in priority, A comes first
      if (priorityA !== -1 && priorityB === -1) return -1;

      // If only B is in priority, B comes first
      if (priorityA === -1 && priorityB !== -1) return 1;

      // If neither in priority, sort alphabetically
      return keyA.localeCompare(keyB);
    }

    // If only A starts with doc_, A comes first
    if (isDocA && !isDocB) return -1;

    // If only B starts with doc_, B comes first
    if (!isDocA && isDocB) return 1;

    // If neither starts with doc_, sort alphabetically
    return keyA.localeCompare(keyB);
  });
};
// Utility function to get file type icon
export const getFileTypeIcon = (type: string) => {
  if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
  if (type.includes("image")) return <File className="h-5 w-5" />;
  if (type.includes("text")) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};
export const MetadataValue = ({ value }: { value: any }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Not provided</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (typeof value === "number") {
    return <span className="font-mono">{formatNumberUS(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-muted-foreground italic text-sm">Empty list</span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs px-1.5 py-0.5"
          >
            {String(item)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </Badge>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-0.5">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="text-xs">
            <span className="font-medium text-muted-foreground">{key}:</span>{" "}
            <span className="text-foreground">{String(val)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default string handling - show full content but more compact
  const stringValue = String(value);

  // Check if it's a phrase (no periods or commas) and apply formatting
  const isPhrase = !stringValue.includes(".") && !stringValue.includes(",");
  const displayValue = isPhrase
    ? stringValue
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : stringValue;

  return (
    <span className="text-sm leading-relaxed break-all">{displayValue}</span>
  );
};
export const capitalizeFirstLetter = (text?: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getTagsFromIdsOrNames = (
  tagValues: string[] = [],
  tagList: any[] = [],
) => {
  if (!Array.isArray(tagValues) || !Array.isArray(tagList)) return [];
  return tagValues
    .map((value) =>
      tagList.find((tag) => tag.id === value || tag.name === value),
    )
    .filter(Boolean);
};

export const formatFunctionName = (name: string): string => {
  if (!name) return name;
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to get initials for AvatarFallback
export const getInitials = (name: string) => {
  if (!name) return "NA";

  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const trimValues = (values: any): any => {
  if (typeof values === "string") return values.trim();

  if (Array.isArray(values)) {
    return values.map(trimValues);
  }

  if (typeof values === "object" && values !== null) {
    return Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, trimValues(value)]),
    );
  }

  return values;
};

export const firstLetterCapital = (val: string): string => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

// this function showing tool icons in multiple places

export function getToolIcon(
  tool: any,
  toolIcons: Record<string, string> | null,
  defaultIcon: string,
) {
  const integrationIcon =
    tool.is_default && tool.integration_key
      ? INTEGRATION_ICON_SRC[tool.integration_key]
      : null;
  if (integrationIcon) {
    return (
      <img
        src={integrationIcon}
        alt={tool.integration_key}
        className="size-5 xl:size-6 shrink-0"
      />
    );
  }
  const iconSvg = toolIcons?.[tool.icon];
  return (
    <div
      className="flex items-stretch [&>svg]:w-6 [&>svg]:h-6"
      dangerouslySetInnerHTML={{
        __html: iconSvg || defaultIcon,
      }}
    />
  );
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatSchedule(cron: string) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(" ");

  const time = moment(`${hour}:${minute}`, "H:m").format("h:mm A");

  // Weekly
  if (dayOfWeek !== "*") {
    return `Weekly • ${DAYS[Number(dayOfWeek)]} at ${time}`;
  }

  // Monthly
  if (dayOfMonth !== "*" && month === "*") {
    return `Monthly • Day ${dayOfMonth} at ${time}`;
  }

  // Yearly
  if (dayOfMonth !== "*" && month !== "*") {
    const monthName = moment()
      .month(Number(month) - 1)
      .format("MMMM");

    return `Yearly • ${monthName} ${dayOfMonth} at ${time}`;
  }

  // Daily
  return `Daily • ${time}`;
}

// func use for match integration key return true if match

export const getProviderByKey = (
  providerList: any[],
  integrationKey?: string,
) => {
  return (providerList || []).find((provider) => provider.key === integrationKey);
};
