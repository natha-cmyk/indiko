# PRD — Indiko

**Plataforma de programas de indicação — multi-produto, multi-programa e multi-empresa**

**Versão:** 1.0 · **Data:** 23/06/2026 · **Owner:** Nathã Tinelli · **Fundador:** Guilherme Oliveira

---

## 1. Visão e objetivo

### 1.1 Contexto

O Seahub Coworking opera programas de indicação que hoje dependem de uma ferramenta terceira limitada: não suporta múltiplos produtos com regras distintas, não paga comissão recorrente, não roda mais de um programa em paralelo, não aplica regressão de nível por cadência e não confirma conversões automaticamente. Em paralelo, existe demanda de outras empresas por uma solução do mesmo tipo. O Indiko nasce para resolver as duas coisas: ser o motor de indicações do Seahub e, ao mesmo tempo, um produto replicável para outras empresas.

### 1.2 Visão

Indiko é uma plataforma de programas de indicação replicável: um motor multi-produto, multi-programa e multi-empresa que confirma conversão automaticamente, comissiona com justiça — one-shot ou recorrente — e mantém parceiros engajados por níveis com cadência. O Seahub é a primeira empresa a operar na plataforma.

### 1.3 Objetivos

1. Substituir a ferramenta atual do Seahub sem perder histórico ativo.
2. Habilitar comissão recorrente, abrindo nova categoria de ganho para o parceiro.
3. Automatizar a confirmação de conversão via integrações (sistema de pagamentos e CRM).
4. Operar dois programas em paralelo desde o lançamento.
5. Aplicar regressão de nível por cadência.
6. Operar como plataforma multi-empresa: cada empresa tem ambiente, dados e marca isolados.

### 1.4 Fases do produto

**Fase 1 — MVP.** Operação do Seahub sobre arquitetura multi-empresa: todo dado é escopado por organização e os papéis de acesso já funcionam. A criação de novos ambientes e a personalização são feitas pela equipe da plataforma.

**Fase 2 — Produtização.** Entrada de empresas adicionais, com onboarding assistido, personalização completa (marca, domínio, nomenclatura), campanhas e cobrança.

**Fase 3 — Self-serve.** A empresa cria o próprio ambiente, usa domínio próprio (white-label) e contrata planos de forma autônoma.

### 1.5 Fora de escopo

App nativo (a plataforma é PWA), gamificação avançada com missões e badges, marketplace de materiais pagos, e indicação cruzada entre múltiplas iniciativas de uma mesma empresa.

---

## 2. Modelo multi-empresa

### 2.1 Organizações e isolamento

Cada empresa é uma **organização** (tenant) com dados completamente isolados. Toda entidade do sistema carrega o identificador da organização, e nenhuma consulta cruza os limites de um tenant. O Seahub é a organização número um.

### 2.2 Camadas de personalização

Cada organização personaliza:

| Camada | Conteúdo |
|---|---|
| Marca | logo, cor primária, cor secundária, tipografia |
| Domínio | subdomínio próprio na plataforma e, posteriormente, domínio próprio (white-label) |
| Nomenclatura | nomes dos níveis e dos programas |
| Programas e produtos | quantos e quais, com regras de comissão próprias |
| Campanhas | páginas co-branded, ofertas e períodos |
| Comunicação | remetente e templates de e-mail, termos do programa |

Os nomes dos níveis são dados da organização, não do código. O Seahub usa nomenclatura náutica; outra empresa define a sua.

### 2.3 Programa e campanha

São conceitos distintos e complementares:

- **Programa** é a estrutura permanente: público-alvo, níveis e regras de comissão. É onde vive a lógica de níveis e a regressão por cadência.
- **Campanha** é uma ativação dentro de um programa: período, oferta, formato e uma landing pública de captura. A nomenclatura de níveis do programa aparece no construtor de campanha quando se definem as recompensas.

---

## 3. Personas e papéis

### 3.1 Parceiro Contador (programa Parceria)

Escritório contábil ou contador autônomo que conhece o Endereço Fiscal do Seahub e indica regularmente. Motivação: comissão recorrente sobre as mensalidades dos clientes indicados.

### 3.2 Seahuber Indicador (programa IndiQ)

Cliente ativo do Seahub que indica conhecidos. Motivação: crédito na própria mensalidade ou recompensa em dinheiro via PIX.

