import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  generatedContractSchema,
  generatedProposalSchema,
  structuredBriefingSchema,
} from "@/lib/validations";

type AiResult<T> = {
  data: T;
  provider: "gemini" | "mock";
  model: string;
  status: "MOCK" | "SUCCESS";
  error?: string;
};

const fallbackModel = "local-fallback";
let geminiClient: GoogleGenAI | null = null;

function isMockMode() {
  return (
    process.env.AI_MOCK_MODE?.trim().toLowerCase() === "true" ||
    process.env.AI_PROVIDER?.trim().toLowerCase() !== "gemini"
  );
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || isMockMode()) return null;

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

async function withTimeout<T>(promise: Promise<T>, ms = 20000) {
  let timeout: ReturnType<typeof setTimeout>;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Timeout na IA")), ms);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    clearTimeout(timeout!);
  }
}

function parseJson(raw: string) {
  const clean = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(clean);
}

async function generateJson<T>({
  type,
  prompt,
  schema,
  fallback,
}: {
  type: string;
  prompt: string;
  schema: z.ZodSchema<T>;
  fallback: T;
}): Promise<AiResult<T>> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  if (!client) {
    return {
      data: fallback,
      provider: "mock",
      model: fallbackModel,
      status: "MOCK",
    };
  }

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model,
        contents: [
          "Você é um consultor sênior para freelancers.",
          "Responda somente JSON válido, sem markdown.",
          type,
          prompt,
        ].join("\n\n"),
        config: { responseMimeType: "application/json" },
      }),
    );

    const raw = response.text;
    if (!raw) throw new Error("Resposta vazia da IA");

    const parsed = schema.safeParse(parseJson(raw));
    if (!parsed.success) {
      throw new Error("JSON do Gemini não passou na validação");
    }

    return {
      data: parsed.data,
      provider: "gemini",
      model,
      status: "SUCCESS",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada na IA";
    return {
      data: fallback,
      provider: "mock",
      model: fallbackModel,
      status: "MOCK",
      error: message,
    };
  }
}

export async function generateStructuredBriefing(input: string) {
  const fallback = structuredBriefingSchema.parse({
    projectType: "Site profissional",
    objective:
      "Transformar a conversa inicial em um escopo claro, com entregas, riscos e próximas perguntas.",
    targetAudience: "Clientes que chegam por indicação, redes sociais ou pesquisa local.",
    pages: ["Início", "Sobre", "Serviços", "Contato"],
    features: ["Formulário de contato", "CTA de WhatsApp simulado", "Design responsivo"],
    optionalFeatures: ["Blog", "Depoimentos", "Integração futura com CRM"],
    missingInfo: ["Prazo ideal", "Referências visuais", "Materiais da marca"],
    risks: ["Escopo ainda amplo", "Dependência de conteúdo enviado pelo cliente"],
    suggestedTimeline: "21 a 30 dias",
    complexity: "MEDIA",
    suggestedPriceMin: 3500,
    suggestedPriceMax: 6500,
    nextQuestions: [
      "Qual é o objetivo comercial principal?",
      "Quem aprova textos e design?",
      "Há integrações obrigatórias?",
    ],
  });

  return generateJson({
    type: "Organize este briefing em campos profissionais.",
    prompt: input,
    schema: structuredBriefingSchema,
    fallback,
  });
}

export async function generateProposalFromBriefing(briefing: unknown) {
  const fallback = generatedProposalSchema.parse({
    title: "Desenvolvimento de projeto digital demonstrativo",
    summary:
      "Criação de uma solução responsiva, organizada em etapas claras e preparada para apresentação comercial.",
    includedScope: [
      "Briefing e planejamento",
      "Design responsivo",
      "Desenvolvimento da primeira versão",
      "Publicação assistida",
    ],
    excludedScope: [
      "Disparos reais de e-mail ou WhatsApp",
      "Pagamentos reais",
      "Funcionalidades não descritas no escopo",
    ],
    deliverables: ["Projeto publicado", "Guia de uso", "Documentação de entrega"],
    milestones: ["Briefing", "Design", "Desenvolvimento", "Revisão", "Entrega"],
    timeline: "21 a 30 dias, conforme complexidade e aprovações",
    totalPrice: 5800,
    paymentTerms: "50% para iniciar e 50% na entrega. Valores demonstrativos.",
    notes: "Inclui 2 rodadas de revisão.",
  });

  return generateJson({
    type:
      "Gere uma proposta comercial com título, resumo, escopos, entregáveis, etapas, prazo, valor e termos.",
    prompt: JSON.stringify(briefing),
    schema: generatedProposalSchema,
    fallback,
  });
}

export async function generateContractFromProposal(proposal: unknown) {
  const fallback = generatedContractSchema.parse({
    title: "Contrato demonstrativo de prestação de serviços digitais",
    contractorData: "Hamad Dev Studio - dados fiscais não informados na demo",
    clientData: "Dados fiscais não informados na demo",
    object: "Prestação de serviços digitais conforme proposta demonstrativa.",
    scope: "Execução do escopo aprovado, revisões previstas e entrega final.",
    totalPrice: 5800,
    paymentTerms: "50% para iniciar e 50% antes da entrega. Sem cobrança real.",
    deadline: "Conforme cronograma apresentado na proposta.",
    includedRevisions: 2,
    freelancerResponsibilities: [
      "Executar o escopo aprovado",
      "Comunicar riscos e dependências",
      "Entregar os materiais previstos",
    ],
    clientResponsibilities: [
      "Enviar materiais fictícios",
      "Aprovar as etapas",
      "Responder aos alinhamentos",
    ],
    cancellationTerms: "Cláusula demonstrativa sem efeito comercial.",
    penaltyTerms: "",
    rightsAndOwnership: "Texto demonstrativo para apresentação do fluxo.",
    supportTerms: "30 dias de suporte demonstrativo.",
    additionalClauses: [
      "Nenhum pagamento real será processado.",
      "Este modelo não substitui orientação jurídica.",
    ],
  });

  return generateJson({
    type: "Gere um contrato claro para freelancer, sem juridiquês exagerado.",
    prompt: JSON.stringify(proposal),
    schema: generatedContractSchema,
    fallback,
  });
}

export async function suggestProjectPrice(briefing: unknown) {
  const result = await generateProposalFromBriefing(briefing);
  return {
    ...result,
    data: {
      min: Math.round(result.data.totalPrice * 0.8),
      max: Math.round(result.data.totalPrice * 1.25),
    },
  };
}

export async function detectProjectRisks(briefing: unknown) {
  const result = await generateStructuredBriefing(JSON.stringify(briefing));
  return { ...result, data: result.data.risks };
}

export async function generateClientMessage(
  type: "educada" | "direta" | "firme",
  context: unknown,
) {
  const schema = z.object({ message: z.string().min(10) });
  const fallback = {
    message:
      type === "firme"
        ? "Mensagem demonstrativa: existe um pagamento fictício pendente no projeto."
        : "Mensagem demonstrativa: este contato não será enviado por WhatsApp ou e-mail.",
  };

  return generateJson({
    type: `Gere uma mensagem comercial ${type}.`,
    prompt: JSON.stringify(context),
    schema,
    fallback,
  });
}
