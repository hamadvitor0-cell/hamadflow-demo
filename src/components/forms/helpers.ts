export function dateInputValue(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export type ClientOption = {
  id: string;
  name: string;
  company: string | null;
};

export type ProposalOption = {
  id: string;
  title: string;
};

export type ContractOption = {
  id: string;
  title: string;
};

export type ProjectOption = {
  id: string;
  name: string;
};
