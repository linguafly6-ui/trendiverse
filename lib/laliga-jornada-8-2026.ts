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
    essay: `El Málaga llega a La Rosaleda como el único equipo de Primera que, tras siete jornadas, no ha ganado. Tres puntos, tres empates y cuatro derrotas. Tres goles a favor y doce en contra. La diferencia de menos nueve es la misma que la del Valencia, pero el Valencia al menos tiene una victoria y cuatro puntos. El anfitrión del viernes es, con esa foto, el vigésimo.

El Espanyol no está en ese foso. Va decimoquinto, con siete puntos, el mismo número que Celta y Racing, y con el gol average en cero: diez goles a favor y diez en contra. EL PAÍS publica su racha como P E G P P. Hay una victoria en esa serie y dos derrotas al final de la secuencia que el diario muestra. No es un equipo hundido. Tampoco es un equipo que pueda regalar el viernes si quiere alejarse de los tres últimos.

Esos tres últimos, con la tabla que coinciden en publicar Mundo Deportivo y EL PAÍS, son Elche (5 puntos), Valencia (4) y Málaga (3). El descenso en LaLiga son los puestos 18, 19 y 20. El Levante es decimoséptimo con cinco puntos, los mismos que el Elche, pero con un partido menos: ha jugado seis, no siete. Por eso un triunfo del Málaga, que lo dejaría en seis, superaría los totales actuales de Valencia, Elche y Levante, y aun así habría que esperar a lo que hagan esos tres entre el domingo y el lunes. La cuenta del viernes no cierra la jornada.

Para el Espanyol el cálculo es más cómodo y más estrecho a la vez. Una victoria lo lleva de siete a diez puntos, la cifra en la que hoy están Deportivo y Real Sociedad. Un empate lo deja en ocho, la nube en la que viven Villarreal, Athletic, Getafe, Rayo y Osasuna. Una derrota lo mantiene en siete, pegado a la zona que ya ocupa y con el Málaga todavía capaz de recortar si más adelante suma. El viernes no se decide el descenso. Sí se decide si el colista sigue sin estrenar la victoria y si el Espanyol sale de La Rosaleda con aire o con el mismo margen justo.

El contraste de los números ofensivos es el otro dato que no hace falta adornar. El Málaga ha marcado tres goles en siete partidos, la cifra más baja de la competición. El Valencia y el Getafe han marcado cuatro. El Espanyol ha marcado diez, uno más de los que ha encajado. Quien mire solo la portería rival verá un Málaga que encaja doce, por encima de un gol por partido, y un Espanyol que encaja diez justos. No es una previa de estilos. Es la previa de dos cuentas que el viernes se cruzan en el único partido de la noche.`,
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
    essay: `Rayo y Athletic aparecen en la tabla con los mismos ocho puntos y, aun así, no llegan iguales a Vallecas. El Rayo ha jugado siete partidos: dos victorias, dos empates, tres derrotas, once goles a favor y dieciséis en contra. El Athletic ha jugado seis: dos victorias, dos empates, dos derrotas, siete goles a favor y seis en contra. La diferencia es de menos cinco para el local y de más uno para el visitante. El puesto, duodécimo y décimo, sale de esa foto, con el Athletic un partido por disputar respecto a casi toda la Liga.

Ese partido de menos es el dato que ordena la previa. Ocho puntos en seis jornadas no pesan lo mismo que ocho puntos en siete. Si el Athletic gana en Vallecas se va a once, la cifra actual del Alavés, que es sexto. Si empata se queda en nueve y conserva el partido de margen. Si pierde sigue en ocho, con el Rayo yéndose a once. Nada de eso recoloca solo la tabla del lunes, porque el Alavés juega el mismo sábado a las 16:15 y el bloque de los ocho puntos es ancho: Villarreal, Athletic, Getafe, Rayo y Osasuna están ahí, y el Getafe y el Villarreal también juegan el sábado.

El cuadro de LALIGA marca este partido como el primero del sábado y lo asigna a DAZN en abierto, además de a DAZN. Es, de los diez de la jornada, el que la propia competición señala con emisión abierta. El campo que lista ESPN para el sábado 10 es el Estadio de Vallecas.

Los goles cuentan otra historia distinta de los puntos. El Rayo ha marcado once, más que el Betis, que es tercero con nueve, y ha encajado dieciséis, la cuarta portería más goleada por detrás de Racing (21), Elche (17) y, en el mismo escalón que el Rayo, nadie más por encima. Dieciséis encajados en siete partidos es más de dos por jornada. El Athletic ha encajado seis en seis partidos, la misma cifra que el Celta y el Alavés han encajado en siete. EL PAÍS muestra la racha del Rayo como P G P G E y la del Athletic como P G G E E. Hay victorias en las dos series. La del visitante, en los datos agregados, viene con una portería mucho más cerrada.

Vallecas, a las 14:00, no es un partido de la zona alta ni del descenso directo. Es el partido en el que dos equipos de ocho puntos comprueban si esa igualdad resiste el primer pitido del sábado, con el Athletic jugándose además no perder el partido que le sobra en el casillero.`,
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
    essay: `Mendizorroza junta el sábado a las 16:15 al sexto y al segundo. El Alavés tiene once puntos, tres victorias, dos empates y dos derrotas, once goles a favor y seis en contra. El Atlético tiene dieciséis, cinco victorias, un empate y una derrota, dieciséis goles a favor y siete en contra. Cinco puntos de diferencia, y una portería local que es de las más cerradas de la Liga.

La web de LALIGA, al describir la tabla, sitúa a Sevilla y al Alavés en puestos europeos, por detrás de Barcelona, Atlético, Betis y Real Madrid. El Alavés es, con once puntos, el sexto. El Sevilla es quinto con trece. Una victoria local llevaría al Alavés a catorce, por encima de los trece actuales del Sevilla y a un punto de los quince del Real Madrid. Una victoria del Atlético lo subiría a diecinueve, a dos de los veintiuno del Barcelona, que aún no habría jugado: el líder juega a las 18:30 en el Spotify Camp Nou. Un empate dejaría al Atlético en diecisiete, todavía por encima del Betis, que también tiene dieciséis y juega el domingo, y al Alavés en doce, entre el Sevilla y su propio total de hoy.

El Atlético es segundo con los mismos dieciséis puntos que el Betis, tercero. Lo separan el gol average: más nueve frente a más dos. El Atlético ha marcado dieciséis y ha encajado siete. El Betis ha marcado nueve y ha encajado siete. La portería es parecida. El ataque, no. Por eso el sábado en Vitoria no es solo un partido del segundo contra el sexto. Es también el partido en el que el Atlético puede abrir hueco sobre un Betis que todavía no juega, o dejar la puerta abierta si no gana.

EL PAÍS publica la racha del Alavés como G G P P E y la del Atlético como G P G G G. El visitante llega con tres victorias en los últimos tres resultados de esa serie. El local llega de un empate después de dos derrotas, también según el orden en que el diario escribe la racha. Once goles a favor y seis en contra dan al Alavés una diferencia de más cinco, mejor que la del Real Madrid en términos de goles encajados: el Madrid ha encajado ocho. No convierte a Mendizorroza en un fortín demostrado partido a partido, porque esta previa no entra en alineaciones. Sí explica por qué un sexto con la portería en seis goles es un examen distinto de un sexto goleado.

Movistar LALIGA es el operador que figura en el cuadro oficial de la jornada para este partido. ESPN sitúa el campo en Mendizorrotza. El sábado 10, a las 16:15, hora peninsular.`,
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
    essay: `El Barcelona es el único equipo que ha ganado los siete partidos. Veintiún puntos, treinta y un goles a favor y siete en contra. Diferencia de más veinticuatro. Nadie más en la tabla pasa de más diez: el Real Madrid tiene más diez y el Atlético, más nueve. El liderato no es una ventaja de un partido. Es una ventaja de cinco puntos sobre el Atlético y el Betis, que tienen dieciséis, y de seis sobre el Madrid, que tiene quince. Y el líder todavía no ha empatado.

El Getafe llega undécimo, con ocho puntos, dos victorias, dos empates y tres derrotas. Ha marcado cuatro goles en siete partidos. Solo el Málaga ha marcado menos: tres. El Valencia también ha marcado cuatro. Siete goles encajados dejan al Getafe con una diferencia de menos tres. Es un equipo que, en el agregado, ataca poco y no se desborda atrás. EL PAÍS escribe su racha como P E E P G. La del Barcelona es G G G G G.

ESPN coloca el partido en el Spotify Camp Nou el sábado 10. LALIGA asigna la emisión a DAZN y la hora de las 18:30. Una victoria azulgrana haría veinticuatro puntos y ocho triunfos, y ampliaría a ocho la renta sobre los dieciséis actuales de Atlético y Betis, con el Atlético jugando antes, a las 16:15 en Mendizorroza. Si el Atlético gana ese partido, llegaría a diecinueve y el margen del Barcelona, de ganar después, sería de cinco puntos, el mismo de hoy. Si el Atlético no gana, la ventaja crece. El Barcelona no controla Mendizorroza. Sí controla si sigue siendo el único con pleno.

Para el Getafe, ocho puntos son la cifra que comparte con Villarreal, Athletic, Rayo y Osasuna. Una victoria en el Camp Nou lo llevaría a once, los puntos actuales del Alavés, sexto. Sería, en la foto de hoy, salir de la mitad de la tabla. Un empate lo dejaría en nueve. Una derrota lo mantendría en ocho, que es donde ya vive un grupo de cinco equipos. El partido no le exige ganar para seguir undécimo el sábado por la noche. Le ofrece, si gana, un salto que sus cuatro goles en siete jornadas no anuncian y que la tabla tampoco prohíbe: los puntos no preguntan por el promedio goleador.

Treinta y un goles a favor en siete partidos son más de cuatro por jornada. Siete encajados son uno por partido. Esa es la cuenta del líder antes de las 18:30. La del Getafe es la contraria en el ataque y parecida en la portería: pocos goles propios, pocos goles rivales. El marcador del sábado dirá cuál de las dos cuentas manda en el Camp Nou. Hasta el pitido, las dos conviven en la clasificación.`,
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
    essay: `El Real Madrid cierra el sábado en el Santiago Bernabéu a las 21:00 contra el Villarreal. Llega cuarto, con quince puntos, cinco victorias, cero empates y dos derrotas. Dieciocho goles a favor y ocho en contra. Es el único de los cuatro primeros que no ha empatado: cuando no gana, pierde. El Villarreal es noveno, con ocho puntos, dos victorias, dos empates y tres derrotas, trece goles a favor y doce en contra. EL PAÍS escribe su racha como P P P G G. La del Madrid, G P G G P.

Quince puntos dejan al Madrid a seis del Barcelona, que tiene veintiuno y juega antes, a las 18:30. Dejan también un punto por debajo del Atlético y del Betis, que tienen dieciséis. Una victoria en el Bernabéu sube al Madrid a dieciocho. Eso es más que los dieciséis actuales de Atlético y Betis, y seguiría siendo menos que los veintiuno del Barcelona incluso si el líder empatara por la tarde, cosa que todavía no ha hecho en toda la temporada. Una derrota dejaría al Madrid en quince, y el Villarreal se iría a once, la cifra de hoy del Alavés. Un empate, el primer empate madridista del curso, dejaría a los dos en dieciséis y nueve.

El Madrid ha marcado dieciocho goles, la segunda mejor cifra detrás de los treinta y uno del Barcelona. Ha encajado ocho. El Villarreal ha marcado trece, más que el Betis, el Sevilla, el Alavés o la Real Sociedad, y ha encajado doce. Su diferencia es de más uno. No llega a Chamartín como un equipo de ocho puntos apagado en el marcador: llega como un equipo que genera goles y que, en la serie que publica EL PAÍS, enlaza dos victorias después de tres derrotas.

La emisión, en el cuadro de LALIGA, corresponde a Orange Fútbol 1, Movistar Plus+ y Movistar LALIGA. ESPN sitúa el campo en el Santiago Bernabéu. Es el último partido del sábado y el de las 21:00, el mismo hueco horario que el viernes ocupó el Málaga-Espanyol y que el domingo ocupará el Racing-Valencia. El lunes, a la misma hora, cierran Levante y Sevilla.

El Bernabéu del sábado no arregla el liderato. Seis puntos, con el Barcelona aún invicto, no se borran en una noche aunque el Madrid gane y el Barcelona no. Lo que sí puede moverse el sábado por la noche es el grupo de dieciséis puntos. Si el Atlético ha ganado por la tarde en Vitoria, estará en diecinueve y una victoria madridista lo dejaría un punto por detrás. Si el Atlético no ha ganado, dieciocho puntos del Madrid quedarían por encima de los dieciséis del Betis, que juega el domingo a las 18:30. La previa se escribe con esos condicionales porque los otros partidos existen y todavía no tienen marcador. El de este artículo, el sábado a las 21:00, será el que esta página actualice en vivo.`,
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
    essay: `El domingo empieza en el Martínez Valero con un equipo de descenso y otro de la zona media baja. El Elche es decimoctavo, con cinco puntos, una victoria, dos empates y cuatro derrotas. Once goles a favor y diecisiete en contra. El Celta es decimocuarto, con siete puntos, una victoria, cuatro empates y dos derrotas. Ocho goles a favor y seis en contra. ESPN sitúa el partido en el Estadio Martínez Valero. LALIGA lo programa a las 14:00 y lo asigna a Movistar LALIGA.

El descenso son los puestos 18, 19 y 20. Hoy los ocupan Elche, Valencia y Málaga. El Elche tiene cinco puntos, los mismos que el Levante, que es decimoséptimo y ha jugado un partido menos. Una victoria delante de su público llevaría al Elche a ocho puntos, la cifra en la que ahora mismo están Villarreal, Athletic, Getafe, Rayo y Osasuna. Saldría, respecto a los totales actuales, del grupo de cinco puntos. Un empate lo dejaría en seis, por encima de los cuatro del Valencia y de los tres del Málaga, y todavía a la espera de lo que hagan esos dos: el Valencia juega el domingo a las 21:00 en Santander y el Málaga ya habrá jugado el viernes. Una derrota lo mantendría en cinco, con el Celta yéndose a diez.

El Celta es el equipo de los empates. Cuatro en siete partidos. Solo el Deportivo empata tanto: también cuatro. La portería celeste es de las más cerradas del campeonato: seis goles en siete jornadas, los mismos que el Alavés y uno menos que el Getafe, el Atlético y el Betis, que han encajado siete. El ataque, ocho goles, no acompaña a esa defensa. EL PAÍS muestra la racha del Celta como P E E E G y la del Elche como P P E P G. Los dos tienen una victoria en el tramo final de la serie que publica el diario.

Diecisiete goles encajados colocan al Elche como la segunda portería más goleada, solo por detrás del Racing, que lleva veintiuno. Once goles a favor dicen que el Elche no es un equipo mudo: marca más que el Celta. El problema de la tabla está en lo que entra. Una diferencia de menos seis, con cinco puntos, es la de un decimoctavo. La del Celta, más dos, con siete puntos, es la de un equipo que no gana a menudo y que tampoco se cae del mapa. El domingo a las 14:00 esas dos maneras de sumar poco se ven las caras, y el marcador de esta página seguirá el partido mientras dure.`,
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
    essay: `Real Sociedad y Deportivo llegan al domingo con los mismos diez puntos y un puesto de diferencia. El Deportivo es séptimo: dos victorias, cuatro empates, una derrota, diez goles a favor y ocho en contra. La Real es octava: tres victorias, un empate, tres derrotas, nueve a favor y trece en contra. La diferencia de goles explica el orden. El Depor tiene más dos. La Real, menos cuatro. A igualdad de puntos, eso basta.

El Deportivo es, con el Celta, el equipo que más empata: cuatro veces en siete partidos. Solo ha perdido una. La Real ha perdido tres y ha ganado tres. EL PAÍS escribe la racha del Depor como G G E P E y la de la Real como G E G P G. Hay victorias en los dos extremos de la serie realista que muestra el diario. El visitante, en el agregado, es un equipo difícil de batir y poco dado a resolver. El local alterna.

Diez puntos son también la frontera con el sexto. El Alavés tiene once y juega el sábado. Si el Alavés no suma en Mendizorroza, diez puntos del domingo pueden acercarse a esa plaza, que LALIGA describe, junto con la del Sevilla, como puesto europeo. Si el Alavés gana, se va a catorce y la puerta de los once se cierra para quien llegue solo a trece o a diez. Esta previa no adelanta el resultado de Vitoria. Deja escrito que el domingo en el Reale Arena se juega con el sábado ya disputado, y que el lector puede mirar esa clasificación antes de mirar este marcador.

Una victoria de la Real la lleva a trece puntos, los que hoy tiene el Sevilla, quinto. Una victoria del Depor lo lleva también a trece y, además, lo dejaría con una sola derrota en ocho jornadas. Un empate los deja en once, la cifra actual del Alavés, a la espera de lo que el Alavés haya hecho veinticuatro horas antes. El perdedor se queda en diez.

ESPN sitúa el partido en el Reale Arena. LALIGA lo da a las 16:15 y en DAZN. Trece goles encajados son muchos para un octavo: solo Racing, Elche, Rayo y Osasuna han encajado más o los mismos trece. El Depor, con ocho encajados y una derrota, llega a Anoeta como el séptimo más ordenado de la tabla, no como un recién llegado que sobrevive de rachas. El nombre del rival exige no confundirlo con el Alavés: el Deportivo de esta jornada es el de A Coruña, séptimo, diez puntos, y el marcador de esta ficha busca ese partido, no el de Mendizorroza.`,
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
    essay: `El Betis es tercero, con dieciséis puntos, los mismos que el Atlético, que es segundo. Cinco victorias, un empate y una derrota. Nueve goles a favor y siete en contra. Osasuna es decimotercero, con ocho puntos, dos victorias, dos empates y tres derrotas, seis goles a favor y trece en contra. El domingo a las 18:30 se ven en el campo que ESPN asigna a este partido: el Estadio La Cartuja. Conviene leerlo así, como el escenario que figura en el calendario de ESPN para el 11 de octubre, y comprobar el día del partido si el club confirma la sede. LALIGA asigna la hora y el operador, Movistar LALIGA. El nombre del estadio, en esta previa, sale de ESPN.

Dieciséis puntos con solo nueve goles a favor son la rareza del Betis. El Atlético, con los mismos puntos, ha marcado dieciséis. El Madrid, con uno menos, ha marcado dieciocho. El Barcelona, treinta y uno. El Betis ha encajado siete, los mismos que el Atlético y el Getafe. Está tercero porque gana, no porque golee. Osasuna está en la otra orilla: seis goles a favor, la tercera cifra más baja junto a un grupo escaso, solo por delante de Málaga (3), Valencia (4) y Getafe (4), y empatado en la zona baja del ataque. Trece encajados lo colocan con el grupo de porterías abiertas.

EL PAÍS muestra la racha del Betis como P G G G E y la de Osasuna como G P P P E. El tercero llega de tres victorias y un empate en los cuatro últimos resultados de esa serie, con una derrota al principio. Osasuna llega de tres derrotas en el tramo central de la serie que publica el diario.

Una victoria del Betis lo deja en diecinueve puntos. El Atlético juega el sábado. Si ha ganado en Vitoria, también estaría en diecinueve y el gol average seguiría mandando entre ellos: el Atlético tiene más nueve y el Betis, más dos, antes de este domingo. Si el Atlético no sumó de tres, diecinueve del Betis serían más que dieciséis o diecisiete del segundo. El Barcelona, si el sábado ganó al Getafe, estaría en veinticuatro y el liderato seguiría lejos. Si no ganó, la distancia bajaría, y esta previa no va a suponer ese resultado.

Osasuna, con ocho puntos, vive en el grupo de Villarreal, Athletic, Getafe y Rayo. Una victoria lo sube a once, la cifra de hoy del Alavés. Un empate, a nueve. Una derrota lo deja en ocho, que ya es su sitio. No juega el descenso el domingo. Juega si quiere salir de una franja en la que cinco equipos caben en el mismo número. El Betis juega si quiere que el dieciséis del sábado por la noche siga siendo un puesto de arriba el domingo por la noche. El marcador de La Cartuja, o del campo que finalmente confirme el calendario, se actualizará en esta página el día del partido.`,
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
    essay: `El domingo se apaga en Santander con un decimosexto y un decimonoveno. El Racing tiene siete puntos, dos victorias, un empate y cuatro derrotas, once goles a favor y veintiuno en contra. Es la portería más goleada de Primera, por delante del Elche, que lleva diecisiete. El Valencia tiene cuatro puntos, una victoria, un empate y cinco derrotas, cuatro goles a favor y trece en contra. ESPN registra el campo como El Sardineros. El nombre con el que se conoce el estadio del Racing es El Sardinero, en Santander. Si el rótulo del marcador y el del club no coinciden letra por letra, manda el partido Racing-Valencia de esa noche, no el detalle ortográfico. LALIGA pone la hora en las 21:00 y el operador en DAZN.

El Valencia es penúltimo. Solo el Málaga, con tres puntos y cero victorias, está peor en la columna de puntos. Cuatro goles a favor lo empatan con el Getafe como segundo ataque menos productivo. Cinco derrotas en siete partidos son las más de la Liga, junto a nadie más: el Valencia es el que más ha perdido. EL PAÍS muestra su racha como P P P G P. Hay una victoria metida entre derrotas. La del Racing es G P G P P.

Siete puntos del Racing son los mismos que tienen Celta y Espanyol. No es puesto de descenso. El 18 es el Elche, con cinco; el 19, el Valencia, con cuatro; el 20, el Málaga, con tres. Una victoria del Racing lo lleva a diez, la cifra de Real Sociedad y Deportivo, que juegan el mismo domingo a las 16:15, así que a las 21:00 esa cifra ya habrá podido moverse. Una derrota lo deja en siete y sube al Valencia a siete, justo el total que el Racing tiene hoy. Un empate deja al Racing en ocho y al Valencia en cinco. Para el visitante, el empate no lo saca de la zona de los tres últimos si el Elche, que juega a las 14:00, no pierde terreno: el Elche tiene cinco. Para el Valencia, la victoria es la cuenta que lo iguala con los siete puntos de la franja de arriba del descenso.

Veintiún goles encajados en siete partidos son tres por jornada. Once a favor dicen que el Racing marca, y que lo que lo tiene decimosexto no es la puntería sino la portería. Trece encajados del Valencia tampoco son una muralla, y cuatro marcados no alcanzan para compensarlos. El partido de las 21:00 es el de dos equipos a los que la tabla ya ha separado —siete puntos contra cuatro, puesto 16 contra puesto 19— y a los que el gol en contra ha colocado en la conversación de la parte baja. El marcador en vivo de esta página sigue ese encuentro el domingo, desde antes del inicio, cuando el 0-0 todavía no es un resultado, hasta el final.`,
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
    essay: `La jornada 8 no acaba el domingo. Acaba el lunes 12 de octubre, festivo, a las 21:00, con el Levante-Sevilla. LALIGA lo anunció así al fijar los horarios: el viernes abre el Málaga-Espanyol y el lunes cierra este partido, en Movistar LALIGA. ESPN sitúa el campo en el Estadi Ciutat de València.

El Sevilla es quinto, con trece puntos, cuatro victorias, un empate y dos derrotas, diez goles a favor y nueve en contra. La web de LALIGA lo cita, junto al Alavés, en puestos europeos, por detrás de los cuatro primeros. El Levante es decimoséptimo, con cinco puntos, pero ha jugado seis partidos, no siete: una victoria, dos empates y tres derrotas, ocho goles a favor y doce en contra. Es el otro equipo, con el Athletic, que llega a esta jornada con un partido de menos. Cinco puntos en seis jornadas no son los cinco del Elche, que ya ha jugado siete.

Esa diferencia de partidos es la previa entera del lunes. Cuando el Sevilla salte al campo, el resto de la jornada ya tendrá marcador. Barcelona, Madrid, Atlético, Betis, Alavés y los tres de abajo habrán jugado. El Levante podrá mirar una tabla casi cerrada y saber qué vale, esa noche, una victoria, un empate o una derrota. Esta página, escrita el 8 de octubre, no puede adelantar esa tabla del lunes. Puede decir qué significan los puntos de hoy. Una victoria del Levante lo deja en ocho, con siete partidos, la cifra en la que ahora están cinco equipos de la mitad. Una victoria del Sevilla lo deja en dieciséis, los puntos actuales de Atlético y Betis, y lo acerca o lo mete en la conversación de los cuatro primeros según lo que esos cuatro hayan hecho el fin de semana. Un empate deja al Sevilla en catorce, por encima de los once de hoy del Alavés, y al Levante en seis.

EL PAÍS muestra la racha del Sevilla como P E G G P y la del Levante como E G E P P. Diez goles a favor y nueve en contra dejan al quinto con una diferencia de más uno, modesta para un puesto europeo y suficiente para estar por encima del Alavés en puntos: trece contra once. El Levante, con menos cuatro de diferencia y un partido guardado, es decimoséptimo, justo encima de los tres puestos de descenso. El lunes no es un trámite de horario. Es el partido que la competición dejó solo, con toda la jornada ya jugada alrededor, y el marcador de esta página se actualizará esa noche igual que el viernes se actualiza el de La Rosaleda.`,
  },
]

