# Indiko - contexto do projeto (leia antes de tudo)

Voce e o Claude Code trabalhando neste repositorio. Fale e escreva em **portugues do Brasil**.
O usuario (Nathan) NAO e desenvolvedor. Explique decisoes em linguagem simples, trabalhe em
etapas pequenas, valide cada passo e NUNCA quebre o que ja esta no ar.

## O que e o Indiko
Plataforma de programas de indicacao (MGM), multi-empresa (multi-tenant). O Seahub Coworking
e a primeira empresa (tenant). Parceiros indicam clientes, ganham comissao (one-shot ou
recorrente), sobem/descem de nivel por cadencia. Tem painel da empresa (Admin/Operacao) e uma
camada de plataforma (Super Admin).

## Estado atual (IMPORTANTE - ja esta no ar)
- App **Next.js** publicado na **Vercel** (deploy automatico a cada push no GitHub).
- Banco **Supabase (PostgreSQL)** ja criado, conectado e populado.
- Tabelas ja existem (ver docs/criar-tabelas.sql) e o seed do Seahub ja foi aplicado
  (ver docs/dados-seahub.sql): 1 organizacao, 2 programas (Parceria, IndiQ), 6 niveis,
  5 produtos, 7 regras de comissao.
- Variaveis no Vercel: DATABASE_URL (pooled 6543) e DIRECT_URL (direct 5432).
- O schema canonico do banco esta em `prisma/schema.prisma`.

NAO recriar tabelas nem rodar `prisma migrate reset`. Se precisar evoluir o banco, prefira
`prisma migrate` com cuidado OU SQL aditivo, e sempre avise o usuario antes.

## Stack
Next.js (App Router) + TypeScript + Prisma + Supabase + Vercel. Sem framework de UI pesado;
seguir o visual do prototipo. Auth: a definir (Supabase Auth recomendado).

## Estrutura
- `prisma/schema.prisma` - modelo de dados (fonte da verdade do banco).
- `src/lib/prisma.ts` - client do Prisma. `src/lib/rules.ts` - regras de negocio (comissao etc.).
- `src/app/` - paginas e rotas de API (Next App Router).
- `docs/PRD-Indiko.md` - o produto inteiro (visao, regras, fluxos).
- `docs/DOCUMENTACAO-TELAS.md` - as 37 telas com funcao, logica e relacao.
- `docs/prototipo/` - prototipo HTML de alta fidelidade (referencia visual de CADA tela).
  Use como guia para reconstruir as telas como componentes React.

## Convencoes (nao violar)
- **Multi-tenant:** toda leitura/escrita filtra por `organizacaoId`. Nunca cruzar tenants.
- **Dinheiro em centavos** (Int). **Percentual em base 10000** (1000 = 10%).
- **Multiplicador de nivel** em base 10000 (12500 = 1.25x).
- **Papeis:** SUPER_ADMIN (plataforma), ADMIN (dono da empresa), OPERACAO (rotina).
  Operacao NAO altera programas, comissoes, integracoes, personalizacao nem usuarios.
- Marca Seahub: vermelho #FF001E, ciano #00BBC5, preto #121111, fonte Montserrat.

## Ordem de construcao sugerida (uma etapa por sessao)
1. Saude: restaurar `src/app/api/health/route.ts` para TESTAR o banco de verdade (SELECT 1
   via Prisma) e confirmar conexao na Vercel.
2. Autenticacao com papeis (login Admin/Operacao) + seed de 1 usuario admin do Seahub.
3. Primeira tela real: dashboard admin lendo dados do banco (programas, contagens).
4. Parceiros: listar, ver detalhe, convidar.
5. Indicacao: criar, landing co-branded, status.
6. Carteira e comissao: calculo, liberacao, resgate.
7. Webhooks reais (Conexa, ClickUp) com dedupe idempotente.
8. Camada de plataforma (Super Admin) e personalizacao.

## Como trabalhar
- Antes de codar uma etapa, apresente um plano curto e espere o "pode seguir".
- Faca push pequeno e frequente; deixe a Vercel publicar; valide na URL ao vivo.
- Se algo falhar no deploy, leia o log da Vercel e corrija antes de seguir.
