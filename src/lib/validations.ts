import { z } from "zod";

const required = (label: string) => z.string().trim().min(1, `${label} e obrigatorio`);
const optionalText = z.string().trim().optional().or(z.literal(""));
const moneyNumber = z.coerce.number().min(0, "Valor invalido");

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail invalido").toLowerCase(),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: required("Nome"),
  email: z.string().trim().email("E-mail invalido").toLowerCase(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  brandName: required("Nome da marca"),
});

export const clientSchema = z.object({
  id: optionalText,
  name: required("Nome"),
  company: optionalText,
  email: z.string().trim().email("E-mail invalido"),
  phone: optionalText,
  document: optionalText,
  type: z.enum(["PESSOA_FISICA", "EMPRESA", "AGENCIA", "OUTRO"]),
  source: z.enum(["INDICACAO", "INSTAGRAM", "WHATSAPP", "SITE", "OUTRO"]),
  status: z.enum(["LEAD", "ATIVO", "INATIVO"]),
  notes: optionalText,
});

export const briefingSchema = z.object({
  id: optionalText,
  clientId: required("Cliente"),
  title: required("Titulo"),
  rawInput: optionalText,
  projectType: required("Tipo de projeto"),
  objective: required("Objetivo"),
  targetAudience: optionalText,
  pages: z.array(z.string()),
  features: z.array(z.string()),
  optionalFeatures: z.array(z.string()),
  missingInfo: z.array(z.string()),
  risks: z.array(z.string()),
  suggestedTimeline: optionalText,
  complexity: z.enum(["BAIXA", "MEDIA", "ALTA"]),
  suggestedPriceMin: moneyNumber,
  suggestedPriceMax: moneyNumber,
  nextQuestions: z.array(z.string()),
});

export const structuredBriefingSchema = z.object({
  projectType: required("Tipo de projeto"),
  objective: required("Objetivo"),
  targetAudience: optionalText.default(""),
  pages: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  optionalFeatures: z.array(z.string()).default([]),
  missingInfo: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  suggestedTimeline: optionalText.default(""),
  complexity: z.enum(["BAIXA", "MEDIA", "ALTA"]).default("MEDIA"),
  suggestedPriceMin: z.coerce.number().default(0),
  suggestedPriceMax: z.coerce.number().default(0),
  nextQuestions: z.array(z.string()).default([]),
});

export const proposalSchema = z.object({
  id: optionalText,
  clientId: required("Cliente"),
  briefingId: optionalText,
  title: required("Titulo"),
  summary: required("Resumo"),
  includedScope: z.array(z.string()),
  excludedScope: z.array(z.string()),
  deliverables: z.array(z.string()),
  milestones: z.array(z.string()),
  timeline: required("Prazo"),
  totalPrice: moneyNumber,
  paymentTerms: required("Forma de pagamento"),
  validUntil: z.date().nullable(),
  notes: optionalText,
  status: z.enum(["RASCUNHO", "ENVIADA", "VISUALIZADA", "APROVADA", "RECUSADA", "EXPIRADA"]),
});

export const generatedProposalSchema = z.object({
  title: required("Titulo"),
  summary: required("Resumo"),
  includedScope: z.array(z.string()).default([]),
  excludedScope: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  milestones: z.array(z.string()).default([]),
  timeline: required("Prazo"),
  totalPrice: z.coerce.number().default(0),
  paymentTerms: required("Forma de pagamento"),
  notes: optionalText.default(""),
});

export const contractSchema = z.object({
  id: optionalText,
  clientId: required("Cliente"),
  proposalId: optionalText,
  title: required("Titulo"),
  contractorData: required("Dados do contratado"),
  clientData: required("Dados do contratante"),
  object: required("Objeto"),
  scope: required("Escopo"),
  totalPrice: moneyNumber,
  paymentTerms: required("Forma de pagamento"),
  deadline: required("Prazo"),
  includedRevisions: z.coerce.number().int().min(0),
  freelancerResponsibilities: z.array(z.string()),
  clientResponsibilities: z.array(z.string()),
  cancellationTerms: required("Cancelamento"),
  penaltyTerms: optionalText,
  rightsAndOwnership: required("Direitos de uso"),
  supportTerms: required("Suporte"),
  additionalClauses: z.array(z.string()),
  status: z.enum(["RASCUNHO", "ENVIADO", "AGUARDANDO_ACEITE", "ACEITO", "RECUSADO", "CANCELADO"]),
});

export const generatedContractSchema = z.object({
  title: required("Titulo"),
  contractorData: required("Dados do contratado"),
  clientData: required("Dados do contratante"),
  object: required("Objeto"),
  scope: required("Escopo"),
  totalPrice: z.coerce.number().default(0),
  paymentTerms: required("Forma de pagamento"),
  deadline: required("Prazo"),
  includedRevisions: z.coerce.number().int().default(2),
  freelancerResponsibilities: z.array(z.string()).default([]),
  clientResponsibilities: z.array(z.string()).default([]),
  cancellationTerms: required("Cancelamento"),
  penaltyTerms: optionalText.default(""),
  rightsAndOwnership: required("Direitos de uso"),
  supportTerms: required("Suporte"),
  additionalClauses: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  id: optionalText,
  clientId: required("Cliente"),
  proposalId: optionalText,
  contractId: optionalText,
  name: required("Nome"),
  description: required("Descricao"),
  status: z.enum([
    "ORCAMENTO",
    "APROVADO",
    "AGUARDANDO_CONTRATO",
    "EM_DESENVOLVIMENTO",
    "AGUARDANDO_REVISAO",
    "AJUSTES",
    "ENTREGUE",
    "FINALIZADO",
    "CANCELADO",
  ]),
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  value: moneyNumber,
  notes: optionalText,
  links: z.array(z.string()),
});

export const taskSchema = z.object({
  projectId: required("Projeto"),
  title: required("Titulo"),
  description: optionalText,
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"]),
  priority: z.enum(["BAIXA", "MEDIA", "ALTA"]),
  dueDate: z.date().nullable(),
});

export const paymentSchema = z.object({
  id: optionalText,
  clientId: required("Cliente"),
  projectId: optionalText,
  description: required("Descricao"),
  amount: moneyNumber,
  dueDate: z.date(),
  paidAt: z.date().nullable(),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"]),
  method: z.enum(["PIX", "BOLETO", "CARTAO", "TRANSFERENCIA", "DINHEIRO", "OUTRO"]),
  notes: optionalText,
});

export const settingsSchema = z.object({
  name: required("Nome"),
  brandName: required("Nome da marca"),
  email: z.string().trim().email("E-mail invalido"),
  phone: optionalText,
  website: optionalText,
  document: optionalText,
  logoUrl: optionalText,
  footerText: optionalText,
  pixKey: optionalText,
  currency: z.string().trim().default("BRL"),
});

export const commentSchema = z.object({
  entityType: z.enum(["PROPOSAL", "CONTRACT", "PROJECT"]),
  entityId: required("Entidade"),
  clientId: optionalText,
  authorName: required("Nome"),
  content: required("Comentario"),
});
