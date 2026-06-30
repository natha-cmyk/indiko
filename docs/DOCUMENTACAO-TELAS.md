# Indiko — Documentação de Telas

Especificação completa das **37 telas** do MVP multi-tenant. Para cada tela: **Função** (o que faz), **Lógica** (regras, estados e papéis) e **Relação** (de onde vem, para onde leva, dados que toca).

Companheiro do `PRD-Indiko-v0.3.md`. Índice visual rápido: `MAPA-DE-TELAS.md` (na pasta do protótipo). Protótipo navegável: `index.html`.

**Públicos:** Parceiro · Admin/Operação (empresa) · Super Admin (plataforma) · Lead.
**Entidades de dados referenciadas:** ver `schema.prisma`.

---

## Fundação

### 00 · Design System
- **Função:** referência viva de marca — cores, tipografia, botões, inputs, badges, tabelas, modais e estados.
- **Lógica:** define os tokens CSS (`--brand-red`, `--brand-cyan`, etc.) e o esquema claro/escuro herdado por todas as telas. Nível de organização: cores e fonte aqui são sobrescritas pela Personalização (30) de cada tenant.
- **Relação:** não navegável pelo usuário final; base de todas as demais telas.

---

## App do Parceiro

### 01 · Login
- **Função:** autenticar o parceiro existente.
- **Lógica:** e-mail/senha ou login social; escopado por organização (o parceiro pertence a um tenant). Erros de credencial não revelam se o e-mail existe.
- **Relação:** ← entrada do app. → 02 (sucesso), → 19 (criar conta), → 20 (esqueci senha).

### 19 · Cadastro completo (pós-convite)
- **Função:** transformar um convite em conta de parceiro.
- **Lógica:** valida o token do convite (define organização e nível inicial); coleta nome, contato, senha, **chave PIX** e aceite dos termos. PIX precisa ser do titular (validado depois no resgate).
- **Relação:** ← 25 (convite) / 01. → 02 (conta criada). Cria entidade `Parceiro`.

### 20 · Recuperar / redefinir senha
- **Função:** recuperar acesso.
- **Lógica:** etapa 1 envia link por e-mail; etapa 2 (via link) define nova senha. Link expira.
- **Relação:** ← 01. → 01 (após redefinir).

### 02 · Dashboard
- **Função:** visão inicial do parceiro — saldo, nível, próxima meta e CTA de indicar.
- **Lógica:** saldo = soma de comissões `disponivel`; mostra progresso de nível e aviso de cadência (regressão) quando aplicável.
- **Relação:** ← 01/19. → 03, 04, 05, 06, 16, 18.

### 03 · Indicar
- **Função:** gerar e compartilhar a indicação.
- **Lógica:** entrega link único com UTM do parceiro + cupom; ou formulário direto. Cada indicação nasce `aguardando_contato` e dispara card no CRM.
- **Relação:** ← 02. Cria `Indicacao` → aparece em 04 e em 10 (admin). Compartilha 15/36.

### 04 · Minhas indicações
- **Função:** acompanhar todas as indicações do parceiro.
- **Lógica:** lista filtrável por status (nova, em contato, convertida, perdida, paga); espelha o que o admin altera em 10/23.
- **Relação:** ← 02. → 22 (abrir uma).

### 22 · Detalhe da indicação (parceiro)
- **Função:** ver a jornada de um lead indicado.
- **Lógica:** timeline de status (criada → em contato → convertida → paga) + comissão prevista e data de liberação. Read-only para o parceiro.
- **Relação:** ← 04. → WhatsApp do lead.

### 05 · Carteira
- **Função:** mostrar dinheiro — disponível, a liberar e extrato.
- **Lógica:** "a liberar" = comissões `pendente` dentro da janela de liberação; "disponível" = liberadas e não pagas. Resgate só acima do mínimo.
- **Relação:** ← 02. → 06 (resgatar).

### 06 · Resgate via PIX
- **Função:** solicitar saque do saldo disponível.
- **Lógica:** valida saldo ≥ mínimo e chave PIX; cria solicitação `em_analise` que entra na fila do admin (11). Não move dinheiro sozinho.
- **Relação:** ← 05/02. → fila em 11. Notifica via 18.

### 07 · Materiais & perfil
- **Função:** acessar materiais de divulgação e dados do parceiro.
- **Lógica:** biblioteca de textos/banners + resumo de nível; aba "Meus dados" leva à edição.
- **Relação:** ← 02. → 21 (editar), 17 (regras).

