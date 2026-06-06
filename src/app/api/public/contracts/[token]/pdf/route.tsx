import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf";
import { ContractPdf } from "@/components/pdf/contract-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const contract = await getPrisma().contract.findUnique({
    where: { publicToken: token },
    include: { client: true, user: true },
  });
  if (!contract) notFound();

  const buffer = await renderPdf(<ContractPdf contract={contract} />);
  return pdfResponse(buffer, `contrato-${contract.id}.pdf`);
}
