import { AIChatRoot } from "~/modules/ai-chat/components/layouts/AIChatRoot"
import { ChatPageHeader } from "~/modules/ai-chat/components/layouts/ChatHeader"
import { ChatInterface } from "~/modules/ai-chat/components/layouts/ChatInterface"

export const Component = () => {
  return (
    <div
      className="glass-panel-strong relative flex h-full w-full flex-col overflow-hidden [&_[data-testid=welcome-screen-header]]:-translate-y-24"
      style={{ "--ai-chat-layout-width": "65rem" } as React.CSSProperties}
    >
      <AIChatRoot>
        <ChatPageHeader />
        <ChatInterface centerInputOnEmpty visualOffsetY="clamp(-10vh, -8vh, -6vh)" />
      </AIChatRoot>
    </div>
  )
}
