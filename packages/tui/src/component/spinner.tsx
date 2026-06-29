import { Show, children as resolveChildren, useContext } from "solid-js"
import { useTheme } from "../context/theme"
import { useKV } from "../context/kv"
import type { JSX } from "@opentui/solid"
import type { RGBA } from "@opentui/core"
import "opentui-spinner/solid"
import { ShimmerText } from "./shimmer-text"
import { ToolGroupContext } from "../routes/session/index"

export const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

export function Spinner(props: { children?: JSX.Element; color?: RGBA; shimmer?: boolean }) {
  const { theme } = useTheme()
  const kv = useKV()
  const isGrouped = useContext(ToolGroupContext)
  const color = () => props.color ?? theme.textMuted
  const resolved = resolveChildren(() => props.children)
  const shouldShimmer = () => props.shimmer !== false && !isGrouped

  return (
    <Show when={kv.get("animations_enabled", true)} fallback={<text fg={color()}>⋯ {resolved()}</text>}>
      <box flexDirection="row" gap={1}>
        <spinner frames={SPINNER_FRAMES} interval={80} color={color()} />
        <Show when={resolved()}>
          {shouldShimmer() && typeof resolved() === "string" ? (
            <ShimmerText text={resolved() as string} baseColor={color()} highlightColor={theme.text} />
          ) : (
            <text fg={color()}>{resolved()}</text>
          )}
        </Show>
      </box>
    </Show>
  )
}
