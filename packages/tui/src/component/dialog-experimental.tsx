import { createMemo, createSignal, onMount } from "solid-js"
import { DialogSelect, type DialogSelectOption } from "../ui/dialog-select"
import { useTheme } from "../context/theme"
import { useToast } from "../ui/toast"
import { readFlags, writeFlags } from "@devcode/core/experimental-flags"

type ExperimentalFlag = {
  key: string
  title: string
  description: string
}

const FLAGS: ExperimentalFlag[] = [
  { key: "backgroundSubagents", title: "Background Subagents", description: "Run subagents in the background without blocking" },
  { key: "eventSystem", title: "Event System", description: "V2 event bus for real-time updates" },
  { key: "planMode", title: "Plan Mode", description: "Filesystem-based plan files for plan/build agents" },
  { key: "lspTool", title: "LSP Tool", description: "Code intelligence queries via LSP" },
  { key: "workspaces", title: "Workspaces", description: "Multi-project workspace support" },
  { key: "nativeLlm", title: "Native LLM", description: "Use native LLM runtime when available" },
  { key: "oxfmt", title: "Oxfmt", description: "Use oxfmt for code formatting" },
  { key: "iconDiscovery", title: "Icon Discovery", description: "Auto-discover project icons" },
  { key: "references", title: "References", description: "Enhanced reference tracking" },
  { key: "beta_ui", title: "Beta UI", description: "Starry background, logo effects and sound" },
]

export function DialogExperimental() {
  const toast = useToast()
  const { theme } = useTheme()
  const [flags, setFlags] = createSignal<Record<string, boolean>>({})

  onMount(() => {
    setFlags(readFlags())
  })

  const umbrellaOn = createMemo(() => !!flags().experimental)

  const options = createMemo((): DialogSelectOption<string>[] => [
    {
      value: "__toggle_all__",
      title: umbrellaOn() ? "Disable All" : "Enable All",
      description: umbrellaOn()
        ? "Turn off the master switch — individual features become configurable"
        : "Turn on every experimental feature at once",
      gutter: () => (
        <text fg={umbrellaOn() ? theme.success : theme.textMuted}>
          {umbrellaOn() ? "●" : "○"}
        </text>
      ),
    },
    ...FLAGS.map((flag) => {
      const isOn = umbrellaOn() || !!flags()[flag.key]
      const disabled = umbrellaOn()
      return {
        value: flag.key,
        title: flag.title,
        description: disabled ? "Controlled by Enable All" : flag.description,
        gutter: () => (
          <text fg={isOn ? theme.success : theme.textMuted}>
            {isOn ? "●" : "○"}
          </text>
        ),
      }
    }),
  ])

  const toggleAll = () => {
    const updated = { ...flags(), experimental: !umbrellaOn() }
    setFlags(updated)
    writeFlags(updated)
    toast.show({
      variant: "success",
      message: updated.experimental
        ? "All experimental features enabled. Individual toggles locked."
        : "Experimental umbrella disabled. Individual toggles are now configurable.",
    })
  }

  const toggleFlag = (flag: ExperimentalFlag) => {
    if (umbrellaOn()) return
    const newValue = !flags()[flag.key]
    const updated = { ...flags(), [flag.key]: newValue }
    setFlags(updated)
    writeFlags(updated)
    toast.show({
      variant: "success",
      message: `${flag.title} ${newValue ? "enabled" : "disabled"}. Takes effect on next agent turn.`,
    })
  }

  return (
    <DialogSelect
      title="Features"
      options={options()}
      onSelect={(option) => {
        if (option.value === "__toggle_all__") {
          toggleAll()
        } else {
          const flag = FLAGS.find((f) => f.key === option.value)
          if (flag) toggleFlag(flag)
        }
      }}
    />
  )
}
