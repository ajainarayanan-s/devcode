import { createMemo } from "solid-js"
import { DialogSelect, type DialogSelectOption } from "../ui/dialog-select"
import { useKV } from "../context/kv"
import { useTheme } from "../context/theme"
import { useToast } from "../ui/toast"

export function DialogAdvanced() {
  const kv = useKV()
  const toast = useToast()
  const { theme } = useTheme()

  const [betaUi, setBetaUi] = kv.signal("beta_ui", false)

  const options = createMemo((): DialogSelectOption<string>[] => [
    {
      value: "beta_ui",
      title: "Beta UI",
      description: "Starry background, logo effects and sound",
      gutter: () => (
        <text fg={betaUi() ? theme.success : theme.textMuted}>
          {betaUi() ? "●" : "○"}
        </text>
      ),
    },
  ])

  return (
    <DialogSelect
      title="Advanced Features"
      options={options()}
      onSelect={(option) => {
        if (option.value === "beta_ui") {
          setBetaUi(() => !betaUi())
          if (betaUi()) {
            toast.show({ variant: "info", message: "Restart the application to apply Beta UI changes." })
          }
        }
      }}
    />
  )
}
