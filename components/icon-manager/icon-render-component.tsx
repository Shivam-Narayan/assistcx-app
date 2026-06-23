import React from "react";
import { ICONS_LIST } from "./icons-list";

export type IconCategory =
  | "agent_icons"
  | "collection_icons"
  | "tool_icons"
  | "ai_icons"
  | "data_table_icons";

/** Per-category SVG when a name is missing or unknown. */
const CATEGORY_FALLBACK_SVG: Record<IconCategory, string> = {
  agent_icons: ICONS_LIST.agent_icons["chat-bot"],
  collection_icons: ICONS_LIST.collection_icons["book02"],
  tool_icons: ICONS_LIST.tool_icons["tool-case"],
  data_table_icons: ICONS_LIST.data_table_icons["grid-table"],
  ai_icons:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V7h2v6h3v2h-5z"/></svg>',
};

function resolveFallbackSvg(
  normalizedName: string,
  category?: IconCategory,
): string | null {
  const isLocalProvider =
    normalizedName === "local" && (!category || category === "ai_icons");
  if (isLocalProvider) return CATEGORY_FALLBACK_SVG.ai_icons;
  if (category && category !== "ai_icons")
    return CATEGORY_FALLBACK_SVG[category];
  return null;
}

interface IconRenderComponentProps {
  iconName?: string;
  category?: IconCategory;
  returnAll?: boolean;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * IconRenderComponent - Renders icons from the icons-list.tsx
 *
 * @param iconName - Name of the icon to render
 * @param category - Category to filter icons
 * @param returnAll - If true, returns all icons
 * @param size - Size of the icon in pixels
 * @param color - Color of the icon
 * @param className - Additional CSS classes
 *
 * @example
 * // Single icon by name
 * <IconRenderComponent iconName="claude" category="ai_icons" />
 *
 * @example
 * // All AI icons
 * <IconRenderComponent category="ai_icons" returnAll />
 *
 * @example
 * // All icons
 * <IconRenderComponent returnAll />
 */
export const IconRenderComponent: React.FC<IconRenderComponentProps> = ({
  iconName,
  category,
  returnAll = false,
  size = 24,
  color = "currentColor",
  className = "",
}) => {
  // Helper function to find icon by name across all categories
  const findIconByName = (
    name: string,
  ): { svg: string; category: IconCategory; key: string } | null => {
    const normalizedName = name.toLowerCase();

    // Check each category
    for (const cat of Object.keys(ICONS_LIST) as IconCategory[]) {
      const icons = ICONS_LIST[cat] as Record<string, string>;
      // Check if icon exists in this category
      if (icons[normalizedName]) {
        return {
          svg: icons[normalizedName],
          category: cat,
          key: normalizedName,
        };
      }
      // Also check for partial matches (e.g., "claude" might match "anthropic" or be in ai_icons)
      for (const key in icons) {
        if (
          icons.hasOwnProperty(key) &&
          (key.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(key.toLowerCase()))
        ) {
          return { svg: icons[key], category: cat, key };
        }
      }
    }
    return null;
  };

  // Helper function to get all icons from a category
  const getIconsFromCategory = (
    cat?: IconCategory,
  ): Array<{ svg: string; category: IconCategory; key: string }> => {
    if (cat) {
      const icons = ICONS_LIST[cat] as Record<string, string>;
      return Object.keys(icons).map((key) => ({
        svg: icons[key],
        category: cat,
        key,
      }));
    }

    // Return all icons from all categories
    const allIcons: Array<{
      svg: string;
      category: IconCategory;
      key: string;
    }> = [];
    for (const cat of Object.keys(ICONS_LIST) as IconCategory[]) {
      const icons = ICONS_LIST[cat] as Record<string, string>;
      Object.keys(icons).forEach((key) => {
        allIcons.push({ svg: icons[key], category: cat, key });
      });
    }
    return allIcons;
  };

  // Render single icon
  if (iconName && !returnAll) {
    const iconData = findIconByName(iconName);
    const normalizedName = iconName.toLowerCase().trim();
    const svgToRender =
      iconData?.svg ?? resolveFallbackSvg(normalizedName, category);
    if (!svgToRender) {
      if (normalizedName !== "local") {
        console.warn(`Icon "${iconName}" not found in icons list`);
      }
      return null;
    }

    return (
      <div
        className={className}
        style={{ width: size, height: size, color }}
        dangerouslySetInnerHTML={{ __html: svgToRender }}
      />
    );
  }

  // Render all icons
  if (returnAll) {
    const icons = getIconsFromCategory(category);

    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {icons.map((iconData, index) => (
          <div
            key={`${iconData.category}-${iconData.key}-${index}`}
            className="flex flex-col items-center"
            style={{ width: size, height: size }}
            title={`${iconData.category}: ${iconData.key}`}
          >
            <div
              style={{ width: size, height: size, color }}
              dangerouslySetInnerHTML={{ __html: iconData.svg }}
            />
          </div>
        ))}
      </div>
    );
  }

  // If no iconName and returnAll is false, return null
  return null;
};

/**
 * Utility function to get icons data as Record<string, string> for a specific category
 * @param category - Category to get icons from (e.g., "agent_icons", "ai_icons")
 * @returns Record<string, string> where key is icon name and value is SVG string
 */
export const getIconsData = (
  category: IconCategory,
): Record<string, string> => {
  const icons = ICONS_LIST[category] as Record<string, string>;
  return icons || {};
};

/**
 * Utility function to get a single icon SVG string by name
 * @param iconName - Name of the icon to get
 * @param category - Optional category to search in (searches all if not provided)
 * @returns SVG string returns a category fallback when the name is unknown
 */
export const getIconSvg = (
  iconName: string,
  category?: IconCategory,
): string => {
  const normalizedName = iconName.toLowerCase().trim();

  if (category) {
    const icons = ICONS_LIST[category] as Record<string, string>;
    const found = icons[normalizedName];
    if (found) return found;
    return resolveFallbackSvg(normalizedName, category) ?? "";
  }

  // Search across all categories
  for (const cat of Object.keys(ICONS_LIST) as IconCategory[]) {
    const icons = ICONS_LIST[cat] as Record<string, string>;
    if (icons[normalizedName]) {
      return icons[normalizedName];
    }
  }

  return resolveFallbackSvg(normalizedName, undefined) ?? "";
};

export default IconRenderComponent;
