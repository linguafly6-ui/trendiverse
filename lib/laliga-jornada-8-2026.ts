import type { Article } from './types'

interface Side {
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

interface Fixture {
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
  seoTitle: string
  seoDescription: string
  excerpt: string
  /** Una o dos frases humanas que presentan el partido. */
  lead: string
  /** Narrativa de qué se juegan los dos equipos. */
  essay: string
  neighbors: string
}

const TABLE: Side[] = [
  { name: 'Barcelona', pos: 1, pj: 7, pg: 7, pe: 0, pp: 0, gf: 31, gc: 7, pts: 21, form: 'G G G G G' },
  { name: 'Atlético de Madrid', pos: 2, pj: 7, pg: 5, pe: 1, pp: 1, gf: 16, gc: 7, pts: 16, form: 'G P G G G' },
  { name: 'Real Betis', pos: 3, pj: 7, pg: 5, pe: 1, pp: 1, gf: 9, gc: 7, pts: 16, form: 'P G G G E' },
  { name: 'Real Madrid', pos: 4, pj: 7, pg: 5, pe: 0, pp: 2, gf: 18, gc: 8, pts: 15, form: 'G P G G P' },
  { name: 'Sevilla', pos: 5, pj: 7, pg: 4, pe: 1, pp: 2, gf: 10, gc: 9, pts: 13, form: 'P E G G P' },
  { name: 'Alavés', pos: 6, pj: 7, pg: 3, pe: 2, pp: 2, gf: 11, gc: 6, pts: 11, form: 'G G P P E' },
  { name: 'Deportivo', pos: 7, pj: 7, pg: 2, pe: 4, pp: 1, gf: 10, gc: 8, pts: 10, form: 'G G E P E' },
  { name: 'Real Sociedad', pos: 8, pj: 7, pg: 3, pe: 1, pp: 3, gf: 9, gc: 13, pts: 10, form: 'G E G P G' },
  { name: 'Villarreal', pos: 9, pj: 7, pg: 2, pe: 2, pp: 3, gf: 13, gc: 12, pts: 8, form: 'P P P G G' },
  { name: 'Athletic Club', pos: 10, pj: 6, pg: 2, pe: 2, pp: 2, gf: 7, gc: 6, pts: 8, form: 'P G G E E' },
  { name: 'Getafe', pos: 11, pj: 7, pg: 2, pe: 2, pp: 3, gf: 4, gc: 7, pts: 8, form: 'P E E P G' },
  { name: 'Rayo Vallecano', pos: 12, pj: 7, pg: 2, pe: 2, pp: 3, gf: 11, gc: 16, pts: 8, form: 'P G P G E' },
  { name: 'Osasuna', pos: 13, pj: 7, pg: 2, pe: 2, pp: 3, gf: 6, gc: 13, pts: 8, form: 'G P P P E' },
  { name: 'Celta', pos: 14, pj: 7, pg: 1, pe: 4, pp: 2, gf: 8, gc: 6, pts: 7, form: 'P E E E G' },
  { name: 'Espanyol', pos: 15, pj: 7, pg: 2, pe: 1, pp: 4, gf: 10, gc: 10, pts: 7, form: 'P E G P P' },
  { name: 'Racing', pos: 16, pj: 7, pg: 2, pe: 1, pp: 4, gf: 11, gc: 21, pts: 7, form: 'G P G P P' },
  { name: 'Levante', pos: 17, pj: 6, pg: 1, pe: 2, pp: 3, gf: 8, gc: 12, pts: 5, form: 'E G E P P' },
  { name: 'Elche', pos: 18, pj: 7, pg: 1, pe: 2, pp: 4, gf: 11, gc: 17, pts: 5, form: 'P P E P G' },
  { name: 'Valencia', pos: 19, pj: 7, pg: 1, pe: 1, pp: 5, gf: 4, gc: 13, pts: 4, form: 'P P P G P' },
  { name: 'Málaga', pos: 20, pj: 7, pg: 0, pe: 3, pp: 4, gf: 3, gc: 12, pts: 3, form: 'P E E P P' },
]

const FIXTURES: Fixture[] = [
  {
    id: 366,
    slug: 'malaga-espanyol-laliga-jornada-8-2026',
    home: TABLE[19],
    away: TABLE[14],
    espnHome: 'Málaga',
    espnAway: 'Espanyol',
    date: '20261009',
    dayLabel: 'viernes 9 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN',
    venue: 'La Rosaleda',
    published_at: '2026-10-09T00:10:00.000Z',
    seoTitle: 'Málaga-Espanyol: previa y marcador',
    seoDescription: 'El Málaga busca su primera victoria del curso ante el Espanyol, viernes 9 a las 21:00 en La Rosaleda. Cómo llegan, qué se juegan y marcador en vivo.',
    excerpt: 'El Málaga, colista y todavía sin ganar, recibe al Espanyol el viernes 9 a las 21:00 en La Rosaleda. Te contamos cómo llegan, qué se juegan y cómo seguir el marcador en directo.',
    lead: 'El Málaga busca su primera victoria de la temporada y el Espanyol quiere alejarse de la zona baja. Es el partido que abre la jornada, y en La Rosaleda hay ganas de una alegría.',
    neighbors: 'Es el único partido del viernes, así que toda la atención está en Málaga. El sábado, a las 14:00, sigue la jornada con el Rayo-Athletic en Vallecas.',
    essay: `Hay noches en las que un estadio entero necesita una alegría, y La Rosaleda llega a este viernes así. El Málaga ha jugado siete partidos y todavía no sabe lo que es ganar: tres empates, cuatro derrotas y solo tres goles a favor, los menos de toda Primera. Es colista, y la afición lo sabe. Pero también sabe que una victoria lo cambiaría todo de golpe: pasaría de 3 a 6 puntos y saldría, al menos por unas horas, del último puesto.

El Espanyol llega con otro ánimo, aunque tampoco sobrado. Es decimoquinto, con 7 puntos, y sus números están en perfecto equilibrio: diez goles marcados y diez encajados. Ganar en Málaga le daría un respiro real, hasta los 10 puntos, lejos de la zona que quema. Perder lo dejaría mirando hacia abajo con cierta inquietud.

Nadie va a descender ni a salvarse esta noche. Pero el Málaga se juega algo más que tres puntos: romper una racha que empieza a pesar en el vestuario y en la grada. Y el Espanyol, demostrar que sabe ganar fuera de casa cuando toca.`,
  },
  {
    id: 367,
    slug: 'rayo-athletic-laliga-jornada-8-2026',
    home: TABLE[11],
    away: TABLE[9],
    espnHome: 'Rayo Vallecano',
    espnAway: 'Athletic Club',
    date: '20261010',
    dayLabel: 'sábado 10 de octubre de 2026',
    hour: '14:00',
    tv: 'DAZN, también en abierto',
    venue: 'Estadio de Vallecas',
    published_at: '2026-10-09T00:20:00.000Z',
    seoTitle: 'Rayo-Athletic: horario y marcador',
    seoDescription: 'Rayo y Athletic, empatados a 8 puntos, se ven en Vallecas el sábado 10 a las 14:00. El único partido de la jornada en abierto. Marcador en vivo.',
    excerpt: 'Rayo y Athletic llegan empatados a 8 puntos a Vallecas, el sábado 10 a las 14:00. Estilos opuestos y el único partido de la jornada que se puede ver en abierto.',
    lead: 'Dos equipos empatados a puntos, dos estilos opuestos y el único partido de la jornada que se puede ver en abierto. Buen plan para la hora de comer.',
    neighbors: 'Abre el sábado. Después, a las 16:15, el Alavés recibe al Atlético en Mendizorrotza.',
    essay: `Vallecas a mediodía tiene algo especial: el estadio pegado a las casas y el ruido de la grada casi encima del campo. Este sábado recibe al Athletic en un partido que, sobre el papel, está muy igualado: los dos llegan con 8 puntos. La diferencia es que el Rayo los ha conseguido en siete partidos y el Athletic en seis, porque tiene uno pendiente.

El Rayo es un equipo que no aburre. Marca bastante (11 goles, más que el Betis, que va tercero) pero encaja mucho (16). Sus partidos suelen tener goles para los dos lados. El Athletic es casi lo contrario: solo ha encajado 6 en seis partidos, una de las mejores defensas de la Liga, aunque le cuesta más marcar.

Si gana el Athletic, se pone con 11 puntos y mira hacia Europa, con un partido todavía guardado en el bolsillo. Si gana el Rayo, es él quien da el salto a 11. Es, además, el único partido de la jornada que LaLiga emite en abierto en DAZN, así que es la ocasión perfecta para ver fútbol sin pagar más. A la hora de comer y con el sol de octubre, un buen plan de sábado.`,
  },
  {
    id: 368,
    slug: 'alaves-atletico-laliga-jornada-8-2026',
    home: TABLE[5],
    away: TABLE[1],
    espnHome: 'Alavés',
    espnAway: 'Atlético Madrid',
    date: '20261010',
    dayLabel: 'sábado 10 de octubre de 2026',
    hour: '16:15',
    tv: 'Movistar LALIGA',
    venue: 'Mendizorrotza',
    published_at: '2026-10-09T00:40:00.000Z',
    seoTitle: 'Alavés-Atlético: previa y marcador',
    seoDescription: 'El Alavés, sexto y con una de las mejores defensas, recibe al Atlético, segundo, el sábado 10 a las 16:15. Cómo llegan, qué se juegan y marcador en vivo.',
    excerpt: 'El Alavés, sexto con 11 puntos y una de las mejores defensas de la Liga, recibe al Atlético, segundo con 16, el sábado 10 a las 16:15 en Mendizorrotza. Marcador en directo.',
    lead: 'El equipo con una de las defensas más sólidas de la Liga recibe al segundo clasificado, que no quiere perder de vista al Barcelona.',
    neighbors: 'Se juega a las 16:15, entre el Rayo-Athletic de las 14:00 y el Barcelona-Getafe de las 18:30.',
    essay: `El Alavés está viviendo un buen arranque de temporada y Mendizorrotza quiere disfrutarlo. Es sexto, con 11 puntos, y la clave está en su portería: solo ha encajado 6 goles en siete partidos, menos que el Atlético y menos que el Real Madrid. Es un equipo difícil de perforar, y eso lo convierte en un rival incómodo para cualquiera.

Enfrente, el Atlético, segundo con 16 puntos y con ganas de recortar distancias con un Barcelona que lleva pleno. Si gana en Vitoria, se pone a 19 y aprieta al líder antes de que juegue por la tarde. Si no gana, el Barcelona puede ampliar la ventaja esa misma noche. El Atlético comparte puntos con el Betis, pero ha marcado casi el doble de goles (16 frente a 9), y eso es lo que lo mantiene por delante.

Para el Alavés, una victoria sería un golpe en la mesa: 14 puntos, por encima del Sevilla y a uno del Madrid. Para el Atlético, es la típica tarde en la que no se puede fallar si quiere seguir en la pelea por el título. Un sexto con esa defensa no es un rival cualquiera, y eso es lo que hace interesante este partido.`,
  },
  {
    id: 369,
    slug: 'barcelona-getafe-laliga-jornada-8-2026',
    home: TABLE[0],
    away: TABLE[10],
    espnHome: 'Barcelona',
    espnAway: 'Getafe',
    date: '20261010',
    dayLabel: 'sábado 10 de octubre de 2026',
    hour: '18:30',
    tv: 'DAZN',
    venue: 'Spotify Camp Nou',
    published_at: '2026-10-09T01:20:00.000Z',
    seoTitle: 'Barcelona-Getafe: previa y marcador',
    seoDescription: 'El Barcelona, líder con pleno de victorias, recibe al Getafe el sábado 10 a las 18:30. Cómo llegan, qué se juegan y marcador en vivo del partido.',
    excerpt: 'El Barcelona, líder con siete victorias en siete partidos, recibe al Getafe el sábado 10 a las 18:30 en el Spotify Camp Nou. El equipo que más marca contra uno de los que menos.',
    lead: 'El líder, con pleno de victorias, recibe a uno de los equipos que menos goles marca. Dos maneras opuestas de entender el fútbol en el Camp Nou.',
    neighbors: 'Es el tercer partido del sábado, después del Alavés-Atlético de las 16:15 y antes del Real Madrid-Villarreal de las 21:00.',
    essay: `El Barcelona está jugando a otra cosa. Siete partidos, siete victorias y 31 goles a favor, más de cuatro por partido. Nadie en la Liga se le acerca: el Madrid y el Atlético tienen poco más de la mitad de goles, y ninguno pasa de +10 de diferencia mientras el Barça va por +24. Es el único equipo que todavía no ha pinchado ni una vez.

El Getafe llega como lo que es: un equipo serio, ordenado y que marca muy poco. Cuatro goles en siete partidos; solo el Málaga ha marcado menos. Pero su portería aguanta (7 encajados), y eso le permite estar en mitad de la tabla con 8 puntos. Al Camp Nou vendrá a cerrarse, a sufrir y a esperar su ocasión. No es un plan vistoso, pero a veces funciona.

¿Qué está en juego? Para el Barça, seguir con pleno y mantener la distancia con el Atlético, que juega antes. Si el Atlético gana y el Barça también, la diferencia se queda en cinco puntos; si el Atlético pincha, el líder se escapa un poco más. Para el Getafe, cualquier punto en Barcelona sería una fiesta. Lo normal es que gane el Barça, pero el fútbol tiene estas cosas: el equipo que mejor se defiende contra el que más ataca siempre deja una pequeña duda hasta el pitido final.`,
  },
  {
    id: 370,
    slug: 'real-madrid-villarreal-laliga-jornada-8-2026',
    home: TABLE[3],
    away: TABLE[8],
    espnHome: 'Real Madrid',
    espnAway: 'Villarreal',
    date: '20261010',
    dayLabel: 'sábado 10 de octubre de 2026',
    hour: '21:00',
    tv: 'Orange Fútbol 1, Movistar Plus+ y Movistar LALIGA',
    venue: 'Santiago Bernabéu',
    published_at: '2026-10-09T01:40:00.000Z',
    seoTitle: 'Madrid-Villarreal: previa y marcador',
    seoDescription: 'El Real Madrid, cuarto y sin empates en el curso, recibe al Villarreal el sábado 10 a las 21:00 en el Bernabéu. Cómo llegan y marcador en vivo.',
    excerpt: 'El Real Madrid recibe al Villarreal el sábado 10 a las 21:00 en el Bernabéu. El Madrid, cuarto, aún no ha empatado esta temporada; el Villarreal marca y encaja mucho. Promete goles.',
    lead: 'El Madrid cierra el sábado en casa ante un Villarreal que marca mucho y encaja mucho. Un partido que promete goles y que el Madrid no puede dejar escapar.',
    neighbors: 'Cierra el sábado, después del Barcelona-Getafe de las 18:30. El domingo arranca con el Elche-Celta a las 14:00.',
    essay: `El Real Madrid tiene una estadística curiosa esta temporada: en siete partidos no ha empatado ni una vez. Cinco victorias y dos derrotas. Cuando no gana, pierde. Es cuarto con 15 puntos, a seis del Barcelona y a uno del Atlético y el Betis, y el sábado por la noche cierra la jornada del fin de semana en el Bernabéu.

El Villarreal llega noveno, con 8 puntos, y con un estilo que invita a ver sus partidos: marca mucho (13 goles, más que el Betis o el Sevilla) y también encaja (12). Es un equipo que no especula. Precisamente por eso, el Bernabéu puede ser un partido abierto, de los que no se pueden ver a medias.

Para el Madrid, ganar significa pasar a 18 puntos y adelantar al Atlético y al Betis, al menos hasta que estos jueguen. Perder sería la tercera derrota en ocho jornadas, demasiado pronto para un equipo que aspira a todo. Y un empate sería noticia por sí mismo: el primero del curso. Seis puntos con el Barcelona no se recuperan en una noche, pero el Madrid sabe que no puede dejarse más puntos si quiere que la Liga siga viva en primavera.`,
  },
  {
    id: 371,
    slug: 'elche-celta-laliga-jornada-8-2026',
    home: TABLE[17],
    away: TABLE[13],
    espnHome: 'Elche',
    espnAway: 'Celta Vigo',
    date: '20261011',
    dayLabel: 'domingo 11 de octubre de 2026',
    hour: '14:00',
    tv: 'Movistar LALIGA',
    venue: 'Estadio Martínez Valero',
    published_at: '2026-10-09T00:30:00.000Z',
    seoTitle: 'Elche-Celta: horario y marcador',
    seoDescription: 'El Elche, en descenso con 5 puntos, recibe al Celta, el rey del empate, el domingo 11 a las 14:00 en el Martínez Valero. Cómo llegan y marcador en vivo.',
    excerpt: 'El Elche, en puesto de descenso con 5 puntos, recibe al Celta el domingo 11 a las 14:00 en el Martínez Valero. El Celta encaja poco y empata mucho. Mucho en juego para los de abajo.',
    lead: 'Un equipo en descenso que marca pero encaja demasiado, contra el rey del empate. Mucho en juego para los de abajo en el partido que abre el domingo.',
    neighbors: 'Abre el domingo. A las 16:15, la Real Sociedad recibe al Deportivo en el Reale Arena.',
    essay: `El domingo arranca en Elche con un partido que importa mucho a los de abajo. El Elche es decimoctavo, en puesto de descenso, con 5 puntos. Su problema no es marcar: ha hecho 11 goles, bastantes para su posición. El problema es que encaja demasiado, 17, la segunda portería más castigada de la Liga. Sus partidos son una montaña rusa.

El Celta es justo lo contrario: el equipo de los empates. Cuatro en siete partidos; solo el Deportivo empata tanto. Encaja muy poco (6 goles, de las mejores defensas) pero también marca poco. Es decimocuarto con 7 puntos, y le falta ganar más para convertir esa solidez en una posición tranquila.

Para el Elche, ganar supondría salir del descenso, al menos hasta que jueguen el Valencia y el Levante, y ponerse con 8 puntos, en el grupo de la zona media. Un empate le daría un pequeño respiro. Para el Celta, una victoria lo subiría a 10 puntos y le daría la tranquilidad que sus números defensivos merecen. Dos formas de entender el fútbol, frente a frente, a la hora de comer.`,
  },
  {
    id: 372,
    slug: 'real-sociedad-deportivo-laliga-jornada-8-2026',
    home: TABLE[7],
    away: TABLE[6],
    espnHome: 'Real Sociedad',
    espnAway: 'Deportivo',
    date: '20261011',
    dayLabel: 'domingo 11 de octubre de 2026',
    hour: '16:15',
    tv: 'DAZN',
    venue: 'Reale Arena',
    published_at: '2026-10-09T00:50:00.000Z',
    seoTitle: 'Real Sociedad-Deportivo: marcador',
    seoDescription: 'Real Sociedad y Deportivo, empatados a 10 puntos, se ven en el Reale Arena el domingo 11 a las 16:15. Quien gane mira a Europa. Marcador en vivo.',
    excerpt: 'Real Sociedad y Deportivo llegan empatados a 10 puntos al Reale Arena, el domingo 11 a las 16:15. Quien gane se pone a la altura del Sevilla, quinto. Marcador en directo.',
    lead: 'Empatados a 10 puntos, Real y Depor se juegan dar el salto hacia la zona europea en una tarde de domingo en Anoeta.',
    neighbors: 'Va entre el Elche-Celta de las 14:00 y el Betis-Osasuna de las 18:30.',
    essay: `Real Sociedad y Deportivo llegan empatados a 10 puntos, pero han llegado hasta ahí por caminos muy distintos. El Depor, séptimo, es un equipo al que cuesta mucho ganar: solo ha perdido un partido de siete, aunque ha empatado cuatro. La Real, octava, es más de blanco o negro: tres victorias, tres derrotas y un empate. Cuando sale bien, sale muy bien. Cuando sale mal, también.

La diferencia entre los dos la marcan los goles. El Depor tiene +2; la Real, −4, porque ha encajado 13, demasiados para un equipo que quiere pelear por Europa. Eso es lo que la tiene por detrás con los mismos puntos.

El premio es grande: quien gane se pone con 13 puntos, a la altura del Sevilla, que es quinto. Para el Deportivo sería además confirmar que su vuelta a Primera va en serio. Un empate dejaría a los dos con 11, justo donde hoy está el Alavés. Es un partido de tarde de domingo, en Anoeta, entre dos equipos que todavía no saben del todo quiénes van a ser esta temporada. Por eso es tan interesante. Un apunte para no confundirse: el Deportivo de esta jornada es el de A Coruña, y el marcador de esta página sigue ese partido.`,
  },
  {
    id: 373,
    slug: 'betis-osasuna-laliga-jornada-8-2026',
    home: TABLE[2],
    away: TABLE[12],
    espnHome: 'Real Betis',
    espnAway: 'Osasuna',
    date: '20261011',
    dayLabel: 'domingo 11 de octubre de 2026',
    hour: '18:30',
    tv: 'Movistar LALIGA',
    venue: 'Estadio La Cartuja',
    published_at: '2026-10-09T01:00:00.000Z',
    seoTitle: 'Betis-Osasuna: previa y marcador',
    seoDescription: 'El Betis, tercero con 16 puntos, recibe a Osasuna el domingo 11 a las 18:30 en La Cartuja. Cómo llegan, qué se juegan y marcador en vivo.',
    excerpt: 'El Betis, tercero con 16 puntos, recibe a Osasuna el domingo 11 a las 18:30 en La Cartuja. Un equipo que gana sin hacer ruido contra otro al que le cuesta marcar. Marcador en directo.',
    lead: 'El tercer clasificado, que gana sin hacer mucho ruido, recibe a un Osasuna al que le cuesta marcar. El Betis quiere demostrar que su puesto no es casualidad.',
    neighbors: 'Es el tercer partido del domingo, después del Real Sociedad-Deportivo de las 16:15 y antes del Racing-Valencia de las 21:00.',
    essay: `El Betis está tercero, con los mismos 16 puntos que el Atlético, y lo ha conseguido a su manera: sin marcar mucho (9 goles) pero ganando partidos. Es un equipo que compite, que sabe cerrar resultados y que esta temporada juega en La Cartuja. Conviene confirmar la sede el día del partido, pero el calendario lo sitúa ahí.

Osasuna llega decimotercero, con 8 puntos, y con la asignatura pendiente del gol: solo ha marcado 6 y ha encajado 13. Es un equipo que sufre, pero que no se rinde, y que en Sevilla intentará aprovechar cualquier despiste.

Para el Betis, ganar significa llegar a 19 puntos y, según lo que haya hecho el Atlético el sábado, pelear por la segunda plaza o incluso seguir pegado a un Barcelona que parece imparable. Para Osasuna, una victoria le daría 11 puntos y lo sacaría del grupo de cinco equipos que comparten 8. Es el partido de la tarde del domingo, con el calor sevillano todavía presente en octubre y un Betis que quiere demostrar que su tercer puesto no es casualidad.`,
  },
  {
    id: 374,
    slug: 'racing-valencia-laliga-jornada-8-2026',
    home: TABLE[15],
    away: TABLE[18],
    espnHome: 'Racing Santander',
    espnAway: 'Valencia',
    date: '20261011',
    dayLabel: 'domingo 11 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN',
    venue: 'El Sardinero',
    published_at: '2026-10-09T01:10:00.000Z',
    seoTitle: 'Racing-Valencia: previa y marcador',
    seoDescription: 'El Racing, con la peor defensa de la Liga, recibe al Valencia, penúltimo, el domingo 11 a las 21:00 en El Sardinero. Cómo llegan y marcador en vivo.',
    excerpt: 'Racing y Valencia cierran el domingo 11 a las 21:00 en El Sardinero. El Racing tiene la peor defensa de la Liga; el Valencia, penúltimo, casi no marca. Dos equipos que necesitan ganar.',
    lead: 'La peor defensa de la Liga contra el ataque que menos marca. Dos equipos que necesitan ganar como el comer, de noche y a orillas del Cantábrico.',
    neighbors: 'Cierra el domingo, después del Betis-Osasuna de las 18:30. El lunes, a las 21:00, el Levante recibe al Sevilla.',
    essay: `El domingo se cierra en Santander con dos equipos que lo están pasando mal, cada uno a su manera. El Racing ha marcado 11 goles, una cifra decente, pero ha encajado 21, la peor defensa de toda la Liga: tres por partido. Es decimosexto con 7 puntos, y sus partidos son una fiesta para quien le gusten los goles y un sufrimiento para su afición.

El Valencia tiene el problema contrario: no marca. Cuatro goles en siete partidos, cinco derrotas (las que más en Primera) y 4 puntos que lo tienen penúltimo. Solo el Málaga está por debajo. Es una situación que en Mestalla nadie esperaba y que empieza a pesar.

Lo que está en juego es claro. Si gana el Racing, se va a 10 puntos y se aleja de los problemas. Si gana el Valencia, iguala al Racing con 7 y respira por primera vez en semanas. Un empate deja al Valencia en descenso y al Racing sin avanzar. Es un partido de los que se juegan con el estómago encogido, de noche, en El Sardinero, con el viento del Cantábrico y la sensación de que ninguno de los dos puede permitirse perder.`,
  },
  {
    id: 375,
    slug: 'levante-sevilla-laliga-jornada-8-2026',
    home: TABLE[16],
    away: TABLE[4],
    espnHome: 'Levante',
    espnAway: 'Sevilla',
    date: '20261012',
    dayLabel: 'lunes 12 de octubre de 2026',
    hour: '21:00',
    tv: 'Movistar LALIGA',
    venue: 'Estadi Ciutat de València',
    published_at: '2026-10-09T00:05:00.000Z',
    seoTitle: 'Levante-Sevilla: previa y marcador',
    seoDescription: 'El Levante, con un partido menos, recibe al Sevilla, quinto, el lunes 12 a las 21:00. El cierre de la jornada 8, con marcador en vivo.',
    excerpt: 'El Levante recibe al Sevilla el lunes 12 a las 21:00 y cierra la jornada 8. El Sevilla, quinto, quiere acercarse a los de arriba; el Levante pelea por salir del agobio de abajo.',
    lead: 'El cierre de la jornada, en lunes festivo, con el Sevilla queriendo acercarse a los de arriba y el Levante peleando por salir del agobio.',
    neighbors: 'Es el cierre de la jornada, el lunes festivo, cuando ya se han jugado los otros nueve partidos.',
    essay: `La jornada se cierra el lunes 12, festivo, en Valencia, con un partido que tiene algo de examen final. Cuando el Levante y el Sevilla salten al campo, todos los demás ya habrán jugado y la tabla estará casi hecha. Ellos sabrán exactamente qué necesitan.

El Sevilla llega quinto, con 13 puntos, en puesto europeo, y con la oportunidad de meterse de lleno en la pelea de arriba: una victoria lo dejaría con 16, los puntos que hoy tienen Atlético y Betis. El Levante, decimoséptimo con 5 puntos, está justo encima del descenso, pero tiene una ventaja: ha jugado un partido menos que casi todos. Sus 5 puntos en seis partidos no son lo mismo que los 5 del Elche en siete.

Para el Levante, ganar sería salir del agobio, ponerse con 8 puntos y coger aire antes de un tramo complicado. Para el Sevilla, no ganar sería dejar escapar la ocasión de aprovechar lo que hayan hecho los de arriba durante el fin de semana. Un lunes festivo, por la noche, con la jornada entera ya jugada: el escenario perfecto para un partido que puede decir mucho de los dos.`,
  },
]

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

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** «en el Estadio de Vallecas», «en La Rosaleda», «en Mendizorrotza». */
function enVenue(venue: string): string {
  if (/^(La|El) /.test(venue) || venue === 'Mendizorrotza') return `en ${venue}`
  return `en el ${venue}`
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function portrait(side: Side): string {
  const games = side.pj === 6 ? 'seis partidos' : 'siete partidos'
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

function articleContent(fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  const hand = [h, a].filter((s) => s.pj === 6).map((s) => s.name)
  const handLine = hand.length
    ? `Un detalle a tener en cuenta: ${hand.map(el).join(' y ')} ${hand.length > 1 ? 'llegan' : 'llega'} con un partido menos que casi toda la Liga, así que sus números hay que leerlos con esa pequeña diferencia.`
    : 'Los dos han jugado siete partidos, como casi toda la Liga. Solo el Athletic y el Levante llegan con seis.'
  const openTv = fx.tv.includes('abierto')
    ? ' Y una buena noticia: es el único partido de la jornada que se emite en abierto.'
    : ''

  return `${cap(el(h.name))} y ${el(a.name)} se ven las caras el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${fx.lead} Aquí te contamos cómo llegan los dos equipos, qué se juegan y cómo seguir el marcador en directo sin complicaciones.

## Cuándo y dónde se juega

El partido es el ${fx.dayLabel} a las ${fx.hour}, hora peninsular, ${enVenue(fx.venue)}. Se puede ver en ${fx.tv}.${openTv} ${fx.neighbors} Si el club anunciara algún cambio de sede o de horario a última hora, manda ese aviso oficial.

## Cómo llegan los dos equipos

${portrait(h)} ${formSummary(h)}

${portrait(a)} ${formSummary(a)}

${handLine}

Para situarse en la tabla: el Barcelona manda con 21 puntos y pleno de victorias; Atlético y Betis le siguen con 16, y el Real Madrid tiene 15. Sevilla (13) y Alavés (11) ocupan los puestos europeos. Abajo, Elche (5), Valencia (4) y Málaga (3) están en descenso, con el Levante justo encima, también con 5 puntos pero con un partido menos.

## Qué se juegan

${fx.essay}

## Si gana, empata o pierde

Vamos a lo práctico. Si gana ${el(h.name)}, pasa de ${h.pts} a ${h.pts + 3} puntos y ${el(a.name)} se queda en ${a.pts}. Si empatan, los dos suman uno: ${h.pts + 1} para ${el(h.name)} y ${a.pts + 1} para ${el(a.name)}. Si gana ${el(a.name)}, se va a ${a.pts + 3} y ${el(h.name)} se queda en ${h.pts}.

Eso sí: el resto de partidos de la jornada también mueven la tabla, así que el lunes por la noche la foto puede ser distinta.

## El resto de la jornada

Si quieres seguir toda la jornada, este es el calendario, en hora peninsular. Viernes: Málaga-Espanyol (21:00). Sábado: Rayo-Athletic (14:00), Alavés-Atlético (16:15), Barcelona-Getafe (18:30) y Real Madrid-Villarreal (21:00). Domingo: Elche-Celta (14:00), Real Sociedad-Deportivo (16:15), Betis-Osasuna (18:30) y Racing-Valencia (21:00). Y el lunes 12, festivo, Levante-Sevilla (21:00). Cada partido tiene su propia página con marcador.

## Cómo funciona el marcador en directo

Arriba tienes el marcador del partido. Hasta que empiece, verás un 0-0 que no significa nada: simplemente, el partido todavía no se ha jugado. El ${fx.dayLabel}, el marcador se actualiza solo cada pocos segundos con los goles y el minuto de juego. Cuando termine, se queda el resultado final. Si en algún momento falla la conexión, verás el último dato que llegó. Aquí no encontrarás alineaciones, cambios ni tarjetas: solo el resultado, claro y al momento.

## Preguntas frecuentes

### ¿A qué hora juegan ${el(h.name)} y ${el(a.name)}?

El ${fx.dayLabel}, a las ${fx.hour}, hora peninsular.

### ¿Dónde se juega y dónde se puede ver?

${cap(enVenue(fx.venue))}. En televisión, en ${fx.tv}.${fx.tv.includes('abierto') ? ' Es el único partido de la jornada en abierto.' : ''}

### ¿Cómo llegan los dos equipos?

${cap(el(h.name))} es ${ordinal(h.pos, isFem(h.name))} con ${h.pts} puntos y ${el(a.name)} es ${ordinal(a.pos, isFem(a.name))} con ${a.pts}. Son los datos de la clasificación tras la jornada 7.

### ¿Qué pasa con los puntos según el resultado?

Si gana ${el(h.name)}, llega a ${h.pts + 3}. Si empatan, ${el(h.name)} se queda en ${h.pts + 1} y ${el(a.name)} en ${a.pts + 1}. Si gana ${el(a.name)}, llega a ${a.pts + 3}.

### ¿El 0-0 del marcador es el resultado?

Antes del partido, no: solo indica que todavía no ha empezado. El 0-0 cuenta como resultado cuando el partido está en juego o ya ha terminado.

## En resumen

${cap(el(h.name))} y ${el(a.name)} juegan el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${isFem(h.name) ? 'Una' : 'Uno'} llega ${ordinal(h.pos, isFem(h.name))}, con ${h.pts} puntos; ${isFem(a.name) ? 'la otra' : 'el otro'}, ${ordinal(a.pos, isFem(a.name))}, con ${a.pts}. Si solo puedes seguir el partido de reojo, el marcador de arriba te lo cuenta en directo.`
}

function excerptOk(text: string): string {
  if (text.length > 200) throw new Error(`excerpt ${text.length}: ${text}`)
  return text
}

export const LALIGA_JORNADA_8_ARTICLES: Article[] = FIXTURES.map((fx) => ({
  id: fx.id,
  category: 'deportes',
  title: `${fx.home.name}-${fx.away.name}: horario, previa y marcador en vivo de LaLiga`,
  slug: fx.slug,
  excerpt: excerptOk(fx.excerpt),
  image_url: `/images/articles/${fx.slug}.svg`,
  thumbnail_url: `/images/articles/${fx.slug}-thumb.svg`,
  read_time_minutes: 11,
  views: 0,
  trending: 1,
  published_at: fx.published_at,
  content: articleContent(fx),
}))

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

const LIVE = new Map<string, LiveFixtureRef>(FIXTURES.map((fx) => [fx.slug, {
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

export function liveMatchForSlug(slug: string): LiveFixtureRef | null {
  return LIVE.get(slug) ?? null
}

export const JORNADA_8_SEO: Record<string, { title: string; description: string }> = Object.fromEntries(
  FIXTURES.map((fx) => [fx.slug, { title: fx.seoTitle, description: fx.seoDescription }]),
)

export const JORNADA_8_SLUGS = FIXTURES.map((fx) => fx.slug)

const bySlug = new Map(FIXTURES.map((fx) => [fx.slug, fx]))

export const JORNADA_8_RELATED: Record<string, string[]> = Object.fromEntries(FIXTURES.map((fx) => {
  const others = FIXTURES.filter((o) => o.slug !== fx.slug)
  const picks = [others[0], others[4], others[others.length - 1]].filter((o, i, arr) => o && arr.findIndex((x) => x.slug === o.slug) === i && o.slug !== fx.slug).slice(0, 3)
  const fallback = others.filter((o) => !picks.includes(o)).slice(0, 3 - picks.length)
  const links = [...picks, ...fallback].slice(0, 3).map((o) => {
    const match = bySlug.get(o.slug)!
    return `[${match.home.name}-${match.away.name}, ${match.dayLabel}](/articles/${match.slug}): horario y marcador de ese partido de la jornada 8.`
  })
  return [fx.slug, links]
}))
