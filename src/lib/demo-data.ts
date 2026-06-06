import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, isDemoMode } from "@/lib/demo";

type DemoCase = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: string;
  budgetRange: string;
  message: string;
  objective: string;
  targetAudience: string;
  pages: string[];
  features: string[];
  risks: string[];
  timeline: string;
  complexity: "BAIXA" | "MEDIA" | "ALTA";
  minPrice: number;
  maxPrice: number;
  value: number;
  proposalStatus: "RASCUNHO" | "ENVIADA" | "VISUALIZADA" | "APROVADA";
  contractStatus?: "ENVIADO" | "AGUARDANDO_ACEITE" | "ACEITO";
  projectStatus:
    | "ORCAMENTO"
    | "AGUARDANDO_CONTRATO"
    | "EM_DESENVOLVIMENTO"
    | "AGUARDANDO_REVISAO";
  leadStatus: "EM_ANALISE" | "CONTATADO" | "CONVERTIDO";
  dueInDays: number;
};

const demoCases: DemoCase[] = [
  {
    name: "Camila Rocha",
    company: "Clinica Aura Estetica",
    email: "camila.rocha@example.com",
    phone: "+55 41 99999-1001",
    projectName: "Site Institucional Premium",
    projectType: "Site Institucional",
    budgetRange: "R$ 3.000 a R$ 5.000",
    message:
      "Quero apresentar os tratamentos da clinica com um visual premium, depoimentos e agendamento por formulario.",
    objective:
      "Fortalecer a presenca digital da clinica e transformar visitas em pedidos de avaliacao.",
    targetAudience: "Mulheres de 25 a 55 anos interessadas em estetica e bem-estar.",
    pages: ["Inicio", "Tratamentos", "Sobre", "Depoimentos", "Contato"],
    features: ["Formulario de avaliacao", "Galeria", "SEO local", "Design responsivo"],
    risks: ["Fotos finais ainda precisam ser selecionadas"],
    timeline: "24 dias",
    complexity: "MEDIA",
    minPrice: 3800,
    maxPrice: 5000,
    value: 4600,
    proposalStatus: "ENVIADA",
    contractStatus: "AGUARDANDO_ACEITE",
    projectStatus: "AGUARDANDO_REVISAO",
    leadStatus: "CONVERTIDO",
    dueInDays: 8,
  },
  {
    name: "Joao Martins",
    company: "Barbearia Corte Fino",
    email: "joao.martins@example.com",
    phone: "+55 41 99999-1002",
    projectName: "Landing Page com WhatsApp e SEO Local",
    projectType: "Landing Page",
    budgetRange: "Acima de R$ 5.000",
    message:
      "Preciso de uma pagina para aparecer melhor no Google e facilitar pedidos de horario pelo WhatsApp.",
    objective: "Gerar agendamentos locais e destacar servicos, equipe e avaliacoes.",
    targetAudience: "Homens de 18 a 50 anos na regiao da barbearia.",
    pages: ["Landing Page"],
    features: ["CTA de WhatsApp", "Mapa", "Servicos", "Avaliacoes", "SEO local"],
    risks: ["Integracao real de WhatsApp esta fora do ambiente demo"],
    timeline: "16 dias",
    complexity: "MEDIA",
    minPrice: 4200,
    maxPrice: 6200,
    value: 5600,
    proposalStatus: "RASCUNHO",
    projectStatus: "ORCAMENTO",
    leadStatus: "EM_ANALISE",
    dueInDays: 28,
  },
  {
    name: "Rafael Lima",
    company: "RL Personal Trainer",
    email: "rafael.lima@example.com",
    phone: "+55 41 99999-1003",
    projectName: "Landing Page para captacao de alunos",
    projectType: "Landing Page",
    budgetRange: "R$ 1.500 a R$ 3.000",
    message:
      "Quero divulgar consultoria online, mostrar resultados de alunos e receber pedidos de avaliacao.",
    objective: "Captar alunos para planos presenciais e online.",
    targetAudience: "Adultos que buscam acompanhamento personalizado de treino.",
    pages: ["Landing Page"],
    features: ["Planos", "Depoimentos", "Formulario", "FAQ", "Design responsivo"],
    risks: ["Depoimentos precisam de autorizacao de uso"],
    timeline: "14 dias",
    complexity: "BAIXA",
    minPrice: 1900,
    maxPrice: 2900,
    value: 2500,
    proposalStatus: "APROVADA",
    contractStatus: "ACEITO",
    projectStatus: "EM_DESENVOLVIMENTO",
    leadStatus: "CONVERTIDO",
    dueInDays: 11,
  },
  {
    name: "Bianca Souza",
    company: "Studio Nomade Design",
    email: "bianca.souza@example.com",
    phone: "+55 41 99999-1004",
    projectName: "Portfolio profissional e pagina de servicos",
    projectType: "Site Institucional",
    budgetRange: "R$ 1.500 a R$ 3.000",
    message:
      "Preciso organizar meus projetos de branding em um portfolio elegante e explicar meus pacotes de servico.",
    objective: "Apresentar autoridade, organizar cases e facilitar novos contatos comerciais.",
    targetAudience: "Pequenas empresas que precisam de branding e identidade visual.",
    pages: ["Inicio", "Portfolio", "Servicos", "Sobre", "Contato"],
    features: ["Galeria de cases", "Filtro por categoria", "Formulario", "SEO basico"],
    risks: ["Quantidade final de cases ainda nao definida"],
    timeline: "21 dias",
    complexity: "MEDIA",
    minPrice: 2200,
    maxPrice: 3000,
    value: 2800,
    proposalStatus: "VISUALIZADA",
    contractStatus: "ENVIADO",
    projectStatus: "AGUARDANDO_CONTRATO",
    leadStatus: "CONTATADO",
    dueInDays: 20,
  },
  {
    name: "Pedro Almeida",
    company: "TechZone Informatica",
    email: "pedro.almeida@example.com",
    phone: "+55 41 99999-1005",
    projectName: "E-commerce simples",
    projectType: "Sistema Web",
    budgetRange: "Acima de R$ 5.000",
    message:
      "Quero cadastrar produtos, receber pedidos e ter um painel simples para atualizar estoque e precos.",
    objective: "Criar um canal digital de vendas com operacao simples para a equipe.",
    targetAudience: "Consumidores e pequenas empresas que compram acessorios de informatica.",
    pages: ["Catalogo", "Produto", "Carrinho", "Pedido", "Painel"],
    features: ["Catalogo", "Carrinho", "Pedidos", "Painel administrativo", "Busca"],
    risks: ["Pagamento real esta desativado na demo", "Frete precisa de regra comercial"],
    timeline: "42 dias",
    complexity: "ALTA",
    minPrice: 6500,
    maxPrice: 9800,
    value: 8900,
    proposalStatus: "ENVIADA",
    projectStatus: "ORCAMENTO",
    leadStatus: "EM_ANALISE",
    dueInDays: 45,
  },
];

