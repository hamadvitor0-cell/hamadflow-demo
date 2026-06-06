import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf";
import { ProposalPdf } from "@/components/pdf/proposal-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const proposal = await getPrisma().proposal.findUnique({
    where: { publicToken: token },
    include: { client: true, user: true },
  });
  if (!proposal) notFound();

  const buffer = await renderPdf(<ProposalPdf proposal={proposal} />);
  return pdfResponse(buffer, `proposta-${proposal.id}.pdf`);
}
