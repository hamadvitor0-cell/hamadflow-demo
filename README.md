# HamadFlow Demo

Versão demonstrativa do HamadFlow, sistema criado por Vitor Hamad para gerenciar clientes, pedidos, briefings, propostas, contratos, projetos e pagamentos de freelas com IA.

## Diferença entre versão real e demo

Versão real:

- uso privado;
- conectada ao `vitorhamad.me`;
- dados e banco reais;
- Gemini configurado para o workflow privado;
- sem login demo público.

Versão demo:

- pública para portfólio;
- dados fictícios;
- login demo;
- banco PostgreSQL separado;
- sem conexão com o workflow real;
- IA mock por padrão;
- sem envio real de e-mail, WhatsApp ou pagamento.

## Segurança e isolamento

Esta aplicação deve usar outro `DATABASE_URL`.

**Nunca use o banco real do HamadFlow nesta demo.**

Também não configure na demo:

- `PORTFOLIO_LEAD_SECRET` real;
- CPF/CNPJ real;
- chave Pix real;
- webhook, e-mail, WhatsApp ou gateway de pagamento real;
- `GEMINI_API_KEY` real, exceto se isso for uma decisão intencional.

O endpoint `POST /api/public/portfolio-request` aceita apenas testes da demo, força `source=demo` e não chama o HamadFlow real.

## Banco demo separado

1. Crie um novo banco PostgreSQL no Neon ou Supabase.
2. Use um nome identificável, como `hamadflow-demo`.
3. Copie a `DATABASE_URL` exclusiva desse banco.
4. Configure a URL em `.env.local`.
5. Configure a mesma URL somente no projeto Vercel da demo.

## Como rodar localmente

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Login demo:

```text
demo@hamadflow.dev
demo123456
```

O botão **Entrar como demo** só aparece quando:

```text
HAMADFLOW_MODE=demo
DEMO_LOGIN_ENABLED=true
```

## Variáveis necessárias

```dotenv
DATABASE_URL=
NEXTAUTH_SECRET=
APP_URL=http://localhost:3000

HAMADFLOW_MODE=demo
DEMO_LOGIN_ENABLED=true
DEMO_RESET_ENABLED=true
ALLOW_PUBLIC_REGISTER=false

AI_PROVIDER=mock
AI_MOCK_MODE=true
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

PORTFOLIO_LEAD_SECRET=
PDF_RENDER_MODE=react-pdf
```

Por padrão, a demo usa `AI_PROVIDER=mock` e `AI_MOCK_MODE=true`. O Gemini só é chamado se `AI_PROVIDER=gemini`, `AI_MOCK_MODE=false` e `GEMINI_API_KEY` estiver configurada.

## Dados fictícios

O seed cria cinco casos completos:

- Clínica Aura Estética;
- Barbearia Corte Fino;
- RL Personal Trainer;
- Studio Nômade Design;
- TechZone Informática.

Cada caso inclui pedido, cliente, briefing, proposta, projeto, pagamentos, tarefas e comentários. Alguns também incluem contrato.

Para restaurar o conjunto inicial:

```bash
npm run seed:demo
```

O dashboard também oferece **Resetar dados demo**. A rota `POST /api/demo/reset` exige:

- `HAMADFLOW_MODE=demo`;
- `DEMO_RESET_ENABLED=true`;
- sessão autenticada do usuário `demo@hamadflow.dev`.

## Testar o endpoint de pedido demo

```powershell
$body = @{
  name = "Cliente Fictício"
  companyName = "Empresa Exemplo"
  email = "cliente@example.com"
  phone = "+55 41 99999-1234"
  projectName = "Landing Page de teste"
  projectType = "Landing Page"
  budgetRange = "R$ 1.500 a R$ 3.000"
  message = "Pedido criado exclusivamente para testar o ambiente demonstrativo."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/public/portfolio-request" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Pedido recebido no ambiente demo. Nenhuma informação será enviada para o workflow real.",
  "notice": "Pedido criado apenas na demo."
}
```

## Deploy na Vercel

Crie um projeto separado:

```text
hamadflow-demo
```

Variáveis da Vercel demo:

```dotenv
DATABASE_URL=banco_demo
NEXTAUTH_SECRET=secret_demo_seguro
APP_URL=https://hamadflow-demo.vercel.app
HAMADFLOW_MODE=demo
DEMO_LOGIN_ENABLED=true
DEMO_RESET_ENABLED=true
ALLOW_PUBLIC_REGISTER=false
AI_PROVIDER=mock
AI_MOCK_MODE=true
GEMINI_MODEL=gemini-2.5-flash
```

Não configure:

- banco real;
- `PORTFOLIO_LEAD_SECRET` real;
- CPF/CNPJ real;
- chave Pix real;
- `GEMINI_API_KEY` real, salvo decisão intencional.

Depois de configurar o banco:

```bash
npx prisma migrate deploy
npx prisma db seed
vercel --prod
```

## Verificações recomendadas

```bash
npx prisma generate
npm run lint
npm run build
```

Confirme também:

- `/` identifica claramente `HamadFlow Demo`;
- `/login` mostra **Entrar como demo**;
- o dashboard abre preenchido;
- pedidos, clientes, briefings, propostas, contratos, projetos e pagamentos aparecem;
- PDFs e links públicos funcionam;
- o reset restaura os dados fictícios;
- `.env` e `.vercel` não estão rastreados pelo Git.
