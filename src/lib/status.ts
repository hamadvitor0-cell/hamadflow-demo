export const clientStatusLabels = {
  LEAD: "Lead",
  ATIVO: "Ativo",
  INATIVO: "Inativo",
} as const;

export const leadStatusLabels = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONTATADO: "Contatado",
  CONVERTIDO: "Convertido",
  RECUSADO: "Recusado",
  ARQUIVADO: "Arquivado",
} as const;

export const proposalStatusLabels = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  VISUALIZADA: "Visualizada",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
  EXPIRADA: "Expirada",
} as const;

export const contractStatusLabels = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  AGUARDANDO_ACEITE: "Aguardando aceite",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
} as const;

export const projectStatusLabels = {
  ORCAMENTO: "Orcamento",
  APROVADO: "Aprovado",
  AGUARDANDO_CONTRATO: "Aguardando contrato",
  EM_DESENVOLVIMENTO: "Em desenvolvimento",
  AGUARDANDO_REVISAO: "Aguardando revisao",
  AJUSTES: "Ajustes",
  ENTREGUE: "Entregue",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
} as const;

export const paymentStatusLabels = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
} as const;

export function statusTone(status: string) {
  if (["APROVADA", "ACEITO", "PAGO", "CONCLUIDA", "ATIVO", "FINALIZADO", "CONVERTIDO"].includes(status)) {
    return "success";
  }

  if (["RECUSADA", "RECUSADO", "ATRASADO", "CANCELADO", "INATIVO"].includes(status)) {
    return "danger";
  }

  if (["ENVIADA", "AGUARDANDO_ACEITE", "AGUARDANDO_REVISAO", "PENDENTE", "NOVO", "EM_ANALISE"].includes(status)) {
    return "warning";
  }

  return "neutral";
}
