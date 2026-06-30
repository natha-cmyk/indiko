# Indiko — App (base para o backend)

Base **Next.js (App Router) + Prisma + Supabase**, pronta para subir no Vercel. É **esta pasta** (`indiko-app/`) que vira o repositório e o deploy — não o protótipo HTML.

## O que tem aqui

```
indiko-app/
├─ prisma/schema.prisma     # modelo de dados multi-tenant (a fonte da verdade do banco)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx           # home/status
│  │  ├─ layout.tsx
│  │  └─ api/
│  │     ├─ health/route.ts            # testa conexão com o banco
│  │     └─ webhooks/conexa|clickup/   # entradas de conversão (stubs prontos p/ preencher)
│  └─ lib/
│     ├─ prisma.ts          # client do Prisma (singleton)
│     └─ rules.ts           # regras de negócio (comissão, atribuição, liberação)
├─ .env.example             # variáveis necessárias
├─ package.json
└─ tsconfig.json / next.config.mjs
```

O que **não** vai pro Vercel: a pasta `indiko-design` (protótipo HTML — referência visual) e os documentos (`PRD-Indiko.md`, `DOCUMENTACAO-TELAS.md`). Eles guiam o build; o `schema.prisma` já está copiado aqui dentro.

---

## Passo a passo

### Pré-requisitos
Contas em **GitHub**, **Vercel** e **Supabase** (free serve pra começar). Node 18+ instalado na sua máquina.

### 1. Subir o código pro GitHub
Na sua máquina, dentro de `indiko-app/`:
```bash
git init
git add .
git commit -m "Base Indiko: Next.js + Prisma"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/indiko.git
git push -u origin main
```
(Crie o repositório vazio no GitHub antes, sem README.)

### 2. Criar o banco no Supabase
1. Crie um projeto novo no Supabase.
2. Em **Project Settings → Database → Connection string**, copie **duas** strings:
   - **Transaction / pooled** (porta **6543**) → vira a `DATABASE_URL`. Acrescente `?pgbouncer=true&connection_limit=1` no fim.
   - **Direct** (porta **5432**) → vira a `DIRECT_URL`.
> Esse par é importante: o Vercel é serverless, então a aplicação usa a conexão *pooled*, e as migrations usam a *direct*. Sem isso, dá erro de conexão em produção.

### 3. Rodar a primeira migration (local)
Ainda na sua máquina:
```bash
cp .env.example .env        # e preencha DATABASE_URL e DIRECT_URL
npm install
npm run db:migrate          # cria as tabelas no Supabase a partir do schema
```
Confirme no Supabase (Table Editor) que as tabelas apareceram.

### 4. Importar no Vercel
1. Em vercel.com → **Add New → Project → Import** o repositório do GitHub.
2. O Vercel detecta Next.js sozinho (não mude nada no build).
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL` (a pooled, 6543)
   - `DIRECT_URL` (a direct, 5432)
   - `CONEXA_WEBHOOK_SECRET`, `CLICKUP_WEBHOOK_SECRET`, `RESEND_API_KEY` (deixe vazios por enquanto)
4. **Deploy**.

### 5. Validar
Abra `https://SEU-PROJETO.vercel.app/api/health`. Deve responder:
```json
{ "status": "ok", "db": "connected" }
```
Se vier `db: "unreachable"`, revise as connection strings nas env vars (e refaça o deploy — variável nova só vale após redeploy).

---

## Comandos úteis
```bash
npm run dev          # rodar local em http://localhost:3000
npm run db:migrate   # criar/atualizar tabelas (dev)
npm run db:deploy    # aplicar migrations em produção
npm run db:studio    # abrir o Prisma Studio (ver/editar dados)
npm run build        # build de produção (roda prisma generate + next build)
```

---

## Sequência do backend (a partir daqui)
1. **Seed do tenant Seahub:** criar a Organização nº 1, os 2 programas (Parceria/IndiQ), níveis e regras de comissão.
2. **Auth + papéis:** Supabase Auth com Admin/Operação/Super Admin nas claims; middleware que injeta o `organizacaoId` em toda query.
3. **RLS no Supabase:** políticas por `organizacao_id` (o isolamento entre empresas).
4. **Webhooks reais:** preencher os stubs de Conexa e ClickUp com validação de assinatura e dedupe idempotente.
5. **CRUD por entidade** seguindo `DOCUMENTACAO-TELAS.md` (cada tela → endpoints).
6. **Telas:** reconstruir o protótipo HTML como componentes React no app.
