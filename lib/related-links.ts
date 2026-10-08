/**
 * Enlaces cruzados entre artículos relacionados y a fuentes oficiales.
 * Se insertan como sección "Sigue leyendo" justo antes de "Preguntas frecuentes"
 * (o al final si el artículo no tiene ese bloque). Usa la sintaxis [texto](url)
 * que renderiza ArticleBody.
 */

const BOE_RDL_26_2026 = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20266'

const A = {
  fondos: '/articles/fondos-buitre-2026-decreto-vivienda',
  alquiler: '/articles/decreto-vivienda-2026-arrendadores-arrendatarios',
  nomina: '/articles/nomina-enero-2027-mei-pensiones',
  chollosOtono: '/articles/guia-chollos-otono-campanas-pre-black-friday-2026',
  chollosEcommerce: '/articles/guia-analisis-chollos-ecommerce-espana-2026',
  tecnologia: '/articles/novedades-tecnologia-2026-tv-moviles-ordenadores',
  espacio: '/articles/semana-mundial-del-espacio-2026',
  inundaciones: '/articles/inundaciones-cataluna-octubre-2026-alerta-recomendaciones',
  elecciones: '/articles/elecciones-generales-2026-29-noviembre',
  presupuestos: '/articles/espana-sin-presupuestos-prorrogados-consecuencias-ciudadanos-2026',
  pensiones: '/articles/pensiones-seguridad-social-novedades-2027',
  sanchez: '/articles/pedro-sanchez-ultimas-noticias-29n',
  vivienda29: '/articles/vivienda-elecciones-29n-comparar-propuestas-partidos',
  desahucios: '/articles/desahucios-decretos-vivienda-rechazados-que-sigue-vigente-2026',
  funciones: '/articles/gobierno-en-funciones-espana-que-puede-hacer-elecciones-2026',
  frente: '/articles/frente-amplio-espana-partidos-candidato-programa-29n',
  escanos: '/articles/como-se-reparten-escanos-voto-provincia-29n',
  electricidad: '/articles/evitar-electrocucion-ducha-seguridad-electrica-bano',
}

