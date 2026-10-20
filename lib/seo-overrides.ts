import { JORNADA_8_SEO } from './laliga-jornada-8-2026'
import { JORNADA_9_SEO } from './laliga-jornada-9-2026'
import { CONCIERTOS_AGENDA_SEO } from './conciertos-agenda-2026'
import { CONCERTS_GUIDE_SLUG } from './concerts'

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
  'mejores-freidoras-aire-amazon-espana-2026': {
    title: '10 mejores freidoras de aire Amazon 2026',
    description: 'Comparamos 10 freidoras de aire para cada cocina: capacidad, doble cesta, limpieza y funciones. Guía para elegir en Amazon España.',
  },
  'mejores-mancuernas-entrenar-casa-2026': {
    title: '10 mejores mancuernas para casa en 2026',
    description: 'Guía de mancuernas ajustables y fijas para casa: peso, seguridad, espacio, tipos de ajuste y qué revisar antes de comprar en Amazon.',
  },
  [CONCERTS_GUIDE_SLUG]: CONCIERTOS_AGENDA_SEO,
  ...JORNADA_8_SEO,
  ...JORNADA_9_SEO,
  'pep-guardiola-ultimas-noticias-vuelta-etihad': {
    title: 'Guardiola vuelve al Etihad tras el fallo',
    description: 'Guardiola tiene previsto el Etihad el 14 de octubre, según ESPN. El City apeló el fallo financiero. La sanción sigue sin decidirse.',
  },
  'decreto-universidades-privadas-supremo-anula': {
    title: 'Supremo anula el decreto universitario',
    description: 'El Supremo anula el decreto de universidades por la vía de urgencia. El fondo, con el mínimo de 4.500 alumnos, no se juzgó. El Gobierno prepara otra norma.',
  },
  'pedro-sanchez-ultimas-noticias-29n': {
    title: 'Sánchez y el 29N: vivienda y campaña',
    description: 'Sánchez convocó el 29N tras caer la vivienda en el Congreso. El 6 de octubre rehízo los decretos y arranca la precampaña en Dos Hermanas.',
  },
  'pensiones-seguridad-social-novedades-2027': {
    title: 'Pensiones 2027: subida, edad y cálculo',
    description: 'La subida de las pensiones en 2027 se liga al IPC y se cierra el 15 de diciembre. Edad de 67 años, nuevo cálculo de la base y jubilación flexible.',
  },
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
  'nvidia-innovacion-tecnologica-chips-inteligencia-artificial': { title: 'NVIDIA: innovación en chips e inteligencia artificial', description: 'Cómo NVIDIA impulsa la IA con GPU, CUDA y Blackwell, y qué límites de coste, energía y competencia marcarán su futuro.' },
  'microsoft-innovacion-tecnologica-ia-computacion-cuantica': { title: 'Microsoft: IA y computación cuántica', description: 'Azure, Copilot y Majorana 1: qué innovaciones de Microsoft ya se usan y cuáles siguen en fase de investigación.' },
  'tesla-innovacion-tecnologica-conduccion-robotica-optimus': { title: 'Tesla: innovación en conducción y robótica', description: 'Vehículos eléctricos, redes neuronales y Optimus: avances de Tesla, límites de la autonomía y retos de la robótica.' },
  'byd-innovacion-tecnologica-baterias-coches-electricos': { title: 'BYD: baterías e innovación eléctrica', description: 'Batería Blade, coches eléctricos y conducción asistida: cómo innova BYD y qué conviene comparar antes de comprar.' },
  'spacex-innovacion-tecnologica-cohetes-reutilizables-starlink': { title: 'SpaceX: cohetes reutilizables y Starlink', description: 'Falcon 9, Starship y Starlink: las innovaciones espaciales de SpaceX, su potencial, sus límites y sus retos.' },
  'prediccion-tecnologica-proximos-5-anos-2026-2031': {
    title: 'Predicción tecnológica: tendencias hasta 2031',
    description: 'Las 10 tendencias tecnológicas de 2026 a 2031: IA, robots, ciberseguridad, energía, salud digital y qué cambios son realmente probables.',
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
