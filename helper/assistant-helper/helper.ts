// import { ChatMessage } from "@/components/assistant/quary-plan/types";
import { DAY_MAP, fileTypes, ScheduleInfo } from "./helper-types";

import moment from "moment";
import toast from "react-hot-toast";
import PizZip from "pizzip";
import { ChatMessage } from "@/app/assistant/chat/_components/types";
// Function to format date
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// Function to sort messages
export const sortedMessages = (messages: ChatMessage[]) => {
  return messages.sort((a, b) => {
    return (
      new Date(a.created_at ?? "").getTime() -
      new Date(b.created_at ?? "").getTime()
    ); // DESC
  });
};

// Function to calculate time difference
export const timeCount = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

// Function to get the file extension from a MIME type
export const getFileExtension = (mimeType: string): string => {
  const mimeToExtensionMap: Record<string, string> = {
    "application/pdf": "pdf",
    "text/markdown": "md",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
  };

  return mimeToExtensionMap[mimeType] || "Unknown";
};

type FileInfo = {
  icon: string;
  color: string;
};

type FileInput =
  | string
  | {
      mime?: string; // optional MIME type
      name?: string; // optional filename
    };

export const getIconForFileType = (input: FileInput): FileInfo | undefined => {
  const mimeTypeToExtension: { [key: string]: string } = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "text/markdown": "md",
    "text/plain": "txt",
    "text/html": "html",
  };

  let fileExtension = "";

  // 🟢 Case: object input
  if (typeof input === "object") {
    const { name, mime } = input;

    // 1️⃣ Try to extract from filename first
    if (name && name.includes(".")) {
      fileExtension = name.split(".").pop()!.toLowerCase();
    }
    // 2️⃣ If no extension in name → use MIME type mapping
    else if (mime && mimeTypeToExtension[mime]) {
      fileExtension = mimeTypeToExtension[mime];
    }
    // 3️⃣ If MIME not in map but has subtype → extract it
    else if (mime && mime.includes("/")) {
      fileExtension = mime.split("/").pop()!.toLowerCase();
    }
  } else {
    // 🟢 Case: plain string input
    const rawInput = input;

    if (mimeTypeToExtension[rawInput]) {
      fileExtension = mimeTypeToExtension[rawInput];
    } else if (rawInput.includes(".")) {
      fileExtension = rawInput.split(".").pop()!.toLowerCase();
    } else if (rawInput.includes("/")) {
      fileExtension = rawInput.split("/").pop()!.toLowerCase();
    } else {
      fileExtension = rawInput.toLowerCase();
    }
  }

  const fileType = fileTypes.find((ft) => ft.value === fileExtension);

  return fileType ? { icon: fileType.icon, color: fileType.color } : undefined;
};

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

  if (status === "FAILED" || status === "INCOMPLETE" || status === "CANCELLED")
    return "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-400";

  if (
    status === "PROCESSING" ||
    status === "EXECUTING" ||
    status === "IN PROGRESS"
  )
    return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-400";

  if (status === "INDEXING")
    return "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-700/20 dark:text-violet-400";

  if (status === "ARCHIVED")
    return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700/20 dark:text-gray-400";

  if (status === "UNLISTED")
    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-700/20 dark:text-orange-400";

  // Default
  return "bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-600/20 dark:text-gray-300";
};
// utils/download.ts
export const downloadBase64File = (
  base64Content: string,
  fileName: string,
  mimeType: string,
) => {
  try {
    // Convert base64 to binary
    const binaryString = window.atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create Blob and Object URL
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error("Download failed:", err);
    return false;
  }
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

// Helper functions to convert between formats
export const isoToTimeString = (isoString: string | undefined) => {
  if (!isoString) return "10:10"; // Default fallback
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const timeStringToIso = (timeString: string, baseDate = new Date()) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours);
  date.setMinutes(minutes);
  return date.toISOString();
};

/* cron expression handler*/
export function scheduleToCron(schedule: {
  type: "daily" | "weekly" | "monthly" | "yearly" | "once";
  time: string; // "HH:mm"
  date?: string; // "YYYY-MM-DD"
  dayOfWeek?: string;
  dayOfMonth?: string;
}): string {
  // Parse local time first
  const [localHour, localMinute] = schedule.time.split(":").map(Number);

  // Convert local time to UTC
  const localDate = new Date();
  localDate.setHours(localHour, localMinute, 0, 0);

  const utcHour = localDate.getUTCHours();
  const utcMinute = localDate.getUTCMinutes();

  switch (schedule.type) {
    case "daily":
      return `${utcMinute} ${utcHour} * * *`;

    case "weekly":
      return `${utcMinute} ${utcHour} * * ${dayToNumber(
        schedule.dayOfWeek || "Monday",
      )}`;

    case "monthly":
      return `${utcMinute} ${utcHour} ${schedule.dayOfMonth || 1} * *`;

    case "yearly":
      if (!schedule.date)
        throw new Error("Date is required for 'yearly' schedule");
      const yearlyDate = new Date(schedule.date);
      return `${utcMinute} ${utcHour} ${yearlyDate.getUTCDate()} ${
        yearlyDate.getUTCMonth() + 1
      } *`;

    case "once":
      if (!schedule.date)
        throw new Error("Date is required for 'once' schedule");
      const onceDate = new Date(`${schedule.date}T${schedule.time}:00`);
      return onceDate.getTime().toString().slice(0, -3); // epoch seconds UTC

    default:
      return `${utcMinute} ${utcHour} * * *`;
  }
}

