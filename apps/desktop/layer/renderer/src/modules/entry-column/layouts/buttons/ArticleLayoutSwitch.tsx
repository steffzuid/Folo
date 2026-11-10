import { Tooltip, TooltipContent, TooltipTrigger } from "@follow/components/ui/tooltip/index.js"
import type { ArticleListLayout } from "@follow/shared/settings/interface"
import { cn } from "@follow/utils/utils"
import { useTranslation } from "react-i18next"

import { setUISetting, useUISettingKey } from "~/atoms/settings/ui"

const LAYOUTS = [
  { value: "rows", icon: "i-mingcute-menu-line", labelKey: "entry_list_header.layout_rows" },
  { value: "list", icon: "i-mingcute-news-line", labelKey: "entry_list_header.layout_list" },
  { value: "cards", icon: "i-mingcute-rows-2-line", labelKey: "entry_list_header.layout_cards" },
] as const satisfies readonly { value: ArticleListLayout; icon: string; labelKey: string }[]

/**
 * Picks how the Articles timeline is drawn: dense rows, a list with thumbnails, or large cards.
 */
export const ArticleLayoutSwitch = () => {
  const { t } = useTranslation()
  const layout = useUISettingKey("articleListLayout")

  return (
    <div
      role="radiogroup"
      aria-label={t("entry_list_header.layout")}
      className="glass-capsule flex h-7 items-center gap-0.5 p-0.5"
    >
      {LAYOUTS.map((item) => {
        const active = item.value === layout
        return (
          <Tooltip key={item.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={t(item.labelKey)}
                className={cn(
                  "center h-6 w-7 rounded-full text-base transition-colors duration-200",
                  active
                    ? "glass-selected text-accent"
                    : "text-text-secondary hover:bg-theme-item-hover hover:text-text",
                )}
                onClick={() => setUISetting("articleListLayout", item.value)}
              >
                <i className={item.icon} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t(item.labelKey)}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
