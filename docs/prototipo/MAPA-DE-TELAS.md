# Indiko — Mapa de telas, conexões e gatilhos

36 telas (incluindo o Design System). 4 públicos: **Parceiro**, **Admin/Operação** (empresa), **Super Admin** (plataforma) e **Lead**.
Ponto de entrada do protótipo: `index.html` (hub navegável).

---

## App do Parceiro

| # | Tela | Acionada quando | Conecta para |
|---|------|-----------------|--------------|
| 01 | Login | Parceiro abre o app já cadastrado | → 02 (entrar), → 19 (criar conta), → 20 (esqueci senha) |
| 19 | Cadastro completo | Recebe convite e clica no link | → 02 (conta criada), → 01 (já tem conta), → 17 (termos) |
| 20 | Recuperar senha | Clica em "Esqueci a senha" | → 01 (após redefinir) |
| 02 | Dashboard | Logo após login (tela inicial) | → 03, → 05, → 06, → 16, → 18, → 04 |
| 03 | Indicar | Clica em "Indicar agora" / aba central | → compartilha link/WhatsApp; cria indicação (→ 04) |
| 04 | Minhas indicações | Aba "Indicações" | → 22 (abrir uma indicação), → 03 (nova) |
| 22 | Detalhe da indicação | Clica numa indicação da lista | → 04 (voltar), WhatsApp do lead |
| 05 | Carteira | Aba "Carteira" | → 06 (resgatar) |
| 06 | Resgate | Clica em "Resgatar" na carteira/dashboard | solicita resgate → status "em análise" (decidido em 11) |
| 07 | Materiais & perfil | Aba "Perfil" | → 21 (meus dados), → 17 (regras) |
| 21 | Editar meus dados | Aba "Meus dados" no perfil | → 07 (salvar/cancelar) |
| 18 | Notificações | Clica no sino (badge) | → telas relacionadas a cada evento |

## Painel Admin

| # | Tela | Acionada quando | Conecta para |
|---|------|-----------------|--------------|
| 08 | Login admin (2FA) | Admin acessa o painel | → 09 (após 2FA) |
| 09 | Visão geral | Logo após login (home admin) | → 10, → 11, → 13, → 16, → 26 |
| 10 | Indicações | Item "Indicações" na sidebar | → 23 (abrir uma), muda status inline |
| 23 | Detalhe da indicação | Clica numa linha da tabela | → 10 (voltar), → 24 (ver parceiro) |
| 11 | Resgates | Item "Resgates" (badge de pendentes) | aprova/rejeita → muda saldo do parceiro (05) |
| 12 | Programas | Item "Programas" | define regras que alimentam 03/05/06 |
| 13 | Parceiros | Item "Parceiros" | → 24 (abrir parceiro), → 25 (convidar) |
| 24 | Detalhe do parceiro | Clica num parceiro / link em 23 | → 13 (voltar); pausar/banir/mudar nível |
| 25 | Convidar parceiro | Botão "Convidar parceiro" | gera convite → leva ao cadastro (19) |
| 14 | Webhooks | Item "Webhooks" | configura integrações (CRM, WhatsApp, ERP, Meta) |
| 26 | Configurações | Item "Configurações" | conta, 2FA, equipe de admins |

## Telas Públicas & Sistema

| # | Tela | Acionada quando | Conecta para |
|---|------|-----------------|--------------|
| 15 | Landing co-branded | Lead clica no link do parceiro | → 27 (envia form) |
| 36 | Landing da campanha | Gerada pelo construtor (31); link público compartilhável | → 27 (cadastro na campanha) |
| 27 | Lead · confirmação | Após enviar o formulário da landing | → 15 (voltar), WhatsApp |
| 16 | Ranking | Parceiro abre via dashboard | público; mostra níveis e conquistas |
| 17 | Biblioteca & regras | Via perfil/materiais ou cadastro | como funciona + regras do programa |
| 28 | Erro 404 | URL inválida / link quebrado | → 02 (início), → 17 (ajuda) |

