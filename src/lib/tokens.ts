import { randomBytes } from "node:crypto";

export function createPublicToken() {
  return randomBytes(32).toString("hex");
}
