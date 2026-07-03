import { Global } from "./global"
import path from "path"
import fs from "fs"

const FILE = "experimental.json"

function filePath(): string {
  return path.join(Global.Path.state, FILE)
}

export function readFlags(): Record<string, boolean> {
  try {
    const data = fs.readFileSync(filePath(), "utf-8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

/** Check if the experimental umbrella (master switch) is on. */
export function isUmbrellaEnabled(): boolean {
  return !!readFlags().experimental
}

/** Check if a specific flag is enabled. True if the umbrella OR the individual flag is on. */
export function isFlagEnabled(key: string): boolean {
  const flags = readFlags()
  return !!flags.experimental || !!flags[key]
}

export function writeFlags(flags: Record<string, boolean>) {
  const dir = Global.Path.state
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath(), JSON.stringify(flags, null, 2), "utf-8")
}

export function setFlag(key: string, value: boolean) {
  const current = readFlags()
  current[key] = value
  writeFlags(current)
}
