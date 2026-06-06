import Link from "next/link";
import {
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  LayoutDashboard,
  MailCheck,
  Settings,
  Users,
} from "lucide-react";
import { brand } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Pedidos do site", icon: MailCheck },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/briefings", label: "Briefings", icon: ClipboardList },
  { href: "/dashboard/proposals", label: "Propostas", icon: FileText },
  { href: "/dashboard/contracts", label: "Contratos", icon: FileSignature },
  { href: "/dashboard/projects", label: "Projetos", icon: BriefcaseBusiness },
  { href: "/dashboard/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-full min-w-0 border-border bg-slate-950/62 md:sticky md:top-0 md:h-screen md:w-72 md:border-r">
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3 px-2 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-bold text-slate-950">
            {brand.shortName}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm font-semibold">
              {brand.name}
              <Badge tone="info">{brand.badge}</Badge>
            </span>
            <span className="block text-xs text-muted">{brand.studioName}</span>
          </span>
        </Link>

        <nav className="mt-6 grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 text-muted" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
          <p className="text-sm font-medium text-cyan-100">IA demo</p>
          <p className="mt-2 text-xs leading-5 text-muted">
            Respostas simuladas para apresentação. Gemini só é usado quando configurado intencionalmente.
          </p>
        </div>
      </div>
    </aside>
  );
}
