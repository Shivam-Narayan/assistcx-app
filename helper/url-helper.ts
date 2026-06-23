export const WHITESPACE_INPUT_ERROR_CODE = 422;

// Tools page
export const CREATE_TOOLS = "/agent-tools";
export const LIST_TOOLS = "/agent-tools";
export const UPDATE_TOOLS = "/agent-tools";
export const SEARCH_TOOLS = "/agent-tools/search";
export const FILTER_TOOLS = "/agent-tools";
export const GET_TOOL_FILTER_LIST = "/agent-tools/filters";

//setting mailbox-polling
export const LIST_MAILBOX_POLLING = "/pollings";
export const ADD_MAILBOX_POLLING = "/pollings";
export const STOP_MAILBOX_POLLING = "/pollings"; // With identifier
export const START_MAILBOX_POLLING = "/pollings";
export const DELETE_MAILBOX_POLLING = "/pollings";
export const UPDATE_MAILBOX_POLLING = "/pollings";
export const SEARCH_MAILBOX_POLLING = "/pollings/search";
export const LIST_MAILBOX_AND_INTENT_CLASS_LIST = "/emails/filters";
export const DOWNLOAD_MAILBOX_ATTACHMENT = "/attachments";
export const RETRY_TASK = "/emails";

//Setting -> manage-api-key
export const LIST_API_KEY = "/api-keys";
export const SEARCH_API_KEY = "/api-keys/search";
export const ADD_API_KEY = "/api-keys";
export const DELETE_API_KEY = "/api-keys";
export const UPDATE_API_KEY = "/api-keys";

//Setting -> class-group
export const GET_CLASS_GROUP_LIST = "/class-groups";
export const POST_CLASS_GROUP_LIST = "/class-groups";
export const DELETE_CLASS_GROUP = "/class-groups";
export const SEARCH_CLASS_GROUP = "/class-groups/search";

//setting -> user-group
export const GET_USER_GROUP_LIST = "/user-groups";
export const POST_USER_GROUP = "/user-groups";
export const DELETE_USER_GROUP = "/user-groups";
export const SEARCH_USER_GROUP = "/user-groups/search";

// setting -> data-template
export const LIST_DATA_TEMPLATE = "data-templates";
export const ADD_DATA_TEMPLATE = "data-templates";
export const UPDATE_DATA_TEMPLATE = "data-templates";
export const DELETE_DATA_TEMPLATE = "data-templates";
export const SEARCH_DATA_TEMPLATE = "/data-templates/search";
export const DATA_TEMPLATES_BUILDER = "/data-templates/build-schema";
export const LIST_TEAM_MEMBERS = "/users";
export const SEARCH_TEAM_MEMBERS = "/users/search";
export const ADD_TEAM_MEMBERS = "/users";
export const UPDATE_TEAM_MEMBERS = "/users";
export const DELETE_TEAM_MEMBERS = "/users";
export const ACTIVATE_DEACTIVATE_USER = "/users";

//setting -> llm-providers
export const LIST_PROVIDERS = "integrations/llm-providers";
export const ACTIVATE_LLM_PROVIDER = "/platform/llm";
export const LIST_AGENT_LLMS = "integrations/llm-models";
export const DEACTIVATE_LLM_PROVIDER = "/platform/llm";
// Agents
export const LIST_AGENTS = "/agents";
export const LIST_AGENTS_PERVIEW = "/agents/preview";
export const SEARCH_AGENTS = "/agents/search";
export const ADD_AGENTS = "/agents";
export const UPDATE_AGENTS = "/agents";
export const ICON_LIST = "/icons";
export const AGENTS_PREVIEW = "/agents/preview";
export const AGENTS_EXPORT = "/agents";
export const AGENTS_ARCHIVE = "/agents/archive";
export const AGENTS_IMPORT = "/agents/import";
export const AGENT_DETAILS = "/agents";
export const AGENT_MOUNT_PATHS = "/storage-mounts";
export const AGENT_BUILDER = "agents/build";
export const GET_ALL_TOOL_lIST = "/agent";

// Agents Tools
export const AGENT_TOOLS_LIST = "/agent-tools";
export const DELETE_AGENT_TOOLS_LIST = "/agent-tools";
export const AGENT_TOOLS_TEST = "/agent-tools";

//Mailbox
export const LIST_MAILBOX = "/emails";
export const TASK_PROGESS_ACTIVITY = "/task-progress";
export const MAILBOX_ATTACHMENTS_DETAILS = "/emails";
export const MAILBOX_OUTPUT_DETAILS = "/agent-tasks";
export const AGENT_TASKS_STREAM = "/agent-tasks";
export const MAILBOX_PAGE_SIZE = 10;
export const DOWNLOAD_ATTACHMENT = "/attachments";
export const EMAIL_TASK_LIST = "/emails";
export const EMAILS_EXPORT = "/emails/export";
export const AGENT_TASK_DETAILS = "/agent-tasks";
export const AGENT_TASK_CONTINUE = "/agent-tasks";
export const CHANGE_TASK_STATUS = "/agent-tasks/status";
export const AGENT_TASK_EXPORT = "/agent-tasks/export";
export const ARCHIVE_EMAILS = "/emails/archive";
export const DELETE_EMAILS = "/emails/bulk";
export const REPROCESS_ATTACHMENT = "/attachments";
export const TOKEN_USAGE = "/task-outputs";
export const RESUME_TASK = "/agent-tasks";

