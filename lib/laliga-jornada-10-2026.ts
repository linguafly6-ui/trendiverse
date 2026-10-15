import { buildMatchday, type Fixture } from './laliga-matchday'
import { TABLE_AFTER_J7 as T } from './laliga-jornada-8-2026'

/**
 * Jornada 10 de LaLiga EA Sports 2026/27.
 * Calendario y operadores contrastados con el horario oficial de LALIGA.
 * La tabla es deliberadamente provisional: el snapshot disponible es el de J7.
 * Actualizar clasificación, forma y textos de puntos antes de publicar como previa final.
 */

const FIXTURES: Fixture[] = [
  {
    id: 388,
    slug: 'alaves-malaga-laliga-jornada-10-2026',
    home: T[5],
    away: T[19],
    espnHome: 'Alaves',
    espnAway: 'Malaga',
    date: '20261023',
    dayLabel: 'viernes 23 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN y DAZN en abierto',
    venue: 'Mendizorrotza',
    published_at: '2026-10-15T08:00:00.000Z',
    excerpt: 'El Alavés recibe al Málaga en Mendizorrotza para abrir la jornada 10 de LaLiga, el viernes 23 de octubre a las 21:00.',
    lead: 'La jornada empieza en Vitoria con un Alavés que quiere hacerse fuerte en casa y un Málaga que necesita que los puntos empiecen a llegar.',
    neighbors: 'Es el único partido del viernes. El sábado, la jornada continúa a las 14:00 con el Rayo-Elche.',
    essay: `El Alavés abre la décima jornada ante su afición. El equipo vitoriano ha encontrado en Mendizorrotza un escenario para competir con intensidad y convertir los partidos en duelos incómodos. Ante un rival que necesita sumar, la paciencia y el control de las segundas jugadas pueden ser tan importantes como el acierto en las áreas.

El Málaga llega con la obligación de convertir sus buenas fases en puntos. Para puntuar fuera de casa necesitará protegerse cuando pierda el balón y aprovechar las oportunidades que encuentre. En un encuentro que inaugura la jornada, marcar primero puede cambiar por completo el guion.`,
  },
  {
    id: 389,
    slug: 'rayo-elche-laliga-jornada-10-2026',
    home: T[11],
    away: T[17],
    espnHome: 'Rayo Vallecano',
    espnAway: 'Elche',
    date: '20261024',
    dayLabel: 'sábado 24 de octubre de 2026',
    hour: '14:00',
    tv: 'Movistar LALIGA',
    venue: 'Estadio de Vallecas',
    published_at: '2026-10-15T08:05:00.000Z',
    excerpt: 'Rayo Vallecano y Elche abren el sábado de la jornada 10 en Vallecas, con tres puntos importantes para dos equipos que quieren ganar estabilidad.',
    lead: 'Vallecas suele pedir ritmo y valentía. El Rayo y el Elche se citan en un partido en el que cada recuperación puede convertirse en una ocasión.',
    neighbors: 'El partido abre el sábado a las 14:00. Después llegan Racing-Espanyol, Valencia-Villarreal y Atlético-Deportivo.',
    essay: `El Rayo buscará imponer energía desde el inicio y llevar el encuentro a un ritmo alto. En Vallecas, la presión y la velocidad por fuera suelen ser herramientas importantes, aunque el equipo tendrá que equilibrar esa agresividad para no conceder espacios a la espalda.

El Elche necesita que su trabajo sin balón tenga continuidad con posesiones que le permitan respirar. Si consigue superar la primera presión, podrá atacar con más orden y reducir el tiempo que pase defendiendo cerca de su área. Es un duelo de necesidades y estilos que puede decidirse en los detalles.`,
  },
  {
    id: 390,
    slug: 'racing-espanyol-laliga-jornada-10-2026',
    home: T[15],
    away: T[14],
    espnHome: 'Racing Santander',
    espnAway: 'Espanyol',
    date: '20261024',
    dayLabel: 'sábado 24 de octubre de 2026',
    hour: '16:15',
    tv: 'DAZN',
    venue: 'El Sardinero',
    published_at: '2026-10-15T08:10:00.000Z',
    excerpt: 'El Racing recibe al Espanyol en El Sardinero el sábado a las 16:15, en un cruce entre dos equipos que quieren convertir su regularidad en puntos.',
    lead: 'El Sardinero tendrá una prueba exigente: el Racing quiere aprovechar el empuje de casa y el Espanyol buscará competir con orden lejos de Barcelona.',
    neighbors: 'Se juega el sábado a las 16:15, después del Rayo-Elche y antes del Valencia-Villarreal.',
    essay: `El Racing tiene en El Sardinero un impulso que debe acompañar con claridad cuando tenga la pelota. Ante un Espanyol organizado, será importante no precipitar los ataques y elegir bien cuándo acelerar. Ganar los duelos en el centro del campo puede ayudarle a instalarse en campo contrario.

El Espanyol afronta una salida en la que la concentración defensiva será fundamental. Si consigue resistir los primeros minutos y mantener juntas sus líneas, podrá buscar sus opciones en transiciones y acciones a balón parado. La gestión de los momentos del partido puede inclinar un choque que promete ser competido.`,
  },
  {
    id: 391,
    slug: 'valencia-villarreal-laliga-jornada-10-2026',
    home: T[18],
    away: T[8],
    espnHome: 'Valencia',
    espnAway: 'Villarreal',
    date: '20261024',
    dayLabel: 'sábado 24 de octubre de 2026',
    hour: '18:30',
    tv: 'Movistar LALIGA',
    venue: 'Mestalla',
    published_at: '2026-10-15T08:15:00.000Z',
    excerpt: 'Valencia y Villarreal se enfrentan en Mestalla el sábado a las 18:30 en uno de los duelos más atractivos de la jornada 10.',
    lead: 'El derbi autonómico llega en un momento en el que ambos necesitan continuidad. Mestalla puede empujar al Valencia, mientras el Villarreal tratará de encontrar espacios con balón.',
    neighbors: 'El Valencia-Villarreal arranca a las 18:30 y precede al Atlético-Deportivo, que cierra el sábado.',
    essay: `El Valencia necesita que Mestalla sea un punto de apoyo y que el equipo convierta la energía de su público en ocasiones claras. Frente a un rival capaz de castigar los espacios, será esencial equilibrar las subidas de los laterales y evitar pérdidas comprometidas.

El Villarreal intentará encontrar ventajas con circulación y movimientos entre líneas. Si consigue atraer la presión local, puede abrir pasillos para atacar; si el Valencia roba y sale con velocidad, el partido puede convertirse en un intercambio de llegadas. La eficacia en las áreas tendrá un peso especial.`,
  },
  {
    id: 392,
    slug: 'atletico-deportivo-laliga-jornada-10-2026',
    home: T[1],
    away: T[6],
    espnHome: 'Atletico Madrid',
    espnAway: 'Deportivo',
    date: '20261024',
    dayLabel: 'sábado 24 de octubre de 2026',
    hour: '21:00',
    tv: 'Orange Fútbol 1, Movistar Plus+ y Movistar LALIGA',
    venue: 'Riyadh Air Metropolitano',
    published_at: '2026-10-15T08:20:00.000Z',
    excerpt: 'El Atlético de Madrid recibe al Deportivo el sábado por la noche en el Metropolitano, un choque entre un aspirante a la zona alta y un Dépor competitivo en su regreso.',
    lead: 'El Atlético tendrá que llevar la iniciativa ante un Deportivo que ha demostrado que sabe resistir y competir. La paciencia local chocará con la ambición visitante.',
    neighbors: 'El Atlético-Deportivo, a las 21:00 del sábado, es el último partido del día.',
    essay: `El Atlético parte con la responsabilidad de dominar en casa y transformar su presión en ocasiones. Frente a un adversario que puede sentirse cómodo defendiendo junto, mover el balón con velocidad y evitar ataques previsibles será clave para encontrar huecos.

El Deportivo llega a una prueba de máxima exigencia, pero también con la oportunidad de medir su nivel ante uno de los equipos fuertes de la competición. Necesitará ayudas constantes, precisión al salir y aprovechar cualquier balón parado. Si mantiene el encuentro igualado durante muchos minutos, la presión puede trasladarse al conjunto local.`,
  },
  {
    id: 393,
    slug: 'athletic-getafe-laliga-jornada-10-2026',
    home: T[9],
    away: T[10],
    espnHome: 'Athletic Club',
    espnAway: 'Getafe',
    date: '20261025',
    dayLabel: 'domingo 25 de octubre de 2026',
    hour: '14:00',
    tv: 'DAZN',
    venue: 'San Mamés',
    published_at: '2026-10-15T08:25:00.000Z',
    excerpt: 'Athletic Club y Getafe abren el domingo de la jornada 10 en San Mamés, con un partido que puede decidirse en los duelos y las segundas jugadas.',
    lead: 'San Mamés espera un encuentro intenso. El Athletic buscará iniciativa y amplitud; el Getafe intentará que cada disputa y cada balón dividido cuenten.',
    neighbors: 'El domingo empieza a las 14:00 con Athletic-Getafe. A continuación se juega el Celta-Betis.',
    essay: `El Athletic querrá marcar el tono desde el inicio, apoyándose en la intensidad y en la capacidad para recuperar arriba. Para traducir esa energía en ocasiones tendrá que mover al Getafe de lado a lado y no convertir cada ataque en una acción precipitada.

El Getafe intentará llevar el partido a un terreno de contactos, orden y paciencia. Si consigue cerrar los espacios interiores y ganar segundas jugadas, puede incomodar al equipo local. Las acciones a balón parado y la disciplina en las áreas pueden ser decisivas en un choque de margen estrecho.`,
  },
  {
    id: 394,
    slug: 'celta-betis-laliga-jornada-10-2026',
    home: T[13],
    away: T[2],
    espnHome: 'Celta Vigo',
    espnAway: 'Real Betis',
    date: '20261025',
    dayLabel: 'domingo 25 de octubre de 2026',
    hour: '16:15',
    tv: 'DAZN',
    venue: 'Abanca Balaídos',
    published_at: '2026-10-15T08:30:00.000Z',
    excerpt: 'Celta y Real Betis se miden en Balaídos el domingo a las 16:15 en un partido entre dos equipos que buscan imponer su fútbol con balón.',
    lead: 'El Celta quiere aprovechar Balaídos para dar un paso adelante, pero el Betis llega con argumentos para discutir la posesión y llevar el partido a campo rival.',
    neighbors: 'Tras el Athletic-Getafe, el Celta-Betis es el segundo partido del domingo.',
    essay: `El Celta intentará darle ritmo al encuentro y conectar con sus atacantes entre líneas. La precisión en el primer pase será importante para evitar pérdidas que permitan al Betis correr. En casa, el equipo gallego necesita combinar iniciativa con seguridad defensiva.

El Betis buscará tener la pelota y encontrar ventajas con asociaciones cortas y cambios de orientación. Si consigue superar la presión inicial, podrá instalarse arriba y obligar al Celta a defender durante fases largas. El duelo en el centro del campo será una de las claves de la tarde.`,
  },
  {
    id: 395,
    slug: 'real-sociedad-levante-laliga-jornada-10-2026',
    home: T[7],
    away: T[16],
    espnHome: 'Real Sociedad',
    espnAway: 'Levante',
    date: '20261025',
    dayLabel: 'domingo 25 de octubre de 2026',
    hour: '18:30',
    tv: 'Movistar LALIGA',
    venue: 'Reale Arena',
    published_at: '2026-10-15T08:35:00.000Z',
    excerpt: 'La Real Sociedad recibe al Levante el domingo a las 18:30 en el Reale Arena, con la intención de controlar el partido ante un rival que buscará puntos fuera.',
    lead: 'La Real tratará de asumir el mando en San Sebastián. El Levante necesita un partido ordenado y aprovechar las ocasiones que aparezcan para salir con algo positivo.',
    neighbors: 'Real Sociedad-Levante se disputa el domingo a las 18:30, antes del Clásico entre Barcelona y Real Madrid.',
    essay: `La Real Sociedad buscará instalarse en campo contrario mediante la posesión y la movilidad de sus centrocampistas. Para evitar que el partido se atasque, necesitará ritmo en la circulación y profundidad por los costados, sin perder el equilibrio cuando el Levante recupere.

El Levante afronta una salida en la que defender con distancias cortas será prioritario. Sus opciones pueden crecer si logra superar la primera presión y correr hacia los espacios. Mantener la concentración durante los noventa minutos será esencial ante un rival que suele querer controlar el ritmo en casa.`,
  },
  {
    id: 396,
    slug: 'barcelona-real-madrid-laliga-jornada-10-2026',
    home: T[0],
    away: T[3],
    espnHome: 'Barcelona',
    espnAway: 'Real Madrid',
    date: '20261025',
    dayLabel: 'domingo 25 de octubre de 2026',
    hour: '21:00',
    tv: 'DAZN',
    venue: 'Spotify Camp Nou',
    published_at: '2026-10-15T08:40:00.000Z',
    excerpt: 'Barcelona y Real Madrid disputan el Clásico el domingo 25 de octubre a las 21:00, el gran partido de la jornada 10 de LaLiga.',
    lead: 'El Clásico vuelve a concentrar la atención de la jornada. El Barcelona querrá imponer su iniciativa y el Real Madrid buscará castigar cualquier espacio que deje el equipo azulgrana.',
    neighbors: 'El Barcelona-Real Madrid cierra el domingo. La jornada termina el lunes con el Sevilla-Osasuna.',
    essay: `El Barcelona llega al Clásico con la ambición de controlar el juego y convertir su dominio en ocasiones. La circulación rápida puede obligar al Real Madrid a bascular y abrir espacios, pero el equipo azulgrana deberá vigilar las pérdidas: cada balón regalado puede convertirse en una transición peligrosa.

El Real Madrid suele sentirse cómodo cuando encuentra metros para correr, aunque también necesitará defender con concentración los ataques posicionales del rival. El control de las emociones, la eficacia en las áreas y la capacidad para ajustar durante el partido pesan tanto como el planteamiento inicial. En un Clásico, un detalle puede cambiarlo todo.`,
  },
  {
    id: 397,
    slug: 'sevilla-osasuna-laliga-jornada-10-2026',
    home: T[4],
    away: T[12],
    espnHome: 'Sevilla',
    espnAway: 'Osasuna',
    date: '20261026',
    dayLabel: 'lunes 26 de octubre de 2026',
    hour: '21:00',
    tv: 'Movistar LALIGA',
    venue: 'Ramón Sánchez-Pizjuán',
    published_at: '2026-10-15T08:45:00.000Z',
    excerpt: 'Sevilla y Osasuna cierran la jornada 10 el lunes a las 21:00 en el Ramón Sánchez-Pizjuán, en un encuentro importante para ambos.',
    lead: 'La décima jornada se despide en Nervión. El Sevilla quiere llevar la iniciativa en casa y Osasuna intentará competir con orden y aprovechar los momentos de transición.',
    neighbors: 'Es el último encuentro de la jornada 10, el lunes 26 a las 21:00.',
    essay: `El Sevilla buscará cerrar la jornada ante su público con una actuación convincente. Para dominar, tendrá que circular con paciencia y protegerse bien cuando pierda el balón. La gestión de los primeros minutos puede ayudarle a evitar que el encuentro se convierta en un intercambio desordenado.

Osasuna tratará de hacer valer su disciplina y competir cada duelo. Si mantiene las líneas juntas y elige bien cuándo presionar, puede complicar la construcción local y encontrar opciones al recuperar. En un partido que cierra la jornada, la claridad en las áreas puede marcar la diferencia.`,
  },
]

