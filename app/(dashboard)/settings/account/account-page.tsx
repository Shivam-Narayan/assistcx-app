"use client";

import { ColorThemeSelector } from "@/app/(dashboard)/settings/account/app-color-theme-selector";
import { SettingCommonHeader } from "@/components/ui/setting-header";
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import { canEdit } from "@/lib/permissions";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { useAppSelector } from "@/redux/store";
import { useCallback, useState } from "react";
import AddEditViewDataPage from "./add-edit-view-data";
import AddEditViewPreferancePage from "./add-edit-view-preferance";
import AuthenticationCard from "./authentication-card";
import { usePreferenceSettings } from "./hook/usePreference";
import SwitchOrgCard from "./switch-org-card";

const AccountMainPage = () => {
  const preference = usePreferenceSettings();
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const { axiosAuth, loading } = useAxiosAuth();
  const [getOrgLoading, setGetOrgLoading] = useState(false);
  const [orgName, setOrgName] = useState("");

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const isOrganizationUpdate = canEdit(permissions, "organizations");
  const isRootUser = permissions.isRoot;

  const getOrganizationsDetails = useCallback(async () => {
    if (!loading) {
      try {
        setGetOrgLoading(true);
        const result = await axiosAuth.get(url.GET_ORGANIZATION_DETAILS);
        if (result?.status === 200) {
          const data = result.data.organizations;
          setOrgName(data[0]?.name || "");
          return Array.isArray(data) && data.length > 0 ? data[0] : {};
        }
        return {};
      } catch (error: any) {
        errorMessageHandler(error);
        return {};
      } finally {
        setGetOrgLoading(false);
      }
    }
  }, [axiosAuth, loading]);

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <SettingCommonHeader
            title="Account"
            infoMessage="Manage organization account on the platform"
            showSearch={false}
            showAddButton={false}
          />
        </div>
      </div>

      <div className="px-6">
        {isRootUser && (
          <SwitchOrgCard currentOrg={orgName} loading={getOrgLoading} />
        )}
        <AddEditViewPreferancePage
          isOrganizationUpdate={isOrganizationUpdate}
          preference={preference}
        />
        {isOrganizationUpdate && <AuthenticationCard />}

        <AddEditViewDataPage
          isOrganizationUpdate={isOrganizationUpdate}
          getOrganizationsDetails={getOrganizationsDetails}
        />
        <ColorThemeSelector
          isOrganizationUpdate={isOrganizationUpdate}
          configData={preference.configData}
          getConfigurationData={preference.getConfigurationData}
        />
      </div>
    </div>
  );
};

export default AccountMainPage;