function gd(side: Side): string {
  const diff = side.gf - side.gc
  const sign = diff > 0 ? `más ${diff}` : diff < 0 ? `menos ${Math.abs(diff)}` : 'cero'
  return sign
}

function record(side: Side): string {
  const games = side.pj === 6
    ? 'seis partidos, uno menos que la mayoría de la Liga'
    : 'siete partidos'
  return `${side.name} es ${ordinal(side.pos)} con ${side.pts} puntos en ${games}: ${side.pg} victorias, ${side.pe} empates y ${side.pp} derrotas, ${side.gf} goles a favor y ${side.gc} en contra, diferencia de ${gd(side)}`
}

function ordinal(pos: number): string {
  const names = ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo', 'undécimo', 'duodécimo', 'decimotercero', 'decimocuarto', 'decimoquinto', 'decimosexto', 'decimoséptimo', 'decimoctavo', 'decimonoveno', 'vigésimo']
  return names[pos] || String(pos)
}

function scenario(side: Side, delta: number): string {
  return `${side.pts + delta}`
}

function articleContent(fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  const hand = [h, a].filter((s) => s.pj === 6).map((s) => s.name)
  const handLine = hand.length
    ? `${hand.join(' y ')} ${hand.length > 1 ? 'llegan' : 'llega'} con seis partidos en esta foto, no con siete. En toda la clasificación, solo el Athletic y el Levante están así: el resto de los veinte ya ha disputado siete jornadas.`
    : 'Los dos han jugado siete partidos, como la mayoría de la clasificación que publican Mundo Deportivo y EL PAÍS. Los únicos que llegan a esta jornada con seis son el Athletic y el Levante.'

  return `El ${fx.dayLabel} se juega el ${h.name}-${a.name} de la jornada 8 de LALIGA EA Sports, a las ${fx.hour} hora peninsular, en ${fx.venue}. ${record(h)}. ${record(a)}. El marcador de esta página consulta ese partido y, el día del encuentro, se actualiza solo.

Los horarios de los diez partidos los fijó LALIGA: la jornada empieza el viernes 9 de octubre con el Málaga-Espanyol a las 21:00 y termina el lunes 12 con el Levante-Sevilla a las 21:00. El operador que el cuadro oficial asigna a este partido es ${fx.tv}. El campo es el que figura en el calendario de ESPN para la fecha ${fx.date.slice(6, 8)} de octubre de 2026. ${fx.neighbors}

## Horario, campo y televisión

La cita es el ${fx.dayLabel}, a las ${fx.hour}. En la España peninsular esa hora es la del anuncio de LALIGA. ESPN guarda el inicio en la misma franja: el partido de las 21:00 corresponde a las 19:00 UTC, el de las 14:00 a las 12:00 UTC, el de las 16:15 a las 14:15 UTC y el de las 18:30 a las 16:30 UTC. Quien mire un marcador en otra zona horaria tiene que hacer esa conversión. Aquí la referencia es la peninsular.

${fx.venue} es el escenario asociado a este ${h.name}-${a.name} en el scoreboard de ESPN. No es una alineación ni un parte de césped. Si el club moviera la sede después del 8 de octubre, el dato que hay que creer es el aviso del club y de LALIGA, no esta frase. Hasta ese aviso, el calendario público dice ${fx.venue}.

La televisión, en el cuadro de la jornada 8 de LALIGA, es ${fx.tv}. Esa atribución describe quién aparece como operador del partido en la web de la competición. No incluye el detalle de cada plataforma de pago ni promete que el partido esté en abierto, salvo en el Rayo-Athletic, donde el propio cuadro escribe «DAZN en abierto» además de DAZN. Para el resto, conviene mirar la parrilla del día.

## Dónde está cada equipo

${record(h)}. La racha que publica EL PAÍS, escrita tal como aparece y sin traducir el orden de los símbolos a un último partido concreto salvo cuando todos los símbolos son iguales, es ${h.form}. ${record(a)}. La racha que el mismo diario publica es ${a.form}. ${handLine}

La clasificación de referencia es la posterior a la jornada 7, coincidente en puntos, partidos jugados y goles entre Mundo Deportivo y EL PAÍS. El Barcelona lidera con 21 puntos y pleno de victorias, 31 goles a favor y 7 en contra. Atlético y Betis tienen 16. El Real Madrid, 15. El Sevilla, 13. El Alavés, 11. Deportivo y Real Sociedad, 10. De ahí hacia abajo hay un grupo amplio en 8 puntos y, al final, Levante y Elche con 5, Valencia con 4 y Málaga con 3. LALIGA describe a Sevilla y Alavés en puestos europeos, detrás de los cuatro primeros. Los puestos 18, 19 y 20 son los de descenso.

${h.name} ha marcado ${h.gf} goles y ha encajado ${h.gc}. ${a.name} ha marcado ${a.gf} y ha encajado ${a.gc}. La diferencia entre atacar y defender, en este emparejamiento, cabe en esas cuatro cifras. No hace falta un once para ver si un equipo llega a la jornada generando más de lo que le entran o al revés.

## Qué se juegan

${fx.essay}

## La aritmética, sin adivinar el resto

Estas cuentas usan solo los puntos de hoy. No son la clasificación del lunes, porque los otros nueve partidos de la jornada también suman.

Si gana ${h.name}, pasa de ${h.pts} a ${scenario(h, 3)} puntos y ${a.name} sigue en ${a.pts}. Si empatan, ${h.name} queda en ${scenario(h, 1)} y ${a.name} en ${scenario(a, 1)}. Si gana ${a.name}, el visitante pasa a ${scenario(a, 3)} y el local se mantiene en ${h.pts}.

Para leerlo con el resto de la tabla quieta: el liderato está en 21 (Barcelona). El segundo escalón está en 16 (Atlético y Betis). El cuarto está en 15 (Real Madrid). El quinto está en 13 (Sevilla) y el sexto en 11 (Alavés). Diez puntos son la frontera de Deportivo y Real Sociedad. Ocho puntos agrupan a Villarreal, Athletic, Getafe, Rayo y Osasuna, con el Athletic en seis jornadas. Siete puntos agrupan a Celta, Espanyol y Racing. Cinco son Levante y Elche. Cuatro, el Valencia. Tres, el Málaga. Un resultado de este partido mueve solo a estos dos clubes dentro de esa foto. El lunes, cuando Levante y Sevilla hayan jugado, la foto será otra.

${h.pj === 6 || a.pj === 6 ? 'Quien tenga seis partidos jugados no se compara de forma limpia con quien ya tiene siete. Sumar tres el día de su partido número siete no es lo mismo que sumar tres en el octavo.' : 'Los dos completan con este encuentro su octavo partido oficial de Liga, en la cuenta de siete más uno.'}

## Alrededor de este horario

${fx.neighbors} La jornada completa, con artículo y marcador propios, es esta: el viernes, Málaga-Espanyol a las 21:00; el sábado, Rayo-Athletic a las 14:00, Alavés-Atlético a las 16:15, Barcelona-Getafe a las 18:30 y Real Madrid-Villarreal a las 21:00; el domingo, Elche-Celta a las 14:00, Real Sociedad-Deportivo a las 16:15, Betis-Osasuna a las 18:30 y Racing-Valencia a las 21:00; el lunes 12, festivo, Levante-Sevilla a las 21:00.

Cada uno de esos partidos tiene su ficha. El marcador de esta página no mezcla resultados: busca a ${fx.espnHome} y a ${fx.espnAway} en la jornada de Primera del ${fx.dayLabel}.

## Marcador en vivo el día del partido

Encima del texto hay un marcador. Antes del ${fx.dayLabel} muestra el partido como no empezado. El 0-0 de ese estado es el valor inicial del feed, no un resultado jugado. El día del partido, con el calendario de España en esa fecha, la página vuelve a pedir el marcador cada quince segundos. Si el encuentro está en juego, el estado pasa a «en vivo» y aparecen el gol y el tiempo que devuelva la fuente. Al terminar, el estado pasa a final y se queda el marcador cerrado.

La fuente es el scoreboard de ESPN para la Liga española en la fecha del partido. El campo y los nombres que veas en el recuadro son los de esa fuente. Si una petición falla y ya había un marcador cargado, se mantiene el último dato y se reintenta. Si todavía no había dato, la página lo dice en vez de inventar un gol.

No hay alineaciones, cambios ni tarjetas en este recuadro. El dato que se actualiza es el marcador del ${h.name}-${a.name} y su estado. Durante el partido no hace falta recargar: la petición se repite sola. Otro día, la misma ficha se consulta con menos frecuencia y sigue en estado previo, de modo que un 0-0 visto el jueves no se confunde con un partido ya jugado el ${fx.dayLabel}. Para el resto de la jornada hay que abrir la ficha de cada partido.

## Preguntas frecuentes

### ¿A qué hora es el ${h.name}-${a.name}?

El ${fx.dayLabel}, a las ${fx.hour}, hora peninsular. Así lo fijó LALIGA para la jornada 8.

### ¿Dónde se juega?

En ${fx.venue}, que es el campo que ESPN asocia a este partido. Si hubiera un cambio de sede posterior, manda el aviso del club y de la competición.

### ¿Dónde se ve por televisión?

En el cuadro oficial de la jornada figura ${fx.tv}.

### ¿Cómo va la clasificación antes del partido?

${h.name} es ${ordinal(h.pos)} con ${h.pts} puntos. ${a.name} es ${ordinal(a.pos)} con ${a.pts} puntos. Los datos son los de después de la jornada 7, con Athletic y Levante todavía en seis partidos.

### ¿El marcador está ya en juego?

Solo el día del partido y mientras la fuente marque el encuentro en vivo. Antes de esa fecha el recuadro existe para localizar el partido, y el 0-0 no cuenta como resultado.

### ¿Qué pasa si gana, empata o pierde el local?

${h.name} iría a ${scenario(h, 3)} puntos si gana, a ${scenario(h, 1)} si empata y seguiría en ${h.pts} si pierde. ${a.name} iría a ${scenario(a, 3)} si gana, a ${scenario(a, 1)} si empata y seguiría en ${a.pts} si pierde. El resto de la tabla depende de los otros partidos.

## Conclusión

${h.name} y ${a.name} se ven el ${fx.dayLabel} a las ${fx.hour} en ${fx.venue}. Uno llega ${ordinal(h.pos)}, con ${h.pts} puntos, ${h.gf} goles a favor y ${h.gc} en contra. El otro llega ${ordinal(a.pos)}, con ${a.pts} puntos, ${a.gf} a favor y ${a.gc} en contra. El operador de la ficha oficial es ${fx.tv}. El marcador de arriba seguirá ese partido el día del encuentro, cada pocos segundos, desde el estado previo hasta el resultado final.`
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
}

const LIVE = new Map<string, LiveFixtureRef>(FIXTURES.map((fx) => [fx.slug, {
  league: 'esp.1',
  espnHome: fx.espnHome,
  espnAway: fx.espnAway,
  date: fx.date,
  kickoffLabel: `${fx.dayLabel}, ${fx.hour} hora peninsular`,
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
