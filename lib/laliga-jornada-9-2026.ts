import { buildMatchday, type Fixture } from './laliga-matchday'
import { TABLE_AFTER_J7 as T } from './laliga-jornada-8-2026'

/**
 * Jornada 9 de LaLiga EA Sports 2026/27 (viernes 16 a lunes 19 de octubre).
 * Horarios oficiales de LALIGA; estadios y televisiones según la programación
 * anunciada (AS, El Desmarque). La clasificación es la de la jornada 7: la
 * jornada 8 se juega del 9 al 12 de octubre y las cifras se actualizarán después.
 */

const FIXTURES: Fixture[] = [
  {
    id: 378,
    slug: 'deportivo-levante-laliga-jornada-9-2026',
    home: T[6],
    away: T[16],
    espnHome: 'Deportivo',
    espnAway: 'Levante',
    date: '20261016',
    dayLabel: 'viernes 16 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN, también en abierto, y Movistar Plus+',
    venue: 'Riazor',
    published_at: '2026-10-09T09:05:00.000Z',
    excerpt: 'El Deportivo, que casi no sabe lo que es perder desde que volvió a Primera, recibe al Levante el viernes 16 a las 21:00 en Riazor. El partido que abre la jornada, en abierto.',
    lead: 'Riazor abre la jornada con un recién ascendido que está sorprendiendo a todos y un Levante que necesita puntos con urgencia. Y se puede ver gratis.',
    neighbors: 'Es el único partido del viernes. El sábado arranca a las 14:00 con el Espanyol-Atlético en Cornellà.',
    essay: `Pocos esperaban ver al Deportivo tan cómodo en su vuelta a Primera. Ha jugado siete partidos y solo ha perdido uno; el resto han sido dos victorias y cuatro empates, muchos empates, que es lo que explica que esté séptimo con 10 puntos en lugar de más arriba. Es un equipo que no se descompone, que encaja poco (8 goles) y que en Riazor se siente fuerte. Esa es la sensación en A Coruña: por fin un equipo que compite de tú a tú.

El Levante llega con la lengua fuera. Es decimoséptimo con 5 puntos en seis partidos, porque tiene uno pendiente, y ha perdido los dos últimos. Está justo encima del descenso, con los mismos puntos que el Elche, y cada semana sin ganar pesa un poco más. Marca goles (8), pero encaja demasiados (12) y le cuesta cerrar los partidos.

Para el Deportivo, convertir uno de esos empates en victoria sería dar un salto de verdad: con 13 puntos se metería en la pelea por Europa. Para el Levante, ganar en Riazor sería respirar y volver a mirar hacia arriba. Un viernes por la noche, con el estadio lleno y el partido en abierto para toda España, Riazor tiene todo lo que necesita un buen arranque de jornada.`,
  },
  {
    id: 379,
    slug: 'espanyol-atletico-laliga-jornada-9-2026',
    home: T[14],
    away: T[1],
    espnHome: 'Espanyol',
    espnAway: 'Atlético Madrid',
    date: '20261017',
    dayLabel: 'sábado 17 de octubre de 2026',
    hour: '14:00',
    tv: 'DAZN',
    venue: 'RCDE Stadium',
    published_at: '2026-10-09T09:10:00.000Z',
    excerpt: 'El Espanyol, en la zona media-baja, recibe al Atlético, segundo y perseguidor del Barcelona, el sábado 17 a las 14:00 en el RCDE Stadium. Previa clara y marcador en directo.',
    lead: 'El Atlético visita Cornellà con la obligación de seguir cerca del Barcelona, y el Espanyol quiere demostrar en casa que puede competir contra los de arriba.',
    neighbors: 'Abre el sábado. Después, a las 16:15, el Villarreal recibe al Elche en La Cerámica.',
    essay: `El Espanyol está en ese punto de la temporada en el que cada partido en casa parece una oportunidad para arrancar de verdad. Es decimoquinto, con 7 puntos, y sus números son un espejo: diez goles a favor, diez en contra. Ha ganado dos partidos y perdido cuatro. No es un mal equipo, pero le falta esa racha de resultados que da tranquilidad. Y recibir al Atlético a la hora de comer no es, precisamente, el partido más fácil para encontrarla.

El Atlético, en cambio, está en la pelea de arriba. Es segundo, con 16 puntos, y lleva cuatro victorias en los últimos cinco partidos. Marca mucho (16 goles) y encaja poco (7), que es la receta con la que lleva años compitiendo. Su problema es otro: el Barcelona ha ganado todo y no da respiro, así que cualquier tropiezo en Cornellà se paga caro en la clasificación.

Para el Espanyol, un punto sería bueno y una victoria, un chute de moral enorme. Para el Atlético, ganar es casi obligatorio si quiere llegar al domingo con opciones de seguir pegado al líder, que juega por la tarde en Sevilla. Es el típico partido que el grande debería ganar, pero que el pequeño, en su casa y con su gente, convierte en una trampa más a menudo de lo que parece.`,
  },
  {
    id: 380,
    slug: 'villarreal-elche-laliga-jornada-9-2026',
    home: T[8],
    away: T[17],
    espnHome: 'Villarreal',
    espnAway: 'Elche',
    date: '20261017',
    dayLabel: 'sábado 17 de octubre de 2026',
    hour: '16:15',
    tv: 'DAZN',
    venue: 'Estadio de la Cerámica',
    published_at: '2026-10-09T09:15:00.000Z',
    excerpt: 'Derbi valenciano en La Cerámica: el Villarreal, que ha enderezado el rumbo, recibe al Elche, en puestos de descenso, el sábado 17 a las 16:15. Qué se juegan y marcador en directo.',
    lead: 'Un derbi de la Comunidad Valenciana con dos realidades: el Villarreal quiere confirmar que ha dejado atrás el mal arranque y el Elche necesita puntos para salir de abajo.',
    neighbors: 'Es el segundo partido del sábado, entre el Espanyol-Atlético de las 14:00 y el Betis-Barcelona de las 18:30.',
    essay: `El Villarreal empezó la temporada torcido, con tres derrotas seguidas, pero las dos últimas victorias han cambiado el ánimo en La Cerámica. Es noveno, con 8 puntos, y tiene un equipo pensado para estar mucho más arriba. Marca con facilidad (13 goles, de los mejores registros fuera del trío de cabeza) aunque también encaja (12). Cuando le salen las cosas, es un equipo muy agradable de ver.

El Elche vive justo lo contrario. Es decimoctavo, en descenso, con 5 puntos: una victoria, dos empates y cuatro derrotas. Su problema no es el gol, porque ha marcado 11, sino la portería, con 17 encajados, la segunda peor cifra de la Liga. Eso sí, ganó el último partido y llega a este derbi con algo de aire fresco.

Es un derbi con mucho en juego. Si gana el Villarreal, se planta en 11 puntos y empieza a mirar hacia los puestos europeos. Si gana el Elche, sale del descenso, al menos por unas horas, y se da un respiro que necesita mucho. Dos equipos a los que les gusta atacar, un sábado por la tarde y un partido con sabor a vecinos: tiene pinta de que habrá goles.`,
  },
  {
    id: 381,
    slug: 'betis-barcelona-laliga-jornada-9-2026',
    home: T[2],
    away: T[0],
    espnHome: 'Real Betis',
    espnAway: 'Barcelona',
    date: '20261017',
    dayLabel: 'sábado 17 de octubre de 2026',
    hour: '18:30',
    tv: 'DAZN',
    venue: 'Estadio La Cartuja',
    published_at: '2026-10-09T09:45:00.000Z',
    excerpt: 'El Betis, tercero, recibe al Barcelona, líder con pleno de victorias, el sábado 17 a las 18:30 en La Cartuja. El partido grande de la jornada, contado de forma sencilla y con marcador en directo.',
    lead: 'Es el partido grande de la jornada: el tercero contra el primero, en un estadio que estará lleno, y el equipo que más goles marca contra uno de los que mejor defiende.',
    neighbors: 'Es el tercer partido del sábado, después del Villarreal-Elche de las 16:15 y antes del Valencia-Athletic de las 21:00.',
    essay: `Hay partidos que se señalan en el calendario desde el primer día, y este es uno de ellos. El Betis está haciendo un arranque de temporada muy serio: tercero, con 16 puntos, los mismos que el Atlético. Ha ganado cinco de siete partidos, y lo ha hecho sin necesidad de marcar mucho (9 goles), porque su defensa es de las más fiables de la Liga, con solo 7 goles encajados. Es un equipo ordenado y competitivo que en La Cartuja, con más de sesenta mil personas, se crece.

El Barcelona llega como lo que es: el equipo más dominante de la Liga. Siete partidos, siete victorias, 31 goles a favor, más de cuatro por partido. Nadie se le acerca en ataque. Pero esta es, probablemente, la salida más exigente que ha tenido hasta ahora: un rival de la parte alta, en su casa, con la grada volcada y una defensa que no regala nada.

¿Qué está en juego? Para el Barça, seguir con pleno y mantener la ventaja sobre Atlético y Betis. Para el Betis, una victoria lo pondría a dos puntos del líder y lanzaría un mensaje a toda la Liga: que este año va en serio. Un empate ya sería un resultado notable para los verdiblancos. El ataque que más marca contra una de las defensas que menos encaja, un sábado por la tarde en Sevilla: es el partido de la semana, y lo sabe todo el mundo.`,
  },
  {
    id: 382,
    slug: 'valencia-athletic-laliga-jornada-9-2026',
    home: T[18],
    away: T[9],
    espnHome: 'Valencia',
    espnAway: 'Athletic Club',
    date: '20261017',
    dayLabel: 'sábado 17 de octubre de 2026',
    hour: '21:00',
    tv: 'Movistar LALIGA y Orange Fútbol 1',
    venue: 'Mestalla',
    published_at: '2026-10-09T09:20:00.000Z',
    excerpt: 'El Valencia, penúltimo y con un arranque muy duro, recibe al Athletic el sábado 17 a las 21:00 en Mestalla. Una noche para empezar a salir del pozo. Previa y marcador en directo.',
    lead: 'Mestalla cierra el sábado con un Valencia que está pasando un mal momento y un Athletic serio, difícil de batir, que viene a confirmar que puede mirar hacia arriba.',
    neighbors: 'Es el último partido del sábado, después del Betis-Barcelona de las 18:30. El domingo arranca a las 14:00 con el Osasuna-Racing.',
    essay: `El Valencia está viviendo un arranque de temporada muy duro. Es penúltimo, con 4 puntos en siete partidos: una sola victoria, un empate y cinco derrotas. Y el dato que más duele es el del ataque: 4 goles en siete partidos, solo el Málaga ha marcado menos. Mestalla, que es uno de los estadios con más carácter de España, está inquieto, y un sábado por la noche contra el Athletic es una ocasión para cambiar el ambiente.

El Athletic es casi lo contrario: un equipo que no regala nada. En seis partidos, porque tiene uno pendiente, solo ha encajado 6 goles, una de las mejores defensas de la Liga. Suma 8 puntos y es décimo, pero con ese partido menos sus números son mejores de lo que parece la tabla. Lleva cuatro partidos sin perder.

Para el Valencia, ganar significaría llegar a 7 puntos y salir del descenso, algo que ahora mismo parece lejos. Para el Athletic, una victoria en Mestalla lo pondría con 11 y en plena pelea por Europa. Un equipo que necesita marcar y le cuesta, contra uno al que casi nadie le marca: la noche del sábado en Valencia tiene mucho más en juego de lo que dicen los puestos.`,
  },
  {
    id: 383,
    slug: 'osasuna-racing-laliga-jornada-9-2026',
    home: T[12],
    away: T[15],
    espnHome: 'Osasuna',
    espnAway: 'Racing Santander',
    date: '20261018',
    dayLabel: 'domingo 18 de octubre de 2026',
    hour: '14:00',
    tv: 'Movistar LALIGA',
    venue: 'El Sadar',
    published_at: '2026-10-09T09:25:00.000Z',
    excerpt: 'Osasuna y Racing, separados por un solo punto en la zona media-baja, se ven en El Sadar el domingo 18 a las 14:00. Dos equipos que necesitan despegar. Previa clara y marcador en directo.',
    lead: 'Dos equipos con un punto de diferencia y la misma necesidad: ganar para alejarse de la zona que incomoda. El Sadar, a la hora de comer, suele ser un buen escenario para eso.',
    neighbors: 'Abre el domingo. Después, a las 16:15, el Celta recibe al Alavés en Balaídos.',
    essay: `Osasuna lleva una temporada rara. Es decimotercero, con 8 puntos, pero ha perdido cuatro de los últimos cinco partidos y solo ha marcado 6 goles en siete jornadas. La defensa tampoco está fina: 13 encajados. El Sadar, que normalmente es un fortín, necesita una tarde de las de antes, con el equipo intenso y la grada apretando desde el primer minuto.

El Racing, recién ascendido, es un equipo que da espectáculo para bien y para mal. Ha marcado 11 goles, más que muchos equipos de la zona media, pero ha encajado 21, los que más de toda la Liga. Es decimosexto con 7 puntos y ha perdido los dos últimos. Sus partidos casi nunca acaban 0-0.

Lo que se juegan es claro: el que gane se pone con 10 u 11 puntos y toma distancia con el descenso; el que pierda se queda mirando hacia abajo con cierta preocupación. Osasuna necesita recuperar su versión de equipo duro; el Racing, demostrar que puede competir fuera sin que le hagan tres goles. Un domingo a las dos de la tarde en Pamplona, con dos equipos que necesitan lo mismo: tiene pinta de partido abierto.`,
  },
  {
    id: 384,
    slug: 'celta-alaves-laliga-jornada-9-2026',
    home: T[13],
    away: T[5],
    espnHome: 'Celta Vigo',
    espnAway: 'Alavés',
    date: '20261018',
    dayLabel: 'domingo 18 de octubre de 2026',
    hour: '16:15',
    tv: 'DAZN o Movistar LALIGA, pendiente de confirmar en la parrilla oficial',
    venue: 'Balaídos',
    published_at: '2026-10-09T09:30:00.000Z',
    excerpt: 'El Celta, el equipo de los empates, recibe al Alavés, sexto y con una de las mejores defensas de la Liga, el domingo 18 a las 16:15 en Balaídos. Previa sencilla y marcador en directo.',
    lead: 'Dos de los equipos que menos goles encajan de la Liga se ven en Balaídos. El Celta quiere convertir empates en victorias y el Alavés, seguir en puestos europeos.',
    neighbors: 'Es el segundo partido del domingo, entre el Osasuna-Racing de las 14:00 y el Málaga-Real Sociedad de las 18:30.',
    essay: `El Celta es el equipo de los empates. Cuatro en siete partidos, más una victoria y dos derrotas, para un total de 7 puntos y el decimocuarto puesto. Lo bueno es que casi nunca pierde y encaja muy poco: solo 6 goles, la misma cifra que el Alavés y el Athletic. Lo malo es que tampoco gana. Ganó el último partido, eso sí, y en Balaídos quiere confirmar que la cosa cambia.

El Alavés es la sorpresa agradable del arranque. Sexto, con 11 puntos, y con la misma virtud que el Celta: una defensa muy seria, 6 goles encajados en siete partidos. Pero el Alavés sí ha sabido ganar (tres victorias), aunque las dos últimas derrotas y el empate posterior han frenado un poco su arranque de temporada.

Con dos defensas así, no parece un partido de muchos goles, aunque el fútbol siempre sorprende. Si gana el Celta, se pone con 10 puntos y da el salto a la zona tranquila. Si gana el Alavés, llega a 14 y se afianza en Europa. Un domingo por la tarde en Vigo, con dos equipos ordenados y un partido que puede decidirse por un detalle: paciencia, que esto se puede resolver en el último cuarto de hora.`,
  },
  {
    id: 385,
    slug: 'malaga-real-sociedad-laliga-jornada-9-2026',
    home: T[19],
    away: T[7],
    espnHome: 'Málaga',
    espnAway: 'Real Sociedad',
    date: '20261018',
    dayLabel: 'domingo 18 de octubre de 2026',
    hour: '18:30',
    tv: 'Movistar LALIGA o DAZN, pendiente de confirmar en la parrilla oficial',
    venue: 'La Rosaleda',
    published_at: '2026-10-09T09:35:00.000Z',
    excerpt: 'El Málaga, colista, recibe a la Real Sociedad el domingo 18 a las 18:30 en La Rosaleda. Un equipo que busca su primera alegría contra otro que quiere engancharse a Europa.',
    lead: 'La Rosaleda vuelve a llenarse para ver si el Málaga por fin arranca, esta vez contra una Real Sociedad que alterna buenos partidos con tropiezos.',
    neighbors: 'Es el tercer partido del domingo, después del Celta-Alavés de las 16:15 y antes del Real Madrid-Sevilla de las 21:00.',
    essay: `El Málaga está viviendo su vuelta a Primera con más sufrimiento del que esperaba. Es colista, con 3 puntos en siete partidos, todavía sin ganar, y con el ataque más flojo de la Liga: 3 goles. Pero La Rosaleda no falla. Cada partido en casa es una fiesta, y la afición sigue creyendo que la primera victoria está al caer. Contra la Real, en un domingo por la tarde, sería un momento perfecto.

La Real Sociedad va octava, con 10 puntos, y está siendo un equipo irregular: ha ganado tres partidos y perdido otros tres. Marca con cierta regularidad (9 goles), pero encaja demasiado para lo que acostumbra (13). Ganó el último partido y llega a Málaga con la idea de encadenar dos victorias seguidas, algo que todavía no ha conseguido esta temporada.

Si gana el Málaga, pasa de 3 a 6 puntos y sale del último puesto, además de quitarse un peso enorme de encima. Si gana la Real, se planta con 13 y se mete en la pelea por Europa. La necesidad de uno frente a la ambición de la otra, en un estadio que empuja de verdad: un partido con más emoción de la que sugieren los puestos en la tabla.`,
  },
  {
    id: 386,
    slug: 'real-madrid-sevilla-laliga-jornada-9-2026',
    home: T[3],
    away: T[4],
    espnHome: 'Real Madrid',
    espnAway: 'Sevilla',
    date: '20261018',
    dayLabel: 'domingo 18 de octubre de 2026',
    hour: '21:00',
    tv: 'Movistar LALIGA',
    venue: 'Santiago Bernabéu',
    published_at: '2026-10-09T09:50:00.000Z',
    excerpt: 'Real Madrid y Sevilla, cuarto y quinto, cierran el domingo 18 a las 21:00 en el Bernabéu. Un clásico moderno entre dos equipos que necesitan ganar para no perder de vista al líder.',
    lead: 'El cuarto contra el quinto, un domingo por la noche en el Bernabéu. El Madrid no puede permitirse más tropiezos y el Sevilla llega como el rival más incómodo posible.',
    neighbors: 'Cierra el domingo, tras el Málaga-Real Sociedad de las 18:30. La jornada termina el lunes 19 con el Getafe-Rayo.',
    essay: `El Real Madrid está en una posición que no le gusta nada: cuarto, con 15 puntos, a seis del Barcelona y a uno de Atlético y Betis. Ha ganado cinco partidos y perdido dos, sin empatar ninguno, y aunque su ataque funciona (18 goles, el segundo mejor de la Liga), las dos derrotas le han dejado sin margen. En el Bernabéu, un domingo por la noche, no vale otra cosa que ganar si quiere seguir en la pelea.

El Sevilla llega quinto, con 13 puntos, y con la sensación de ser un equipo competitivo que ha mejorado mucho respecto a los últimos años. Cuatro victorias, un empate y dos derrotas, con 10 goles a favor y 9 en contra. Es un bloque equilibrado, sin estridencias, que sabe sufrir fuera de casa. Y para el Madrid, históricamente, el Sevilla es de los rivales que más guerra le han dado.

Lo que está en juego es sencillo de explicar: si gana el Madrid, llega a 18 puntos y se queda a tiro de los de arriba. Si gana el Sevilla, se pone con 16 y adelanta al propio Madrid en la tabla. Un empate no le vale a nadie, aunque al Sevilla le dolería menos. Es la noche grande del domingo y, con un Barcelona que juega el sábado, los dos sabrán exactamente lo que necesitan antes de saltar al césped.`,
  },
  {
    id: 387,
    slug: 'getafe-rayo-laliga-jornada-9-2026',
    home: T[10],
    away: T[11],
    espnHome: 'Getafe',
    espnAway: 'Rayo Vallecano',
    date: '20261019',
    dayLabel: 'lunes 19 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN',
    venue: 'Coliseum',
    published_at: '2026-10-09T09:00:00.000Z',
    excerpt: 'Derbi del sur de Madrid: Getafe y Rayo, empatados a puntos y con estilos opuestos, cierran la jornada 9 el lunes 19 a las 21:00 en el Coliseum. Previa sencilla y marcador en directo.',
    lead: 'La jornada se cierra con un derbi madrileño de barrio: dos equipos empatados a puntos y dos maneras de jugar que no se parecen en nada.',
    neighbors: 'Es el único partido del lunes y el que cierra la jornada 9. La siguiente, la 10, empieza el fin de semana del 24 de octubre.',
    essay: `Getafe y Rayo llegan empatados a 8 puntos y con el mismo balance: dos victorias, dos empates y tres derrotas. Pero ahí acaba el parecido. El Getafe es un equipo que vive de su orden: solo ha marcado 4 goles, pero ha encajado 7, y así va sumando. El Rayo es su reverso: marca mucho (11 goles) y encaja mucho más (16). Dos formas de entender el fútbol que, curiosamente, han dado los mismos puntos.

El Coliseum, un lunes por la noche, es un escenario especial. Es un derbi de los que se viven en el barrio, sin la grandilocuencia de los grandes, pero con mucha rivalidad entre dos clubes del sur de Madrid que se conocen bien. El Getafe llega después de ganar su último partido; el Rayo, tras un empate que le supo a poco.

El premio es claro: el ganador se pone con 11 puntos y se asoma a la zona noble de la tabla, con la jornada entera ya jugada y sabiendo exactamente dónde lo deja ese resultado. El que pierda se queda en 8, en tierra de nadie. Para cerrar una jornada con el Betis-Barcelona y el Madrid-Sevilla, un derbi de barrio un lunes por la noche es una forma estupenda de acabar.`,
  },
]

