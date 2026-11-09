import { useCollectionEntry, useIsEntryStarred } from "@follow/store/collection/hooks"
import { useEntry } from "@follow/store/entry/hooks"
import type { EntryModel } from "@follow/store/entry/types"
import { useFeedById } from "@follow/store/feed/hooks"
import { useInboxById } from "@follow/store/inbox/hooks"
import { cn } from "@follow/utils/utils"
import { useMemo } from "react"
import { titleCase } from "title-case"

import { useGeneralSettingKey } from "~/atoms/settings/general"
import { RelativeTime } from "~/components/ui/datetime"
import { Media } from "~/components/ui/media/Media"
import { FEED_COLLECTION_LIST } from "~/constants"
import { useEntryIsRead } from "~/hooks/biz/useAsRead"
import { useRouteParamsSelector } from "~/hooks/biz/useRouteParams"
import { EntryTranslation } from "~/modules/entry-column/translation"
import type { FeedIconEntry } from "~/modules/feed/feed-icon"
import { FeedIcon } from "~/modules/feed/feed-icon"
import { FeedTitle } from "~/modules/feed/feed-title"
import { getPreferredTitle } from "~/store/feed/hooks"

import { StarIcon } from "../star-icon"
import type { UniversalItemProps } from "../types"

const entrySelector = (state: EntryModel) => {
  const media = state.media || []
  const photo = media.find((a) => a.type === "photo")

  /// keep-sorted
  return {
    authorAvatar: state.authorAvatar,
    authorUrl: state.authorUrl,
    description: state.description,
    feedId: state.feedId,
    firstMedia: media[0],
    firstPhotoUrl: photo?.url,
    inboxId: state.inboxHandle,
    publishedAt: state.publishedAt,
    title: state.title,
  }
}

/**
 * Shared data for the Rows and Cards layouts of the Articles timeline
 */
const useArticleItemData = (entryId: string) => {
  const entry = useEntry(entryId, entrySelector)
  const isStarred = useIsEntryStarred(entryId)
  const collectionCreatedAt = useCollectionEntry(entryId)?.createdAt
  const isRead = useEntryIsRead(entryId)
  const inCollection = useRouteParamsSelector((s) => s.feedId === FEED_COLLECTION_LIST)
  const dimRead = useGeneralSettingKey("dimRead")

  const feed = useFeedById(entry?.feedId, (feed) => ({
    type: feed.type,
    ownerUserId: feed.ownerUserId,
    id: feed.id,
    title: feed.title,
    url: "url" in feed && typeof feed.url === "string" ? feed.url : "",
    image: feed.image,
    siteUrl: feed.siteUrl,
  }))
  const inbox = useInboxById(entry?.inboxId)

  const iconEntry: FeedIconEntry = useMemo(
    () => ({
      firstPhotoUrl: entry?.firstPhotoUrl,
      authorAvatar: entry?.authorAvatar,
    }),
    [entry?.firstPhotoUrl, entry?.authorAvatar],
  )
  const titleEntry = useMemo(() => ({ authorUrl: entry?.authorUrl }), [entry?.authorUrl])

  return {
    entry,
    related: feed || inbox,
    isStarred,
    isRead,
    dimmed: isRead && dimRead,
    displayTime: inCollection ? collectionCreatedAt : entry?.publishedAt,
    iconEntry,
    titleEntry,
  }
}

const UnreadDot = ({ isRead, className }: { isRead: boolean; className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "size-1.5 shrink-0 rounded-full bg-accent transition-opacity duration-200",
      isRead && "opacity-0",
      className,
    )}
  />
)

/**
 * Rows: one dense line per entry, no pictures.
 */
export function ArticleRowItem({ entryId, translation }: UniversalItemProps) {
  const { entry, related, isStarred, isRead, dimmed, displayTime, iconEntry } =
    useArticleItemData(entryId)

  // NOTE: prevent 0 height element, the virtual list stops measuring otherwise
  if (!entry || !related) return null

  return (
    <div className="group relative flex h-10 cursor-menu items-center gap-2.5">
      <UnreadDot isRead={!!isRead} className="-ml-1" />
      <FeedIcon target={related} fallback entry={iconEntry} size={16} noMargin />
      <div
        className={cn(
          "min-w-0 flex-1 truncate text-sm leading-tight",
          isRead ? "text-text-secondary" : "font-medium text-text",
          dimmed && "text-text-tertiary",
        )}
      >
        <EntryTranslation
          className="autospace-normal truncate"
          source={titleCase(entry.title || entry.description || "")}
          target={titleCase(translation?.title ?? "")}
        />
      </div>
      {isStarred && <StarIcon className="shrink-0 text-sm" />}
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-text-tertiary">
        {!!displayTime && <RelativeTime date={displayTime} />}
      </span>
    </div>
  )
}

/**
 * Cards: a large picture on top, then source, title and summary.
 */
export function ArticleCardItem({ entryId, translation }: UniversalItemProps) {
  const { entry, related, isStarred, isRead, dimmed, displayTime, iconEntry, titleEntry } =
    useArticleItemData(entryId)

  if (!entry || !related) return null

  const media = entry.firstMedia

  return (
    <div className="group relative cursor-menu py-3">
      {media?.url && (
        <Media
          thumbnail
          src={media.url}
          type={media.type}
          previewImageUrl={media.preview_image_url}
          className="aspect-[16/9] w-full overflow-hidden rounded-2xl"
          mediaContainerClassName="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          proxy={{
            width: 960,
            height: 540,
          }}
          height={media.height}
          width={media.width}
          blurhash={media.blurhash}
        />
      )}

      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-text-secondary",
          media?.url && "mt-3",
          dimmed && "text-text-tertiary",
        )}
      >
        <UnreadDot isRead={!!isRead} />
        <FeedIcon target={related} fallback entry={iconEntry} size={16} noMargin />
        <span className="min-w-0 truncate">
          <FeedTitle feed={related} title={getPreferredTitle(related, titleEntry)} />
        </span>
        <span className="shrink-0">·</span>
        <span className="shrink-0 tabular-nums">
          {!!displayTime && <RelativeTime date={displayTime} />}
        </span>
        {isStarred && <StarIcon className="ml-auto shrink-0 text-sm" />}
      </div>

      {!!entry.title && (
        <EntryTranslation
          className={cn(
            "glass-heading autospace-normal mt-1.5 line-clamp-2 text-[17px] leading-snug",
            dimmed ? "text-text-secondary" : "text-text",
          )}
          source={titleCase(entry.title)}
          target={titleCase(translation?.title ?? "")}
        />
      )}
      {!!entry.description && (
        <EntryTranslation
          className={cn(
            "autospace-normal mt-1 line-clamp-2 text-[13px] leading-normal text-text-secondary",
            dimmed && "text-text-tertiary",
          )}
          source={entry.description}
          target={translation?.description}
        />
      )}
    </div>
  )
}
