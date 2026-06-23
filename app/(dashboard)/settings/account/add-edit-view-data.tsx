"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  capitalizeMessage,
  errorMessageHandler,
  getCardHeaderTitle,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  companyInfoSchema,
  CompanyInfoType,
} from "@/lib/schemas/settings/accounts-schemas";
import { handleSpaceValidation } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as countryList from "react-select-country-list";

const AddEditViewDataPage = ({
  isOrganizationUpdate,
  getOrganizationsDetails,
}: {
  isOrganizationUpdate: boolean;
  getOrganizationsDetails: () => Promise<any>;
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const [organizationDetails, setOrganizationDetails] = useState<any>({});
  const [issaveFormLoading, setSaveFormLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const options = useMemo(() => countryList().getData(), []);

  const form = useForm<CompanyInfoType>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: "",
      email: "",
      city: "",
      website: "",
      country: "",
      postal_code: "",
    },
    mode: "onChange",
  });

  const fetchOrg = useCallback(async () => {
    if (!loading) {
      setLoading(true);
      const data = await getOrganizationsDetails();
      setOrganizationDetails(data);
      setLoading(false);
    }
  }, [getOrganizationsDetails, loading]);

  async function onSubmit(values: CompanyInfoType) {
    if (loading) return;
    const dataModal: any = {
      name: values.companyName,
      tenant_code: organizationDetails.tenant_code,
      address: {
        city: values.city,
        country: values.country,
        postal_code: values.postal_code,
      },
      contact_info: {
        email: values?.email?.trim().toLowerCase(),
        website: values.website,
      },
    };

    try {
      setSaveFormLoading(true);
      const result = await axiosAuth.patch(url.UPDATE_ORGANIZATION, dataModal);
      if (result?.status === 200) {
        successMessageHandler("Organization update successfully");
        addCompanyInfo();
      }
    } catch (error: any) {
      if (error.response?.status === url.WHITESPACE_INPUT_ERROR_CODE) {
        if (
          error?.response?.data?.detail &&
          Array.isArray(error.response.data.detail)
        ) {
          errorMessageHandler(
            capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
              " : " +
              getCardHeaderTitle(error?.response?.data?.detail[0]?.loc[1]),
          );
        }
      } else {
        errorMessageHandler(error);
      }
    } finally {
      setSaveFormLoading(false);
    }
  }

  const ViewCompanyInfo = useMemo(() => {
    const contactInfo = organizationDetails?.contact_info || {};
    const address = organizationDetails?.address || {};

    return [
      { label: "Company Name", value: organizationDetails?.name || "" },
      { label: "Email ID", value: contactInfo?.email?.toLowerCase() || "" },
      { label: "City", value: address?.city || "" },
      { label: "Country", value: address?.country || "" },
      { label: "Postal code", value: address?.postal_code || "" },
      { label: "Website", value: contactInfo?.website || "" },
    ];
  }, [organizationDetails]);

  const addCompanyInfo = () => {
    setIsEdit((prev) => !prev);
    fetchOrg();
  };

  useEffect(() => {
    fetchOrg(); // initial load
  }, [fetchOrg]);

  useEffect(() => {
    if (isEdit && organizationDetails?.name) {
      const contactInfo = organizationDetails?.contact_info || {};
      const address = organizationDetails?.address || {};
      form.reset({
        companyName: organizationDetails?.name || "",
        email: contactInfo?.email?.toLowerCase() || "",
        city: address?.city || "",
        postal_code: address?.postal_code || "",
        country: address?.country || "",
        website: contactInfo?.website || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, organizationDetails]);

  return (
    <div className="flex justify-center pb-4">
      <Card className="w-160 p-0 gap-0">
        <CardHeader className="px-4 py-4!">
          <CardTitle className="flex flex-row justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary shrink-0">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">Company Information</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Manage your organization's details and contact information
                </p>
              </div>
            </div>
            {isOrganizationUpdate &&
              (!isEdit ? (
                <div
                  className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                  onClick={addCompanyInfo}
                >
                  <Pencil size={18} />
                </div>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={addCompanyInfo}
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    size="sm"
                    className="cursor-pointer"
                    disabled={issaveFormLoading}
                  >
                    {issaveFormLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              ))}
          </CardTitle>
        </CardHeader>

        {!isEdit && (
          <CardContent className="pb-2 flex flex-col divide-y">
            {ViewCompanyInfo.map((row, index) => (
              <div key={index} className="flex items-center px-4 py-2.5">
                <div className="w-56 shrink-0 text-sm text-muted-foreground">
                  {row.label}
                </div>
                {row.label === "Website" && row.value ? (
                  <Link href={row.value} target="_blank">
                    <span className="text-sm font-medium underline">
                      {row.value}
                    </span>
                  </Link>
                ) : (
                  <span className="text-sm font-medium">
                    {row.value || (
                      <span className="text-muted-foreground italic font-normal">
                        Not set
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        )}

        {isEdit && (
          <CardContent className="pb-6">
            <Form {...form}>
              <form className="space-y-4">
                {[
                  {
                    name: "companyName",
                    label: "Company Name",
                    disabled: true,
                  },
                  { name: "email", label: "Email" },
                  { name: "city", label: "City" },
                  { name: "country", label: "Country" },
                  { name: "postal_code", label: "Postal code" },
                  { name: "website", label: "Website" },
                ].map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          {f.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter ${f.label.toLowerCase()}`}
                            {...field}
                            disabled={f.disabled}
                            maxLength={80}
                            onKeyDown={handleSpaceValidation}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AddEditViewDataPage;
