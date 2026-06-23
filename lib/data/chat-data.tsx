import { FeedbackOption } from "@/app/assistant/chat/_components/types";

export const feedbackOptions: FeedbackOption[] = [
  {
    id: "inaccurate",
    label: "Inaccurate",
    icon: "AlertCircle",
  },
  {
    id: "out-of-date",
    label: "Out of date",
    icon: "Clock",
  },
  {
    id: "too-short",
    label: "Too short",
    icon: "MinusCircle",
  },
  {
    id: "too-long",
    label: "Too long",
    icon: "PlusCircle",
  },
  {
    id: "harmful",
    label: "Harmful or offensive",
    icon: "ShieldAlert",
  },
  {
    id: "wrong-sources",
    label: "Wrong sources",
    icon: "Link2",
  },
];
export const guidelineData = `
## Web Search
- Web Search is **enabled by default** when no context is selected.
- Can be used **alongside Knowledge** for broader results.

## Knowledge
- Select a **Knowledge Collection** to search within your curated data.
- You can use **Web Search together** with Knowledge.

## Files
- Attach up to **5 files** for the assistant to reference.
- **Knowledge and Files are mutually exclusive** — selecting one clears the other.
`;

export const TaskData = [
  {
    id: "task-1",
    title: "Daily stock market updated",
    thread_metadata: {
      title: "Daily stock market updated",
      created_at: "2025-06-25T09:59:00Z",
      updated_at: "2025-06-25T10:00:00Z",
    },
    user_id: "user-1",
    is_archived: false,
    next_run_at: "2025-06-25T10:30:00Z",
    last_run_at: "2025-06-25T10:00:00Z",
    history: [
      {
        id: "history-1",
        created_at: "2025-06-25T09:59:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task created",
        title: "Task created",
      },
      {
        id: "history-2",
        created_at: "2025-06-25T10:00:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task updated",
        title: "Task updated",
      },
    ],
    scheduleType: "weekly",
    dayOfWeek: "Monday",
    time: "18:10",
    prompt:
      "Provide a weekly status report on the project, including key milestones, challenges faced, and next steps.",
    // attchment: [
    //   {
    //     id: "col_001",
    //     name: "Project Documents",
    //     description: "All documents related to the project.",
    //   },
    //   {
    //     id: "col_002",
    //     name: "Meeting Notes",
    //     description: "Notes from all project meetings.",
    //   },
    // ],
  },
  {
    id: "task-2",
    title: "Weekly project status report",
    thread_metadata: {
      title: "Weekly project status report",
      created_at: "2025-06-24T15:25:00Z",
      updated_at: "2025-06-24T15:26:00Z",
    },
    user_id: "user-2",
    is_archived: false,
    next_run_at: "2025-06-24T16:00:00Z",
    last_run_at: "2025-06-24T15:30:00Z",
    scheduleType: "weekly",
    dayOfWeek: "Monday",
    history: [
      {
        id: "history-1",
        created_at: "2025-06-25T09:59:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task created",
        title: "Stock market update",
      },
      {
        id: "history-2",
        created_at: "2025-06-25T10:00:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task updated",
        title: "War report on israeal and palestine",
      },
      {
        id: "history-3",
        created_at: "2025-06-25T10:00:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task completed",
        title: "indian cricket team match update",
      },
      {
        id: "history-4",
        created_at: "2025-06-25T10:00:00Z",
        updated_at: "2025-06-25T10:00:00Z",
        content: "Task updated",
        title: "india pakistan war update",
      },
    ],
    prompt:
      "Provide a weekly status report on the project, including key milestones, challenges faced, and next steps.",
    collections: [
      {
        id: "aa1d0547-3f4a-4aae-ac22-60b4a996bdab",
        name: "Sample collection 1",
        description: "this is a sample connection",
        index_name: "sample_collection_1_oune",
      },
      {
        id: "238e975e-33d0-460b-bd4a-7cfe1c1ab93f",
        name: "cvdvsdvsdv",
        description: "dvsdbgjtyw",
        index_name: "cvdvsdvsdv_vyxo",
      },
    ],
    time: "11:10",
  },
];

export const TaskSuggestions = [
  {
    title: "Daily Industry News Brief",
    description:
      "Get a concise summary of the latest developments in your industry delivered every morning.",
    schedule: "Daily at 9:00 AM",
    tab: "daily",
    time: "09:00",
    prompt:
      "Summarize the most important industry news and developments from the past 24 hours. Include key trends, notable company announcements, and any regulatory changes that could impact business operations.",
  },
  {
    title: "Weekly Competitor Analysis",
    description:
      "Receive a weekly roundup of competitor activities, product launches, and market positioning.",
    schedule: "Mondays at 8:00 AM",
    tab: "weekly",
    time: "08:00",
    dayOfWeek: "Monday",
    prompt:
      "Provide a weekly analysis of key competitor activities including product updates, pricing changes, marketing campaigns, partnerships, and any public statements or press releases from the past week.",
  },
];
