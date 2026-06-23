import { EmptyState } from "@/components/empty-state/empty-state";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor, getTimeAgo } from "@/helper/helper-function";
import { MANAGE_FILES } from "@/lib/urls";
import { formatFileSize } from "@/lib/utils";
import { openModal } from "@/redux/common/modal-slice";
import { RootState, useAppSelector } from "@/redux/store";
import { CollectionItem, IconsData } from "@/types/types";
import { BookText, ChevronRight, Files, HardDrive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { LoadingCards } from "./loading";

interface CollectionCardProps {
  isListLoading: boolean;
  iconsData: IconsData;
  setDirectEdit: (value: boolean) => void;
}

const CollectionCards = ({
  isListLoading,
  iconsData,
  setDirectEdit,
}: CollectionCardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const defaultIcon = getIconSvg("ai-book", "collection_icons");
  const collectionList = useAppSelector(
    (state: RootState) => state.collectionsReducer.collectionList,
  );

  function handleCollectionData(values: CollectionItem) {
    dispatch(openModal({ type: "view", data: values }));
  }

  function handleRouteToFiles(values: CollectionItem) {
    router.push(`${MANAGE_FILES}?collection_id=${values.id}`);
    localStorage.setItem("collection_name", values.name);
  }

  // Skeleton Loading
  if (isListLoading) {
    return <LoadingCards />;
  }

  if (!isListLoading && collectionList?.length === 0) {
    return (
      <EmptyState
        variant="fullpage"
        title="No Collection Found"
        icon={BookText}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col h-fit">
        <div className="grid gap-5 2xl:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {collectionList?.map((data, index) => (
            <Card
              className={`rounded-lg shadow-xs w-full py-4 px-4 cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col gap-4 min-h-42 relative group hover:bg-primary/5 hover:border-primary/20 `}
              key={index}
              onClick={() => {
                handleRouteToFiles(data);
              }}
            >
              <CardHeader className="shrink-0 p-0 gap-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-row items-center justify-end">
                    <div
                      className={`p-2.5 rounded-full w-fit h-fit bg-primary/10 text-primary `}
                    >
                      <div
                        className="w-full h-full flex items-stretch"
                        dangerouslySetInnerHTML={{
                          __html:
                            data.icon && iconsData?.[data.icon]
                              ? iconsData[data.icon]
                              : defaultIcon,
                        }}
                      />
                    </div>
                    <div className="flex flex-col ml-3 max-w-xs">
                      <CardTitle className="text-base text-foreground/80 truncate whitespace-pre-wrap line-clamp-1 max-w-[600px] tracking-tight">
                        {data?.name}
                      </CardTitle>
                      {/* TODO: Add updated time */}
                      <p className="text-xs text-muted-foreground">
                        Updated {getTimeAgo(data?.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="mb-[18px]">
                      <Badge
                        variant="outline"
                        className={getStatusColor(data?.availability)}
                      >
                        {data?.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between p-0 space-y-3">
                {/* Description */}
                <p className="text-wrap text-sm text-muted-foreground line-clamp-2">
                  {data?.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <Files className="h-4 w-4 text-muted-foreground " />
                      <span>{data.file_count} files</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4 text-muted-foreground " />
                      <span>{formatFileSize(data?.total_size ?? 0)}</span>
                    </div>
                  </div>

                  {/* View button */}
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCollectionData(data);
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-sm px-3 py-1.5 rounded-md 
             border  bg-background xl:opacity-0 xl:translate-x-2 xl:pointer-events-none 
             xl:group-hover:translate-x-0 xl:group-hover:opacity-100 xl:group-hover:pointer-events-auto 
             transition-all duration-300 ease-out hover:bg-muted/40 cursor-pointer"
                  >
                    View Info
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionCards;
