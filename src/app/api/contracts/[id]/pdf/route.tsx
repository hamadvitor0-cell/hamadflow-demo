import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf";
import { ContractPdf } from "@/components/pdf/contract-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const contract = await getPrisma().contract.findFirst({
    where: { id, userId: user.id },
    include: { client: true, user: true },
  });
  if (!contract) notFound();

  const buffer = await renderPdf(<ContractPdf contract={contract} />);
  return pdfResponse(buffer, `contrato-${contract.id}.pdf`);
}
