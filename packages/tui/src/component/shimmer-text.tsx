import { createSignal, createEffect, onCleanup, createMemo, For, Show } from "solid-js"
import { RGBA } from "@opentui/core"
import { useTheme } from "../context/theme"

function lerpColor(a: RGBA, b: RGBA, t: number): RGBA {
  const r = a.r + (b.r - a.r) * t
  const g = a.g + (b.g - a.g) * t
  const blue = a.b + (b.b - a.b) * t
  return RGBA.fromInts(Math.round(r * 255), Math.round(g * 255), Math.round(blue * 255))
}

// ---- shimmer component ----

export interface ShimmerTextProps {
  text: string
  baseColor?: RGBA // dim "resting" color
  highlightColor?: RGBA // bright sweep color
  bandWidth?: number // width (in chars) of the bright band — bigger = softer/wider glow
  speed?: number // ms for one full left-to-right sweep
  steps?: number // brightness quantization levels — fewer = bigger merged spans = cheaper to render
}

export function ShimmerText(props: ShimmerTextProps) {
  const { theme } = useTheme()
  const baseColor = () => props.baseColor ?? RGBA.fromHex("#5c5c66")
  const highlightColor = () => props.highlightColor ?? RGBA.fromHex("#ffffff")
  const bandWidth = () => props.bandWidth ?? 4
  const speed = () => props.speed ?? 1200
  const steps = () => props.steps ?? 10
  const text = () => props.text || ""

  const lines = createMemo(() => text().split("\n"))
  const heading = createMemo(() => lines()[0] ?? "")
  const childrenLines = createMemo(() => lines().slice(1))

  const isHovered = createMemo(() => {
    const b = baseColor()
    return b.r !== theme.textMuted.r || b.g !== theme.textMuted.g || b.b !== theme.textMuted.b
  })

  const span = () => heading().length + bandWidth() * 2
  const [phase, setPhase] = createSignal(0)

  createEffect(() => {
    if (isHovered()) return
    const totalSpeed = speed()
    const currentSpan = span()
    if (currentSpan <= 0) return

    // Recompute phase smoothly
    const fps = 30
    const intervalMs = 1000 / fps
    const deltaPhase = (currentSpan / totalSpeed) * intervalMs

    const interval = setInterval(() => {
      setPhase((p) => {
        const next = p + deltaPhase
        return next > currentSpan ? 0 : next
      })
    }, intervalMs)

    onCleanup(() => clearInterval(interval))
  })

  // Recompute per-character color from the current phase, then merge
  // adjacent characters that share a (quantized) color into one <text>
  // so we're not emitting a color escape code per character.
  const chunks = createMemo(() => {
    if (isHovered()) return []
    const center = phase() - bandWidth()
    const t = heading()
    const bColor = baseColor()
    const hColor = highlightColor()
    const bWidth = bandWidth()
    const s = steps()

    const colors = Array.from({ length: t.length }, (_, i) => {
      const dist = Math.abs(i - center)
      const raw = Math.max(0, 1 - dist / bWidth)
      const quantized = Math.round(raw * s) / s
      return lerpColor(bColor, hColor, quantized)
    })

    const merged: { text: string; color: RGBA }[] = []
    for (let i = 0; i < t.length; i++) {
      const last = merged[merged.length - 1]
      // Use RGB values to compare since they are different object references
      if (last && last.color.r === colors[i].r && last.color.g === colors[i].g && last.color.b === colors[i].b) {
        last.text += t[i]
      } else {
        merged.push({ text: t[i], color: colors[i] })
      }
    }
    return merged
  })

  return (
    <box flexDirection="column">
      <Show
        when={!isHovered()}
        fallback={<text fg={baseColor()}>{heading()}</text>}
      >
        <box flexDirection="row">
          <For each={chunks()}>
            {(c) => (
              <text fg={c.color}>
                {c.text}
              </text>
            )}
          </For>
        </box>
      </Show>
      <For each={childrenLines()}>
        {(line) => (
          <text fg={baseColor()}>
            {line}
          </text>
        )}
      </For>
    </box>
  )
}
