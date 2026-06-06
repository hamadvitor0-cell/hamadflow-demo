import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  FileSignature,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import { demoLoginAction } from "@/server/actions/auth";
import { brand } from "@/config/brand";
import { isDemoLoginEnabled } from "@/lib/demo";
import { buttonStyles, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  { title: "Pedidos e clientes", icon: Users, text: "Leads fictícios conectados ao restante do workflow." },
  { title: "Briefings com IA demo", icon: Sparkles, text: "Fallback local para demonstrar organização de escopo." },
  { title: "Propostas e PDFs", icon: FileText, text: "Documentos comerciais editáveis, públicos e exportáveis." },
  { title: "Contratos", icon: FileSignature, text: "Modelos demonstrativos com aceite e histórico." },
  { title: "Projetos", icon: BriefcaseBusiness, text: "Status, tarefas, comentários e links por projeto." },
  { title: "Pagamentos fictícios", icon: CreditCard, text: "Receita prevista e pendências sem transação real." },
];

export default function HomePage() {
  const demoEnabled = isDemoLoginEnabled();

  return (
    <main>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-bold text-slate-950">
            {brand.shortName}
          </span>
          <span className="font-semibold">{brand.name}</span>
          <Badge tone="info">{brand.badge}</Badge>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#seguranca">Ambiente demo</a>
        </nav>
        <ButtonLink href="/login" variant="secondary">
          Entrar
        </ButtonLink>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Badge tone="info">Portfólio de Vitor Hamad</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            HamadFlow Demo — gestão de freelas com IA
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            Versão demonstrativa do sistema criado por Vitor Hamad para organizar pedidos,
            clientes, propostas, contratos, projetos e pagamentos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {demoEnabled ? (
              <form action={demoLoginAction}>
                <button type="submit" className={buttonStyles()}>
                  Entrar como demo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <ButtonLink href="/login">Entrar</ButtonLink>
            )}
            <a
              href={brand.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles("secondary")}
            >
              Ver portfólio
            </a>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted">
            Dados fictícios. Sem e-mail, WhatsApp, Pix, pagamento ou integração real.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-slate-950/72 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
          <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
            <div className="rounded-lg border border-border bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{brand.name}</p>
                <Badge tone="info">DEMO</Badge>
              </div>
              <div className="mt-6 grid gap-2 text-sm text-muted">
                {["Dashboard", "Pedidos do site", "Clientes", "Briefings", "Propostas", "Contratos", "Projetos", "Pagamentos"].map((item) => (
                  <span key={item} className="rounded-md px-3 py-2 hover:bg-white/8">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="p-4">
                  <p className="text-xs text-muted">Receita prevista</p>
                  <p className="mt-2 font-mono text-xl font-semibold">R$ 24.400</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted">Pedidos demo</p>
                  <p className="mt-2 font-mono text-xl font-semibold">5</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted">Projetos ativos</p>
                  <p className="mt-2 font-mono text-xl font-semibold">5</p>
                </Card>
              </div>
              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Pipeline demonstrativo</h2>
                  <Badge tone="info">IA mock</Badge>
                </div>
                <div className="mt-5 grid gap-3">
                  {["Pedido recebido", "Briefing organizado", "Proposta enviada", "Contrato aguardando aceite", "Projeto em revisão"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-md border border-border bg-white/[0.03] p-3">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item}</span>
                      <span className="ml-auto font-mono text-xs text-muted">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">Um fluxo completo, preenchido e seguro para demonstração.</h2>
          <p className="mt-4 leading-7 text-muted">
            A demo mostra a jornada do pedido inicial ao acompanhamento financeiro sem usar dados ou serviços reais.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="seguranca" className="border-y border-border bg-slate-950/38">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Badge tone="success">Ambiente isolado</Badge>
          <h2 className="mt-5 text-3xl font-semibold">Nenhuma ação segue para o HamadFlow real.</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            O banco, o projeto Vercel e o repositório desta versão são separados. A IA usa respostas
            simuladas por padrão e as integrações de contato e pagamento estão desativadas.
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted">
        {brand.description}
      </footer>
    </main>
  );
}
