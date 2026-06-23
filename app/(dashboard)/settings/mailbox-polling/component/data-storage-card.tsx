import CommonCardComponent from "@/components/common-card-component";
import DataAndStorageCard from "@/components/data-and-storage-card";
import { Badge } from "@/components/ui/badge";
import { STORAGE_TYPES } from "@/lib/constants";
import { MailboxPollingType } from "@/lib/schemas/settings/mailbox-polling-schema";

interface DataStorageProps {
  userEvents: any;
  form: any;
  mountPaths: any;
  storageFolder: any;
  storageBucket: any;
  storageType: any;
}

const DataStorageCard = ({
  userEvents,
  form,
  mountPaths,
  storageFolder,
  storageBucket,
  storageType,
}: DataStorageProps) => {
  return (
    <CommonCardComponent cardTitle="Data and Storage">
      {(userEvents === "addMailboxPolling" ||
        userEvents === "editMailboxPolling") && (
        <div className="p-4">
          <DataAndStorageCard<MailboxPollingType>
            handleStorageType={form}
            mountPaths={mountPaths}
            isEditable={true}
          />
        </div>
      )}

      {userEvents === "viewMailboxPolling" && storageType && (
        <div className="py-2 flex flex-col divide-y divide-dashed">
          {storageType && (
            <div className="flex flex-row px-4 py-2.5">
              <div className="w-2/5 pr-4 font-semibold">
                <Badge variant="secondary" className="text-sm">
                  Storage Type
                </Badge>
              </div>
              <div className="w-3/5 flex gap-4 text-sm">
                {storageType === STORAGE_TYPES.LOCAL
                  ? "Mounted Storage"
                  : "Remote Bucket"}
              </div>
            </div>
          )}

          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                Data Folder
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4 text-sm">{storageFolder}</div>
          </div>

          {storageBucket && (
            <div className="flex flex-row px-4 py-2.5">
              <div className="w-2/5 pr-4 font-semibold">
                <Badge variant="secondary" className="text-sm">
                  {storageType === STORAGE_TYPES.LOCAL
                    ? "Mount Path"
                    : " Bucket Name"}
                </Badge>
              </div>
              <div className="w-3/5 flex gap-4 text-sm">{storageBucket}</div>
            </div>
          )}
        </div>
      )}
    </CommonCardComponent>
  );
};

export default DataStorageCard;
