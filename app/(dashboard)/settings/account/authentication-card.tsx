"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AuthMethod = "password" | "sso" | "flexible";
type SSOProvider = "microsoft" | "google" | "oidc";

interface AuthSettings {
  auth_method: AuthMethod;
  sso_provider: SSOProvider | null;
  sso_provider_name: string | null;
  sso_client_id: string | null;
  sso_tenant_id: string | null;
  sso_well_known_url: string | null;
  sso_scopes: string | null;
  client_secret_set: boolean;
  callback_url: string | null;
}

const PROVIDER_OPTIONS = [
  { value: "microsoft", label: "Microsoft (Azure AD)" },
  { value: "google", label: "Google Workspace" },
  { value: "oidc", label: "Custom OIDC (Okta, CyberArk, etc.)" },
];

const AUTH_METHOD_LABELS: Record<AuthMethod, string> = {
  password: "Password only",
  sso: "Single Sign-On (SSO) only",
  flexible: "Password or SSO",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center px-4 py-2.5">
    <div className="w-56 shrink-0 text-sm text-muted-foreground">{label}</div>
    <div className="flex-1 text-sm font-medium">
      {value || (
        <span className="text-muted-foreground italic font-normal">
          Not configured
        </span>
      )}
    </div>
  </div>
);

const AuthenticationCard = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [settings, setSettings] = useState<AuthSettings | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [provider, setProvider] = useState<SSOProvider | "">("");
  const [providerName, setProviderName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [wellKnownUrl, setWellKnownUrl] = useState("");

  const showSSO = authMethod === "sso" || authMethod === "flexible";

  const fetchSettings = useCallback(async () => {
    if (loading) return;
    try {
      setFetching(true);
      const res = await axiosAuth.get(url.AUTH_SETTINGS);
      const data: AuthSettings = res.data;
      setSettings(data);
      resetFormState(data);
    } catch (error: any) {
      errorMessageHandler(error);
    } finally {
      setFetching(false);
    }
  }, [axiosAuth, loading]);

  const resetFormState = (data: AuthSettings) => {
    setAuthMethod(data.auth_method);
    setProvider(data.sso_provider || "");
    setProviderName(data.sso_provider_name || "");
    setClientId(data.sso_client_id || "");
    setTenantId(data.sso_tenant_id || "");
    setWellKnownUrl(data.sso_well_known_url || "");
    setClientSecret("");
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleEdit = () => {
    if (settings) resetFormState(settings);
    setIsEdit(true);
  };

  const handleCancel = () => {
    if (settings) resetFormState(settings);
    setIsEdit(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        auth_method: authMethod,
      };

      if (showSSO && provider) {
        payload.sso_provider = provider;
        payload.sso_client_id = clientId;

        if (provider === "microsoft") {
          payload.sso_provider_name = "Microsoft";
          payload.sso_tenant_id = tenantId;
        } else if (provider === "google") {
          payload.sso_provider_name = "Google";
        } else if (provider === "oidc") {
          payload.sso_provider_name = providerName;
          payload.sso_well_known_url = wellKnownUrl;
        }

        if (clientSecret) {
          payload.sso_client_secret = clientSecret;
        }
      }

      await axiosAuth.put(url.AUTH_SETTINGS, payload);
      successMessageHandler("Authentication settings saved");
      setIsEdit(false);
      await fetchSettings();
    } catch (error: any) {
      errorMessageHandler(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCallback = () => {
    if (settings?.callback_url) {
      navigator.clipboard.writeText(settings.callback_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProviderLabel = (value: string | null) =>
    PROVIDER_OPTIONS.find((o) => o.value === value)?.label || value;

  if (fetching) {
    return (
      <div className="flex justify-center pb-4">
        <Card className="w-160 p-0 gap-0">
          <CardContent className="flex items-center gap-3 py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading authentication settings...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center pb-4">
      <Card className="w-160 p-0 gap-0">
        {/* Header */}
        <CardHeader className="px-4 py-4!">
          <CardTitle className="flex flex-row justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">Authentication</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Configure how users sign in to your organization
                </p>
              </div>
            </div>
            {!isEdit ? (
              <div
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                onClick={handleEdit}
              >
                <Pencil size={18} />
              </div>
            ) : (
              <div className="space-x-2">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        {/* View Mode */}
        {!isEdit && (
          <CardContent className="pb-2 flex flex-col divide-y">
            <InfoRow
              label="Authentication Method"
              value={
                <Badge variant="outline" className="font-medium">
                  {AUTH_METHOD_LABELS[settings?.auth_method || "password"]}
                </Badge>
              }
            />

            {(settings?.auth_method === "sso" ||
              settings?.auth_method === "flexible") && (
                <>
                  <InfoRow
                    label="SSO Provider"
                    value={getProviderLabel(settings?.sso_provider)}
                  />
                  {settings?.sso_provider_name &&
                    settings?.sso_provider === "oidc" && (
                      <InfoRow
                        label="Provider Name"
                        value={settings.sso_provider_name}
                      />
                    )}
                  <InfoRow label="Client ID" value={settings?.sso_client_id} />
                  <InfoRow
                    label="Client Secret"
                    value={
                      settings?.client_secret_set ? (
                        <span className="flex items-center gap-2">
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Configured
                          </span>
                        </span>
                      ) : null
                    }
                  />
                  {settings?.sso_provider === "microsoft" && (
                    <InfoRow label="Tenant ID" value={settings?.sso_tenant_id} />
                  )}
                  {settings?.sso_provider === "oidc" && (
                    <InfoRow
                      label="Well-Known URL"
                      value={
                        settings?.sso_well_known_url ? (
                          <span className="truncate block max-w-sm">
                            {settings.sso_well_known_url}
                          </span>
                        ) : null
                      }
                    />
                  )}
                  {settings?.callback_url && (
                    <div className="flex items-center px-4 py-2.5">
                      <div className="w-56 shrink-0 text-sm text-muted-foreground">
                        Callback URL
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-sm">
                          {settings.callback_url}
                        </code>
                        <button
                          onClick={handleCopyCallback}
                          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
          </CardContent>
        )}

        {/* Edit Mode */}
        {isEdit && (
          <CardContent className="pb-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Authentication Method
                </Label>
                <RadioGroup
                  value={authMethod}
                  onValueChange={(v) => setAuthMethod(v as AuthMethod)}
                  className="space-y-1"
                >
                  {(
                    Object.entries(AUTH_METHOD_LABELS) as [AuthMethod, string][]
                  ).map(([value, label]) => (
                    <div
                      key={value}
                      className={`flex items-center space-x-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${authMethod === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                        }`}
                      onClick={() => setAuthMethod(value)}
                    >
                      <RadioGroupItem value={value} id={`auth-${value}`} />
                      <Label
                        htmlFor={`auth-${value}`}
                        className="font-normal cursor-pointer flex-1"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {showSSO && (
                <>
                  <Separator />

                  {/* Provider selector as a boxed row */}
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">SSO Provider</p>
                      <p className="text-xs text-muted-foreground">
                        Select your identity provider
                      </p>
                    </div>
                    <Select
                      value={provider}
                      onValueChange={(v) => {
                        setProvider(v as SSOProvider);
                        setClientId("");
                        setClientSecret("");
                        setTenantId("");
                        setWellKnownUrl("");
                        setProviderName("");
                      }}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="microsoft">
                          Microsoft (Azure AD)
                        </SelectItem>
                        <SelectItem value="google">
                          Google Workspace
                        </SelectItem>
                        <SelectItem value="oidc">Custom OIDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Provider configuration form */}
                  {provider && (
                    <div className="space-y-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Provider Configuration
                      </p>

                      {provider === "oidc" && (
                        <>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Provider Name</Label>
                            <Input
                              placeholder="e.g., CyberArk, Okta, Ping Identity"
                              value={providerName}
                              onChange={(e) => setProviderName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Well-Known URL</Label>
                            <Input
                              placeholder="https://your-tenant.example.com/.well-known/openid-configuration"
                              value={wellKnownUrl}
                              onChange={(e) => setWellKnownUrl(e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-sm">Client ID</Label>
                        <Input
                          placeholder="Enter client ID"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm">Client Secret</Label>
                        <Input
                          type="password"
                          placeholder={
                            settings?.client_secret_set
                              ? "Leave blank to keep existing secret"
                              : "Enter client secret"
                          }
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                        />
                      </div>

                      {provider === "microsoft" && (
                        <div className="space-y-1.5">
                          <Label className="text-sm">Tenant ID</Label>
                          <Input
                            placeholder="Enter tenant ID"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}
                          />
                        </div>
                      )}

                      {settings?.callback_url && (
                        <div className="space-y-1.5">
                          <Label className="text-sm">
                            Callback URL{" "}
                            <span className="text-muted-foreground font-normal">
                              - register this in your IdP app
                            </span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={settings.callback_url}
                              className="text-muted-foreground bg-muted/50"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0 cursor-pointer"
                              onClick={handleCopyCallback}
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AuthenticationCard;
