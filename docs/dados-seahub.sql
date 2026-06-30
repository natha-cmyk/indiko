-- Indiko - dados iniciais do Seahub (rode uma vez no SQL Editor, depois de criar as tabelas)
-- Seguro rodar mais de uma vez (ON CONFLICT DO NOTHING).
-- Valores monetarios em CENTAVOS. Percentual em base 10000 (1000 = 10 por cento).
-- Multiplicador de nivel em base 10000 (10000 = 1.0x; 12500 = 1.25x).
-- OBS: os valores de comissao abaixo sao um ponto de partida e podem ser editados depois.

-- Organizacao
INSERT INTO "Organizacao" ("id","nome","slug","branding","plano","status") VALUES
 ('org_seahub','Seahub Coworking','seahub',
  '{"corPrimaria":"#FF001E","corSecundaria":"#00BBC5","fonte":"Montserrat"}'::jsonb,
  'scale','ATIVA')
ON CONFLICT ("id") DO NOTHING;

-- Programas
INSERT INTO "Programa" ("id","organizacaoId","nome","slug","publicoAlvo","tetoRecorrenciaMeses","ativo") VALUES
 ('prog_parceria','org_seahub','Parceria','parceria','Contadores e escritorios contabeis',12,true),
 ('prog_indiq','org_seahub','IndiQ','indiq','Clientes ativos (Seahubers)',12,true)
ON CONFLICT ("id") DO NOTHING;

-- Niveis
INSERT INTO "Nivel" ("id","organizacaoId","programaId","nome","ordem","regraCadenciaDias","multiplicador") VALUES
 ('niv_par_1','org_seahub','prog_parceria','Marinheiro',1,NULL,10000),
 ('niv_par_2','org_seahub','prog_parceria','Capitão',2,90,12500),
 ('niv_par_3','org_seahub','prog_parceria','Almirante',3,45,15000),
 ('niv_iq_1','org_seahub','prog_indiq','Tripulante',1,NULL,10000),
 ('niv_iq_2','org_seahub','prog_indiq','Navegador',2,120,11500),
 ('niv_iq_3','org_seahub','prog_indiq','Comandante',3,60,13000)
ON CONFLICT ("id") DO NOTHING;

-- Produtos (valorBaseCents = referencia em centavos)
INSERT INTO "Produto" ("id","organizacaoId","nome","slug","tipo","valorBaseCents","ativo") VALUES
 ('prod_ef','org_seahub','Endereço Fiscal','endereco-fiscal','endereco_fiscal',28000,true),
 ('prod_priv','org_seahub','Sala Privativa','sala-privativa','espaco',150000,true),
 ('prod_seabox','org_seahub','Seabox','seabox','seabox',1990,true),
 ('prod_aud','org_seahub','Auditório','auditorio','auditorio',13000,true),
 ('prod_reuniao','org_seahub','Sala de Reunião','sala-reuniao','sala_reuniao',7000,true)
ON CONFLICT ("id") DO NOTHING;

-- Regras de comissao por programa + produto
INSERT INTO "ComissaoRegra" ("id","organizacaoId","programaId","produtoId","tipo","valor","recorrencia","tetoMeses") VALUES
 -- Parceria (foco em recorrente)
 ('cr_par_ef','org_seahub','prog_parceria','prod_ef','PERCENTUAL',1000,'RECORRENTE',12),
 ('cr_par_priv','org_seahub','prog_parceria','prod_priv','VALOR_FIXO',15000,'RECORRENTE',12),
 -- IndiQ (todos os produtos)
 ('cr_iq_ef','org_seahub','prog_indiq','prod_ef','PERCENTUAL',1000,'RECORRENTE',12),
 ('cr_iq_priv','org_seahub','prog_indiq','prod_priv','VALOR_FIXO',15000,'ONE_SHOT',NULL),
 ('cr_iq_seabox','org_seahub','prog_indiq','prod_seabox','VALOR_FIXO',1200,'ONE_SHOT',NULL),
 ('cr_iq_aud','org_seahub','prog_indiq','prod_aud','VALOR_FIXO',5000,'ONE_SHOT',NULL),
 ('cr_iq_reuniao','org_seahub','prog_indiq','prod_reuniao','VALOR_FIXO',2500,'ONE_SHOT',NULL)
ON CONFLICT ("id") DO NOTHING;

-- Conferencia rapida (opcional): contagem por tabela
-- SELECT 'Organizacao' t, count(*) FROM "Organizacao"
-- UNION ALL SELECT 'Programa', count(*) FROM "Programa"
-- UNION ALL SELECT 'Nivel', count(*) FROM "Nivel"
-- UNION ALL SELECT 'Produto', count(*) FROM "Produto"
-- UNION ALL SELECT 'ComissaoRegra', count(*) FROM "ComissaoRegra";