### 3.3 Lead

Pessoa indicada que chega por uma landing co-branded ou por uma landing de campanha, preenche o formulário e entra no funil comercial.

### 3.4 Usuários internos da empresa

- **Admin (owner):** controle total da organização — programas, comissões, integrações, personalização, usuários e cobrança.
- **Operação:** rotina do dia a dia — indicações, resgates e parceiros. Não altera regras, integrações, personalização nem usuários.

### 3.5 Super Admin (plataforma)

Equipe que opera o Indiko como produto: provisiona organizações, dá suporte, gerencia planos e acompanha métricas agregadas. Vive numa camada acima de qualquer empresa e não acessa dados operacionais de um tenant, exceto em modo de suporte auditado.

### 3.6 Matriz de permissões

| Ação | Admin | Operação |
|---|:---:|:---:|
| Ver dashboards e relatórios | Sim | Sim |
| Gerenciar indicações (status, fraude) | Sim | Sim |
| Processar e aprovar resgates | Sim | Sim |
| Pausar parceiro | Sim | Sim |
| Banir parceiro | Sim | Não |
| Configurar programas, níveis e comissões | Sim | Não |
| Configurar integrações | Sim | Não |
| Personalização (marca, domínio, nomenclatura) | Sim | Não |
| Criar e editar campanhas | Sim | Visualiza |
| Convidar e gerenciar usuários | Sim | Não |
| Cobrança e assinatura | Sim | Não |

---

## 4. Escopo funcional

| Funcionalidade | Descrição |
|---|---|
| Multi-produto | Regra de comissão configurável por produto: percentual ou valor fixo, one-shot ou recorrente. |
| Multi-programa | Estrutura genérica que suporta vários programas; dois ativos no lançamento. |
| Comissão recorrente | Percentual da mensalidade do indicado enquanto ele permanecer ativo, com teto configurável. |
| Confirmação automática | Integrações disparam a liberação de comissão, com dedupe garantido. |
| Regressão de nível | O parceiro sobe ao bater meta e regride ao não cumprir a cadência no prazo. |
| Carteira e pagamento | Saldo disponível e a liberar, extrato, resgate via PIX e pagamento em lote. |
| Construtor de campanha | Monta público, formato e recompensas, e gera uma landing pública de captura. |
| Landing co-branded | Link único do parceiro, com identificação e atribuição. |
| Multi-empresa | Cada organização com dados, marca e configuração isolados. |
| Papéis de acesso | Admin, Operação e Super Admin. |

---

## 5. Programas, níveis e produtos

### 5.1 Programa Parceria (contadores)

- **Público:** contadores e escritórios contábeis.
- **Produtos principais:** Endereço Fiscal e Sala Privativa.
- **Níveis:** Marinheiro, Capitão, Almirante.
- **Cadência:** Capitão exige uma indicação válida a cada 90 dias (multiplicador 1,25); Almirante a cada 45 dias (multiplicador 1,5).

### 5.2 Programa IndiQ (Seahubers)

- **Público:** clientes ativos do Seahub.
- **Produtos principais:** todos.
- **Níveis:** Tripulante, Navegador, Comandante.
- **Cadência:** Navegador a cada 120 dias (multiplicador 1,15); Comandante a cada 60 dias (multiplicador 1,3).

### 5.3 Produtos e configuração de comissão

| Produto | Tipo | Valor | Recorrência | Teto |
|---|---|---|---|---|
| Endereço Fiscal | % da mensalidade | 10% | Recorrente | 12 meses |
| Sala Privativa | valor sobre contrato | R$ 150 | Recorrente | 12 meses |
| Seabox | valor fixo | R$ 12 | One-shot | — |
| Auditório | valor sobre contrato | R$ 50 | One-shot | — |
| Sala de Reunião | valor fixo | R$ 25 | One-shot | — |

Os valores são editáveis na configuração de cada programa e multiplicados pelo nível do parceiro.

---

## 6. Fluxos principais

### 6.1 Cadastro do parceiro

O parceiro recebe um convite (individual, link aberto ou em massa), confirma os dados, define a chave PIX, aceita os termos e cai no painel com o link de indicação já gerado.

### 6.2 Indicação