const token = () => randomBytes(32).toString("hex");
const money = (value: number) => new Prisma.Decimal(value);
const dateFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export async function resetDemoData(prisma: PrismaClient) {
  if (!isDemoMode()) {
    throw new Error("Seed e reset bloqueados fora de HAMADFLOW_MODE=demo.");
  }

  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {
      name: "Vitor Hamad",
      passwordHash,
      brandName: "Hamad Dev Studio",
      phone: "+55 41 99999-0000",
      website: "https://www.vitorhamad.me",
      document: null,
      pixKey: null,
      footerText: "Documento demonstrativo. Nenhuma cobranca real sera realizada.",
    },
    create: {
      name: "Vitor Hamad",
      email: DEMO_USER_EMAIL,
      passwordHash,
      brandName: "Hamad Dev Studio",
      phone: "+55 41 99999-0000",
      website: "https://www.vitorhamad.me",
      document: null,
      pixKey: null,
      footerText: "Documento demonstrativo. Nenhuma cobranca real sera realizada.",
    },
  });

  await prisma.aiGenerationLog.deleteMany({ where: { userId: user.id } });
  await prisma.comment.deleteMany({ where: { userId: user.id } });
  await prisma.payment.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.lead.deleteMany({ where: { userId: user.id } });
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.contract.deleteMany({ where: { userId: user.id } });
  await prisma.proposal.deleteMany({ where: { userId: user.id } });
  await prisma.briefing.deleteMany({ where: { userId: user.id } });
  await prisma.client.deleteMany({ where: { userId: user.id } });

  for (const [index, item] of demoCases.entries()) {
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: item.name,
        company: item.company,
        email: item.email,
        phone: item.phone,
        document: null,
        type: "EMPRESA",
        source: "SITE",
        status: item.leadStatus === "EM_ANALISE" ? "LEAD" : "ATIVO",
        notes: `Caso ficticio da demonstracao. Projeto: ${item.projectName}.`,
      },
    });

    const briefing = await prisma.briefing.create({
      data: {
        userId: user.id,
        clientId: client.id,
        title: `Briefing - ${item.projectName}`,
        rawInput: item.message,
        projectType: item.projectType,
        objective: item.objective,
        targetAudience: item.targetAudience,
        pages: item.pages,
        features: item.features,
        optionalFeatures: ["Analytics demonstrativo", "Otimizações futuras"],
        missingInfo: ["Referencias visuais finais", "Materiais de marca"],
        risks: item.risks,
        suggestedTimeline: item.timeline,
        complexity: item.complexity,
        suggestedPriceMin: money(item.minPrice),
        suggestedPriceMax: money(item.maxPrice),
        nextQuestions: [
          "Qual e a prioridade principal do projeto?",
          "Quais materiais ja estao disponiveis?",
          "Quem aprova cada etapa?",
        ],
      },
    });

    const proposal = await prisma.proposal.create({
      data: {
        userId: user.id,
        clientId: client.id,
        briefingId: briefing.id,
        title: `${item.projectName} - ${item.company}`,
        summary: item.objective,
        includedScope: item.features,
        excludedScope: [
          "Disparos reais de e-mail ou WhatsApp",
          "Gateway de pagamento real",
          "Itens fora do escopo aprovado",
        ],
        deliverables: ["Projeto responsivo", "Publicacao assistida", "Guia de uso"],
        milestones: ["Briefing", "Design", "Desenvolvimento", "Revisao", "Entrega"],
        timeline: item.timeline,
        totalPrice: money(item.value),
        paymentTerms: "50% na aprovacao e 50% na entrega. Valores apenas demonstrativos.",
        validUntil: dateFromNow(10 + index),
        notes: "Proposta ficticia criada para demonstracao publica.",
        status: item.proposalStatus,
        approvedAt: item.proposalStatus === "APROVADA" ? dateFromNow(-3) : null,
        publicToken: token(),
      },
    });

    const contract = item.contractStatus
      ? await prisma.contract.create({
          data: {
            userId: user.id,
            clientId: client.id,
            proposalId: proposal.id,
            title: `Contrato demonstrativo - ${item.projectName}`,
            contractorData: "Hamad Dev Studio - dados fiscais nao informados na demo",
            clientData: `${item.company} - dados fiscais nao informados na demo`,
            object: item.objective,
            scope: item.features.join(", "),
            totalPrice: money(item.value),
            paymentTerms: "50% na aprovacao e 50% na entrega. Sem cobranca real.",
            deadline: item.timeline,
            includedRevisions: 2,
            freelancerResponsibilities: [
              "Executar o escopo demonstrativo",
              "Comunicar o andamento",
              "Entregar os materiais previstos",
            ],
            clientResponsibilities: [
              "Enviar materiais ficticios",
              "Validar as etapas",
              "Responder aos alinhamentos",
            ],
            cancellationTerms: "Clausula demonstrativa sem efeito comercial.",
            penaltyTerms: null,
            rightsAndOwnership: "Texto demonstrativo para apresentacao do fluxo.",
            supportTerms: "30 dias de suporte demonstrativo.",
            additionalClauses: ["Nenhum pagamento ou assinatura real e processado nesta demo."],
            status: item.contractStatus,
            acceptedAt: item.contractStatus === "ACEITO" ? dateFromNow(-2) : null,
            publicToken: token(),
          },
        })
      : null;

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        clientId: client.id,
        proposalId: proposal.id,
        contractId: contract?.id ?? null,
        name: item.projectName,
        description: item.objective,
        status: item.projectStatus,
        startDate: item.projectStatus === "ORCAMENTO" ? null : dateFromNow(-7 - index),
        dueDate: dateFromNow(item.dueInDays),
        value: money(item.value),
        publicToken: token(),
        links: [`https://example.com/demo/projeto-${index + 1}`],
        notes: "Projeto ficticio para apresentacao do HamadFlow Demo.",
      },
    });

    await prisma.task.createMany({
      data: [
        {
          userId: user.id,
          projectId: project.id,
          title: "Validar materiais do projeto",
          status: index % 2 === 0 ? "EM_ANDAMENTO" : "PENDENTE",
          priority: index === 4 ? "ALTA" : "MEDIA",
          dueDate: dateFromNow(2 + index),
        },
        {
          userId: user.id,
          projectId: project.id,
          title: "Revisar proxima entrega",
          status: "PENDENTE",
          priority: "MEDIA",
          dueDate: dateFromNow(6 + index),
        },
      ],
    });

    const firstInstallment = Math.round(item.value * 0.5);
    await prisma.payment.createMany({
      data: [
        {
          userId: user.id,
          clientId: client.id,
          projectId: project.id,
          description: `Entrada - ${item.projectName}`,
          amount: money(firstInstallment),
          dueDate: dateFromNow(index === 1 || index === 4 ? -4 : -8),
          paidAt: index === 1 || index === 4 ? null : dateFromNow(-7),
          status: index === 1 || index === 4 ? "ATRASADO" : "PAGO",
          method: index % 2 === 0 ? "PIX" : "TRANSFERENCIA",
          notes: "Lancamento ficticio. Nenhuma cobranca real.",
        },
        {
          userId: user.id,
          clientId: client.id,
          projectId: project.id,
          description: `Saldo - ${item.projectName}`,
          amount: money(item.value - firstInstallment),
          dueDate: dateFromNow(item.dueInDays),
          status: "PENDENTE",
          method: "PIX",
          notes: "Lancamento ficticio. Pagamento real desativado.",
        },
      ],
    });

    await prisma.comment.createMany({
      data: [
        {
          userId: user.id,
          clientId: client.id,
          entityType: "PROPOSAL",
          entityId: proposal.id,
          authorType: "CLIENTE",
          authorName: item.name,
          content: "Recebi a proposta demonstrativa e vou revisar os detalhes do escopo.",
        },
        {
          userId: user.id,
          clientId: client.id,
          entityType: "PROJECT",
          entityId: project.id,
          authorType: "FREELANCER",
          authorName: "Vitor Hamad",
          content: "Atualizacao ficticia registrada para demonstrar o historico do projeto.",
        },
      ],
    });

    await prisma.lead.create({
      data: {
        userId: user.id,
        name: item.name,
        isCompany: true,
        companyName: item.company,
        email: item.email,
        phone: item.phone,
        projectName: item.projectName,
        projectType: item.projectType,
        budgetRange: item.budgetRange,
        message: item.message,
        source: "demo",
        status: item.leadStatus,
        convertedClientId: client.id,
        convertedBriefingId: briefing.id,
        convertedProposalId: proposal.id,
        convertedProjectId: project.id,
      },
    });
  }

  await prisma.aiGenerationLog.createMany({
    data: [
      {
        userId: user.id,
        type: "BRIEFING",
        provider: "mock",
        input: { source: "seed-demo" },
        output: { message: "Briefing estruturado por fallback local." },
        model: "local-fallback",
        status: "MOCK",
      },
      {
        userId: user.id,
        type: "PROPOSAL",
        provider: "mock",
        input: { source: "seed-demo" },
        output: { message: "Proposta simulada para apresentacao." },
        model: "local-fallback",
        status: "MOCK",
      },
    ],
  });

  return { userId: user.id, email: user.email };
}
