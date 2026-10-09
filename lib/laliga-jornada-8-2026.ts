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
    seoDescription: 'El Málaga, sin victorias y con 3 puntos, recibe al Espanyol el viernes 9 a las 21:00 en La Rosaleda. Marcador en vivo el día del partido.',
    excerpt: 'El Málaga abre la jornada 8 en La Rosaleda contra el Espanyol, viernes 9 a las 21:00. Sigue último y sin victorias. El marcador de esta página se actualiza el día del partido.',
    neighbors: 'Es el único partido del viernes. El sábado, a las 14:00, el Rayo recibe al Athletic en Vallecas.',
    essay: `La Rosaleda abre la jornada con el único equipo de Primera que, tras siete partidos, sigue sin ganar. El Málaga ha marcado 3 goles, la cifra más baja del campeonato. El Valencia y el Getafe han marcado 4. La diferencia del Málaga, −9, es la misma que la del Valencia, y el Valencia llega con una victoria y 4 puntos. Por eso el anfitrión del viernes es el 20.º.

El descenso son los puestos 18, 19 y 20: Elche (5), Valencia (4) y Málaga (3). El Levante es 17.º, también con 5 puntos, y ha jugado seis partidos, no siete. Una victoria del Málaga lo deja en 6, por encima de esos totales de hoy, y el viernes no cierra la cuenta: Elche, Valencia y Levante juegan entre el domingo y el lunes.

El Espanyol llega 15.º, con 7 puntos, los mismos que Celta y Racing, y el balance de goles en cero: 10 a favor y 10 en contra. Una victoria lo lleva a 10, donde hoy están Deportivo y Real Sociedad. Un empate lo deja en 8, con Villarreal, Athletic, Getafe, Rayo y Osasuna. Una derrota lo mantiene en 7. El descenso no se decide esta noche. Lo que sí se ve es si el colista estrena una victoria y si el Espanyol sale de La Rosaleda con un poco más de margen. Es el único partido del viernes, y las dos cuentas se cruzan ahí.`,
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
    tv: 'DAZN en abierto y DAZN',
    venue: 'Estadio de Vallecas',
    published_at: '2026-10-09T00:20:00.000Z',
    seoTitle: 'Rayo-Athletic: horario y marcador',
    seoDescription: 'Rayo y Athletic empatan a 8 puntos antes de Vallecas, el sábado 10 a las 14:00. El Athletic lleva un partido menos. Marcador en vivo aquí.',
    excerpt: 'Rayo y Athletic llegan a Vallecas con 8 puntos, el sábado 10 a las 14:00. El Athletic ha jugado un partido menos. El marcador se actualiza el día del partido.',
    neighbors: 'Abre el sábado. A las 16:15, en Mendizorroza, el Alavés recibe al Atlético.',
    essay: `Rayo y Athletic llegan a Vallecas con los mismos 8 puntos y con un partido de diferencia. El Rayo ha jugado siete. El Athletic, seis. La diferencia de goles los separa en la tabla: −5 para el local, 12.º, y +1 para el visitante, 10.º. Ocho puntos en seis jornadas y ocho puntos en siete cuentan una historia distinta.

Si el Athletic gana, se va a 11, la cifra de hoy del Alavés, que es 6.º. Si empata, se queda en 9 y conserva ese partido de margen. Si pierde, sigue en 8 y el Rayo se va a 11. El lunes la tabla habrá seguido moviéndose: el Alavés juega el mismo sábado a las 16:15, y en 8 puntos viven también Villarreal, Getafe y Osasuna. Getafe y Villarreal juegan el sábado.

LALIGA abre el sábado con este partido y lo marca como DAZN en abierto, además de DAZN. Es el único de los diez al que la competición señala con emisión abierta. ESPN sitúa el campo en el Estadio de Vallecas.

Los goles cuentan otra cosa. El Rayo ha marcado 11, más que el Betis, que es tercero con 9, y ha encajado 16. Por delante en goles en contra están el Racing (21) y el Elche (17). El Athletic ha encajado 6 en seis partidos, los mismos que el Celta y el Alavés han encajado en siete. Vallecas, a las 14:00, junta a dos equipos de la mitad de la tabla para ver si esa igualdad de puntos aguanta el primer partido del sábado, con el Athletic jugándose además el partido que le queda en el bolsillo.`,
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
    seoDescription: 'El Alavés, sexto con 11 puntos, recibe al Atlético, segundo con 16, el sábado 10 a las 16:15. Horario, previa y marcador en vivo.',
    excerpt: 'El Alavés es sexto con 11 puntos y recibe al Atlético, segundo con 16, el sábado 10 a las 16:15 en Mendizorroza. El marcador se actualiza en vivo ese día.',
    neighbors: 'Se juega a las 16:15, entre el Rayo-Athletic de las 14:00 y el Barcelona-Getafe de las 18:30.',
    essay: `A las 16:15, Mendizorrotza junta al 6.º y al 2.º. Cinco puntos les separan, y la portería del Alavés es de las más cerradas de la Liga: 6 goles encajados, uno menos que el Atlético y dos menos que el Madrid.

LALIGA sitúa a Sevilla y Alavés en puestos europeos, detrás de Barcelona, Atlético, Betis y Real Madrid. El Sevilla es 5.º con 13. Una victoria del Alavés lo lleva a 14, por encima de esos 13 y a un punto de los 15 del Madrid. Una victoria del Atlético lo sube a 19, a dos de los 21 del Barcelona, que juega después, a las 18:30 en el Spotify Camp Nou. Un empate deja al Atlético en 17, todavía por encima del Betis, que también tiene 16 y juega el domingo, y al Alavés en 12.

Atlético y Betis comparten los 16 puntos. Les separa el gol: +9 frente a +2. Los dos han encajado 7. El Atlético ha marcado 16 y el Betis, 9. El sábado en Vitoria es el partido del segundo contra el sexto, y también la tarde en la que el Atlético puede abrir hueco sobre un Betis que todavía no juega.

El Alavés ha marcado 11 y encajado 6. Esta previa no entra en alineaciones. Sí explica por qué un sexto con esa portería es un examen distinto de un sexto goleado. Movistar LALIGA es el operador del cuadro oficial. ESPN sitúa el campo en Mendizorrotza.`,
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
    seoDescription: 'El Barcelona, líder con 21 puntos y pleno de victorias, recibe al Getafe el sábado 10 a las 18:30. Previa y marcador en vivo.',
    excerpt: 'El Barcelona recibe al Getafe el sábado 10 a las 18:30 en el Spotify Camp Nou. Llega líder, con 21 puntos y siete victorias. El marcador se actualiza ese día.',
    neighbors: 'Es el tercer partido del sábado, después del Alavés-Atlético de las 16:15 y antes del Real Madrid-Villarreal de las 21:00.',
    essay: `El Barcelona es el único equipo que ha ganado los siete partidos. Llega con 21 puntos, 31 goles a favor y 7 en contra, diferencia de +24. Nadie más pasa de +10: el Madrid tiene +10 y el Atlético, +9. La ventaja es de 5 puntos sobre Atlético y Betis, que tienen 16, y de 6 sobre el Madrid, que tiene 15. El líder todavía no ha empatado.

El Getafe llega 11.º, con 8 puntos. Ha marcado 4 goles en siete partidos. Solo el Málaga ha marcado menos: 3. El Valencia también ha marcado 4. Con 7 encajados, la diferencia del Getafe es −3. Ataca poco y, en el agregado, la portería aguanta.

ESPN coloca el partido en el Spotify Camp Nou. LALIGA lo da a las 18:30 y en DAZN. Una victoria azulgrana haría 24 puntos. El Atlético juega antes, a las 16:15 en Mendizorrotza. Si gana allí, llega a 19, y una victoria del Barcelona dejaría el margen en 5 puntos, el mismo de hoy. Si el Atlético no gana, la ventaja crece. El Camp Nou decide si el Barcelona sigue siendo el único con pleno.

Para el Getafe, 8 puntos son los que comparte con Villarreal, Athletic, Rayo y Osasuna. Una victoria lo llevaría a 11, la cifra de hoy del Alavés, 6.º. Un empate lo dejaría en 9. Una derrota lo mantiene en 8, donde ya vive un grupo de cinco equipos. El partido le ofrece, si gana, un salto que sus 4 goles en siete jornadas no anuncian. 31 goles a favor del líder son más de cuatro por jornada. Los 4 del Getafe cuentan otra manera de llegar a las 18:30. Hasta el pitido, las dos conviven en la tabla.`,
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
    seoDescription: 'El Real Madrid, cuarto con 15 puntos, recibe al Villarreal el sábado 10 a las 21:00 en el Bernabéu. Previa de la jornada 8 y marcador en vivo.',
    excerpt: 'El Real Madrid recibe al Villarreal el sábado 10 a las 21:00 en el Bernabéu. El Madrid es cuarto, con 15 puntos y sin empates. El marcador se actualiza en vivo.',
    neighbors: 'Cierra el sábado, después del Barcelona-Getafe de las 18:30. El domingo abre el Elche-Celta a las 14:00.',
    essay: `El Real Madrid cierra el sábado en el Bernabéu. Llega 4.º, con 15 puntos, cinco victorias, cero empates y dos derrotas. Cuando no gana, pierde. El Villarreal es 9.º, con 8 puntos, 13 goles a favor y 12 en contra. Llega generando goles, con diferencia de +1.

Quince puntos dejan al Madrid a 6 del Barcelona, que tiene 21 y juega antes, a las 18:30. También lo dejan un punto por debajo de Atlético y Betis, que tienen 16. Una victoria en el Bernabéu sube al Madrid a 18. Eso supera los 16 actuales de Atlético y Betis, y sigue por debajo de los 21 del Barcelona incluso si el líder empatara por la tarde, algo que todavía no ha hecho. Una derrota deja al Madrid en 15 y sube al Villarreal a 11, la cifra de hoy del Alavés. Un empate sería el primero del Madrid en el curso: 16 para el local y 9 para el visitante.

El Madrid ha marcado 18 goles, la segunda cifra detrás de los 31 del Barcelona, y ha encajado 8. El Villarreal ha marcado 13, más que Betis, Sevilla, Alavés o Real Sociedad, y ha encajado 12. LALIGA asigna el partido a Orange Fútbol 1, Movistar Plus+ y Movistar LALIGA. ESPN sitúa el campo en el Santiago Bernabéu. Es el último del sábado, en el hueco de las 21:00 que el viernes ocupó el Málaga-Espanyol y que el domingo ocupará el Racing-Valencia.

Seis puntos, con el Barcelona todavía invicto, no se borran en una noche. Lo que sí puede moverse es el grupo de los 16. Si el Atlético ha ganado por la tarde en Mendizorrotza, estará en 19 y una victoria madridista lo dejaría a un punto. Si el Atlético no ha ganado, 18 puntos del Madrid quedarían por encima de los 16 del Betis, que juega el domingo a las 18:30. El marcador de esta página sigue el del Bernabéu, el sábado a las 21:00.`,
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
    seoDescription: 'El Elche, 18º con 5 puntos, recibe al Celta el domingo 11 a las 14:00 en el Martínez Valero. Previa de la jornada 8 y marcador en vivo.',
    excerpt: 'El Elche, 18º con 5 puntos, recibe al Celta el domingo 11 a las 14:00 en el Martínez Valero. El Celta es 14º, con 7 puntos y 6 goles encajados.',
    neighbors: 'Abre el domingo. A las 16:15, la Real Sociedad recibe al Deportivo en el Reale Arena.',
    essay: `El domingo empieza en el Martínez Valero con un equipo de descenso y otro de la zona media baja. El Elche es 18.º, con 5 puntos, 11 goles a favor y 17 en contra. El Celta es 14.º, con 7 puntos, 8 a favor y 6 en contra. ESPN sitúa el partido en el Estadio Martínez Valero. LALIGA lo programa a las 14:00 y lo da a Movistar LALIGA.

Los puestos 18, 19 y 20 son hoy Elche, Valencia y Málaga. El Levante tiene los mismos 5 puntos que el Elche y es 17.º, con un partido menos. Una victoria del Elche lo lleva a 8, la cifra en la que ahora están Villarreal, Athletic, Getafe, Rayo y Osasuna. Un empate lo deja en 6, por encima de los 4 del Valencia y de los 3 del Málaga, a la espera de lo que hagan esos dos: el Valencia juega el domingo a las 21:00 en Santander y el Málaga ya habrá jugado el viernes. Una derrota lo mantiene en 5, y el Celta se va a 10.

El Celta es el equipo de los empates: cuatro en siete partidos. Solo el Deportivo empata tanto. Su portería es de las más cerradas: 6 goles, los mismos que el Alavés, y uno menos que Getafe, Atlético y Betis. El ataque, 8 goles, va por detrás de esa defensa. El Elche ha encajado 17, la segunda portería más goleada, detrás del Racing (21). A la vez ha marcado 11, más que el Celta. La tabla lo tiene 18.º por lo que entra, con diferencia de −6. El Celta, con +2 y 7 puntos, gana poco y se mantiene en la zona media. A las 14:00 se ven esas dos maneras de sumar.`,
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
    seoDescription: 'Real Sociedad y Deportivo llegan con 10 puntos al Reale Arena, el domingo 11 a las 16:15. El Depor es séptimo y la Real, octava. Marcador en vivo.',
    excerpt: 'Real Sociedad y Deportivo se ven el domingo 11 a las 16:15 en el Reale Arena. Los dos tienen 10 puntos. El Depor es séptimo y la Real, octava.',
    neighbors: 'Va entre el Elche-Celta de las 14:00 y el Betis-Osasuna de las 18:30.',
    essay: `Real Sociedad y Deportivo llegan al domingo con los mismos 10 puntos y un puesto de diferencia. El Depor es 7.º, con diferencia de +2. La Real es 8.ª, con −4. A igualdad de puntos, el gol explica el orden.

El Deportivo empata tanto como el Celta: cuatro veces en siete partidos, y solo ha perdido una. La Real ha ganado tres y ha perdido tres. El visitante es difícil de batir. El local alterna.

Diez puntos son también la frontera con el 6.º. El Alavés tiene 11 y juega el sábado en Mendizorrotza. Si no suma, el domingo puede acercarse a esa plaza, que LALIGA describe, junto con la del Sevilla, como puesto europeo. Si el Alavés gana, se va a 14. Esta previa deja el resultado de Vitoria en su sitio: el domingo en el Reale Arena se juega con el sábado ya disputado.

Una victoria de la Real la lleva a 13, los puntos de hoy del Sevilla, 5.º. Una victoria del Depor lo lleva también a 13, y lo dejaría con una sola derrota en ocho jornadas. Un empate los deja en 11, la cifra actual del Alavés. El perdedor se queda en 10.

ESPN sitúa el partido en el Reale Arena, Anoeta. LALIGA lo da a las 16:15 y en DAZN. Trece goles encajados son muchos para un 8.º: Racing, Elche, Rayo y Osasuna han encajado más, o los mismos 13. El Depor, con 8 encajados y una derrota, llega como el 7.º de la tabla. El Deportivo de esta jornada es el de A Coruña. El marcador de esta ficha busca ese partido, no el del Alavés en Mendizorrotza.`,
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
    seoDescription: 'El Betis, tercero con 16 puntos, recibe a Osasuna el domingo 11 a las 18:30. ESPN sitúa el partido en La Cartuja. Marcador en vivo.',
    excerpt: 'El Betis, tercero con 16 puntos, juega contra Osasuna el domingo 11 a las 18:30. ESPN sitúa el partido en La Cartuja. El marcador se actualiza ese día.',
    neighbors: 'Es el tercer partido del domingo, después de la Real-Deportivo de las 16:15 y antes del Racing-Valencia de las 21:00.',
    essay: `El Betis es 3.º, con los mismos 16 puntos que el Atlético, que es 2.º. Ha marcado 9 y ha encajado 7. Osasuna es 13.º, con 8 puntos, 6 goles a favor y 13 en contra. El domingo a las 18:30, ESPN sitúa el partido en el Estadio La Cartuja. Conviene leerlo así, como el campo del calendario de ESPN para el 11 de octubre, y comprobar el día del partido si el club confirma la sede. LALIGA pone la hora y el operador, Movistar LALIGA.

Dieciséis puntos con 9 goles a favor distinguen al Betis. El Atlético, con los mismos puntos, ha marcado 16. El Madrid, con uno menos, ha marcado 18. El Barcelona, 31. El Betis ha encajado 7, los mismos que Atlético y Getafe. Está tercero porque gana. Osasuna ha marcado 6, por delante solo de Málaga (3), Valencia (4) y Getafe (4), y ha encajado 13.

Una victoria del Betis lo deja en 19. El Atlético juega el sábado. Si ha ganado en Mendizorrotza, también estaría en 19, y el gol seguiría ordenándolos: el Atlético llega a este domingo con +9 y el Betis con +2. Si el Atlético no sumó de tres, 19 del Betis quedarían por encima. El Barcelona, si el sábado ganó al Getafe, estaría en 24. Esta previa deja ese resultado en el sábado.

Osasuna, con 8 puntos, vive con Villarreal, Athletic, Getafe y Rayo. Una victoria lo sube a 11, la cifra de hoy del Alavés. Un empate, a 9. Una derrota lo deja en 8. El domingo juega si sale de una franja en la que cinco equipos caben en el mismo número. El Betis juega si el 16 del sábado por la noche sigue siendo un puesto de arriba el domingo. El marcador de esta página sigue el partido en el campo que confirme el calendario.`,
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
    seoDescription: 'El Racing, 16º con 7 puntos y 21 goles encajados, recibe al Valencia el domingo 11 a las 21:00. El Valencia es 19º, con 4 puntos. Marcador en vivo.',
    excerpt: 'Racing y Valencia cierran el domingo 11 a las 21:00 en Santander. El Racing es 16º, con 21 goles encajados. El Valencia es 19º, con 4 puntos.',
    neighbors: 'Cierra el domingo, después del Betis-Osasuna de las 18:30. El lunes, a las 21:00, el Levante recibe al Sevilla.',
    essay: `El domingo se apaga en Santander con el 16.º y el 19.º. El Racing tiene 7 puntos, 11 goles a favor y 21 en contra: la portería más goleada de Primera, por delante del Elche, que lleva 17. El Valencia tiene 4 puntos, 4 goles a favor y 13 en contra. ESPN registra el campo como El Sardineros. El nombre del estadio del Racing es El Sardinero, en Santander. Si el rótulo del marcador y el del club no coinciden letra por letra, manda el partido Racing-Valencia de esa noche. LALIGA pone la hora en las 21:00 y el operador en DAZN.

El Valencia es penúltimo. Solo el Málaga, con 3 puntos y cero victorias, está por debajo en la columna de puntos. Cuatro goles a favor lo empatan con el Getafe. Cinco derrotas en siete partidos son las más de la Liga.

Siete puntos del Racing son los mismos que tienen Celta y Espanyol. El puesto de descenso empieza en el 18: Elche, con 5; Valencia, con 4; Málaga, con 3. Una victoria del Racing lo lleva a 10, la cifra de hoy de Real Sociedad y Deportivo, que juegan el mismo domingo a las 16:15, así que a las 21:00 esa cifra ya habrá podido moverse. Una derrota lo deja en 7 y sube al Valencia a 7. Un empate deja al Racing en 8 y al Valencia en 5. Para el visitante, el empate lo mantiene en la zona de los tres últimos si el Elche, que juega a las 14:00 y tiene 5, conserva el terreno. La victoria es la cuenta que iguala al Valencia con los 7 puntos de Celta, Espanyol y Racing.

Veintiún goles encajados en siete partidos son tres por jornada. El Racing marca 11, y lo que lo tiene 16.º es la portería. El Valencia ha encajado 13 y ha marcado 4. A las 21:00 se ven 7 puntos contra 4, el puesto 16 contra el 19. El marcador de esta página sigue el partido desde el estado previo, cuando el 0-0 todavía no es un resultado, hasta el final.`,
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
    seoDescription: 'El Levante, con 5 puntos y un partido menos, recibe al Sevilla, quinto con 13, el lunes 12 a las 21:00. Cierre de la jornada 8 y marcador en vivo.',
    excerpt: 'El Levante recibe al Sevilla el lunes 12 a las 21:00 y cierra la jornada 8. El Sevilla es quinto, con 13 puntos. El Levante lleva un partido menos.',
    neighbors: 'Es el cierre de la jornada, el lunes festivo, después del domingo completo. El sábado por la noche ya se habrá jugado el Madrid-Villarreal.',
    essay: `La jornada 8 acaba el lunes 12 de octubre, festivo, a las 21:00, con el Levante-Sevilla. LALIGA lo dejó así al fijar los horarios: el viernes abre el Málaga-Espanyol y el lunes cierra este partido, en Movistar LALIGA. ESPN sitúa el campo en el Estadi Ciutat de València.

El Sevilla es 5.º, con 13 puntos, 10 goles a favor y 9 en contra, diferencia de +1. LALIGA lo cita, junto al Alavés, en puestos europeos, detrás de los cuatro primeros. El Levante es 17.º, con 5 puntos en seis partidos: 8 goles a favor y 12 en contra. Con el Athletic, es el otro equipo que llega con un partido de menos. Cinco puntos en seis jornadas y los 5 del Elche, que ya ha jugado siete, cuentan distinto.

Cuando el Sevilla salte al campo, el resto de la jornada ya tendrá marcador. Barcelona, Madrid, Atlético, Betis, Alavés y los tres de abajo habrán jugado. El Levante podrá mirar una tabla casi cerrada. Esta página, escrita el 8 de octubre, dice qué significan los puntos de hoy. Una victoria del Levante lo deja en 8, con siete partidos, la cifra en la que ahora están cinco equipos de la mitad. Una victoria del Sevilla lo deja en 16, los puntos actuales de Atlético y Betis, y lo acerca a la conversación de los cuatro primeros según lo que esos cuatro hayan hecho el fin de semana. Un empate deja al Sevilla en 14, por encima de los 11 de hoy del Alavés, y al Levante en 6.

El Levante, con diferencia de −4 y un partido guardado, está justo encima de los tres puestos de descenso. El lunes es el partido que la competición dejó solo, con toda la jornada ya jugada alrededor. El marcador de esta página se actualiza esa noche, igual que el viernes se actualiza el de La Rosaleda.`,
  },
]