//tags
export const TAGS_LIST = "/tags";
export const SEARCH_TAGS = "/tags/search";

// issues
export const ISSUES_LIST = "/issues";
export const ISSUES_SEARCH = "/issues/search";
export const USERS_LIST = "/issues/filters";
export const USERS_SEARCH = "/issues/filters/search";
export const ISSUE_ADD = "/issues";
export const ADD_COMMENTS = "/comments";

//Sidenav
export const USER_DETAILS = "/profile";
export const USER_PROFILE_EDIT = "/profile";
export const USER_PROFILE_UPDATE_PASSWORD = "/profile/password";

//Accounts
export const GET_ORGANIZATION_DETAILS = "/organizations/current";
export const CREATE_ORGANIZATION = "/organizations";
export const UPDATE_ORGANIZATION = "/organizations/current";
export const AGENT_LLMS = "/integrations/llm-models";
export const POST_CONFIGURATION = "/configurations";
export const GET_CONFIGURATION = "/configurations";
export const AGENT_SETTING_LLMS = "/integrations/llm-models";

//Dashboard
export const DASHBOARD_CARD_COUNTS = "/task-counts";
export const DASHBOARD_EMAIL_MONTHLY_STATES = "/task-volume-stats";
export const DASHBOARD_AGENT_STATES = "/task-agent-stats";
export const DASHBOARD_RECENT_ACTIVITY = "/emails";
export const ARCHIVE_EMAIL = "/emails/archive";
export const DASHBOARD_EMAIL = "/count-by-mailbox";
export const EMAIL_DELETE = "/emails/bulk";

//User Roles
export const USER_ROLES = "/user-roles";
export const DELETE_USER_ROLES = "/user-roles";
export const GET_PERMISSIONS = "/permissions";
export const GET_PERMISSIONS_DATA_ACCESS = "/permissions/data-access";
export const GET_ROLES_SEARCH = "/user-roles/search";

// Knowledge
export const CREATE_COLLECTION = "/collections";
export const GET_COLLECTION_LIST = "/collections";
export const UPDATE_COLLECTION = "/collections";
export const DELETE_COLLECTION = "/collections";
export const SEARCH_COLLECTION = "/collections/search";
export const UPLOAD_DATA_FILE = "/data-files";
export const RENAME_DATA_FILE_NAME = "/data-files";
export const DELETE_DATA_FILE = "/data-files";
export const DOWNLOAD_DATA_FILE = "/data-files";
export const RE_INDEX = "/data-files";
export const SMART_FILED = "/smart-fields";
export const KNOWLEDGE_TOPIC = "/Knowledge-topics";
export const GET_EMBEDDING_MODELS = "/embedding-models";

// Integration -> All Integrations
export const GET_INTEGRATIONS_LIST = "/integrations";
export const SEARCH_INTEGRATIONS = "/integrations/search";
export const ACTIVATE_INTEGRATION = "/integrations";
export const DEACTIVATE_INTEGRATION = "/integrations";
export const INTEGRATION_TAGS = "/integrations/tags";
export const TOOL_OR_AGENT_LLM_LIST = "/integrations";
export const INTEGRATION_CREDENTIALS = "/integrations";

// Change Log
export const CHANGE_LOG = "changelog";

// current version
export const CURRENT_VERSION = "/version";

//sharepoint

export const SHARE_POINT_SITE = "sharepoint/sites";
export const SHARE_POINT_SITE_FILE = "sharepoint/files/import";

// Auth
export const AUTH_SETTINGS = "/auth/settings";
export const AUTH_DISCOVER = "/auth/discover";

// Logout
export const LOGOUT = "/logout";

//access-denied
export const ACCESS_DENIED = "/access-denied";

// tags
export const GET_ALL_TAGS = "/tags";
export const GET_TAG_BY_ID = "/tags";
export const CREATE_TAG = "/tags";
export const TAGS_SEARCH = "/tags/search";
export const DELETE_TAG = "/tags";
export const UPDATE_TAG = "/tags";

// version histories
export const VERSION_HISTORIES = "/version-histories";
export const InDIVidual_VERSION_HISTORY = "/version-history";

// Connections
export const CONNECTIONS = "/connections";
export const PROVIDER = "/providers";
export const AUTH_SCHEMA_CATALOG = "/auth-schema-catalog";


// Data Tables
export const DATA_TABLES = "/data-tables";
export const DATA_TABLES_SEARCH = "/data-tables/search";
