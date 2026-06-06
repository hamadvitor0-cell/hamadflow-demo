import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { logoutAction } from "@/server/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/config/brand";

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; brandName: string; email: string };
}) {
  return (
    <div className="min-h-screen w-full min-w-0 md:flex">
      <Sidebar />
      <div className="w-full min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/82 backdrop-blur">
          <div className="flex min-h-16 min-w-0 items-center justify-between gap-4 px-4 md:px-8">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{user.brandName}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                {brand.name} · {user.email}
                <Badge tone="info">{brand.badge}</Badge>
              </p>
            </div>
            <form action={logoutAction}>
              <SubmitButton variant="secondary" pendingLabel="Saindo...">
                <LogOut className="h-4 w-4" />
                Sair
              </SubmitButton>
            </form>
          </div>
        </header>
        <main className="w-full min-w-0 px-4 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
