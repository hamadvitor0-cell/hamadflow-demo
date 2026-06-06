import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { clientStatusLabels } from "@/lib/status";

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await getPrisma().client.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true, proposals: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie leads, clientes ativos e histórico comercial."
        actions={<ButtonLink href="/dashboard/clients/new"><UserPlus className="h-4 w-4" /> Novo cliente</ButtonLink>}
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Cadastre o primeiro cliente para criar briefings, propostas e projetos."
          href="/dashboard/clients/new"
          actionLabel="Criar cliente"
        />
      ) : (
        <Card>
          <DataTable headers={["Cliente", "Empresa", "Status", "Projetos", "Propostas"]}>
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/clients/${client.id}`} className="font-medium text-primary">
                    {client.name}
                  </Link>
                  <p className="text-xs text-muted">{client.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{client.company || "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={client.status} label={clientStatusLabels[client.status]} />
                </td>
                <td className="px-4 py-3 font-mono">{client._count.projects}</td>
                <td className="px-4 py-3 font-mono">{client._count.proposals}</td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