### 21 · Editar meus dados
- **Função:** atualizar perfil, chave PIX e senha.
- **Lógica:** mudança de chave PIX exige titularidade; alerta de bloqueio em resgate se divergente.
- **Relação:** ← 07. → 07 (salvar/cancelar). Atualiza `Parceiro`.

### 18 · Notificações
- **Função:** central de avisos in-app.
- **Lógica:** eventos: nova indicação, mudança de status, comissão liberada, resgate pago, mudança de nível.
- **Relação:** ← sino global. → tela relacionada a cada evento.

---

## Painel da Empresa (Admin / Operação)

> **Papéis (RBAC):** a sidebar é a mesma; a **Operação** não vê ações restritas. Matriz completa na seção 6.6 do PRD.

### 08 · Login admin (2FA)
- **Função:** autenticar usuário interno (Admin/Operação).
- **Lógica:** credenciais + segundo fator (quando 2FA ligado em 26). Carrega papel e organização nas claims da sessão.
- **Relação:** ← painel. → 09.

### 09 · Visão geral
- **Função:** KPIs do programa — indicações, conversão, comissão paga, ROI, funil.
- **Lógica:** **seletor de programa** no topo filtra todos os números (Parceria/IndiQ/todos). Tudo escopado pela organização logada.
- **Relação:** ← 08. → 10, 11, 13, 26.

### 10 · Indicações
- **Função:** operar o pipeline de indicações.
- **Lógica:** tabela com filtros + **seletor de programa**; mudança de status manual (fallback do webhook); marcação de fraude. Admin e Operação podem operar.
- **Relação:** ← 09. → 23 (abrir). Reflete em 04 (parceiro).

### 23 · Detalhe da indicação (admin)
- **Função:** inspecionar e agir sobre uma indicação.
- **Lógica:** timeline com autor de cada mudança; dados do lead; mudança de status; sinalizar fraude (Admin). Comissão exibida com data de liberação.
- **Relação:** ← 10. → 24 (parceiro vinculado).

### 11 · Resgates
- **Função:** aprovar/rejeitar e processar saques.
- **Lógica:** fila de solicitações `em_analise`; aprovação **manual vs automática** é decisão de negócio; ações em lote geram `PagamentoLote` e baixam saldo.
- **Relação:** ← 09. Atualiza carteira (05) e notifica (18).

### 12 · Programas
- **Função:** configurar a estrutura permanente de cada programa.
- **Lógica:** **seletor de programa**; edita dados (público, recorrência, teto), **níveis** (nome configurável, cadência em dias para regressão, multiplicador), **regras de comissão por produto** (% ou fixo, one-shot ou recorrente com teto) e **atribuição/liberação** (janela, first/last touch, mínimo). **Admin only.**
- **Relação:** ← 09. Alimenta 02/05/06 (parceiro), 03 (valores), 31 (níveis no construtor). Decisões de negócio marcadas.

### 13 · Parceiros
- **Função:** gerir a base de parceiros.
- **Lógica:** lista com nível, performance, status + **seletor de programa**. Pausar (Admin/Operação); banir (Admin).
- **Relação:** ← 09. → 24 (detalhe), 25 (convidar).

### 24 · Detalhe do parceiro
- **Função:** ficha completa de um parceiro.
- **Lógica:** métricas, chave PIX verificada, **mudança de nível**, histórico de indicações, pausar/banir.
- **Relação:** ← 13/23. Atualiza `Parceiro`.

### 25 · Convidar parceiro
- **Função:** trazer novos parceiros.
- **Lógica:** convite individual (define nível inicial), link aberto (entra Bronze/pendente) e convite em massa.
- **Relação:** ← 13. → 19 (cadastro do convidado).

### 31 · Construtor de campanha
- **Função:** montar uma ativação dentro de um programa e gerar sua landing.
- **Lógica:** 5 blocos — identidade (programa + período), público, formato (indique e ganhe / MGM por níveis / recorrente / cashback), **recompensas por nível** (nomes puxados do programa), e página. Operação visualiza, não edita.
- **Relação:** ← sidebar. Lê níveis de 12/30. → 36 (landing gerada). Cria `Campanha`.

### 14 · Webhooks
- **Função:** configurar integrações de entrada/saída.
- **Lógica:** Conexa (confirma pagamento → libera comissão) e ClickUp (status → conversão); dedupe por hash idempotente; log append-only. **Admin only.**
- **Relação:** ← sidebar. Alimenta conversão automática em 10/23.

