import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mailboxPollingInterface } from "@/app/(dashboard)/settings/mailbox-polling/data-table";

type EmailState = {
  value: mailboxPollingInterface;
};

const initialEmailState = {
  value: {
    email_id: "",
    folder: "",
    frequency: undefined,
    description: "",
    data_store: {
      storage_type: "",
      storage_bucket: "",
      mount_path: "",
      storage_folder: "",
      storage_region: "",
    },
    polling_config: {
      pdf_parsing: "",
      copy_email_data: false,
      mailbox_priority: undefined,
      split_pdf_pages: false,
      notification_recipients: [],
      send_notifications: false,
      fix_page_rotation: false,
      data_parsing: false,
      ocr_parser: false,
    },
    status: "",
    id: "",
    delta_link: "",
    task_name: "",
    created_at: "",
  } as mailboxPollingInterface,
} as EmailState;

const emailSlice = createSlice({
  name: "emailSlice",
  initialState: initialEmailState,
  reducers: {
    handleEmailData: (
      state,
      action: PayloadAction<mailboxPollingInterface>,
    ) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleEmailData } = emailSlice.actions;
export default emailSlice.reducer;
