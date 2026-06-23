import { useIssueOperation } from "@/app/(dashboard)/issues/hook/useIssueOpration";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  addIssueFormSchema,
  AddIssueFormType,
} from "@/lib/schemas/inbox-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IssueFormContent } from "./issue-form-content";
import { SearchAndAssignIssue } from "./issue-list";

interface AddIssueModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailData?: any;
  refreshIssues?: () => void;
  editIssue?: any;
  refreshIssueDetails?: (issueId: string) => void;
  existingIssuesList?: any;
}

export const AddIssueModal = ({
  isOpen,
  onOpenChange,
  emailData,
  refreshIssues,
  editIssue,
  refreshIssueDetails,
  existingIssuesList,
}: AddIssueModalProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [loadingAddIssue, setLoadingAddIssue] = useState<boolean>(false);
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [tagsSearch, setTagsSearch] = useState("");
  const [debouncedTagsSearch] = useDebounce(tagsSearch, 300);
  const { allTagsList } = useIssueOperation();
  const [activeTab, setActiveTab] = useState<"search" | "create">("search");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 300);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isIssueLoading, setIsIssueLoading] = useState(false);
  const [issuePage, setIssuePage] = useState(1);
  const [issueHasMore, setIssueHasMore] = useState(true);
  const [isIssueFetchingMore, setIsIssueFetchingMore] = useState(false);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [loadingAssingIssue, setLoadingAssingIssue] = useState(false);

  const tagQueryParams = {
    pageSize: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const issueQueryParams = {
    pageSize: 10,
    sortBy: "updated_at",
    sortOrder: "desc",
  };

  const issueForm = useForm<AddIssueFormType>({
    resolver: zodResolver(addIssueFormSchema),
    defaultValues: {
      title: "",
      tags: [],
      description: "",
    },
    mode: "onChange",
  });

  const handleClose = () => {
    issueForm.reset();
    onOpenChange(false);
    setSearchText("");
    setSelectedIssue(null);
  };
  const isEditMode = Boolean(editIssue);

  const handleSubmitForm = async (values: AddIssueFormType) => {
    setLoadingAddIssue(true);
    const basePayload = {
      title: values.title,
      description: values.description,
      tag_ids: values.tags.map((tag) => tag.value),
    };

    const payload = isEditMode
      ? basePayload
      : {
          ...basePayload,
          agent_task_ids: [emailData?.id],
        };

    try {
      const result = isEditMode
        ? await axiosAuth.patch(`/issues/${editIssue.id}`, payload)
        : await axiosAuth.post(url.ISSUE_ADD, payload);

      if (result.status === 200) {
        successMessageHandler(
          isEditMode
            ? "Issue updated successfully"
            : "Issue created successfully",
        );
        refreshIssues?.();
        if (isEditMode && refreshIssueDetails) {
          refreshIssueDetails(editIssue.id);
        }
        handleClose();
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to create issue",
      );
    } finally {
      setLoadingAddIssue(false);
    }
  };

  const getTagsList = async (keyword?: string) => {
    if (!loading) {
      setLoadingTags(true);

      let API_ENDPOINT_PATH: string = "";
      if (keyword) {
        API_ENDPOINT_PATH = `${url.SEARCH_TAGS}?keyword=${keyword}&page=${page}&page_size=${tagQueryParams.pageSize}&sort_by=${tagQueryParams.sortBy}&sort_order=${tagQueryParams.sortOrder}`;
      } else {
        API_ENDPOINT_PATH = `${url.TAGS_LIST}?page=${page}&page_size=${tagQueryParams.pageSize}&sort_by=${tagQueryParams.sortBy}&sort_order=${tagQueryParams.sortOrder}`;
      }
      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response.status === 200) {
          const newData = response.data || [];
          setTagsList((prev) => {
            const merged = page === 1 ? newData : [...prev, ...newData];
            const unique = merged.filter(
              (item: any, index: any, self: any) =>
                index === self.findIndex((t: any) => t.id === item.id),
            );

            return unique;
          });

          if (newData.length < tagQueryParams.pageSize) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err: any) {
        errorMessageHandler("Failed to fetch tags");
      } finally {
        setLoadingTags(false);
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    getTagsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTagsSearch, loading, page]);

  const tagItems = tagsList.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

  useEffect(() => {
    if (!isOpen) return;

    if (editIssue) {
      issueForm.reset({
        title: editIssue.title ?? "",
        description: editIssue.description ?? "",
        tags:
          editIssue.tag_ids?.map((id: string) => {
            const matchedTag = allTagsList.find((t) => t.value === id);
            return {
              value: id,
              label: matchedTag?.label ?? "",
            };
          }) ?? [],
      });
    } else {
      issueForm.reset({
        title: "",
        description: "",
        tags: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editIssue]);

  useEffect(() => {
    if (editIssue) {
      setActiveTab("create");
    }
  }, [editIssue]);
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("search");
    }
  }, [isOpen]);

  const getAllIssueList = async (pageToLoad = 1) => {
    if (isIssueFetchingMore) return;

    pageToLoad === 1 ? setIsIssueLoading(true) : setIsIssueFetchingMore(true);

    const params = new URLSearchParams();

    params.append("page", pageToLoad.toString());
    params.append("page_size", issueQueryParams.pageSize.toString());
    params.append("sort_by", issueQueryParams.sortBy);
    params.append("sort_order", issueQueryParams.sortOrder);

    params.append("status", "ACTIVE");

    // search
    if (debouncedSearch?.trim()) {
      params.append("keyword", debouncedSearch);
    }

    const API_ENDPOINT_PATH = debouncedSearch
      ? `${url.ISSUES_SEARCH}?${params.toString()}`
      : `${url.ISSUES_LIST}?${params.toString()}`;

    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);

      if (result.status === 200) {
        const newData = result.data || [];

        setIssuesList((prev) =>
          pageToLoad === 1 ? newData : [...prev, ...newData],
        );

        if (newData.length < issueQueryParams.pageSize) {
          setIssueHasMore(false);
        } else {
          setIssueHasMore(true);
        }
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issues");
    } finally {
      setIsIssueLoading(false);
      setIsIssueFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab !== "search") return;
    if (loading) return;

    setIssuesList([]);
    setIssuePage(1);
    setIssueHasMore(true);
    getAllIssueList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, debouncedSearch, loading]);

  const handleAssignIssue = async (data: any) => {
    setLoadingAssingIssue(true);
    const Payload = {
      title: data.title,
      description: data.description,
      tag_ids: data.tag_ids,
      agent_task_ids: [emailData?.id],
    };
    try {
      const result = await axiosAuth.patch(`/issues/${data.id}`, Payload);

      if (result.status === 200) {
        successMessageHandler("Issue created successfully");
        refreshIssues?.();
        handleClose();
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to create issue",
      );
    } finally {
      setLoadingAssingIssue(false);
    }
  };

  const existingIssueIds = new Set(
    existingIssuesList?.map((issue: any) => issue.id) ?? [],
  );

  const finalIssueList = issuesList.filter((issue) => {
    const lastStatus =
      issue.progress?.length > 0
        ? issue.progress[issue.progress.length - 1].status
        : null;

    return !existingIssueIds.has(issue.id) && lastStatus !== "resolved";
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          issueForm.reset({
            title: "",
            description: "",
            tags: [],
          });
        }
        onOpenChange(open);
      }}
    >
      <DialogContent
        className={`flex flex-col sm:max-w-xl ${!isEditMode ? "h-[500px] overflow-hidden" : ""} p-0 gap-2`}
        onCloseAutoFocus={handleClose}
      >
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background rounded-t-lg">
          <div className="w-full">
            <DialogTitle>
              {isEditMode ? "Edit Issue" : "Taks Issue"}
            </DialogTitle>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        {!isEditMode && (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "search" | "create")
              }
              className="w-full px-4"
            >
              <TabsList className="w-full px-1 py-1 h-auto">
                <TabsTrigger
                  value="search"
                  className="w-full px-4 py-2 cursor-pointer"
                >
                  Existing Issue
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="w-full px-4 py-2 cursor-pointer"
                >
                  Create New
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs
              value={activeTab}
              className="flex-1 flex flex-col w-full px-4 pb-4 overflow-hidden"
            >
              <TabsContent
                value="search"
                className="mt-4 flex-1 overflow-y-auto"
              >
                <SearchAndAssignIssue
                  searchText={searchText}
                  setSearchText={setSearchText}
                  issues={finalIssueList}
                  selectedIssue={selectedIssue}
                  setSelectedIssue={setSelectedIssue}
                  onAssign={() => handleAssignIssue(selectedIssue)}
                  loadingAssingIssue={loadingAssingIssue}
                  loadMore={() => {
                    if (issueHasMore && !isIssueFetchingMore) {
                      const nextPage = issuePage + 1;
                      setIssuePage(nextPage);
                      getAllIssueList(nextPage);
                    }
                  }}
                  hasMore={issueHasMore}
                  isFetchingMore={isIssueFetchingMore}
                  isIssueLoading={isIssueLoading}
                />
              </TabsContent>

              <TabsContent
                value="create"
                className="px-1 space-y-4 overflow-y-auto"
              >
                <IssueFormContent
                  issueForm={issueForm}
                  handleSubmitForm={handleSubmitForm}
                  tagItems={tagItems}
                  loadingAddIssue={loadingAddIssue}
                  loadingTags={loadingTags}
                  tagsSearch={tagsSearch}
                  setTagsSearch={setTagsSearch}
                  page={page}
                  setPage={setPage}
                  hasMore={hasMore}
                  isFetchingMore={isFetchingMore}
                  setIsFetchingMore={setIsFetchingMore}
                  isEditMode={false}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {isEditMode && (
          <div className="px-4 pb-4">
            <IssueFormContent
              issueForm={issueForm}
              handleSubmitForm={handleSubmitForm}
              tagItems={tagItems}
              loadingAddIssue={loadingAddIssue}
              loadingTags={loadingTags}
              tagsSearch={tagsSearch}
              setTagsSearch={setTagsSearch}
              page={page}
              setPage={setPage}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              setIsFetchingMore={setIsFetchingMore}
              isEditMode
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddIssueModal;
