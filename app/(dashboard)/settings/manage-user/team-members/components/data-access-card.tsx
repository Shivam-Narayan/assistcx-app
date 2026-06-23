import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCardHeaderTitle } from "@/helper/helper-function";
import PermissionCard from "../permissions-card";

interface DataAccessProps {
  userEvents: any;
  sendUserRoleAPIModal: any;
  permissionList: any;
  permissionFormSchema: any;
  setUserRolesPermission: any;
  formType: any;
}

const DataAccessCard = ({
  userEvents,
  sendUserRoleAPIModal,
  permissionList,
  permissionFormSchema,
  setUserRolesPermission,
  formType,
}: DataAccessProps) => {
  const isView = userEvents === "viewTeamMember";
  const isEditOrAdd =
    userEvents === "addTeamMember" || userEvents === "editTeamMember";

  const shouldShowCard =
    (userEvents === "viewTeamMember" &&
      sendUserRoleAPIModal &&
      Object.keys(sendUserRoleAPIModal).length > 0) ||
    userEvents === "addTeamMember" ||
    userEvents === "editTeamMember";

  if (!shouldShowCard) return null;

  return (
    <>
      <Card className="shadow-none p-0 gap-0">
        <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex gap-3 items-center text-lg font-medium leading-none tracking-tight">
            <span>Data Access</span>
          </CardTitle>
        </CardHeader>
        {isView &&
          sendUserRoleAPIModal != null &&
          Object.keys(sendUserRoleAPIModal).length != 0 && (
            <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed">
              {Object.keys(sendUserRoleAPIModal).map((key) => (
                <div className="flex flex-row px-4 py-2.5" key={key}>
                  <div className="w-2/5 pr-4 font-semibold">
                    <Badge variant="secondary" className="text-sm">
                      {getCardHeaderTitle(key)}
                    </Badge>
                  </div>
                  <div className="w-3/5 flex gap-4">
                    {sendUserRoleAPIModal[key] &&
                      Object.keys(sendUserRoleAPIModal[key]).length > 0 &&
                      Object.entries(sendUserRoleAPIModal[key]).map(
                        ([subKey, value]) => (
                          <div key={subKey + "&" + key}>
                            <div className="flex flex-wrap grow gap-2">
                              {typeof value === "boolean" ? (
                                // Handle boolean values
                                <Badge variant="outline" className="text-sm ">
                                  {value ? "All Access" : "No Access"}
                                </Badge>
                              ) : Array.isArray(value) ? (
                                value.length === 0 ? (
                                  // Handle empty array []
                                  <Badge variant="outline" className="text-sm ">
                                    All Access
                                  </Badge>
                                ) : value.includes("") ? (
                                  // Handle array with empty string [""]
                                  <Badge variant="outline" className="text-sm ">
                                    No Access
                                  </Badge>
                                ) : (
                                  // Handle array with valid values
                                  value.map((item: any) => (
                                    <Badge
                                      key={item}
                                      variant="outline"
                                      className="text-sm"
                                    >
                                      {getCardHeaderTitle(item)}
                                    </Badge>
                                  ))
                                )
                              ) : null}
                            </div>
                          </div>
                        ),
                      )}
                  </div>
                </div>
              ))}
            </CardContent>
          )}

        {isEditOrAdd && (
          <CardContent className="flex grow flex-col gap-4 p-2 px-4 pb-4 py-6 space-y-4">
            {permissionList != null && typeof permissionList === "object" ? (
              <PermissionCard
                permissionList={permissionList}
                permissionFormSchemaModal={permissionFormSchema}
                sendUserRoleAPIModal={sendUserRoleAPIModal}
                setUserRolesPermission={setUserRolesPermission}
                formType={formType}
              />
            ) : null}
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default DataAccessCard;
