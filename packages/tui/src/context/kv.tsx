import { createSignal, type Setter } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { createSimpleContext } from "./helper"
import { Flock } from "@devcode/core/util/flock"
import { Global } from "@devcode/core/global"
import { readJson, writeJsonAtomic, readText, writeText } from "../util/persistence"
import { useTuiPaths } from "./runtime"
import path from "path"
import { existsSync } from "fs"

// Map KV keys for experimental features to their environment variable names.
// When a toggle is changed, we also set process.env so the backend picks it up.
const EXPERIMENTAL_ENV_MAP: Record<string, string> = {
  experimental_background_subagents: "DEVCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS",
  experimental_plan_mode: "DEVCODE_EXPERIMENTAL_PLAN_MODE",
  experimental_references: "DEVCODE_EXPERIMENTAL_REFERENCES",
  experimental_parallel: "DEVCODE_EXPERIMENTAL_PARALLEL",
  experimental_lsp_tool: "DEVCODE_EXPERIMENTAL_LSP_TOOL",
  experimental_oxfmt: "DEVCODE_EXPERIMENTAL_OXFMT",
  experimental_event_system: "DEVCODE_EXPERIMENTAL_EVENT_SYSTEM",
  experimental_workspaces: "DEVCODE_EXPERIMENTAL_WORKSPACES",
  experimental_icon_discovery: "DEVCODE_EXPERIMENTAL_ICON_DISCOVERY",
  experimental_native_llm: "DEVCODE_EXPERIMENTAL_NATIVE_LLM",
  experimental_websockets: "DEVCODE_EXPERIMENTAL_WEBSOCKETS",
  experimental_output_token_max: "DEVCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX",
  experimental_bash_default_timeout_ms: "DEVCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS",
}

function syncEnvVar(key: string, value: any) {
  const envKey = EXPERIMENTAL_ENV_MAP[key]
  if (!envKey) return
  if (typeof value === "boolean") {
    process.env[envKey] = value ? "true" : "false"
  } else if (typeof value === "number") {
    process.env[envKey] = String(value)
  }
}

async function syncLspConfig(cwd: string, enabled: boolean) {
  const candidates = ["devcode.json", "devcode.jsonc"]
  let configFile: string | undefined
  for (const name of candidates) {
    const p = path.join(cwd, name)
    if (existsSync(p)) {
      configFile = p
      break
    }
  }
  if (!configFile) {
    configFile = path.join(cwd, "devcode.json")
    await writeText(configFile, JSON.stringify({ "$schema": "https://devcode.ai/config.json", "lsp": enabled }, null, 2))
    return
  }
  try {
    const raw = await readText(configFile)
    const config = JSON.parse(raw)
    if (config.lsp === enabled) return
    config.lsp = enabled
    await writeText(configFile, JSON.stringify(config, null, 2))
  } catch {
    // ignore config write errors
  }
}

export const { use: useKV, provider: KVProvider } = createSimpleContext({
  name: "KV",
  init: () => {
    const paths = useTuiPaths()
    void Global.Path.state
    const file = path.join(paths.state, "kv.json")
    const lock = `tui-kv:${file}`
    const [ready, setReady] = createSignal(false)
    const [store, setStore] = createStore<Record<string, any>>()
    // Queue same-process writes so rapid updates persist in order.
    let write = Promise.resolve()

    Flock.withLock(lock, () => readJson<Record<string, unknown>>(file))
      .then((x) => {
        setStore(x)
      })
      .catch((error) => {
        console.error("Failed to read KV state", { error })
      })
      .finally(() => {
        setReady(true)
      })

    const result = {
      get ready() {
        return ready()
      },
      get store() {
        return store
      },
      signal<T>(name: string, defaultValue: T) {
        if (store[name] === undefined) setStore(name, defaultValue)
        return [
          function () {
            return result.get(name)
          },
          function setter(next: Setter<T>) {
            result.set(name, next)
          },
        ] as const
      },
      get(key: string, defaultValue?: any) {
        return store[key] ?? defaultValue
      },
      set(key: string, value: any) {
        setStore(key, value)
        const resolved = typeof value === "function" ? value(store[key]) : value
        syncEnvVar(key, resolved)
        if (key === "experimental_lsp_tool") {
          syncLspConfig(paths.cwd, Boolean(resolved)).catch(() => {})
        }
        const snapshot = structuredClone(unwrap(store))
        write = write
          .then(() => Flock.withLock(lock, () => writeJsonAtomic(file, snapshot)))
          .catch((error) => {
            console.error("Failed to write KV state", { error })
          })
      },
    }
    return result
  },
})