const RELATED: Record<string, string[]> = {
  'decreto-universidades-privadas-supremo-anula': [
    `[Últimas noticias de Pedro Sánchez](${A.sanchez}): la convocatoria del 29N y el calendario en el que cae esta sentencia.`,
    `[Elecciones generales del 29 de noviembre](${A.elecciones}): qué está ya convocado y qué se vota.`,
    `[Gobierno en funciones](${A.funciones}): qué margen tiene el Ejecutivo para aprobar la norma que anuncia.`,
  ],
  'pedro-sanchez-ultimas-noticias-29n': [
    `[Elecciones generales del 29 de noviembre](${A.elecciones}): calendario, convocatoria y qué se vota.`,
    `[Vivienda en el 29N](${A.vivienda29}): cómo comparar las propuestas cuando se publiquen los programas.`,
    `[Decretos de vivienda que decayeron](${A.desahucios}): qué siguió vigente tras el rechazo del Congreso.`,
    `[Gobierno en funciones](${A.funciones}): qué puede hacer el Ejecutivo después de disolver las Cortes.`,
  ],
  'pensiones-seguridad-social-novedades-2027': [
    `[Elecciones generales del 29 de noviembre](${A.elecciones}): por qué la revalorización entra en la campaña antes de que el INE cierre el IPC.`,
    `[España con presupuestos prorrogados](${A.presupuestos}): qué puede seguir el Estado sin unas cuentas nuevas.`,
    `[La nómina cambia en enero de 2027](${A.nomina}): la subida del MEI, distinta de la revalorización de las pensiones.`,
  ],
  'rufian-erc-ultimas-noticias-candidato-29n': [
    `[Elecciones generales del 29 de noviembre](${A.elecciones}): calendario, campaña y qué está ya convocado.`,
    `[Qué es el Frente Amplio](${A.frente}): partidos, candidato pendiente y relación con la izquierda.`,
    `[Cómo se reparten los escaños](${A.escanos}): por qué el resultado se decide provincia a provincia.`,
  ],
  'fondos-buitre-2026-decreto-vivienda': [
    `[Cómo afecta el decreto de vivienda a arrendadores e inquilinos](${A.alquiler}): límite del 2% a la subida de la renta, prórrogas y bonificaciones fiscales.`,
    `[La nómina cambia en enero de 2027](${A.nomina}): qué te descontarán para financiar las pensiones.`,
    `[Texto del Real Decreto-ley 26/2026 en el BOE](${BOE_RDL_26_2026}), la fuente oficial.`,
  ],
  'decreto-vivienda-2026-arrendadores-arrendatarios': [
    `[Fondos buitre en 2026](${A.fondos}): quién no puede comprar vivienda por debajo del 70% de su valor y hasta cuándo.`,
    `[La nómina cambia en enero de 2027](${A.nomina}): la subida del MEI para financiar las pensiones.`,
    `[Texto del Real Decreto-ley 26/2026 en el BOE](${BOE_RDL_26_2026}), la fuente oficial.`,
  ],
  'nomina-enero-2027-mei-pensiones': [
    `[Pensiones y Seguridad Social en 2027](${A.pensiones}): revalorización con el IPC, edad de jubilación y nuevo cálculo.`,
    `[Cómo afecta el decreto de vivienda a arrendadores e inquilinos](${A.alquiler}): lo que cambia en el alquiler y en el IRPF.`,
    `[Fondos buitre en 2026](${A.fondos}): el decreto que limita las compras especulativas de vivienda.`,
  ],
  'guia-chollos-otono-campanas-pre-black-friday-2026': [
    `[Guía de chollos e-commerce en España 2026](${A.chollosEcommerce}): tienda por tienda, dónde están las ofertas reales.`,
    `[Novedades tecnológicas 2026](${A.tecnologia}): qué televisores, móviles y ordenadores merecen la pena frente a los de 2025.`,
  ],
  'guia-analisis-chollos-ecommerce-espana-2026': [
    `[Chollos de otoño y Pre-Black Friday 2026](${A.chollosOtono}): el calendario de ofertas de la temporada.`,
    `[Novedades tecnológicas 2026](${A.tecnologia}): compara los modelos nuevos con los del año pasado antes de comprar.`,
  ],
  'novedades-tecnologia-2026-tv-moviles-ordenadores': [
    `[Chollos de otoño y Pre-Black Friday 2026](${A.chollosOtono}): cuándo comprar tecnología más barata.`,
    `[Guía de chollos e-commerce en España 2026](${A.chollosEcommerce}): dónde comprar y cómo verificar los descuentos.`,
    `[Semana Mundial del Espacio 2026](${A.espacio}): la Revolución de los Cohetes y qué ver en el cielo.`,
  ],
  'semana-mundial-del-espacio-2026': [
    `[Novedades tecnológicas 2026](${A.tecnologia}): televisores, móviles y ordenadores del año.`,
  ],
  'inundaciones-cataluna-octubre-2026-alerta-recomendaciones': [
    `[Cómo evitar electrocutarse en la ducha](${A.electricidad}): agua y electricidad en casa, qué protección necesitas y qué hacer ante una descarga.`,
  ],
  'evitar-electrocucion-ducha-seguridad-electrica-bano': [
    `[Inundaciones en Cataluña en octubre de 2026](${A.inundaciones}): recomendaciones de Protección Civil ante lluvias torrenciales.`,
    `[Novedades tecnológicas 2026](${A.tecnologia}): lo nuevo en televisores, móviles y ordenadores.`,
  ],
}

export function withRelatedLinks(slug: string, content: string | null | undefined): string {
  const base = content ?? ''
  const links = RELATED[slug]
  if (!links?.length) return base
  const section = `## Sigue leyendo\n\n${links.map((l) => `- ${l}`).join('\n')}`
  const faqIndex = base.search(/\n##\s+Preguntas frecuentes/)
  if (faqIndex === -1) return `${base.trimEnd()}\n\n${section}`
  return `${base.slice(0, faqIndex).trimEnd()}\n\n${section}\n${base.slice(faqIndex)}`
}