const JORNADA_9 = buildMatchday({
  jornada: 9,
  tableAfterJornada: 7,
  usualGames: 7,
  evenGamesLine: 'Los dos han jugado siete partidos, como casi toda la Liga. Solo el Athletic y el Levante llegan con seis.',
  standingsSummary: 'Para situarse en la tabla: el Barcelona manda con 21 puntos y pleno de victorias; Atlético y Betis le siguen con 16, y el Real Madrid tiene 15. Sevilla (13) y Alavés (11) ocupan los puestos europeos. Abajo, Elche (5), Valencia (4) y Málaga (3) están en descenso, con el Levante justo encima, también con 5 puntos pero con un partido menos.',
  calendarText: 'Si quieres seguir toda la jornada, este es el calendario, en hora peninsular. Viernes 16: Deportivo-Levante (21:00). Sábado 17: Espanyol-Atlético (14:00), Villarreal-Elche (16:15), Betis-Barcelona (18:30) y Valencia-Athletic (21:00). Domingo 18: Osasuna-Racing (14:00), Celta-Alavés (16:15), Málaga-Real Sociedad (18:30) y Real Madrid-Sevilla (21:00). Y el lunes 19, Getafe-Rayo (21:00).',
  pointsIntro: 'Vamos a lo práctico, con los puntos que tienen ahora mismo, antes de que se juegue la jornada 8.',
  pendingNote: 'Ojo: estos números son los de antes de la jornada 8, que se juega del 9 al 12 de octubre. En cuanto termine, actualizaremos las cifras de esta previa.',
  fixtures: FIXTURES,
})

export const LALIGA_JORNADA_9_ARTICLES = JORNADA_9.articles
export const JORNADA_9_SEO = JORNADA_9.seo
export const JORNADA_9_SLUGS = JORNADA_9.slugs
export const JORNADA_9_RELATED = JORNADA_9.related
export const liveMatchForSlugJ9 = JORNADA_9.liveMatchForSlug