function dayToNumber(day: string): number {
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[day] ?? 1;
}

function numberToDay(num: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[num] || "Monday";
}

function pad(n: string | number): string {
  return n.toString().padStart(2, "0");
}
// Convert cron string to JSON format

export function cronToJson(cron: string) {
  const parts = cron.trim().split(" ");

  if (parts.length !== 5) {
    throw new Error("Invalid cron expression (expected 5 parts)");
  }

  const [min, hour, dom, month, fifth] = parts;

  // Convert UTC → Local
  const utcDate = new Date();
  utcDate.setUTCHours(Number(hour), Number(min), 0, 0);

  const localHour = utcDate.getHours();
  const localMinute = utcDate.getMinutes();
  const time = `${pad(localHour)}:${pad(localMinute)}`;

  // Every Minute
  if (cron === "* * * * *") {
    return { type: "every_minute", time: "*:*" };
  }

  // Every Hour
  if (
    min === "0" &&
    hour === "*" &&
    dom === "*" &&
    month === "*" &&
    fifth === "*"
  ) {
    return { type: "every_hour", time: "*:00" };
  }

  // Yearly — 5th part is "*", month & dom are fixed
  if (fifth === "*" && dom !== "*" && month !== "*") {
    const monthDate = `${pad(month)}-${pad(dom)}`;
    const date = getNextYearlyDate(monthDate, time);
    return { type: "yearly", time, date };
  }

  // Weekly — 5th part is a day of week
  if (dom === "*" && month === "*" && /^\d$/.test(fifth)) {
    return { type: "weekly", time, dayOfWeek: numberToDay(Number(fifth)) };
  }

  // Monthly — dom is fixed, rest is "*"
  if (dom !== "*" && month === "*" && fifth === "*") {
    return { type: "monthly", time, dayOfMonth: dom };
  }

  // Daily — all fixed except dom/month/dow = "*"
  if (dom === "*" && month === "*" && fifth === "*") {
    return { type: "daily", time };
  }

  // Fallback: Custom
  return {
    type: "custom",
    time,
    minute: localMinute.toString(),
    hour: localHour.toString(),
    dayOfMonth: dom,
    month,
    fifthField: fifth,
    raw: cron,
  };
}

export function getNextRunText(schedule: ScheduleInfo): string {
  if (schedule.type === "every_minute") return "Running continuously";

  const nextRun = calculateNextRun(schedule);

  if (nextRun) return `Next run: ${nextRun.format("MMMM D [at] h:mm A")}`;
  else {
    if (schedule.type === "once" && schedule.date) {
      // Parse original "once" date to show executed time
      const [year, month, day] = schedule.date.split("-");
      const monthOnce = Number(month) - 1;
      const dayOnce = Number(day);
      const latestYear = Number(year);

      const executedAt = moment().set({
        year: latestYear,
        month: monthOnce,
        date: dayOnce,
        hours: Number(schedule.time.split(":")[0]),
        minutes: Number(schedule.time.split(":")[1]),
        seconds: 0,
      });

      return `Executed on ${executedAt.format("MMMM D [at] h:mm A")}`;
    }
    return "No next run scheduled";
  }
}