### 26 · Configurações · Conta
- **Função:** dados da conta, segurança e equipe.
- **Lógica:** 2FA, troca de senha; sub-abas levam a Usuários (29) e Personalização (30). **Admin only.**
- **Relação:** ← sidebar. → 29, 30.

### 29 · Usuários & papéis
- **Função:** gerir a equipe interna e seus papéis.
- **Lógica:** atribui Admin/Operação por usuário; explica o que cada papel pode; convida usuário. **Admin only.**
- **Relação:** ← 26. Define o gating de todas as telas admin.

### 30 · Personalização
- **Função:** dar a cara da empresa à plataforma.
- **Lógica:** marca (logo, **color picker** de cor primária/secundária, fonte), domínio (subdomínio → próprio na Fase 3), **nomenclatura de níveis por programa**. **Admin only.**
- **Relação:** ← 26. Sobrescreve tokens do 00; alimenta nomes de nível em 12/31.

---

## Camada de Plataforma (Super Admin)

> Shell visual distinto (sidebar escura + selo "Plataforma"). Vive acima de qualquer empresa; sem acesso a dados operacionais do tenant salvo modo suporte auditado.

### 32 · Criar ambiente (onboarding)
- **Função:** provisionar uma nova organização (tenant).
- **Lógica:** wizard 3 passos (empresa → marca → 1º programa); ao final cria `Organizacao` isolada por `organizacao_id` e o Admin cai no painel.
- **Relação:** ← 33. → 09 (painel da nova empresa).

### 33 · Organizações
- **Função:** painel-mãe de todos os tenants.
- **Lógica:** lista com plano, status, parceiros e MRR; métricas agregadas cross-tenant; filtros.
- **Relação:** ← entrada da plataforma. → 34, 32, 35.

### 34 · Detalhe da organização
- **Função:** gerir um tenant específico.
- **Lógica:** plano e limites, uso, suspender/ativar (não apaga dados), encerrar (confirmação dupla), acessar como suporte (auditado), usuários da org.
- **Relação:** ← 33. Altera `Organizacao`.

### 35 · Planos & billing
- **Função:** planos da plataforma e faturamento dos tenants.
- **Lógica:** tiers (Starter/Growth/Scale — valores placeholder), faturas e MRR. Fase 2/3.
- **Relação:** ← sidebar plataforma. Vincula plano em 34.

---

## Telas Públicas & Sistema

### 15 · Landing co-branded
- **Função:** página do lead a partir do link de um parceiro específico.
- **Lógica:** exibe nome/foto do parceiro indicador + produto + oferta; formulário cria indicação atribuída ao parceiro (UTM).
- **Relação:** ← link do parceiro (03). → 27.

### 36 · Landing da campanha
- **Função:** página pública de uma campanha, gerada pelo construtor.
- **Lógica:** explica a campanha de ponta a ponta (oferta, como funciona, recompensas por nível) e captura quem quer participar; link próprio compartilhável.
- **Relação:** ← gerada por 31. → 27 (cadastro na campanha).

### 27 · Lead · confirmação
- **Função:** confirmar recebimento do contato/cadastro.
- **Lógica:** estado de sucesso pós-formulário; reforça prazo de retorno e cupom.
- **Relação:** ← 15/36.

### 16 · Ranking
- **Função:** leaderboard motivacional (opt-in).
- **Lógica:** pódio + níveis + conquistas; só aparece quem optou por participar.
- **Relação:** ← 02. Lê `Parceiro` (opt_in_leaderboard).

### 17 · Biblioteca & regras
- **Função:** explicar como funciona e as regras do programa.
- **Lógica:** conteúdo institucional + termos; base para aceite no cadastro.
- **Relação:** ← 07/19.

### 28 · Erro 404
- **Função:** rota inválida.
- **Lógica:** mensagem amigável + saídas seguras.
- **Relação:** → 02, 17.

---

## Matriz de dependências (quem alimenta quem)

- **12 Programas** → níveis e regras consumidos por 02, 03, 05, 31, 36.
- **30 Personalização** → marca e nomenclatura consumidas por 00 (override), 12, 31, 15, 36.
- **14 Webhooks** → conversão automática que atualiza 10, 23, 05, 18.
- **31 Construtor** → gera 36 e cria `Campanha` referenciada por `Indicacao`.
- **29 Papéis** → gating de 11, 12, 13, 14, 26, 29, 30, 31, 33–35.
- **32 Onboarding** → cria a `Organizacao` que isola todo o resto.

*Documentação mantida junto ao PRD. Atualizar a cada nova tela ou mudança de lógica.*
