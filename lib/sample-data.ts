import type { Article } from './types'

const chollosOtonoContent = `La gran temporada de ofertas del último trimestre de 2026 ya está aquí. Las semanas de ofertas de otoño y las campañas Pre-Black Friday se han consolidado como el momento perfecto para renovar dispositivos tecnológicos, equipar el hogar o adelantar las compras festivas con los mejores precios del año. En este artículo repasamos el calendario clave, las mejores categorías de descuento y las herramientas esenciales para verificar chollos reales.

## Calendario de ofertas de otoño y Pre-Black Friday 2026

Para aprovechar al máximo los descuentos, es fundamental conocer las fechas clave en las que las plataformas activan sus mejores promociones:

- **Fiesta de Ofertas de Otoño:** Principios a mediados de octubre (Amazon, PcComponentes).
- **Semanas del Electrón (Pre-BF):** Finales de octubre e inicios de noviembre (MediaMarkt, El Corte Inglés).
- **Día del Soltero (11.11):** 11 de noviembre (AliExpress, Miravia, Ebay).
- **Semana Black Friday:** Tercera semana de noviembre en todas las grandes superficies.

Planificar las compras en función de este calendario permite comparar la evolución de precios y evitar compras impulsivas.

## Categorías destacadas con mayores descuentos

Durante las campañas de otoño, las siguientes categorías registran las bajadas de precio más significativas:

### Smartphones y telefonía

Con la llegada de nuevos modelos a finales de verano, los terminales de la generación anterior sufren rebajas directas de entre un 20% y un 35%. Es la oportunidad ideal para adquirir gamas altas de años anteriores a precio de gama media.

### Gaming y consolas

Los packs de consolas con juegos clave, mandos adicionales y memorias SSD NVMe experimentan mínimos históricos anuales antes de la saturación navideña.

### Domótica y sonido inteligente

Altavoces inteligentes, cámaras Wi-Fi y sistemas de iluminación conectada suelen encabezar los mayores porcentajes de descuento, alcanzando hasta un 50% de rebaja.

### Wearables y audio portátil

Relojes inteligentes, pulseras de actividad y auriculares TWS con cancelación activa de ruido registran una alta competencia entre fabricantes, permitiendo encontrar grandes prestaciones por debajo de los 100 euros.

## Estrategias para identificar chollos reales

Un descuento anunciado no siempre equivale a un ahorro real. Aplica estos tres pasos antes de comprar:

1. **Revisa el histórico de precios:** Utiliza rastreadores de precios para verificar si el importe actual es realmente un mínimo histórico o si subió semanas antes.
2. **Calcula costes de envío y devoluciones:** Comprueba que las condiciones de envío y los plazos de devolución ampliados (habituales en campaña navideña) sean favorables.
3. **Combina cupones promocionales:** Revisa si la plataforma permite aplicar cupones de bienvenida o descuentos adicionales desde su app.

## Checklist rápida de preparación

- **Crea tu lista de deseos:** Define de antemano qué productos necesitas y establece un presupuesto máximo.
- **Registra tus datos previamente:** En las mejores ofertas el stock vuela en minutos; tener la cuenta lista agiliza la compra.
- **Verifica la garantía:** Recuerda que la garantía legal cubre los productos nuevos durante 3 años.

## Preguntas frecuentes

### ¿Cuándo empieza el Pre-Black Friday 2026?
Las ofertas de Pre-Black Friday suelen comenzar a finales de octubre y se extienden hasta la llegada oficial de la semana del Black Friday a mediados de noviembre.

### ¿Cómo saber si una oferta de verdad merece la pena?
La forma más precisa es consultar rastreadores e históricos de precios para confirmar el valor real del producto en los últimos 90 días.

### ¿Los productos comprados en otoño tienen plazo de devolución ampliado?
La mayoría de grandes tiendas amplían sus plazos de devolución desde noviembre hasta mediados de enero para facilitar las compras navideñas.`

const mundial2026Content = `La Copa del Mundo de la FIFA 2026 ya está en el centro de atención de millones de aficionados. Es una edición histórica con un formato renovado y sedes repartidas en Estados Unidos, México y Canadá.`

const mundialGuiaContent = `Guía completa sobre la Copa mundial de la FIFA 2026, el desarrollo del torneo, los cambios en los grupos y las principales sedes.`

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: 5,
    title: 'Guía Definitiva de Chollos de Otoño y Pre-Black Friday 2026: Cómo Ahorrar en Tecnología',
    slug: 'guia-chollos-otono-campanas-pre-black-friday-2026',
    category: 'chollos',
    excerpt: 'Descubre las mejores estrategias para cazar chollos en los Días de Ofertas de Otoño y el Pre-Black Friday 2026. Analizamos ofertas en tecnología, gaming y domótica.',
    content: chollosOtonoContent,
    image_url: '/images/articles/chollos-otono.svg',
    thumbnail_url: '/images/articles/chollos-otono-thumb.svg',
    read_time_minutes: 6,
    views: 105000,
    trending: 1,
    published_at: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 1,
    title: 'Copa del Mundo de la FIFA 2026: fechas, sedes, formato y todo lo que debes saber',
    slug: 'copa-del-mundo-fifa-2026',
    category: 'virales',
    excerpt: 'La edición más grande del torneo llega con sedes en tres países y un formato sin precedentes.',
    content: mundial2026Content,
    image_url: '/images/articles/mundial2026.svg',
    thumbnail_url: '/images/articles/mundial2026-thumb.svg',
    read_time_minutes: 8,
    views: 145000,
    trending: 1,
    published_at: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 4,
    title: 'Copa mundial de la FIFA 2026: guía completa de grupos, sedes y expectativas del torneo',
    slug: 'copa-mundial-fifa-2026-guia-completa',
    category: 'virales',
    excerpt: 'Guía con el desarrollo del torneo, los cambios en los grupos y las principales sedes.',
    content: mundialGuiaContent,
    image_url: '/images/articles/mundialguia.svg',
    thumbnail_url: '/images/articles/mundialguia-thumb.svg',
    read_time_minutes: 7,
    views: 85000,
    trending: 0,
    published_at: '2026-10-04T15:00:00.000Z',
  },
]

export const SAMPLE_CODES: any[] = [
  {
    game: 'Genshin Impact',
    code: 'GENSHIN2026OCT',
    reward: '60 Protogemas + 5 Experiencia',
    expires: '2026-10-31',
    note: 'Válido hasta finales de octubre',
  },
  {
    game: 'Honkai: Star Rail',
    code: 'STARRAILOCT26',
    reward: '50 Stellar Jade',
    expires: '2026-10-31',
    note: 'Válido hasta finales de octubre',
  },
]

export const SAMPLE_DEALS: any[] = []
export const SAMPLE_TOOLS: any[] = []