## Painel da Empresa — papéis e personalização **[NOVO]**

| # | Tela | Papel | Acionada quando | Conecta para |
|---|------|-------|-----------------|--------------|
| 26 | Configurações · Conta | Admin | Item "Configurações" na sidebar | sub-abas → 29, 30 |
| 29 | Usuários & papéis | Admin | Sub-aba em Configurações | atribui Admin/Operação, convida usuário |
| 30 | Personalização | Admin | Sub-aba em Configurações | marca, domínio, nomes de níveis por programa |
| 31 | Construtor de campanha | Admin (Operação só vê) | Item "Campanhas" na sidebar | seções (público, formato, recompensas por nível) → gera 36 |

> **Papéis (RBAC):** a sidebar é a mesma, mas a **Operação** não enxerga ações restritas (regras de comissão em 12, integrações em 14, personalização em 30, gestão de usuários em 29, billing). Ver matriz na seção 6.6 do PRD v0.2.

## Camada de Plataforma — Super Admin **[NOVO]**

Shell visual distinto (sidebar escura + selo "Plataforma"). Vive **acima** de qualquer empresa.

| # | Tela | Acionada quando | Conecta para |
|---|------|-----------------|--------------|
| 32 | Criar ambiente (onboarding) | Super Admin clica "Nova organização" (33) | wizard 3 passos → cria tenant → painel admin da empresa |
| 33 | Organizações (tenants) | Home da plataforma | → 34 (abrir org), → 32 (nova), → 35 |
| 34 | Detalhe da organização | Clica numa org da lista | → 33 (voltar); muda plano, suspende/ativa, acessa como suporte |
| 35 | Planos & billing | Item "Planos & billing" | tiers, faturas, MRR por tenant |

---

## Fundação

| # | Tela | Para que serve |
|---|------|----------------|
| 00 | Design System | Referência de marca: cores, tipografia, componentes. Base de todas as telas. |

---

## Os fluxos de ponta a ponta

**1. Aquisição (Lead):**
Parceiro compartilha link (03) → Lead abre a landing (15) → envia form (27) → entra como indicação "Nova" na lista do parceiro (04) e do admin (10).

**2. Indicação e conversão (Parceiro + Admin):**
Indicação criada (03) → admin acompanha e muda status (10 → 23): Nova → Em contato → Convertida → Paga. O parceiro vê o mesmo progresso (04 → 22).

**3. Comissão e resgate (Parceiro + Admin):**
Convertida gera comissão "a liberar" (05) → após a janela, vira "disponível" → parceiro solicita resgate (06) → entra na fila do admin (11) → aprovado → vira PIX → notificação (18).

**4. Gestão (Admin):**
Admin define regras de comissão e atribuição (12), convida parceiros (25 → 19), gerencia níveis e status (13 → 24), e conecta integrações (14).

**5. Provisionamento de empresa (Super Admin) [NOVO]:**
Super Admin entra na camada de plataforma (33) → cria nova organização (32: dados, marca, 1º programa) → o ambiente é provisionado isolado por `organizacao_id` → o Admin da nova empresa recebe acesso e cai no próprio painel (09). O Super Admin acompanha uso, plano e billing (34, 35) sem ver os dados operacionais do tenant (salvo modo suporte auditado).

---

## Gatilhos de notificação (tela 18)

- Nova indicação caiu (origem: form da landing 15 ou criação manual 03)
- Indicação avançou de status (admin em 10/23)
- Comissão liberada (passou a janela de liberação)
- Resgate aprovado/pago (admin em 11)
- Subiu no ranking (16)

---

## Telas que dependem das 4 decisões de negócio

- **03, 17** — exibem valores de comissão por produto (decisão 2)
- **05, 22** — exibem a janela de liberação (decisão 4)
- **06** — usa o resgate mínimo (decisão 4)
- **12** — onde o admin configura tudo: atribuição (decisão 1), comissões (2), liberação (4)
- **11** — aprovação de resgate manual vs. automática (decisão 3)
