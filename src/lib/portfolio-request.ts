import { z } from "zod";

const cleanText = (max: number) =>
  z
    .string()
    .trim()
    .min(2)
    .max(max)
    .transform((value) =>
      value
        .replace(/[\u0000-\u001f\u007f<>]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );

const optionalText = z
  .string()
  .trim()
  .max(160)
  .optional()
  .or(z.literal(""))
  .transform((value) => value?.replace(/[<>\u0000-\u001f\u007f]+/g, " ").trim() || "");

export const demoPortfolioRequestSchema = z
  .object({
    name: cleanText(120),
    companyName: optionalText,
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    phone: optionalText,
    whatsapp: optionalText,
    projectName: optionalText,
    projectType: cleanText(120),
    budgetRange: optionalText,
    budget: optionalText,
    message: cleanText(1200),
  })
  .transform((payload) => ({
    name: payload.name,
    companyName: payload.companyName || null,
    email: payload.email?.toLowerCase() || null,
    phone: payload.phone || payload.whatsapp || null,
    projectName: payload.projectName || payload.projectType,
    projectType: payload.projectType,
    budgetRange: payload.budgetRange || payload.budget || "Não informado",
    message: payload.message,
  }));
