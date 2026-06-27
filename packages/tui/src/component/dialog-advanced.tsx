import { createMemo, createSignal } from "solid-js"
import { DialogSelect, type DialogSelectOption } from "../ui/dialog-select"
import { DialogPrompt } from "../ui/dialog-prompt"
import { useDialog } from "../ui/dialog"
import { useKV } from "../context/kv"
import { useTheme } from "../context/theme"
import { useToast } from "../ui/toast"

interface AdvancedFeature {
  id: string
  name: string
  description: string
  kvKey: string
  defaultValue: boolean | number | string
  type: "toggle" | "number"
}

const TOGGLE_FEATURES: AdvancedFeature[] = [
  { id: "beta_ui", name: "Beta UI", description: "Starry background, logo effects and sound", kvKey: "beta_ui", defaultValue: false, type: "toggle" },
  { id: "background_subagents", name: "Background Subagents", description: "Run subagents in parallel", kvKey: "experimental_background_subagents", defaultValue: false, type: "toggle" },
  { id: "plan_mode", name: "Plan Mode", description: "Structured task execution", kvKey: "experimental_plan_mode", defaultValue: false, type: "toggle" },
  { id: "references", name: "References", description: "Code reference tracking", kvKey: "experimental_references", defaultValue: false, type: "toggle" },
  { id: "parallel", name: "Parallel Execution", description: "Parallel tool execution", kvKey: "experimental_parallel", defaultValue: false, type: "toggle" },
  { id: "lsp_tool", name: "LSP Tool", description: "Code intelligence via LSP", kvKey: "experimental_lsp_tool", defaultValue: false, type: "toggle" },
  { id: "oxfmt", name: "Oxford Formatter", description: "Experimental code formatter", kvKey: "experimental_oxfmt", defaultValue: false, type: "toggle" },
  { id: "event_system", name: "Event System", description: "Plugin event hooks", kvKey: "experimental_event_system", defaultValue: false, type: "toggle" },
  { id: "workspaces", name: "Workspaces", description: "Workspace management", kvKey: "experimental_workspaces", defaultValue: false, type: "toggle" },
  { id: "icon_discovery", name: "Icon Discovery", description: "Auto icon discovery", kvKey: "experimental_icon_discovery", defaultValue: false, type: "toggle" },
  { id: "native_llm", name: "Native LLM", description: "Native LLM integration", kvKey: "experimental_native_llm", defaultValue: false, type: "toggle" },
  { id: "websockets", name: "WebSockets", description: "Real-time updates", kvKey: "experimental_websockets", defaultValue: false, type: "toggle" },
]

const NUMERIC_FEATURES: AdvancedFeature[] = [
  { id: "output_token_max", name: "Max Output Tokens", description: "Maximum tokens (0 = unlimited)", kvKey: "experimental_output_token_max", defaultValue: 0, type: "number" },
  { id: "bash_timeout", name: "Bash Timeout", description: "Timeout in ms (default 120000)", kvKey: "experimental_bash_default_timeout_ms", defaultValue: 120000, type: "number" },
]

export function DialogAdvanced() {
  const dialog = useDialog()
  const kv = useKV()
  const toast = useToast()
  const { theme } = useTheme()

  const toggleSignals = TOGGLE_FEATURES.map((feature) => {
    const [get, set] = kv.signal(feature.kvKey, feature.defaultValue as boolean)
    return { feature, get, set }
  })

  const numericSignals = NUMERIC_FEATURES.map((feature) => {
    const [get, set] = kv.signal(feature.kvKey, feature.defaultValue as number)
    return { feature, get, set }
  })

  const options = createMemo((): DialogSelectOption<string>[] => {
    const toggles = toggleSignals.map(({ feature, get }) => ({
      value: feature.id,
      title: feature.name,
      description: feature.description,
      category: "Toggle Features",
      gutter: () => (
        <text fg={get() ? theme.success : theme.textMuted}>
          {get() ? "●" : "○"}
        </text>
      ),
    }))

    const numerics = numericSignals.map(({ feature, get }) => ({
      value: feature.id,
      title: feature.name,
      description: `${feature.description} (${get()})`,
      category: "Numeric Settings",
    }))

    return [...toggles, ...numerics]
  })

  return (
    <DialogSelect
      title="Advanced Features"
      options={options()}
      onSelect={(option) => {
        const toggle = toggleSignals.find((s) => s.feature.id === option.value)
        if (toggle) {
          toggle.set(() => !toggle.get())
          if (toggle.feature.id === "beta_ui" && toggle.get()) {
            toast.show({ variant: "info", message: "Restart the application to apply Beta UI changes." })
          }
          return
        }

        const numeric = numericSignals.find((s) => s.feature.id === option.value)
        if (numeric) {
          const current = numeric.get()
          dialog.replace(() => (
            <DialogPrompt
              title={numeric.feature.name}
              description={() => <text>{numeric.feature.description}</text>}
              value={String(current)}
              onConfirm={(value) => {
                const num = Number(value)
                if (!isNaN(num)) numeric.set(() => num)
                dialog.replace(() => <DialogAdvanced />)
              }}
            />
          ))
        }
      }}
    />
  )
}
