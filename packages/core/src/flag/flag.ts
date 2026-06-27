import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["DEVCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["DEVCODE_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("DEVCODE_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  DEVCODE_AUTO_HEAP_SNAPSHOT: truthy("DEVCODE_AUTO_HEAP_SNAPSHOT"),
  DEVCODE_GIT_BASH_PATH: process.env["DEVCODE_GIT_BASH_PATH"],
  DEVCODE_CONFIG: process.env["DEVCODE_CONFIG"],
  DEVCODE_CONFIG_CONTENT: process.env["DEVCODE_CONFIG_CONTENT"],
  DEVCODE_DISABLE_AUTOUPDATE: truthy("DEVCODE_DISABLE_AUTOUPDATE"),
  DEVCODE_ALWAYS_NOTIFY_UPDATE: truthy("DEVCODE_ALWAYS_NOTIFY_UPDATE"),
  DEVCODE_DISABLE_PRUNE: truthy("DEVCODE_DISABLE_PRUNE"),
  DEVCODE_DISABLE_TERMINAL_TITLE: truthy("DEVCODE_DISABLE_TERMINAL_TITLE"),
  DEVCODE_SHOW_TTFD: truthy("DEVCODE_SHOW_TTFD"),
  DEVCODE_DISABLE_AUTOCOMPACT: truthy("DEVCODE_DISABLE_AUTOCOMPACT"),
  DEVCODE_DISABLE_MODELS_FETCH: truthy("DEVCODE_DISABLE_MODELS_FETCH"),
  DEVCODE_DISABLE_MOUSE: truthy("DEVCODE_DISABLE_MOUSE"),
  DEVCODE_FAKE_VCS: process.env["DEVCODE_FAKE_VCS"],
  DEVCODE_SERVER_PASSWORD: process.env["DEVCODE_SERVER_PASSWORD"],
  DEVCODE_SERVER_USERNAME: process.env["DEVCODE_SERVER_USERNAME"],
  DEVCODE_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("DEVCODE_DISABLE_FFF"),

  // Experimental
  DEVCODE_EXPERIMENTAL_FILEWATCHER: Config.boolean("DEVCODE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  DEVCODE_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("DEVCODE_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  DEVCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("DEVCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  DEVCODE_MODELS_URL: process.env["DEVCODE_MODELS_URL"],
  DEVCODE_MODELS_PATH: process.env["DEVCODE_MODELS_PATH"],
  DEVCODE_DB: process.env["DEVCODE_DB"],

  DEVCODE_WORKSPACE_ID: process.env["DEVCODE_WORKSPACE_ID"],
  DEVCODE_EXPERIMENTAL_WORKSPACES: enabledByExperimental("DEVCODE_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get DEVCODE_DISABLE_PROJECT_CONFIG() {
    return truthy("DEVCODE_DISABLE_PROJECT_CONFIG")
  },
  get DEVCODE_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("DEVCODE_EXPERIMENTAL_REFERENCES")
  },
  get DEVCODE_TUI_CONFIG() {
    return process.env["DEVCODE_TUI_CONFIG"]
  },
  get DEVCODE_CONFIG_DIR() {
    return process.env["DEVCODE_CONFIG_DIR"]
  },
  get DEVCODE_PURE() {
    return truthy("DEVCODE_PURE")
  },
  get DEVCODE_PERMISSION() {
    return process.env["DEVCODE_PERMISSION"]
  },
  get DEVCODE_PLUGIN_META_FILE() {
    return process.env["DEVCODE_PLUGIN_META_FILE"]
  },
  get DEVCODE_CLIENT() {
    return process.env["DEVCODE_CLIENT"] ?? "cli"
  },
}
