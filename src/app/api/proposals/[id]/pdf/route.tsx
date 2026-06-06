import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf";
import { ProposalPdf } from "@/components/pdf/proposal-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const proposal = await getPrisma().proposal.findFirst({
    where: { id, userId: user.id },
    include: { client: true, user: true },
  });
  if (!proposal) notFound();

  const buffer = await renderPdf(<ProposalPdf proposal={proposal} />);
  return pdfResponse(buffer, `proposta-${proposal.id}.pdf`);
}
