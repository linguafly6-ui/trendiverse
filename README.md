# TrendiVerse

Portal multitemático (Virales, Gaming, Micro-Herramientas, Chollos) con Next.js 15, React 19 y Tailwind CSS 3.4.

## Desarrollo local

```bash
npm install --legacy-peer-deps
npm run dev
```

La app usa datos de ejemplo (`lib/sample-data.ts`) para artículos, ofertas y herramientas, tanto en desarrollo local como en producción. No requiere una base de datos ni bindings de almacenamiento.

## Despliegue en Cloudflare Pages

1. Crea el proyecto Pages: `npx wrangler pages project create trendiverse`.
2. En GitHub > Settings > Secrets añade `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
3. Push a `main` → `.github/workflows/deploy.yml` construye con `@cloudflare/next-on-pages` y despliega.

Variables opcionales: `NEXT_PUBLIC_GA_ID` (Google Analytics), `NEXT_PUBLIC_SITE_URL`.

## Estructura

- `app/` páginas y API routes (`/api/articles`, `/api/deals`, `/api/tools`, runtime edge)
- `components/` UI (Header con búsqueda ⌘K, Hero, feed con scroll infinito, códigos, chollos, herramientas…)
- `lib/` acceso a datos de ejemplo, utilidades y constantes
