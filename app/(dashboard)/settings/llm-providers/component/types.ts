import { ICONS_LIST } from "@/components/icon-manager/icons-list";

export type ItemMeta = {
  speed: number;
  intelligence: number;
  max_tokens: number;
  max_output_tokens: number;
  capabilities: string[];
  provider?: string;
};
export interface ProviderModel {
  id: string;
  name: string;
  contextWindow: string;
  releasedAt: string;
  metadata?: ItemMeta | null;
  description?: string;
  integration_key?: string;
  provider?: string;
}

export interface LlmProvider {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  iconKey: keyof typeof ICONS_LIST.ai_icons;
  models?: ProviderModel[];
  key?: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
}

export interface AgentLLM {
  id: string;
  llm_key: string;
  is_default: boolean;
  is_ast: boolean;
  name: string;
  description: string;
  integration_key: string;
  model_name: string;
  provider: string;
  llm_config: Record<string, any>;
  metadata: {
    max_tokens?: number;
    max_output_tokens?: number;
    intelligence?: number;
    speed?: number;
    capabilities?: string[];
  };
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  isDefault?: boolean;
  isFast?: boolean;
}

export interface ProviderCatalog {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  iconKey: string;
  logoUrl: string | null;
  models?: AgentLLM[] | null;
}

export interface ProviderCredentialsDialogProps {
  provider: ProviderCatalog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivated?: () => void;
  mode: "activate" | "manage";
}

/** @deprecated Use ProviderCredentialsDialogProps instead */
export type ProviderActivateDialogProps = ProviderCredentialsDialogProps;

export interface ModelCardProps {
  model: AgentLLM;
  onSetPrimary: () => Promise<void>;
  onSetFast: () => Promise<void>;
  provider: ProviderCatalog;
  collapsible?: boolean;
  resetCollapsibleKey?: string;
}
export interface ModelsProps {
  provider: ProviderCatalog;
  onSetPrimary: (llmKey: string) => Promise<void>;
  onSetFast: (llmKey: string) => Promise<void>;
  filteredModels: AgentLLM[] | null;
  collapsible?: boolean;
  resetCollapsibleKey?: string;
}

export interface ProviderCardProps {
  provider: ProviderCatalog;
  onClick: (provider: ProviderCatalog) => void;
  onActivate?: (provider: ProviderCatalog) => void;
  onManage?: (provider: ProviderCatalog) => void;
  isRoot?: boolean;
  onMakeDeactivate?: (provider: ProviderCatalog) => void;
}