const JORNADA_10 = buildMatchday({
  jornada: 10,
  tableAfterJornada: 7,
  usualGames: 7,
  evenGamesLine: 'La clasificación utilizada es provisional y corresponde al corte disponible tras la jornada 7; no debe interpretarse como la tabla actualizada de la jornada 10.',
  standingsSummary: 'Este módulo todavía dispone de la clasificación tras la jornada 7. Las posiciones, puntos y rachas de los equipos deben actualizarse después de las jornadas 8 y 9 antes de publicar estas previas como definitivas.',
  calendarText: 'Calendario oficial en hora peninsular: viernes 23, Alavés-Málaga (21:00). Sábado 24, Rayo-Elche (14:00), Racing-Espanyol (16:15), Valencia-Villarreal (18:30) y Atlético-Deportivo (21:00). Domingo 25, Athletic-Getafe (14:00), Celta-Betis (16:15), Real Sociedad-Levante (18:30) y Barcelona-Real Madrid (21:00). Lunes 26, Sevilla-Osasuna (21:00).',
  pointsIntro: 'Los escenarios de puntos se calculan con la clasificación disponible tras la jornada 7 y son provisionales: actualiza los datos después de la jornada 9 antes de dar estas cifras por definitivas.',
  pendingNote: 'AVISO EDITORIAL: clasificación, puntos, forma y estadísticas tomadas tras la jornada 7. La jornada 8 se disputa del 9 al 12 de octubre y la 9 del 16 al 19. Actualiza la tabla y revisa los textos de cada partido antes de publicar estas previas como definitivas.',
  fixtures: FIXTURES,
})

export const LALIGA_JORNADA_10_ARTICLES = JORNADA_10.articles
export const JORNADA_10_SEO = JORNADA_10.seo
export const JORNADA_10_SLUGS = JORNADA_10.slugs
export const JORNADA_10_RELATED = JORNADA_10.related
export const liveMatchForSlugJ10 = JORNADA_10.liveMatchForSlug
