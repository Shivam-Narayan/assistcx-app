export interface FileStatus {
  status:
    | "QUEUED"
    | "PROCESSING"
    | "PARSING"
    | "INDEXING"
    | "SUCCESSFUL"
    | string;
  timestamp: string;
}

export interface FileMetadata {
  file_path: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  md5_hash: string | null;
  source_type: string;
  file_metadata: FileMetadata;
  acl_metadata: unknown;
  status: FileStatus[];
  last_synced: string | null;
  collection_id: string;
  created_at: string;
  updated_at: string;
}
export interface DataFiles {
  data_files: FileItem[];
}

export interface FileDetailProps {
  file: FileItem;
  isSelected?: boolean;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleDelete: (id: string) => void;
  isDeleting: string | null;
  IconComponent?: React.ElementType;
  iconData?: any;
  isConfirming?: boolean;
}

export interface FileUploadProps {
  setIsPopupOpen: (isOpen: boolean) => void;
  onUploadSuccess?: () => void;
}

export interface UploadFile {
  name: string;
  error?: string;
}

export interface SuccessfulUpload {
  data_files: Array<{ name: string }>;
}

export interface UseFileUploadOptions {
  setIsPopupOpen: (isOpen: boolean) => void;
  onUploadSuccess?: () => void;
}
