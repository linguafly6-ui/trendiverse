-- Recibos de notificaciones de cierre de cuenta ya aceptadas.
-- No guarda username, userId ni eiasToken. No autoriza a borrar anuncios globales.
-- outcome: reserved, acknowledged-deletion-not-implemented o linked-personal-data-removed.
-- La reserva usa la clave primaria para que dos POST simultáneos no borren dos veces.
CREATE TABLE IF NOT EXISTS ebay_account_deletion_receipts (
  notification_id TEXT PRIMARY KEY,
  outcome TEXT NOT NULL,
  processed_at TEXT NOT NULL
);
