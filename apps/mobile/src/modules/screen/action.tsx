import type { ArticleListLayout } from "@follow/shared/settings/interface"
import { getFeedById } from "@follow/store/feed/getter"
import { useWhoami } from "@follow/store/user/hooks"
import { cn } from "@follow/utils"
import * as Haptics from "expo-haptics"
import type { PropsWithChildren } from "react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Platform, Pressable, Share, View } from "react-native"

import { setGeneralSetting, useGeneralSettingKey } from "@/src/atoms/settings/general"
import { setUISetting, useUISettingKey } from "@/src/atoms/settings/ui"
import { UserAvatar } from "@/src/components/ui/avatar/UserAvatar"
import { UIBarButton } from "@/src/components/ui/button/UIBarButton"
import { AlignJustifyCuteReIcon } from "@/src/icons/align_justify_cute_re"
import { CheckCircleCuteReIcon } from "@/src/icons/check_circle_cute_re"
import { Grid2CuteReIcon } from "@/src/icons/grid_2_cute_re"
import { PicCuteReIcon } from "@/src/icons/pic_cute_re"
import { RoundCuteFiIcon } from "@/src/icons/round_cute_fi"
import { RoundCuteReIcon } from "@/src/icons/round_cute_re"
import { ShareForwardCuteReIcon } from "@/src/icons/share_forward_cute_re"
import { SortAscendingCuteReIcon } from "@/src/icons/sort_ascending_cute_re"
import { SortDescendingCuteReIcon } from "@/src/icons/sort_descending_cute_re"
import { Dialog } from "@/src/lib/dialog"
import { useNavigation } from "@/src/lib/navigation/hooks"
import { proxyEnv } from "@/src/lib/proxy-env"
import { createLinkShareContent } from "@/src/lib/share"
import { toast } from "@/src/lib/toast"
import { LoginScreen } from "@/src/screens/(modal)/LoginScreen"
import { ProfileScreen } from "@/src/screens/(modal)/ProfileScreen"
import { accentColor, useColor } from "@/src/theme/colors"

import { MarkAllAsReadDialog } from "../dialogs/MarkAllAsReadDialog"

export const ActionGroup = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <View className={cn("flex flex-row items-center gap-1", className)}>{children}</View>
}

export function HomeLeftAction() {
  const user = useWhoami()

  const navigation = useNavigation()
  const handlePress = useCallback(() => {
    if (user) {
      navigation.presentControllerView(ProfileScreen, { userId: user.id })
    } else {
      navigation.presentControllerView(LoginScreen)
    }
  }, [navigation, user])

  return (
    <ActionGroup className="ml-2">
      <Pressable testID="home-avatar-trigger" onPress={handlePress}>
        <UserAvatar
          image={user?.image}
          name={user?.name}
          className="rounded-full"
          color={accentColor}
          preview={false}
        />
      </Pressable>
    </ActionGroup>
  )
}

interface HeaderActionButtonProps {
  variant?: "primary" | "secondary"
}

export const MarkAllAsReadActionButton = ({ variant = "secondary" }: HeaderActionButtonProps) => {
  const { t } = useTranslation()
  const { size, color } = useButtonVariant({ variant })

  return (
    <UIBarButton
      label={t("operation.mark_all_as_read")}
      normalIcon={<CheckCircleCuteReIcon height={size} width={size} color={color} />}
      onPress={() => {
        Dialog.show(MarkAllAsReadDialog)
      }}
    />
  )
}

const useButtonVariant = ({ variant = "primary" }: HeaderActionButtonProps) => {
  const label = useColor("label")
  const size = 20
  const color = variant === "primary" ? accentColor : label
  return { size, color }
}
export const UnreadOnlyActionButton = ({ variant = "secondary" }: HeaderActionButtonProps) => {
  const { t } = useTranslation()
  const unreadOnly = useGeneralSettingKey("unreadOnly")
  const { size, color } = useButtonVariant({ variant })
  return (
    <UIBarButton
      label={
        unreadOnly
          ? t("operation.toggle_unread_only.show_all.label")
          : t("operation.toggle_unread_only.show_unread_only.label")
      }
      normalIcon={<RoundCuteReIcon height={size} width={size} color={color} />}
      selectedIcon={<RoundCuteFiIcon height={size} width={size} color={color} />}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setGeneralSetting("unreadOnly", !unreadOnly)
        toast.success(
          unreadOnly
            ? t("operation.toggle_unread_only.show_all.success")
            : t("operation.toggle_unread_only.show_unread_only.success"),
        )
      }}
      selected={unreadOnly}
      overlay={false}
    />
  )
}

