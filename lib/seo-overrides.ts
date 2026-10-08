/**
 * Títulos y descripciones SEO por artículo, independientes del título visible.
 * El layout añade " | TrendiVerse" (14 caracteres), así que los títulos van
 * a 46 caracteres o menos para no superar ~60 en Google. Descripciones ≤155.
 */
export interface SeoOverride {
  title: string
  description: string
}

export const SEO_OVERRIDES: Record<string, SeoOverride> = {
  'rufian-erc-ultimas-noticias-candidato-29n': {
    title: 'Rufián y el plan B de ERC para el 29N',
    description: 'Rufián no confirma si encabezará ERC el 29N. Junqueras lo defiende y el partido estudia a Jordi Albert como plan B antes del domingo.',
  },
  'fondos-buitre-2026-decreto-vivienda': {
    title: 'Fondos buitre 2026: quién no puede comprar',
    description: 'El decreto prohíbe a fondos y a dueños de más de 10 viviendas comprar por debajo del 70% de la tasación. Excepciones y efectos para quien vende.',
  },
  'decreto-vivienda-2026-arrendadores-arrendatarios': {
    title: 'Decreto alquiler 2026: caseros e inquilinos',
    description: 'Subida máxima del 2% hasta 2027, prórroga de dos años, alquiler de temporada y bonificaciones en el IRPF: qué gana y qué pierde cada parte.',
  },
  'nomina-enero-2027-mei-pensiones': {
    title: 'Nómina de enero 2027: sube el MEI',
    description: 'La cotización del trabajador al MEI pasa del 0,15% al 0,17%. Con una base de 2.000 euros, 40 céntimos más al mes. Dónde verlo en la nómina.',
  },
  'guia-chollos-otono-campanas-pre-black-friday-2026': {
    title: 'Calendario Black Friday y ofertas otoño 2026',
    description: 'Fechas de las ofertas de otoño, el 11.11 y el Black Friday 2026, y qué categorías bajan más en cada momento de la temporada.',
  },
  'guia-analisis-chollos-ecommerce-espana-2026': {
    title: 'Dónde comprar barato online en 2026',
    description: 'Amazon, PcComponentes, AliExpress Plaza, MediaMarkt y El Corte Inglés: dónde ahorrar según la categoría y cómo saber si un descuento es real.',
  },
  'novedades-tecnologia-2026-tv-moviles-ordenadores': {
    title: 'Novedades tecnológicas 2026 frente a 2025',
    description: 'Televisores, móviles y ordenadores de 2026 comparados con los de 2025, explicado sin tecnicismos: qué mejora de verdad y qué no.',
  },
  'semana-mundial-del-espacio-2026': {
    title: 'Semana Mundial del Espacio 2026',
    description: 'Del 4 al 10 de octubre, con el lema «Revolución de los Cohetes». Origen, actividades en España y qué ver en el cielo esta semana.',
  },
  'inundaciones-cataluna-octubre-2026-alerta-recomendaciones': {
    title: 'Inundaciones en Cataluña: octubre 2026',
    description: 'Avisos rojos, ES-Alert en ocho comarcas y más de 280 l/m². Qué ha pasado, zonas afectadas y qué hacer ante lluvias torrenciales.',
  },
  'evitar-electrocucion-ducha-seguridad-electrica-bano': {
    title: 'Cómo evitar electrocutarse en la ducha',
    description: 'La protección que evita electrocuciones en el baño, cómo comprobar tu diferencial de 30 mA y qué hacer si alguien recibe una descarga.',
  },
}

/** Recorta a `max` caracteres sin partir palabras, añadiendo "…" si corta. */
export function truncateWords(text: string, max = 155): string {
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, '')}…`
}
