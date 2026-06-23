export const WHITESPACE_INPUT_ERROR_CODE = 422;

export const LOGIN = "/login";
export const ACCESS_DENIED = "/access-denied";
export const DASHBOARD = "/assistant";
export const HISTORY = "/assistant/history";
export const MY_FILES = "/assistant/files";
export const CHAT = "/assistant/chat";
export const KNOWLEDGE = "/assistant/knowledge";
export const TASK = "/assistant/task";
export const TOOLS = "/assistant/tools";
export const PROFILE = "/assistant/profile";
export const ADMIN = "/admin";
export const SETTINGS = "/settings";
export const NOTIFICATIONS = "/notifications";
export const LOGOUT = "/logout";

// -> Chat
export const CHAT_THREAD = "/assistant/chat-threads";
export const CHAT_STREAM_RESEARCH = "/research/stream";
export const CHAT_FEEDBACK = "/assistant/chat-messages";
// -> History
export const LIST_HISTORY = "/assistant/chat-threads";
export const SEARCH_HISTORY = "/assistant/chat-threads/search";
export const HISTORY_DELETE = "/assistant/chat-threads";
export const HISTORY_ARCHIVE = "/assistant/chat-threads";

// --> Knowledge Collections
export const LIST_COLLECTIONS = "/assistant/collections";
export const SEARCH_COLLECTIONS = "/assistant/collections/search";
export const DETAIL_COLLECTION = "/assistant/collections";
export const DETAIL_SEARCH_COLLECTION = "/assistant/collections/search";

// --> My files / Attchment files
export const LIST_FILES = "/assistant/private-data-collection";
export const SEARCH_FILES = "/assistant/private-data-collection-search";
export const DELETE_FILES = "/assistant/data-files";
export const UPLOAD_FILES = "/assistant/private-data-files";
export const DOWNLOAD_FILES = "/assistant/data-files"; // With identifier ID  `/rag/data-files/${source?.metadata?.file_uuid}/download`

// --> Task
export const LIST_TASKS = "/assistant/tasks";
export const SEARCH_TASKS = "/assistant/tasks/search";
export const DETAIL_TASK = "/assistant/tasks";
export const DELETE_TASK = "/assistant/tasks";
export const TASK_STATUS = "/assistant/tasks";
export const ADD_TASK = "/assistant/tasks";
export const EDIT_TASK = "/assistant/tasks";
export const TASK_HISTORY = "/assistant/tasks";

//Icon
export const ICON_LIST = "/icons";

//Profile
export const USER_DETAILS = "/profile";
export const USER_PROFILE_EDIT = "/profile/edit";
export const USER_PROFILE_UPDATE_PASSWORD = "/profile/update-password";