function gd(side: Side): string {
  const diff = side.gf - side.gc
  if (diff > 0) return `+${diff}`
  return String(diff)
}

function games(side: Side): string {
  return side.pj === 6 ? 'seis partidos, uno menos que casi toda la Liga' : 'siete partidos'
}

function portrait(side: Side): string {
  return `${side.name} llega ${side.pos}.º, con ${side.pts} puntos en ${games(side)}: ${side.pg} victorias, ${side.pe} empates y ${side.pp} derrotas, ${side.gf} goles a favor y ${side.gc} en contra (diferencia ${gd(side)})`
}

function formWords(form: string): string {
  const words: Record<string, string> = { G: 'victoria', E: 'empate', P: 'derrota' }
  return form.split(/\s+/).map((token) => words[token] ?? token).join(', ')
}

function articleContent(fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  const hand = [h, a].filter((s) => s.pj === 6).map((s) => s.name)
  const handLine = hand.length
    ? `${hand.join(' y ')} ${hand.length > 1 ? 'llevan' : 'lleva'} seis partidos en esta foto. En toda la Liga, solo el Athletic y el Levante están así. El resto ya ha jugado siete.`
    : 'Los dos han jugado siete partidos, como casi toda la clasificación que publican Mundo Deportivo y EL PAÍS. Athletic y Levante son los únicos que llegan con seis.'
  const uniform = (form: string) => {
    const tokens = form.split(/\s+/)
    return tokens.every((token) => token === tokens[0])
  }
  const uniformNames = [h, a].filter((side) => uniform(side.form)).map((side) => side.name)
  const formNote = uniformNames.length
    ? `${uniformNames.join(' y ')} ${uniformNames.length > 1 ? 'tienen' : 'tiene'} toda la serie igual, y esa sí se lee como una racha uniforme. Donde las letras cambian, EL PAÍS no aclara si la primera es el partido más antiguo o el más reciente, y aquí no la traducimos a «el último partido».`
    : 'EL PAÍS no aclara si la primera letra es el partido más antiguo o el más reciente. Por eso no traducimos el último símbolo a «el último partido».'

  return `El ${fx.dayLabel}, ${h.name} y ${a.name} se ven a las ${fx.hour}, hora peninsular, en ${fx.venue}. En el cuadro de la jornada 8, LALIGA asigna el partido a ${fx.tv}. ${fx.neighbors} El campo es el que figura en el calendario de ESPN. Si el club cambiara la sede después del 8 de octubre, manda ese aviso.

${portrait(h)}. ${portrait(a)}. ${handLine}

EL PAÍS publica la serie reciente de cada equipo con letras: G de victoria, E de empate, P de derrota. Leída tal como aparece, la de ${h.name} es ${formWords(h.form)}. La de ${a.name}, ${formWords(a.form)}. ${formNote}

La tabla es la de después de la jornada 7. Mundo Deportivo y EL PAÍS coinciden en puntos, partidos y goles. El Barcelona va 1.º, con 21 puntos y siete victorias (31 goles a favor y 7 en contra). Atlético y Betis tienen 16. El Real Madrid, 15. El Sevilla, 13. El Alavés, 11. Deportivo y Real Sociedad, 10. Villarreal, Athletic, Getafe, Rayo y Osasuna están en 8, con el Athletic en seis partidos. Celta, Espanyol y Racing tienen 7. Levante y Elche tienen 5, y el Levante también lleva seis partidos. El Valencia tiene 4 y el Málaga, 3. LALIGA sitúa a Sevilla y Alavés en puestos europeos, detrás de los cuatro primeros. El descenso son los puestos 18, 19 y 20.

## Qué se juegan

${fx.essay}

## Si gana, empata o pierde

Las cuentas de abajo usan solo los puntos de hoy. Los otros partidos de la jornada también suman, y el lunes la tabla será otra.

Si gana ${h.name}, pasa de ${h.pts} a ${h.pts + 3} y ${a.name} sigue en ${a.pts}. Si empatan, ${h.name} queda en ${h.pts + 1} y ${a.name} en ${a.pts + 1}. Si gana ${a.name}, el visitante pasa a ${a.pts + 3} y el local se queda en ${h.pts}.

${h.pj === 6 || a.pj === 6 ? 'Quien llega con seis partidos suma, si gana, en su partido número siete. Quien ya lleva siete suma en el octavo. Las dos cifras se parecen y el camino no es el mismo.' : 'Con este partido, los dos llegan a su octavo encuentro de Liga.'}

## El resto de la jornada

Cada partido tiene su ficha y su marcador. El de esta página busca a ${fx.espnHome} y a ${fx.espnAway}. El calendario completo, en hora peninsular, es este: el viernes, Málaga-Espanyol a las 21:00; el sábado, Rayo-Athletic a las 14:00, Alavés-Atlético a las 16:15, Barcelona-Getafe a las 18:30 y Real Madrid-Villarreal a las 21:00; el domingo, Elche-Celta a las 14:00, Real Sociedad-Deportivo a las 16:15, Betis-Osasuna a las 18:30 y Racing-Valencia a las 21:00; el lunes 12, festivo, Levante-Sevilla a las 21:00.

## El marcador

Arriba hay un marcador. Antes del ${fx.dayLabel}, el 0-0 es la casilla vacía del feed: el partido todavía no se ha jugado. Ese día, con el calendario de España en esa fecha, la página pide el dato a ESPN cada quince segundos. Si el encuentro está en juego, aparecen el gol y el minuto que devuelva la fuente. Al terminar, se queda el resultado cerrado. Si una petición falla y ya había un dato, se conserva el último. Si todavía no había, la página lo dice. Alineaciones, cambios y tarjetas se quedan fuera. Otro día, un 0-0 en esta ficha sigue siendo el estado previo, no un partido ya disputado.

## Preguntas frecuentes

### ¿A qué hora es el ${h.name}-${a.name}?

El ${fx.dayLabel}, a las ${fx.hour}, hora peninsular. Así lo fijó LALIGA.

### ¿Dónde se juega y dónde se ve?

En ${fx.venue}, el campo que ESPN asocia a este partido. En el cuadro oficial figura ${fx.tv}.${fx.tv.includes('abierto') ? ' LALIGA lo señala, además, como emisión en abierto.' : ' La parrilla del día concreta la plataforma.'}

### ¿Cómo llegan?

${h.name} es ${h.pos}.º con ${h.pts} puntos. ${a.name} es ${a.pos}.º con ${a.pts} puntos. La foto es la de después de la jornada 7. Athletic y Levante todavía llevan seis partidos.

### ¿El 0-0 del marcador es un resultado?

Antes del día del partido, no. El recuadro localiza el encuentro. El 0-0 cuenta como resultado cuando la fuente marca el partido en juego o ya cerrado.

### ¿Qué pasa con los puntos?

Si gana ${h.name}, llega a ${h.pts + 3}. Si empatan, ${h.name} queda en ${h.pts + 1} y ${a.name} en ${a.pts + 1}. Si gana ${a.name}, llega a ${a.pts + 3}. El resto de la tabla depende de los otros nueve partidos.

## En una frase

${h.name} y ${a.name} se ven el ${fx.dayLabel} a las ${fx.hour} en ${fx.venue}. Uno llega ${h.pos}.º, con ${h.pts} puntos. El otro, ${a.pos}.º, con ${a.pts}. El marcador de arriba sigue ese partido el día del encuentro.`
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