export const EntrySortOrderActionButton = ({ variant = "secondary" }: HeaderActionButtonProps) => {
  const { t } = useTranslation()
  const sortOrder = useGeneralSettingKey("timelineSortOrder")
  const { size, color } = useButtonVariant({ variant })
  const nextSortOrder = sortOrder === "desc" ? "asc" : "desc"

  return (
    <UIBarButton
      label={
        nextSortOrder === "asc"
          ? t("operation.sort_entries.oldest_unread_first.label")
          : t("operation.sort_entries.newest_first.label")
      }
      normalIcon={
        sortOrder === "asc" ? (
          <SortAscendingCuteReIcon height={size} width={size} color={color} />
        ) : (
          <SortDescendingCuteReIcon height={size} width={size} color={color} />
        )
      }
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setGeneralSetting("timelineSortOrder", nextSortOrder)
        toast.success(
          nextSortOrder === "asc"
            ? t("operation.sort_entries.oldest_unread_first.success")
            : t("operation.sort_entries.newest_first.success"),
        )
      }}
      overlay={false}
    />
  )
}

export const FeedShareActionButton = ({
  feedId,
  variant = "secondary",
}: { feedId?: string } & HeaderActionButtonProps) => {
  const { t } = useTranslation()
  const { size, color } = useButtonVariant({ variant })

  if (!feedId) return null
  return (
    <UIBarButton
      label={t("operation.share")}
      normalIcon={<ShareForwardCuteReIcon height={size} width={size} color={color} />}
      onPress={() => {
        const feed = getFeedById(feedId)
        if (!feed) return
        const url = `${proxyEnv.WEB_URL}/share/feeds/${feedId}`
        Share.share(
          createLinkShareContent({
            platform: Platform.OS,
            title: feed.title!,
            url,
            message: `Check out ${feed.title} on Folo: ${url}`,
          }),
        )
      }}
    />
  )
}

const ARTICLE_LAYOUT_ORDER: ArticleListLayout[] = ["rows", "list", "cards"]

/**
 * Cycles the Articles timeline through Rows, List and Cards.
 * The icon shows the layout in use.
 */
export const ArticleLayoutActionButton = ({ variant = "secondary" }: HeaderActionButtonProps) => {
  const { t } = useTranslation()
  const layout = useUISettingKey("articleListLayout")
  const { size, color } = useButtonVariant({ variant })
  const nextLayout =
    ARTICLE_LAYOUT_ORDER[(ARTICLE_LAYOUT_ORDER.indexOf(layout) + 1) % ARTICLE_LAYOUT_ORDER.length]!

  const layoutLabel = {
    rows: t("operation.article_layout.rows"),
    list: t("operation.article_layout.list"),
    cards: t("operation.article_layout.cards"),
  } satisfies Record<ArticleListLayout, string>

  const icon =
    layout === "rows" ? (
      <AlignJustifyCuteReIcon height={size} width={size} color={color} />
    ) : layout === "cards" ? (
      <Grid2CuteReIcon height={size} width={size} color={color} />
    ) : (
      <PicCuteReIcon height={size} width={size} color={color} />
    )

  return (
    <UIBarButton
      label={t("operation.article_layout.switch_to", { layout: layoutLabel[nextLayout] })}
      normalIcon={icon}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setUISetting("articleListLayout", nextLayout)
        toast.success(t("operation.article_layout.success", { layout: layoutLabel[nextLayout] }))
      }}
      overlay={false}
    />
  )
}
