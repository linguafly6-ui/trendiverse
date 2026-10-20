import type { Article } from './types'

/**
 * Plantilla compartida de las previas de LaLiga (una página por partido).
 * Cada jornada aporta su clasificación, sus partidos y los textos de contexto;
 * aquí vive la estructura común del artículo, el marcador y los enlaces.
 */

export interface Side {
  name: string
  pos: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  pts: number
  form: string
}

export interface Fixture {
  id: number
  slug: string
  home: Side
  away: Side
  espnHome: string
  espnAway: string
  date: string
  dayLabel: string
  hour: string
  tv: string
  venue: string
  published_at: string
  /** Extracto propio del partido; el constructor le antepone la palabra clave de entradas. */
  excerpt: string
  /** Una o dos frases humanas que presentan el partido. */
  lead: string
  /** Narrativa de qué se juegan los dos equipos. */
  essay: string
  neighbors: string
}

export interface MatchdayConfig {
  /** Número de la jornada que se juega. */
  jornada: number
  /** Jornada tras la que está tomada la clasificación. */
  tableAfterJornada: number
  /** Partidos jugados por casi toda la Liga en esa clasificación. */
  usualGames: number
  /** Frase que se usa cuando los dos equipos han jugado los mismos partidos que casi toda la Liga. */
  evenGamesLine: string
  /** Párrafo que sitúa la clasificación general. */
  standingsSummary: string
  /** Párrafo con el calendario completo de la jornada. */
  calendarText: string
  /** Primera frase del bloque «Si gana, empata o pierde». */
  pointsIntro: string
  /** Aviso opcional cuando la clasificación puede cambiar antes del partido. */
  pendingNote?: string
  fixtures: Fixture[]
}

export interface LiveFixtureRef {
  league: 'esp.1'
  espnHome: string
  espnAway: string
  date: string
  kickoffLabel: string
  startDate: string
  venue: string
  homeName: string
  awayName: string
}

export interface Matchday {
  articles: Article[]
  slugs: string[]
  seo: Record<string, { title: string; description: string }>
  related: Record<string, string[]>
  liveMatchForSlug: (slug: string) => LiveFixtureRef | null
}

function gd(side: Side): string {
  const diff = side.gf - side.gc
  if (diff > 0) return `+${diff}`
  return String(diff)
}

function ordinal(pos: number, fem = false): string {
  const words: Record<number, string> = {
    1: 'primero', 2: 'segundo', 3: 'tercero', 4: 'cuarto', 5: 'quinto', 6: 'sexto', 7: 'séptimo', 8: 'octavo', 9: 'noveno', 10: 'décimo',
    11: 'undécimo', 12: 'duodécimo', 13: 'decimotercero', 14: 'decimocuarto', 15: 'decimoquinto', 16: 'decimosexto', 17: 'decimoséptimo',
    18: 'decimoctavo', 19: 'penúltimo', 20: 'último',
  }
  const word = words[pos] ?? `${pos}.º`
  return fem ? word.replace(/o$/, 'a') : word
}

function isFem(name: string): boolean {
  return name === 'Real Sociedad'
}

/** «el Rayo Vallecano», «la Real Sociedad». */
function el(name: string): string {
  return `${isFem(name) ? 'la' : 'el'} ${name}`
}

