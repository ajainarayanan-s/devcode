import { run as runTui, type TuiInput } from "@devcode/tui"
import { Global } from "@devcode/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
