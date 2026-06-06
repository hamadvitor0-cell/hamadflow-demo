import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: unknown, currency = "BRL") {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : value && typeof value === "object" && "toString" in value
          ? Number(value.toString())
          : 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function parseMoney(value: FormDataEntryValue | null) {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, "").replace(",", "."));
}

export function parseDate(value: FormDataEntryValue | null) {
  if (!value || !String(value).trim()) return null;
  return new Date(`${String(value)}T12:00:00`);
}

export function listFromText(value: FormDataEntryValue | null) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function linesToText(items?: string[] | null) {
  return (items ?? []).join("\n");
}

export function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function publicAppUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