O parceiro copia o link único ou usa o formulário direto. O lead clica e chega a uma landing co-branded com identificação do parceiro, produto e oferta. Ao preencher, o sistema cria a indicação com status inicial e envia o lead ao CRM comercial.

### 6.3 Conversão automática

Quando o sistema de pagamentos confirma o pagamento, ou quando o CRM move o card para ganho, a indicação é marcada como convertida, a comissão é calculada — one-shot ou início de ciclo recorrente — e o saldo do parceiro é atualizado, com notificação. Se os dois eventos chegarem para a mesma indicação, o dedupe impede comissão duplicada.

### 6.4 Comissão recorrente

No fechamento mensal, o sistema verifica as indicações ativas com comissão recorrente, confirma o pagamento da mensalidade do indicado e gera o lançamento. Se o indicado cancela ou fica inadimplente, a comissão é pausada e retomada se ele voltar. O ciclo encerra ao atingir o teto.

### 6.5 Regressão de nível

Diariamente, o sistema verifica a última indicação válida de cada parceiro contra a cadência do nível. Avisa com antecedência quando o prazo se aproxima e, se estourar, regride um degrau, com tom motivacional. Subir de nível não altera retroativamente comissões já lançadas.

### 6.6 Pagamento e resgate

O parceiro solicita o resgate do saldo disponível acima do mínimo. A solicitação entra na fila do admin, que aprova e processa em lote, baixando o saldo e notificando o parceiro. O comprovante fica no histórico.

### 6.7 Construtor de campanha

O admin monta a campanha em blocos — identidade e programa, público, formato, recompensas por nível e página — e o sistema gera uma landing pública que explica a campanha de ponta a ponta e captura novos participantes, com link próprio compartilhável.

### 6.8 Provisionamento de empresa

O Super Admin cria uma nova organização por um assistente de três passos — dados da empresa, marca e primeiro programa. O ambiente nasce isolado e o admin da empresa recebe acesso ao próprio painel. O Super Admin acompanha uso, plano e cobrança sem ver os dados operacionais do tenant.

---

## 7. Modelo de dados

### 7.1 Isolamento

Toda entidade de negócio carrega o identificador da organização. O isolamento é garantido por segurança em nível de linha no banco, e a chave de organização é obrigatória em qualquer operação.

### 7.2 Entidades

- **Organização:** nome, slug, domínio, marca, plano, status.
- **Usuário:** organização, nome, e-mail, papel (Super Admin, Admin, Operação), duplo fator.
- **Programa:** organização, nome, slug, público-alvo, recorrência padrão, teto.
- **Nível:** programa, nome configurável, ordem, regra de subida, cadência em dias, multiplicador.
- **Produto:** organização, nome, tipo, valor base.
- **Regra de comissão:** programa, produto, tipo, valor, recorrência, teto.
- **Parceiro:** organização, dados pessoais, chave PIX, programa, nível, status, última indicação válida.
- **Campanha:** organização, programa, nome, período, configuração da landing, cupom.
- **Indicação:** organização, parceiro, produto, campanha, dados do lead, status, atribuição, referências cruzadas ao CRM e ao pagamento.
- **Comissão:** organização, indicação, parceiro, tipo, valores, status, mês de referência, lote.
- **Lote de pagamento:** organização, datas, status, total, exportação.
- **Log de integração:** organização, origem, payload, evento, status, hash de idempotência.
- **Evento de nível:** organização, parceiro, tipo, níveis de origem e destino, motivo.

### 7.3 Relações principais

Um parceiro tem muitas indicações, e cada indicação gera comissões. Uma comissão recorrente gera lançamentos mensais até o teto ou o cancelamento. Cada indicação tem no máximo uma conversão. O log de integração é apenas de inclusão, para auditoria.

---

## 8. Regras de negócio

**Cálculo de comissão.** Comissão igual ao valor base do produto multiplicado pela regra do programa e pelo multiplicador do nível do parceiro. Exemplo: Endereço Fiscal Oceano a R$ 280, regra de 10% recorrente, parceiro Capitão com multiplicador 1,25, resulta em R$ 35 por mês durante 12 meses.

**Dedupe de integrações.** Chave idempotente por organização, indicação, tipo de evento e data de referência, com janela de sete dias. Eventos repetidos dentro da janela são ignorados.

