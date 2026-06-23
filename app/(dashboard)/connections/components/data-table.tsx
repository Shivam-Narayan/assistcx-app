import DataTableLoader from "@/components/data-table-loader";
import { getIconsData } from "@/components/icon-manager/icon-render-component";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataRow } from "./data-row";

const columns = ["Name", "Created by", "Date created", "Status", "Action"];

interface ConnectionDataTableProps {
  isListLoading: boolean;
  connectionList: any[];
  onUpdateConnection: (id: string, data: Record<string, any>) => void;
  onDeleteConnection: (id: string) => void;
  onSubmitConnection: (
    formData: any,
    editingConnectionId: string | null,
  ) => Promise<boolean>;
  connectionLoading?: boolean;
  canEditConnections: boolean;
  canDeleteConnections: boolean;
}

const ConnectionDataTable = ({
  isListLoading,
  connectionList,
  onUpdateConnection,
  onDeleteConnection,
  onSubmitConnection,
  connectionLoading,
  canEditConnections,
  canDeleteConnections,
}: ConnectionDataTableProps) => {
  const IconsList = getIconsData("ai_icons");

  if (isListLoading) {
    return <DataTableLoader />;
  }

  const INTEGRATION_ICONS: Record<
    string,
    { type: "img" | "svg"; value: string }
  > = {
    outlook: { type: "img", value: "/integration-icons/outlook.svg" },
    aws_s3: { type: "img", value: "/integration-icons/aws.svg" },
    openai: { type: "svg", value: IconsList["openai"] },
    local: { type: "svg", value: IconsList["local"] },
  };

  return (
    <Card className="p-0 gap-0">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((header, index) => (
              <TableHead className="p-3" key={index}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {connectionList.map((rowItem: any) => {
            const icon =
              INTEGRATION_ICONS[rowItem.provider_key] ||
              INTEGRATION_ICONS["local"];
            return (
              <DataRow
                key={rowItem.id}
                rowItem={rowItem}
                icon={icon}
                onUpdateConnection={onUpdateConnection}
                onDeleteConnection={onDeleteConnection}
                onSubmitConnection={onSubmitConnection}
                connectionLoading={connectionLoading}
                canEditConnections={canEditConnections}
                canDeleteConnections={canDeleteConnections}
              />
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ConnectionDataTable;
