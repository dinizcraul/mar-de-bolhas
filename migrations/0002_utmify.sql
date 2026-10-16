-- Dados para a UTMify (worker/utmify.js): de qual anúncio o cliente veio (parâmetros utm_* em JSON),
-- o IP de quando gerou o Pix e quando o pedido foi marcado como pago.
ALTER TABLE pedidos ADD COLUMN utms TEXT;
ALTER TABLE pedidos ADD COLUMN ip TEXT;
ALTER TABLE pedidos ADD COLUMN pago_em TEXT;