**Atribuição de lead.** Lead que chega pelo link do parceiro é atribuído a ele. Janela de atribuição de 60 dias entre o clique e o cadastro. Em conflito entre dois parceiros, vence quem indicou primeiro. O admin pode atribuir manualmente.

**Regressão de nível.** Avisos com 30, 15 e 5 dias de antecedência. Indicação válida é a convertida. Regride um degrau por vez. Parceiro banido não regride.

**Liberação e ciclo de pagamento.** Comissão fica disponível após a janela de liberação de 15 dias. Pagamento semanal, às sextas, com valor mínimo de R$ 50 para entrar no lote; saldo abaixo do mínimo acumula.

**Controle de acesso.** Toda leitura e escrita é filtrada pela organização do usuário. Operação e Admin só enxergam a própria organização. O Super Admin acessa a camada de plataforma, não os dados operacionais do tenant.

---

## 9. Telas

A plataforma tem 37 telas, organizadas em cinco frentes. A especificação detalhada — função, lógica e relação de cada uma — está no documento de telas que acompanha este PRD.

### 9.1 App do Parceiro

Login; cadastro completo pós-convite; recuperação de senha; dashboard; indicar; minhas indicações; detalhe da indicação; carteira; resgate; materiais e perfil; editar dados; notificações.

### 9.2 Painel da Empresa (Admin e Operação)

Login com duplo fator; visão geral com seletor de programa; indicações; detalhe da indicação; resgates; programas (níveis, cadência, multiplicador e regras de comissão); parceiros; detalhe do parceiro; convidar parceiro; construtor de campanha; integrações; configurações da conta; usuários e papéis; personalização.

### 9.3 Camada de Plataforma (Super Admin)

Criar ambiente; organizações; detalhe da organização; planos e cobrança.

### 9.4 Públicas e sistema

Landing co-branded; landing de campanha; confirmação do lead; ranking; biblioteca e regras; página de erro.

### 9.5 Fundação

Design system, base visual de todas as telas.

---

## 10. Integrações

**Sistema de pagamentos.** Entrada: confirmação de pagamento libera comissão; cancelamento de mensalidade pausa a recorrente; criação de cliente vincula a indicação por documento.

**CRM comercial.** Bidirecional. Saída: nova indicação cria card no pipeline. Entrada: card ganho marca conversão; card perdido marca a indicação como perdida.

**Notificações.** Push no PWA e e-mail transacional. As credenciais de integração são por organização.

---

## 11. Stack técnica

Front-end em Next.js com TypeScript e Tailwind. Back-end em rotas de API e funções de borda para as integrações. Banco PostgreSQL com segurança em nível de linha por organização. Autenticação com papéis nas credenciais de sessão. Hospedagem em Vercel. Aplicação instalável como PWA. Pagamentos via prestador licenciado.

---

## 12. Critérios de sucesso

| Métrica | Meta |
|---|---|
| Migração da base atual do Seahub | acima de 80% |
| Indicações geradas por mês | acima do histórico atual |
| Tempo de confirmação de conversão | até 24 horas |
| Comissão recorrente sobre o total | acima de 40% em seis meses |
| Isolamento de dados entre empresas | zero vazamento entre tenants |
| Bugs críticos em produção | zero |

---

## 13. Migração

Janela paralela entre a ferramenta atual e o Indiko, comunicado oficial aos parceiros, importação da base e dos saldos pendentes, onboarding ativo dos parceiros principais, corte com antecedência comunicada e período de garantia para reconciliar divergências.

---

## 14. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Documentação da integração de pagamentos | fallback manual no painel e uso prioritário do CRM |
| Escopo crescer ao misturar operação e produtização | Fase 1 opera apenas o Seahub; multi-empresa fica na arquitetura, não na operação inicial |
| Vazamento de dados entre empresas | isolamento por linha no banco, chave de organização obrigatória e testes de isolamento |
| Comissão recorrente virar passivo inesperado | teto configurável e relatório de comissão em curso |

---

## 15. Próximos passos

1. Fechar a configuração comercial: valores de comissão por produto, janela de atribuição, janela de liberação, resgate mínimo e fluxo de aprovação de resgate.
2. Confirmar a matriz de papéis Admin e Operação.
3. Levantar a documentação técnica das integrações de pagamento e CRM.
4. Construir a Fase 1 a partir deste PRD, do documento de telas e do modelo de dados.
5. Executar a migração da base atual.
