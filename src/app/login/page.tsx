import Link from "next/link";
import { demoLoginAction, loginAction } from "@/server/actions/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/components/forms/auth-forms";
import { brand } from "@/config/brand";
import { isDemoLoginEnabled, isPublicRegisterAllowed } from "@/lib/demo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const demoEnabled = isDemoLoginEnabled();
  const registerEnabled = isPublicRegisterAllowed();

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <Link href="/" className="text-sm font-semibold text-primary">
          {brand.name}
        </Link>
        <Badge tone="info" className="mt-5">
          {brand.badge}
        </Badge>
        <h1 className="mt-5 text-2xl font-semibold">Entrar na demonstração</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use a conta fictícia para explorar o fluxo completo sem afetar dados reais.
        </p>
        {params.error ? (
          <div className="mt-5 rounded-md border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
            {params.error === "seed"
              ? "Rode o seed para criar a conta demo."
              : params.error === "demo-disabled"
                ? "O login automático demo está desativado."
                : "E-mail ou senha inválidos."}
          </div>
        ) : null}
        <LoginForm action={loginAction} />
        {demoEnabled ? (
          <form action={demoLoginAction} className="mt-3">
            <Button type="submit" variant="secondary" className="w-full">
              Entrar como demo
            </Button>
          </form>
        ) : null}
        <div className="mt-5 rounded-md border border-border bg-white/[0.03] p-3 text-xs leading-5 text-muted">
          Login demo: demo@hamadflow.dev
          <br />
          Senha: demo123456
        </div>
        {registerEnabled ? (
          <p className="mt-6 text-sm text-muted">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-primary">
              Criar cadastro
            </Link>
          </p>
        ) : null}
      </Card>
    </main>
  );
}
