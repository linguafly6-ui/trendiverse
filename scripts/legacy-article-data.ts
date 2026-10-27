// Migration-only source for one-time D1 bootstrap. This module is never imported by the website runtime.
import type { Article } from '../lib/types'
import { TOPTRENDS_ARTICLES } from '../lib/toptrends-articles'
import { SAMPLE_ARTICLES as BASE_SAMPLE_ARTICLES } from '../lib/chollos-otono'
import { EXTRA_ARTICLES } from '../lib/extra-articles'
import { MASCARILLAS_PELO_AMAZON_ARTICLE } from '../lib/mascarillas-pelo-amazon-article'
import { AUDI_ARTICLES } from '../lib/audi-article'
import { IPHONE_ARTICLES } from '../lib/iphone-article'
import { BARCELONA_REAL_MADRID_ARTICLES } from '../lib/barcelona-real-madrid-article'
import { PORTUGAL_NORUEGA_ARTICLES } from '../lib/portugal-noruega-article'
import { GIRONA_MALLORCA_ARTICLES } from '../lib/girona-mallorca-article'
import { EVENEPOEL_ARTICLES } from '../lib/evenepoel-article'
import { EDITORIAL_ARTICLES } from '../lib/editorial-articles'
import { OCTOBER_2026_ARTICLES } from '../lib/october-2026-articles'
import { SEO_BATCH_01_ARTICLES } from '../lib/seo-batch-01'
import { SEO_BATCH_02_ARTICLES } from '../lib/seo-batch-02'
import { SEO_BATCH_03_ARTICLES } from '../lib/seo-batch-03'
import { SEO_BATCH_04_ARTICLES } from '../lib/seo-batch-04'
import { SEO_BATCH_05_ARTICLES } from '../lib/seo-batch-05'
import { AHORRO_BATCH_01_ARTICLES } from '../lib/ahorro-batch-01'
import { TECNOLOGIA_2026_ARTICLES } from '../lib/tecnologia-2026'
import { PREDICCION_TECNOLOGICA_2031_ARTICLES } from '../lib/prediccion-tecnologica-2031'
import { INUNDACIONES_CATALUNA_2026_ARTICLES } from '../lib/inundaciones-cataluna-2026'
import { SEMANA_MUNDIAL_ESPACIO_2026_ARTICLES } from '../lib/semana-mundial-espacio-2026'
import { NOMINA_2027_MEI_ARTICLES } from '../lib/nomina-2027-mei'
import { FONDOS_BUITRE_2026_ARTICLES } from '../lib/fondos-buitre-2026'
import { ALQUILER_DECRETO_2026_ARTICLES } from '../lib/decreto-alquiler-2026'
import { SEGURIDAD_ELECTRICA_BANO_ARTICLES } from '../lib/seguridad-electrica-bano'
import { EMPRESAS_QUE_TRANSFORMAN_ARTICLES } from '../lib/empresas-que-transforman-2026'
import { MODA_TENDENCIAS_ARTICLES } from '../lib/moda-tendencias-2026'
import { GAMING_TENDENCIAS_ARTICLES } from '../lib/gaming-tendencias-2026'
import { ACTUALIDAD_TRENDING_ARTICLES_2026 } from '../lib/actualidad-trending-2026'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_12 } from '../lib/actualidad-trending-2026-batch-12'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_11 } from '../lib/actualidad-trending-2026-batch-11'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_10 } from '../lib/actualidad-trending-2026-batch-10'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_9 } from '../lib/actualidad-trending-2026-batch-9'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_8 } from '../lib/actualidad-trending-2026-batch-8'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_7 } from '../lib/actualidad-trending-2026-batch-7'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_6 } from '../lib/actualidad-trending-2026-batch-6'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_5 } from '../lib/actualidad-trending-2026-batch-5'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_4 } from '../lib/actualidad-trending-2026-batch-4'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_3 } from '../lib/actualidad-trending-2026-batch-3'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_2 } from '../lib/actualidad-trending-2026-batch-2'

// Keeps the first record per slug (earlier entries take precedence).
function dedupeBySlug<T extends { slug: string }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((x) => (seen.has(x.slug) ? false : (seen.add(x.slug), true)))
}

const BUNDLED_EDITORIAL_ARTICLES = [...ACTUALIDAD_TRENDING_ARTICLES_BATCH_12, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_11, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_10, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_9, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_8, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_7, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_6, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_5, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_4, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_3, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_2, ...ACTUALIDAD_TRENDING_ARTICLES_2026, ...TOPTRENDS_ARTICLES, MASCARILLAS_PELO_AMAZON_ARTICLE, ...EDITORIAL_ARTICLES, ...AHORRO_BATCH_01_ARTICLES, ...SEO_BATCH_05_ARTICLES, ...SEO_BATCH_04_ARTICLES, ...SEO_BATCH_03_ARTICLES, ...SEO_BATCH_02_ARTICLES, ...SEO_BATCH_01_ARTICLES, ...OCTOBER_2026_ARTICLES, ...EMPRESAS_QUE_TRANSFORMAN_ARTICLES, ...MODA_TENDENCIAS_ARTICLES, ...GAMING_TENDENCIAS_ARTICLES]

export const SAMPLE_ARTICLES: Article[] = dedupeBySlug([...BUNDLED_EDITORIAL_ARTICLES, ...PREDICCION_TECNOLOGICA_2031_ARTICLES, ...TECNOLOGIA_2026_ARTICLES, ...SEGURIDAD_ELECTRICA_BANO_ARTICLES, ...SEMANA_MUNDIAL_ESPACIO_2026_ARTICLES, ...NOMINA_2027_MEI_ARTICLES, ...FONDOS_BUITRE_2026_ARTICLES, ...ALQUILER_DECRETO_2026_ARTICLES, ...INUNDACIONES_CATALUNA_2026_ARTICLES, ...EVENEPOEL_ARTICLES, ...GIRONA_MALLORCA_ARTICLES, ...PORTUGAL_NORUEGA_ARTICLES, ...BARCELONA_REAL_MADRID_ARTICLES, ...IPHONE_ARTICLES, ...AUDI_ARTICLES, ...EXTRA_ARTICLES, ...BASE_SAMPLE_ARTICLES])