export function calculateNextRun(schedule: ScheduleInfo): moment.Moment | null {
  const now = moment();
  const [hours, minutes] = schedule.time.split(":").map(Number);
  let nextRun = moment().set({ hours, minutes, seconds: 0 });

  switch (schedule.type) {
    case "daily":
      if (nextRun.isBefore(now)) nextRun.add(1, "day");
      break;

    case "weekly":
      const targetDay = DAY_MAP[schedule.dayOfWeek || "Monday"];
      nextRun = nextRun.day(targetDay).set({ hours, minutes, seconds: 0 });
      if (nextRun.isBefore(now)) nextRun.add(1, "week");
      break;

    case "monthly":
      nextRun.date(schedule.dayOfMonth || 1);
      if (nextRun.isBefore(now)) {
        nextRun.add(1, "month");
        while (nextRun.date() !== (schedule.dayOfMonth || 1)) {
          nextRun.subtract(1, "day");
        }
      }
      break;

    case "yearly":
      if (schedule?.date) {
        let monthStr = "";
        let dayStr = "";

        if (schedule?.date) {
          const parts = schedule.date.split("-");
          if (parts.length === 2) {
            [monthStr, dayStr] = parts; // MM-DD format
          } else if (parts.length === 3) {
            [, monthStr, dayStr] = parts; // YYYY-MM-DD format
          }
        }
        // const [monthStr, dayStr] = schedule.date.split("-");
        const month = Number(monthStr) - 1;
        const day = Number(dayStr);
        nextRun = moment().set({
          year: now.year(),
          month,
          date: day,
          hours,
          minutes,
          seconds: 0,
        });

        if (nextRun.isBefore(now)) {
          nextRun.add(1, "year");
        }
      } else {
        return null;
      }
      break;

    case "once":
      if (!schedule.date) return null;
      const [year, month, day] = schedule.date.split("-");
      const monthOnce = Number(month) - 1;
      const dayOnce = Number(day);
      const latestYear = Number(year);

      nextRun = moment().set({
        year: latestYear,
        month: monthOnce,
        date: dayOnce,
        hours,
        minutes,
        seconds: 0,
      });

      // ✅ If already passed, return null (means executed/expired)
      if (nextRun.isBefore(now)) {
        return null;
      }
      break;
  }

  return nextRun;
}
// Format time helper using Moment.js
export function formatScheduleTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return moment().set({ hours, minutes }).format("h:mm A");
}

export function getNextYearlyDate(mmdd: string, time: string): string | null {
  if (!/^\d{2}-\d{2}$/.test(mmdd)) return null;

  const [monthStr, dayStr] = mmdd.split("-");
  const [hoursStr, minutesStr] = time.split(":");

  const month = Number(monthStr) - 1; // moment months are 0-based
  const day = Number(dayStr);
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  let target = moment().set({
    month,
    date: day,
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  });
  const now = moment();

  if (target.isBefore(now)) {
    target = target.add(1, "year");
  }

  return target.format("YYYY-MM-DD");
}

// Function to handle space validation
export const handleSpaceValidation = (event: any) => {
  const input = event.currentTarget;

  // Prevent the first character from being a space
  if (input.selectionStart === 0 && event.key === " ") {
    event.preventDefault();
    return;
  }

  // Prevent multiple consecutive spaces
  if (event.key === " ") {
    const cursorPosition = input.selectionStart ?? 0;
    const text = input.value;

    if (text[cursorPosition - 1] === " " || text[cursorPosition] === " ") {
      event.preventDefault();
    }
  }
};

//=====================[FUNCTION: To Set Capitaliz header ]=======================================================//
export const getCardHeaderTitle = (lable: any) => {
  // Don't render if label is meta__fields or meta__document
  if (lable === "meta__fields" || lable === "meta__document") {
    return "";
  }

  return lable && lable != null && lable != ""
    ? lable.replace(/_/g, " ").replace(/\w+/g, (txt: any) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
      })
    : "";
};

//=====================[FUNCTION: To Set Capitaliz header ]=======================================================//
export const capitalizeMessage = (message: any) => {
  if (message && message != null && message != "") {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }
  return "";
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

//=====================[FUNCTION: To format role name]=======================================================//
export const formatRoleName = (roleKey: string) => {
  if (!roleKey) return "";

  return roleKey
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

//=====================[FUNCTION: To get source type display]=======================================================//
export function getSourceTypeDisplay(source: any): string {
  if (source?.source_type === "web_page") {
    return "WEB";
  }

  if (source?.metadata?.file_extension) {
    return source.metadata.file_extension.toUpperCase();
  }

  if (source?.metadata?.file_name) {
    const extension = source.metadata.file_name.split(".").pop();
    return extension ? extension.toUpperCase() : "";
  }

  return "";
}

//=====================[FUNCTION: Get Local Datetime String by UNIX datetime string]===================//
export const UTCToLocalTimezon = (datetime: any) => {
  var stillUtc = moment.utc(datetime).toDate();
  var local = moment(stillUtc).local().format("MMM DD, YYYY hh:mm A"); //MMM D YYYY, h:mm a
  return local;
};

//=====================[FUNCTION: Get Time in readable format (from seconds to minutes/hours)]===================//
export function secondsToMinutesTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
  }
  if (minutes > 0) return `${minutes} min`;
  else return `${seconds} sec`;
}

