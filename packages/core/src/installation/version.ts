declare global {
  const DEVCODE_VERSION: string
  const DEVCODE_CHANNEL: string
}

export const InstallationVersion = typeof DEVCODE_VERSION === "string" ? DEVCODE_VERSION : "local"
export const InstallationChannel = typeof DEVCODE_CHANNEL === "string" ? DEVCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
