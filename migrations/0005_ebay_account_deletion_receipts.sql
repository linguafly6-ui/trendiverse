-- Recibos de notificaciones de cierre de cuenta ya aceptadas.
-- No guarda username, userId ni eiasToken. No autoriza a borrar anuncios globales.
CREATE TABLE IF NOT EXISTS ebay_account_deletion_receipts (
  notification_id TEXT PRIMARY KEY,
  outcome TEXT NOT NULL,
  processed_at TEXT NOT NULL
);
