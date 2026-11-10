import type { FeedModel } from "@follow/store/feed/types"
import { cn } from "@follow/utils"
import { View } from "react-native"

import { RelativeDateTime } from "@/src/components/ui/datetime/RelativeDateTime"
import { FeedIcon } from "@/src/components/ui/icon/feed-icon"
import { Image } from "@/src/components/ui/image/Image"
import { ItemPressableStyle } from "@/src/components/ui/pressable/enum"
import { ItemPressable } from "@/src/components/ui/pressable/ItemPressable"
import { Text } from "@/src/components/ui/typography/Text"

import { EntryTranslation } from "./EntryTranslation"

type ArticleLayoutItemProps = {
  testID: string
  title?: string | null
  description?: string | null
  translatedTitle?: string | null
  translatedDescription?: string | null
  showTranslation: boolean
  read?: boolean | null
  publishedAt: string | Date
  feed?: FeedModel
  sourceTitle: string
  hasTopSeparator: boolean
  onPress: () => void
}

type ArticleCardItemProps = ArticleLayoutItemProps & {
  image?: string | null
  blurhash?: string
}

const Separator = () => (
  <View
    className="absolute left-4 right-0 top-0 h-px bg-opaque-separator/70"
    style={{ transform: [{ scaleY: 0.5 }] }}
    pointerEvents="none"
  />
)

/**
 * Rows: one dense line per article, no pictures.
 */
export const EntryRowItem = ({
  testID,
  title,
  description,
  translatedTitle,
  showTranslation,
  read,
  publishedAt,
  feed,
  hasTopSeparator,
  onPress,
}: ArticleLayoutItemProps) => (
  <ItemPressable
    testID={testID}
    itemStyle={ItemPressableStyle.Plain}
    className="flex flex-row items-center gap-2.5 py-3 pl-6 pr-4"
    onPress={onPress}
  >
    {hasTopSeparator && <Separator />}
    {!read && <View className="absolute left-2.5 size-1.5 rounded-full bg-accent" />}
    <FeedIcon fallback feed={feed} size={16} />
    <View className="flex-1">
      <EntryTranslation
        numberOfLines={1}
        className={cn("text-callout", read ? "text-secondary-label" : "font-medium text-label")}
        source={title || description || ""}
        target={translatedTitle}
        showTranslation={showTranslation}
        inline
      />
    </View>
    <RelativeDateTime
      date={publishedAt}
      className="font-mono text-caption tabular-nums text-tertiary-label"
    />
  </ItemPressable>
)

/**
 * Cards: a large picture on top, then source, title and summary.
 */
export const EntryCardItem = ({
  testID,
  title,
  description,
  translatedTitle,
  translatedDescription,
  showTranslation,
  read,
  publishedAt,
  feed,
  sourceTitle,
  hasTopSeparator,
  image,
  blurhash,
  onPress,
}: ArticleCardItemProps) => (
  <ItemPressable
    testID={testID}
    itemStyle={ItemPressableStyle.Plain}
    className="px-4 py-4"
    onPress={onPress}
  >
    {hasTopSeparator && <Separator />}
    {!!image && (
      <View className="mb-3 aspect-video w-full overflow-hidden rounded-[22px] bg-tertiary-system-background">
        <Image
          proxy={{ width: 720, height: 405 }}
          className="size-full"
          contentFit="cover"
          transition={100}
          source={{ uri: image }}
          blurhash={blurhash}
          hideOnError
        />
      </View>
    )}
    <View className="mb-1 flex-row items-center gap-1.5">
      {!read && <View className="size-1.5 rounded-full bg-accent" />}
      <FeedIcon fallback feed={feed} size={16} />
      <Text numberOfLines={1} className="shrink text-xs font-medium text-secondary-label">
        {sourceTitle}
      </Text>
      <Text className="text-xs font-medium text-tertiary-label">·</Text>
      <RelativeDateTime date={publishedAt} className="text-xs font-medium text-tertiary-label" />
    </View>
    {!!title && (
      <EntryTranslation
        numberOfLines={2}
        className="text-lg font-semibold tracking-tight text-label"
        source={title}
        target={translatedTitle}
        showTranslation={showTranslation}
        inline
      />
    )}
    {!!description && (
      <EntryTranslation
        numberOfLines={2}
        className="mt-1 text-subheadline text-secondary-label"
        source={description}
        target={translatedDescription}
        showTranslation={showTranslation}
        inline
      />
    )}
  </ItemPressable>
)
