-- Pedidos do checkout. Status: aguardando, pago, enviado, cancelado.
CREATE TABLE IF NOT EXISTS pedidos (
  codigo TEXT PRIMARY KEY,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando',
  avisou_pagamento_em TEXT,
  kit_id TEXT NOT NULL,
  kit TEXT NOT NULL,
  tema TEXT,
  bombas INTEGER NOT NULL,
  frete TEXT NOT NULL,
  valor_frete REAL NOT NULL,
  total REAL NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cep TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  rastreio TEXT,
  observacao TEXT
);

CREATE INDEX IF NOT EXISTS pedidos_criado_em ON pedidos (criado_em DESC);
