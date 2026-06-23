import { DataFile, KnowledgeItem } from "../../chat/_components/types";

export interface UseKnowledgeDetailListParams {
  open: boolean;
  collectionId: string;
  pageSize?: number;
}
export interface ApiResponse {
  data_collections: KnowledgeItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface FileCardProps {
  collection: KnowledgeItem;
}

export interface fileViewerProps {
  fileData: DataFile | null;
  enableKnowledgeFetching?: boolean;
}
export interface KnowledgeDetailHeaderProps {
  name: string;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onClose: () => void;
}

export interface JsonViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  id: string;
}
export interface MobileFileDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: DataFile | null;
}

export interface FileCardResponsiveProps {
  filteredData: DataFile[];
  onSelectFile: (file: DataFile) => void;
  selectedFile: DataFile | null;
  isMobile: boolean;
  setIsFileDetailOpen: (open: boolean) => void;
}