//truncate file name
export function truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length > maxLength) {
    return `${fileName.slice(0, maxLength - 3)}...`;
  }
  return fileName;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateFile = async (
  file: File,
  uploadedFiles: File[],
  allowedMimeTypes: Record<string, any>,
  maxFiles: number = 10,
): Promise<ValidationResult> => {
  const file_name = truncateFileName(file.name, 25);

  // Check max files limit
  if (uploadedFiles.length >= maxFiles) {
    return {
      isValid: false,
      errorMessage: `You can only upload up to ${maxFiles} files`,
    };
  }

  // Check empty file
  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: `File "${file_name}" is empty and cannot be uploaded.`,
    };
  }

  // Read file buffer
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return {
      isValid: false,
      errorMessage: `File "${file_name}" is corrupted or unreadable.`,
    };
  }

  const uint8 = new Uint8Array(buffer);
  const ext = file.name.toLowerCase();

  // Markdown validation
  if (ext.endsWith(".md")) {
    if (file.size < 5) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" seems to be empty or invalid Markdown.`,
      };
    }
  }

  // PDF validation
  if (ext.endsWith(".pdf") || file.type === "application/pdf") {
    const header = new TextDecoder().decode(uint8.slice(0, 4));
    if (header !== "%PDF") {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is corrupted or not a valid PDF.`,
      };
    }
    if (file.size < 1000) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is too small to be a valid PDF.`,
      };
    }
  }

  // DOCX validation

  if (
    ext.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    if (!(uint8[0] === 0x50 && uint8[1] === 0x4b)) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is corrupted or not a valid DOCX file.`,
      };
    }
    if (file.size < 2000) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is too small to be a valid DOCX file.`,
      };
    }

    try {
      const zip = new PizZip(buffer);
      const documentXml = zip.file("word/document.xml");
      if (!documentXml) {
        return {
          isValid: false,
          errorMessage: `"${file_name}" is not a valid DOCX file structure.`,
        };
      }
      const xmlContent = documentXml.asText();
      if (!xmlContent) {
        return {
          isValid: false,
          errorMessage: `"${file_name}" could not be read properly.`,
        };
      }
      const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (!textMatches || textMatches.length === 0) {
        return {
          isValid: false,
          errorMessage: `"${file_name}" contains no text (empty Word file).`,
        };
      }
      const allText = textMatches
        .map((match) => {
          return match.replace(/<w:t[^>]*>|<\/w:t>/g, "");
        })
        .join("")
        .trim();

      if (!allText || allText.length === 0) {
        return {
          isValid: false,
          errorMessage: `"${file_name}" is missing document.xml (invalid DOCX). `,
        };
      }

      if (!/[a-zA-Z0-9]/.test(allText)) {
        return {
          isValid: false,
          errorMessage: `"${file_name}" seems to have no readable text (empty DOCX).`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is corrupted or not a valid DOCX file`,
      };
    }
  }

  // PPTX validation
  if (
    ext.endsWith(".pptx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    if (!(uint8[0] === 0x50 && uint8[1] === 0x4b)) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is corrupted or not a valid PPTX file.`,
      };
    }
    if (file.size < 3000) {
      return {
        isValid: false,
        errorMessage: `"${file_name}" is too small to be a valid PPTX file.`,
      };
    }
  }

  // MIME type validation
  const isValidType =
    file.type === "text/markdown" ||
    file.name.endsWith(".md") ||
    Object.keys(allowedMimeTypes).includes(file.type);

  if (!isValidType) {
    return {
      isValid: false,
      errorMessage: `"${file_name}" has an unsupported file type.`,
    };
  }

  // Duplicate check
  if (uploadedFiles.some((uploadedFile) => uploadedFile.name === file.name)) {
    return {
      isValid: false,
      errorMessage: `File "${file_name}" already exists.`,
    };
  }

  return { isValid: true };
};

export const parseStreamEventsFromHistory = (messages: any[]) => {
  const streamEvents: any[] = [];

  for (const msg of messages) {
    if (msg.role === "assistant") {
      if (
        msg.content &&
        typeof msg.content === "string" &&
        msg.content.trim()
      ) {
        streamEvents.push({
          type: "thinking",
          text: msg.content,
        });
      }

      if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
        for (const toolCall of msg.tool_calls) {
          if (toolCall.type === "function") {
            let parsedArgs = {};
            try {
              parsedArgs = JSON.parse(toolCall.function.arguments || "{}");
            } catch {
              parsedArgs = {};
            }
            streamEvents.push({
              type: "tool_call",
              tool_call_id: toolCall.id ?? "",
              tool: toolCall.function.name ?? "",
              args: parsedArgs,
            });
          }
        }
      }
    }

    if (msg.role === "tool") {
      streamEvents.push({
        type: "tool_result",
        tool_call_id: msg.tool_call_id ?? "",
        output: msg.content ?? "",
      });
    }
  }

  return streamEvents;
};