/** «del Rayo Vallecano», «de la Real Sociedad». */
function de(name: string): string {
  return `${isFem(name) ? 'de la' : 'del'} ${name}`
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Estadios que se nombran sin artículo: «en Mendizorrotza», «en Mestalla». */
const BARE_VENUES = new Set(['Mendizorrotza', 'Mestalla', 'Balaídos', 'Riazor'])

/** «en el Estadio de Vallecas», «en La Rosaleda», «en Mendizorrotza». */
function enVenue(venue: string): string {
  if (/^(La|El) /.test(venue) || BARE_VENUES.has(venue)) return `en ${venue}`
  return `en el ${venue}`
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

const GAMES_WORDS: Record<number, string> = { 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez', 11: 'once', 12: 'doce' }

function portrait(side: Side): string {
  const games = `${GAMES_WORDS[side.pj] ?? side.pj} partidos`
  return `${cap(el(side.name))} va ${ordinal(side.pos, isFem(side.name))}, con ${side.pts} puntos en ${games}: ${plural(side.pg, 'victoria', 'victorias')}, ${plural(side.pe, 'empate', 'empates')} y ${plural(side.pp, 'derrota', 'derrotas')}. Ha marcado ${side.gf} goles y ha encajado ${side.gc} (diferencia ${gd(side)}).`
}

function formSummary(side: Side): string {
  const tokens = side.form.split(/\s+/)
  const g = tokens.filter((t) => t === 'G').length
  const e = tokens.filter((t) => t === 'E').length
  const p = tokens.filter((t) => t === 'P').length
  if (g === tokens.length) return `Sus últimos ${tokens.length} partidos han sido todos victorias.`
  if (p === tokens.length) return `Sus últimos ${tokens.length} partidos han sido todos derrotas.`
  return `En sus últimos ${tokens.length} partidos ha sumado ${plural(g, 'victoria', 'victorias')}, ${plural(e, 'empate', 'empates')} y ${plural(p, 'derrota', 'derrotas')}.`
}

function longFormPreview(fx: Fixture, cfg: MatchdayConfig): string {
  const h = fx.home
  const a = fx.away
  const pair = h.name + '-' + a.name
  const home = h.name
  const away = a.name
  return [
    '## Análisis táctico del ' + pair,
    'La primera clave del ' + pair + ' será la gestión de los espacios. El equipo que consiga defender hacia delante sin dejar desprotegida la espalda podrá recuperar más arriba y reducir el tiempo que necesita para llegar al área rival. Sin embargo, presionar no consiste solo en correr: hace falta coordinación entre la primera línea, los centrocampistas y la defensa. Si una de esas piezas salta tarde, el adversario puede superar la presión con un pase y atacar con ventaja.',
    home + ' tratará de aprovechar su condición de local y encontrar un ritmo que le permita instalarse en campo contrario. Para ello necesita que los jugadores cercanos al balón ofrezcan líneas de pase y que las llegadas al área estén acompañadas. La posesión será útil si sirve para progresar, mover al rival y encontrar a un compañero en una posición ventajosa; acumular pases sin profundidad puede facilitar la tarea defensiva del contrario.',
    away + ' tendrá que decidir cuándo presionar y cuándo protegerse en un bloque más compacto. Si retrocede demasiado, puede conceder segundas jugadas y permitir que el anfitrión ataque una y otra vez. Si adelanta las líneas sin ayudas, aparecerán espacios a la espalda. La lectura de esos momentos puede resultar tan importante como el dibujo inicial de los entrenadores.',
    '## El centro del campo y la salida de balón',
    'La batalla por el centro del campo no se reduce a quién acumula más posesión. También importa quién recibe de cara, quién puede girarse bajo presión y quién acompaña la primera recuperación. Un equipo que gana el balón pero no encuentra apoyos cercanos suele devolverlo rápidamente; uno que combina con apoyos cortos puede superar líneas y avanzar con más control. En el ' + pair + ', el primer pase después de recuperar será una señal útil para entender qué plan está funcionando.',
    'La salida en corto puede atraer la presión y liberar espacios más adelante, mientras que el juego directo permite saltarse la primera línea y disputar la segunda jugada. No existe una solución universal: cada decisión depende de la altura del rival, la precisión de los receptores y la capacidad de los centrocampistas para recoger los rechaces. La variedad en la salida evita que el adversario anticipe con facilidad el siguiente movimiento.',
    '## Las bandas, los espacios interiores y la llegada al área',
    'Abrir el campo obliga a la defensa a cubrir más metros. Un extremo que fija a su marcador, un lateral que aparece por fuera y un centrocampista que ocupa el medio espacio pueden generar dudas en las ayudas defensivas. Si varios jugadores atacan la misma zona, el rival tendrá más fácil cerrar el camino; si se distribuyen bien las alturas, el poseedor dispondrá de más de una opción para progresar. La amplitud debe servir para encontrar mejores posiciones, no solo para acumular centros.',
    'La ocupación del área es otro factor decisivo. Los centros tienen más posibilidades de convertirse en ocasiones cuando hay presencia en el primer palo, en la zona central y en el segundo palo, además de jugadores atentos al rechace. La calidad del último pase y la coordinación de los desmarques pueden marcar la diferencia entre una llegada prometedora y un remate cómodo para la defensa. También habrá que observar si los dos equipos consiguen finalizar sus ataques o si pierden el balón antes de poner a prueba al portero.',
    '## Transiciones: el partido después de cada pérdida',
    'Los segundos posteriores a una pérdida suelen ser especialmente delicados. Si el equipo que pierde el balón reacciona de forma coordinada, puede recuperar cerca del área rival y volver a atacar. Si cada jugador decide por su cuenta, el adversario encontrará espacios para correr. Por eso, el equilibrio entre atacar con muchos efectivos y conservar una estructura defensiva será una de las decisiones que pueden inclinar el encuentro.',
    'Cuando recupere, cada equipo deberá valorar si existe una oportunidad clara para avanzar rápido o si conviene conservar la pelota y reorganizarse. La transición vertical puede castigar a una defensa descolocada, pero forzar un pase arriesgado también puede devolver la iniciativa al rival. Saber elegir entre acelerar y pausar el juego es una señal de madurez competitiva, sobre todo en los minutos en los que el marcador aumenta la presión.',
    '## El balón parado puede cambiar el guion',
    'Los córners, las faltas laterales y los saques de banda próximos al área ofrecen oportunidades para atacar sin necesidad de construir una jugada larga. La organización en estas acciones exige movimientos coordinados, bloqueos legales, buenos tiempos de salto y atención a los rechaces. En defensa, es fundamental no perder las referencias y reaccionar al segundo balón. En un partido equilibrado, una acción detenida puede tener más influencia que varias posesiones largas.',
    'También será importante evitar faltas innecesarias cerca del área. La concentración en los últimos minutos, cuando el cansancio puede reducir la precisión, resulta especialmente valiosa. Un equipo que defiende con orden y no concede acciones evitables puede proteger una ventaja; otro que mantiene la calma en ataque puede encontrar una ocasión cuando el rival ya está pendiente del marcador.',
    '## Qué puede cambiar durante el partido',
    'El primer gol suele modificar las prioridades. Si marca ' + home + ', puede elegir entre controlar el balón y seguir buscando el segundo tanto; si se adelanta ' + away + ', el anfitrión tendrá que decidir cómo aumentar su presencia ofensiva sin regalar espacios para las contras. El marcador no decide por sí solo el resultado, pero altera las distancias, los riesgos asumidos y el tipo de sustituciones que cada entrenador puede necesitar.',
    'El banquillo será relevante si el desgaste abre espacios en la última media hora. Un atacante fresco puede fijar a los centrales, un centrocampista capaz de conservar el balón puede ayudar a proteger una ventaja y un jugador de banda puede ofrecer profundidad ante una defensa cansada. La utilidad de los cambios dependerá del desarrollo real del encuentro; por eso, no conviene anticipar decisiones técnicas que todavía no se han producido.',
    '## Qué se juega cada equipo en la jornada 10',
    'Para ' + home + ', el encuentro en casa representa una oportunidad de sumar ante su afición y confirmar el trabajo de la semana. La victoria añadiría tres puntos y reforzaría la confianza; un empate puede ser útil si el partido se complica, aunque su valor depende del contexto de la clasificación y de los resultados de los rivales directos. Una derrota obligaría a revisar el rendimiento, pero no debería interpretarse de forma aislada ni como una conclusión definitiva sobre toda la temporada.',
    'Para ' + away + ', puntuar a domicilio puede ayudar a dar continuidad a los resultados y demostrar que el equipo sabe competir fuera de su estadio. Ganar tendría un valor evidente, pero también puede ser importante gestionar bien un empate si el desarrollo del partido no permite asumir riesgos con seguridad. La ambición debe convivir con el pragmatismo: no todos los minutos exigen la misma respuesta ni todos los escenarios se resuelven atacando con más jugadores.',
    'Los puntos exactos y la posición que ocupe cada equipo después del encuentro dependerán de la clasificación vigente y del resto de resultados. En esta página, las estadísticas de referencia proceden del corte que se indica en el aviso editorial. Deben actualizarse antes de publicar una valoración definitiva de la tabla, la forma reciente o las consecuencias matemáticas de cada marcador.',
    '## Cinco claves para entender el ' + pair,
    'La primera clave será quién consigue imponer el ritmo. Un encuentro abierto, con transiciones constantes, puede beneficiar al equipo que encuentre espacios para correr; uno más pausado puede favorecer a quien gestione mejor la posesión y la colocación. La segunda será la calidad de las pérdidas: regalar el balón en zonas centrales suele ser más peligroso que perderlo lejos de la propia portería.',
    'La tercera clave será la eficacia en las áreas. El dominio territorial no garantiza una victoria si no se transforma en ocasiones claras, mientras que un equipo que genera menos puede mantenerse en el partido si defiende bien y aprovecha una oportunidad. La cuarta estará en las acciones a balón parado y en los rechaces. La quinta, en la capacidad de los entrenadores para ajustar el plan sin perder el equilibrio colectivo.',
    '## Contexto del calendario y seguimiento del partido',
    'El ' + pair + ' forma parte de la jornada 10 de LaLiga EA Sports 2026/27, programada entre el viernes 23 y el lunes 26 de octubre. La distribución de horarios hace que algunos equipos conozcan los resultados de sus rivales antes de saltar al campo, mientras que otros jugarán con una clasificación provisional ya modificada. Esa circunstancia añade contexto, pero cada equipo necesita concentrarse en su propio rendimiento y no depender de combinaciones ajenas.',
    cfg.calendarText,
    'La fecha, la hora, el estadio y la retransmisión son los datos prácticos que conviene revisar antes de desplazarse o planificar cómo ver el partido. La programación puede cambiar, por lo que los canales oficiales de LALIGA, los clubes y los operadores deben considerarse la referencia final ante cualquier modificación. Las alineaciones y las posibles bajas solo deben incorporarse cuando exista información confirmada, no a partir de rumores o de previsiones sin respaldo.',
    'Durante el encuentro, el marcador de esta página permite consultar el resultado y el minuto de juego. Antes del pitido inicial, el 0-0 solo indica que el partido no ha comenzado; no es un pronóstico ni un resultado final. Cuando el encuentro arranque, la información se actualizará con los datos que reciba el sistema, aunque una incidencia de conexión puede provocar algún retraso puntual.',
    'Después del pitido final, el resultado deberá leerse junto con el resto de partidos de la jornada. Una victoria no siempre supone subir puestos, del mismo modo que un empate puede tener un valor distinto para cada equipo. Para sacar conclusiones conviene considerar la clasificación actualizada, los encuentros pendientes y el rendimiento mostrado durante los noventa minutos, además del marcador.',
    '## Preguntas que deja la previa',
    '¿Qué debe hacer ' + home + ' para tener opciones? Aprovechar el factor campo, defender con equilibrio y transformar sus llegadas en ocasiones de calidad. ¿Qué necesita ' + away + '? Mantener el orden, elegir bien los momentos para presionar y aprovechar los espacios cuando recupere. ¿Puede decidirse en una acción a balón parado? Sí: en partidos igualados, un córner o una falta lateral puede alterar el guion, aunque no es posible anticipar que vaya a suceder.',
    '¿Es posible asegurar un resultado antes de jugar? No. La previa identifica tendencias y factores tácticos, pero el fútbol mantiene una incertidumbre que depende de las decisiones, la ejecución y los acontecimientos del encuentro. Una predicción responsable explica escenarios posibles sin presentar como hechos una alineación no confirmada, una lesión no verificada o un marcador futuro.',
    '## Conclusión: un partido que se decidirá en los detalles',
    'El ' + pair + ' ofrece varios duelos que conviene seguir: la salida de balón frente a la presión, la batalla en el centro del campo, la ocupación de las bandas, la defensa de las transiciones y la eficacia en el área. Si ' + home + ' consigue convertir su iniciativa en ocasiones claras, tendrá argumentos para buscar la victoria; si ' + away + ' mantiene el orden y aprovecha los espacios, podrá discutir el control del partido. La clave será que cada equipo ejecute su plan y se adapte a lo que ocurra.',
    'La previa debe entenderse como una guía para llegar al encuentro con los datos esenciales y las claves de juego, no como una garantía de resultado. La clasificación y las rachas se deben revisar antes del inicio, especialmente mientras el módulo conserve el corte provisional señalado en el aviso editorial. Para seguir la evolución del marcador, consulta esta página durante el partido y contrasta cualquier cambio de horario en los canales oficiales.',
    '## Qué observar en los primeros quince minutos',
    'El arranque puede ofrecer pistas sobre el plan de cada entrenador, aunque no determina necesariamente el desenlace. Conviene fijarse en la altura de la presión, en la distancia entre defensas y centrocampistas y en si el equipo que tiene la pelota consigue progresar con pases verticales. Si el partido empieza con muchas pérdidas, probablemente veremos fases de ida y vuelta; si uno de los conjuntos logra instalarse arriba y recuperar rápido, podrá acumular ataques y obligar al rival a defender cerca de su portería.',
    'También será interesante observar cómo se comportan los laterales y los extremos. Cuando los dos laterales suben al mismo tiempo, el equipo puede ganar amplitud, pero necesita una cobertura clara para evitar que una pérdida termine en una carrera del adversario. Cuando uno se queda más atrás, el conjunto gana protección, aunque quizá pierda una opción de ataque. Estas decisiones suelen adaptarse durante el partido, por lo que la lectura táctica debe tener en cuenta los ajustes y no solo la alineación inicial.',
    '## Cómo interpretar la clasificación sin sacar conclusiones precipitadas',
    'La tabla es una referencia importante, pero necesita contexto. No todos los equipos llegan con el mismo número de partidos disputados, y la diferencia de goles o el calendario reciente pueden ayudar a explicar por qué dos clubes con los mismos puntos viven situaciones distintas. Además, una posición puede cambiar con un solo resultado cuando la clasificación está muy apretada. Por eso, cualquier comparación debe indicar la fecha del corte estadístico y evitar mezclar datos de jornadas diferentes.',
    'En esta previa se advierte de forma expresa que el módulo conserva una clasificación provisional. Antes de publicar una versión definitiva conviene actualizar puntos, partidos jugados, goles a favor y en contra, resultados recientes y la explicación de lo que significaría cada marcador. Esa comprobación mejora la precisión editorial y evita que una página bien posicionada en buscadores ofrezca información desfasada a quienes llegan buscando la situación actual de su equipo.',
    '## Experiencia del aficionado: entradas, televisión y marcador',
    'Quien vaya al estadio debe consultar primero los canales oficiales del club local para confirmar disponibilidad, horarios de taquilla, condiciones de acceso y posibles requisitos para la compra. Los precios pueden variar según la zona, la fase de venta y las condiciones para socios o abonados; por eso, no conviene reproducir cifras antiguas ni enlazar a intermediarios no autorizados. La información más útil es la que ayuda al aficionado a encontrar la fuente oficial y comprobar los detalles vigentes.',
    'Para quienes vean el encuentro por televisión, el operador indicado corresponde a la programación anunciada para esta jornada. Es recomendable comprobar la guía de emisión el mismo día, especialmente si el usuario accede desde una plataforma con distintos paquetes o canales. En caso de que haya una modificación oficial, debe prevalecer el aviso más reciente de LALIGA o del operador y actualizarse el texto de la previa.',
    'El marcador en directo complementa la lectura del partido: permite comprobar el resultado y el minuto sin tener que actualizar manualmente toda la página. No sustituye a una retransmisión ni pretende ofrecer estadísticas que el módulo no proporciona. Antes del inicio, el cero a cero es el estado inicial; después del final, el resultado definitivo debe interpretarse junto con la clasificación actualizada y el resto de encuentros de la jornada.'
  ].join('\n\n')
}
function articleContent(cfg: MatchdayConfig, fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  const hand = [h, a].filter((s) => s.pj < cfg.usualGames).map((s) => s.name)
  const handLine = hand.length
    ? `Un detalle a tener en cuenta: ${hand.map(el).join(' y ')} ${hand.length > 1 ? 'llegan' : 'llega'} con un partido menos que casi toda la Liga, así que sus números hay que leerlos con esa pequeña diferencia.`
    : cfg.evenGamesLine
  const pending = cfg.pendingNote ? ` ${cfg.pendingNote}` : ''
  const openTv = fx.tv.includes('abierto')
    ? ' Y una buena noticia: es el único partido de la jornada que se emite en abierto.'
    : ''

  return `${cap(el(h.name))} y ${el(a.name)} se ven las caras el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${fx.lead} Aquí te contamos dónde se compran las entradas del ${h.name}-${a.name}, cómo llegan los dos equipos, qué se juegan y cómo seguir el marcador en directo sin complicaciones.

## Cuándo y dónde se juega

El partido es el ${fx.dayLabel} a las ${fx.hour}, hora peninsular, ${enVenue(fx.venue)}. Se puede ver en ${fx.tv}.${openTv} ${fx.neighbors} Si el club anunciara algún cambio de sede o de horario a última hora, manda ese aviso oficial.

## Entradas para el ${h.name}-${a.name}

${ticketsText(fx)}

## Cómo llegan los dos equipos

${portrait(h)} ${formSummary(h)}

${portrait(a)} ${formSummary(a)}

${handLine}${pending}

${cfg.standingsSummary}

## Qué se juegan

${fx.essay}
${cfg.jornada === 10 ? longFormPreview(fx, cfg) : ''}

## Si gana, empata o pierde

${cfg.pointsIntro} Si gana ${el(h.name)}, pasa de ${h.pts} a ${h.pts + 3} puntos y ${el(a.name)} se queda en ${a.pts}. Si empatan, los dos suman uno: ${h.pts + 1} para ${el(h.name)} y ${a.pts + 1} para ${el(a.name)}. Si gana ${el(a.name)}, se va a ${a.pts + 3} y ${el(h.name)} se queda en ${h.pts}.

Eso sí: el resto de partidos de la jornada también mueven la tabla, así que el lunes por la noche la foto puede ser distinta.

## El resto de la jornada

${cfg.calendarText} Cada partido tiene su propia página con marcador.

## Cómo funciona el marcador en directo

Arriba tienes el marcador del partido. Hasta que empiece, verás un 0-0 que no significa nada: simplemente, el partido todavía no se ha jugado. El ${fx.dayLabel}, el marcador se actualiza solo cada pocos segundos con los goles y el minuto de juego. Cuando termine, se queda el resultado final. Si en algún momento falla la conexión, verás el último dato que llegó. Aquí no encontrarás alineaciones, cambios ni tarjetas: solo el resultado, claro y al momento.

## Preguntas frecuentes

### ¿Dónde comprar entradas para el ${h.name}-${a.name}?

En la web oficial de entradas ${de(h.name)}, que es quien organiza el partido ${enVenue(fx.venue)}, o en las taquillas del estadio. Junto al marcador tienes el botón con el enlace oficial que hemos comprobado. No usamos ni recomendamos páginas de reventa.

### ¿Cuánto cuestan las entradas del ${h.name}-${a.name}?

El precio lo fija ${el(h.name)} y cambia según la zona del estadio, la fase de venta y si eres socio o abonado. Por eso no publicamos precios aquí: los que valen son los de la web oficial en el momento de comprar.

### ¿A qué hora juegan ${el(h.name)} y ${el(a.name)}?

El ${fx.dayLabel}, a las ${fx.hour}, hora peninsular.

### ¿Dónde se juega y dónde se puede ver?

${cap(enVenue(fx.venue))}. En televisión, en ${fx.tv}.${fx.tv.includes('abierto') ? ' Es el único partido de la jornada en abierto.' : ''}

### ¿Cómo llegan los dos equipos?

${cap(el(h.name))} es ${ordinal(h.pos, isFem(h.name))} con ${h.pts} puntos y ${el(a.name)} es ${ordinal(a.pos, isFem(a.name))} con ${a.pts}. Son los datos de la clasificación tras la jornada ${cfg.tableAfterJornada}.${pending}

### ¿Qué pasa con los puntos según el resultado?

Si gana ${el(h.name)}, llega a ${h.pts + 3}. Si empatan, ${el(h.name)} se queda en ${h.pts + 1} y ${el(a.name)} en ${a.pts + 1}. Si gana ${el(a.name)}, llega a ${a.pts + 3}.

### ¿El 0-0 del marcador es el resultado?

Antes del partido, no: solo indica que todavía no ha empezado. El 0-0 cuenta como resultado cuando el partido está en juego o ya ha terminado.

## En resumen

${cap(el(h.name))} y ${el(a.name)} juegan el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${isFem(h.name) ? 'Una' : 'Uno'} llega ${ordinal(h.pos, isFem(h.name))}, con ${h.pts} puntos; ${isFem(a.name) ? 'la otra' : 'el otro'}, ${ordinal(a.pos, isFem(a.name))}, con ${a.pts}. Las entradas se compran solo en la web oficial ${de(h.name)} o en taquilla. Y si solo puedes seguir el partido de reojo, el marcador de arriba te lo cuenta en directo.`
}

/** «viernes 9 de octubre de 2026» → «viernes 9 de octubre». */
function dayShort(dayLabel: string): string {
  return dayLabel.replace(/ de \d{4}$/, '')
}

function ticketsText(fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  return `Si quieres ver el ${h.name}-${a.name} en el estadio, las entradas las vende ${el(h.name)}, que es el equipo local, a través de su web oficial de entradas y de las taquillas ${enVenue(fx.venue)}. Junto al marcador, al principio de esta página, tienes un botón con el enlace oficial que hemos comprobado: si lleva a la página del partido concreto pone «Comprar entradas»; si lleva a la taquilla general del club, pone «Ver entradas en la web oficial» y allí se consulta la disponibilidad de este partido; y si el club solo ha publicado la información oficial de venta (taquillas, horarios y precios), pone «Ver información de entradas».

Tres consejos rápidos. Uno: los socios y abonados suelen tener venta preferente, así que la venta general puede abrirse unos días después del anuncio. Dos: los precios cambian según la zona del estadio y la fase de venta; los que valen son los que marca la web oficial en el momento de comprar, y por eso aquí no publicamos cifras. Y tres: evita la reventa no autorizada, porque las entradas suelen ser nominativas y el club puede anularlas. Cuando el partido empieza, el botón de entradas desaparece solo.`
}

const SEO_TITLE_MAX = 46
const SEO_DESCRIPTION_MAX = 155
const EXCERPT_MAX = 200

/** Título SEO con la palabra clave «entradas» delante, dentro del límite. */
function seoTitle(fx: Fixture): string {
  const pair = `${fx.home.name}-${fx.away.name}`
  for (const candidate of [`Entradas ${pair}: horario y previa`, `Entradas ${pair} y previa`, `Entradas ${pair}`]) {
    if (candidate.length <= SEO_TITLE_MAX) return candidate
  }
  throw new Error(`seoTitle ${pair}`)
}

function seoDescription(fx: Fixture): string {
  const pair = `${fx.home.name}-${fx.away.name}`
  const when = `${cap(dayShort(fx.dayLabel))} a las ${fx.hour} ${enVenue(fx.venue)}`
  for (const candidate of [
    `Entradas ${pair}: dónde comprarlas en la web oficial. ${when}. Previa, cómo llegan y marcador en directo.`,
    `Entradas ${pair}: dónde comprarlas. ${when}. Previa y marcador en directo.`,
    `Entradas ${pair}: dónde comprarlas. ${when}. Previa y marcador.`,
  ]) {
    if (candidate.length <= SEO_DESCRIPTION_MAX) return candidate
  }
  throw new Error(`seoDescription ${pair}`)
}

/** Antepone la palabra clave al extracto y, si no cabe, recorta por frases. */
function excerptWithTickets(fx: Fixture): string {
  const prefix = `Entradas y previa del ${fx.home.name}-${fx.away.name}. `
  const sentences = fx.excerpt.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((t) => t.trim()) ?? [fx.excerpt]
  let body = ''
  for (const sentence of sentences) {
    const next = body ? `${body} ${sentence}` : sentence
    if ((prefix + next).length > EXCERPT_MAX) break
    body = next
  }
  if (!body) throw new Error(`excerpt ${fx.slug}: la primera frase no cabe`)
  return excerptOk(prefix + body)
}

function excerptOk(text: string): string {
  if (text.length > EXCERPT_MAX) throw new Error(`excerpt ${text.length}: ${text}`)
  return text
}

export function buildMatchday(cfg: MatchdayConfig): Matchday {
  const fixtures = cfg.fixtures
  const articles: Article[] = fixtures.map((fx) => ({
    id: fx.id,
    category: 'toptrends',
    title: `Entradas ${fx.home.name}-${fx.away.name}: dónde comprarlas, horario y previa de LaLiga`,
    slug: fx.slug,
    excerpt: excerptWithTickets(fx),
    image_url: `/images/articles/${fx.slug}.svg`,
    thumbnail_url: `/images/articles/${fx.slug}-thumb.svg`,
    read_time_minutes: cfg.jornada === 10 ? 18 : 11,
    views: 0,
    trending: 1,
    published_at: fx.published_at,
    content: articleContent(cfg, fx),
  }))

  const live = new Map<string, LiveFixtureRef>(fixtures.map((fx) => [fx.slug, {
    league: 'esp.1',
    espnHome: fx.espnHome,
    espnAway: fx.espnAway,
    date: fx.date,
    kickoffLabel: `${fx.dayLabel}, ${fx.hour} hora peninsular`,
    startDate: `${fx.date.slice(0, 4)}-${fx.date.slice(4, 6)}-${fx.date.slice(6, 8)}T${fx.hour}:00+02:00`,
    venue: fx.venue,
    homeName: fx.home.name,
    awayName: fx.away.name,
  }]))

  const seo: Matchday['seo'] = Object.fromEntries(fixtures.map((fx) => [fx.slug, { title: seoTitle(fx), description: seoDescription(fx) }]))

  const bySlug = new Map(fixtures.map((fx) => [fx.slug, fx]))
  const related: Matchday['related'] = Object.fromEntries(fixtures.map((fx) => {
    const others = fixtures.filter((o) => o.slug !== fx.slug)
    const picks = [others[0], others[4], others[others.length - 1]].filter((o, i, arr) => o && arr.findIndex((x) => x.slug === o.slug) === i && o.slug !== fx.slug).slice(0, 3)
    const fallback = others.filter((o) => !picks.includes(o)).slice(0, 3 - picks.length)
    const links = [...picks, ...fallback].slice(0, 3).map((o) => {
      const match = bySlug.get(o.slug)!
      return `[${match.home.name}-${match.away.name}, ${match.dayLabel}](/articles/${match.slug}): horario y marcador de ese partido de la jornada ${cfg.jornada}.`
    })
    return [fx.slug, links]
  }))

  return {
    articles,
    slugs: fixtures.map((fx) => fx.slug),
    seo,
    related,
    liveMatchForSlug: (slug: string) => live.get(slug) ?? null,
  }
}
