-- Indiko - criacao das tabelas (rode uma vez no SQL Editor do Supabase)
-- Seguro rodar mais de uma vez: usa IF NOT EXISTS e protege os tipos.

-- 1) Tipos (enums)
DO $$ BEGIN CREATE TYPE "Papel" AS ENUM ('SUPER_ADMIN','ADMIN','OPERACAO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "OrgStatus" AS ENUM ('ATIVA','TRIAL','SUSPENSA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Recorrencia" AS ENUM ('ONE_SHOT','RECORRENTE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TipoComissaoRegra" AS ENUM ('PERCENTUAL','VALOR_FIXO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ReferralStatus" AS ENUM ('AGUARDANDO_CONTATO','EM_NEGOCIACAO','CONVERTIDA','PERDIDA','DESCARTADA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "CommissionStatus" AS ENUM ('PENDENTE','DISPONIVEL','PAGA','CANCELADA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PartnerStatus" AS ENUM ('ATIVO','INATIVO','BANIDO'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2) Tabelas (na ordem de dependencia)
CREATE TABLE IF NOT EXISTS "Organizacao" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "dominioCustom" TEXT,
  "branding" JSONB,
  "plano" TEXT NOT NULL DEFAULT 'mvp',
  "status" "OrgStatus" NOT NULL DEFAULT 'ATIVA',
  "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Usuario" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT REFERENCES "Organizacao"("id"),
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "senhaHash" TEXT NOT NULL,
  "papel" "Papel" NOT NULL DEFAULT 'OPERACAO',
  "twofaAtivo" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Programa" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descricao" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "tetoRecorrenciaMeses" INTEGER NOT NULL DEFAULT 12,
  "publicoAlvo" TEXT,
  UNIQUE ("organizacaoId","slug")
);

CREATE TABLE IF NOT EXISTS "Nivel" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL,
  "programaId" TEXT NOT NULL REFERENCES "Programa"("id"),
  "nome" TEXT NOT NULL,
  "ordem" INTEGER NOT NULL,
  "regraSubida" TEXT,
  "regraCadenciaDias" INTEGER,
  "multiplicador" INTEGER NOT NULL DEFAULT 10000,
  "beneficiosExtras" JSONB
);

CREATE TABLE IF NOT EXISTS "Produto" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "tipo" TEXT NOT NULL,
  "valorBaseCents" INTEGER NOT NULL DEFAULT 0,
  UNIQUE ("organizacaoId","slug")
);

CREATE TABLE IF NOT EXISTS "ComissaoRegra" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL,
  "programaId" TEXT NOT NULL REFERENCES "Programa"("id"),
  "produtoId" TEXT NOT NULL REFERENCES "Produto"("id"),
  "tipo" "TipoComissaoRegra" NOT NULL,
  "valor" INTEGER NOT NULL,
  "recorrencia" "Recorrencia" NOT NULL DEFAULT 'ONE_SHOT',
  "tetoMeses" INTEGER,
  UNIQUE ("programaId","produtoId")
);

CREATE TABLE IF NOT EXISTS "Parceiro" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "cpfCnpj" TEXT,
  "pixChave" TEXT,
  "programaId" TEXT NOT NULL REFERENCES "Programa"("id"),
  "nivelId" TEXT REFERENCES "Nivel"("id"),
  "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ultimaIndicacaoValida" TIMESTAMP(3),
  "status" "PartnerStatus" NOT NULL DEFAULT 'ATIVO',
  "optInLeaderboard" BOOLEAN NOT NULL DEFAULT true,
  "optInNotificacoes" BOOLEAN NOT NULL DEFAULT true,
  UNIQUE ("organizacaoId","email")
);

CREATE TABLE IF NOT EXISTS "Campanha" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "programaId" TEXT NOT NULL REFERENCES "Programa"("id"),
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "periodoInicio" TIMESTAMP(3),
  "periodoFim" TIMESTAMP(3),
  "landingConfig" JSONB,
  "ofertaCupom" TEXT,
  UNIQUE ("organizacaoId","slug")
);

CREATE TABLE IF NOT EXISTS "Indicacao" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "parceiroId" TEXT NOT NULL REFERENCES "Parceiro"("id"),
  "produtoId" TEXT NOT NULL REFERENCES "Produto"("id"),
  "campanhaId" TEXT REFERENCES "Campanha"("id"),
  "leadNome" TEXT NOT NULL,
  "leadEmail" TEXT,
  "leadTelefone" TEXT,
  "leadCpfCnpj" TEXT,
  "status" "ReferralStatus" NOT NULL DEFAULT 'AGUARDANDO_CONTATO',
  "utmSource" TEXT,
  "utmCampaign" TEXT,
  "clickupCardId" TEXT,
  "conexaClienteId" TEXT,
  "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "convertidaEm" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "Comissao" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL REFERENCES "Organizacao"("id"),
  "indicacaoId" TEXT NOT NULL REFERENCES "Indicacao"("id"),
  "parceiroId" TEXT NOT NULL REFERENCES "Parceiro"("id"),
  "tipo" "Recorrencia" NOT NULL DEFAULT 'ONE_SHOT',
  "valorBrutoCents" INTEGER NOT NULL,
  "valorLiquidoCents" INTEGER NOT NULL,
  "status" "CommissionStatus" NOT NULL DEFAULT 'PENDENTE',
  "mesReferencia" TEXT,
  "geradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pagaEm" TIMESTAMP(3),
  "pagamentoLoteId" TEXT
);

CREATE TABLE IF NOT EXISTS "PagamentoLote" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL,
  "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataPagamento" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'aberto',
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  "totalParceiros" INTEGER NOT NULL DEFAULT 0,
  "csvExportUrl" TEXT
);

CREATE TABLE IF NOT EXISTS "WebhookLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL,
  "origem" TEXT NOT NULL,
  "payloadRaw" JSONB NOT NULL,
  "eventoTipo" TEXT NOT NULL,
  "indicacaoId" TEXT,
  "status" TEXT NOT NULL,
  "hashIdempotencia" TEXT NOT NULL UNIQUE,
  "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processadoEm" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "EventoNivel" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizacaoId" TEXT NOT NULL,
  "parceiroId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "deNivelId" TEXT,
  "paraNivelId" TEXT,
  "motivo" TEXT,
  "ocorridoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
