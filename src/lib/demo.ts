export const DEMO_USER_EMAIL = "demo@hamadflow.dev";
export const DEMO_USER_PASSWORD = "demo123456";

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function isDemoMode() {
  return process.env.HAMADFLOW_MODE?.trim().toLowerCase() === "demo";
}

export function isDemoLoginEnabled() {
  return isDemoMode() && enabled(process.env.DEMO_LOGIN_ENABLED);
}

export function isDemoResetEnabled() {
  return isDemoMode() && enabled(process.env.DEMO_RESET_ENABLED);
}

export function isPublicRegisterAllowed() {
  return enabled(process.env.ALLOW_PUBLIC_REGISTER);
}
