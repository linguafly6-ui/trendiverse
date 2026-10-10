# TrendiVerse

Portal multitemático (Virales, Gaming, Micro-Herramientas, Chollos) con Next.js 15, React 19, Tailwind CSS 3.4 y Cloudflare D1.

## Desarrollo local

```bash
npm install --legacy-peer-deps
npm run dev
```

Sin binding D1, la app usa datos de ejemplo (`lib/sample-data.ts`), por lo que funciona de inmediato.

## Despliegue en Cloudflare Pages

1. `npx wrangler d1 create trendiverse-db` y copia el `database_id` en `wrangler.toml`.
2. (Opcional) `npx wrangler kv namespace create CACHE` y copia el `id` en `wrangler.toml`; y descomenta el bloque `kv_namespaces` (opcional).
3. Migraciones: `npm run migrate:cf` (esquema `0001_init.sql`, datos `0002_seed.sql`, artículos posteriores y, si se usa el cierre de cuenta de eBay, `0005_ebay_account_deletion_receipts.sql`). Local: `npm run migrate:local`. Datos de ejemplo: `npm run seed:db` (`-- --remote` para producción).
4. Crea el proyecto Pages: `npx wrangler pages project create trendiverse`.
5. En GitHub > Settings > Secrets añade `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
6. En Cloudflare Pages > Settings > Functions, añade el binding D1 `DB` (y KV `CACHE`) y la compatibilidad `nodejs_compat`.
7. Push a `main` → `.github/workflows/deploy.yml` construye con `@cloudflare/next-on-pages` y despliega.

Variables opcionales: `NEXT_PUBLIC_GA_ID` (Google Analytics), `NEXT_PUBLIC_SITE_URL`.

El cierre de cuenta de eBay Marketplace usa secretos de Pages, no variables de este archivo. La URL y los nombres están en [docs/ebay-account-deletion.md](docs/ebay-account-deletion.md).

## Estructura

- `app/` páginas y API routes (`/api/articles`, `/api/deals`, `/api/tools`, runtime edge)
- `components/` UI (Header con búsqueda ⌘K, Hero, feed con scroll infinito, códigos, chollos, herramientas…)
- `lib/` acceso a D1 (con caché KV opcional), utilidades y constantes
- `migrations/` esquema y seed D1
