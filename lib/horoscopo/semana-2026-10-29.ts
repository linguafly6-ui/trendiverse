import { withSignInfo, type HoroscopeWeek, type WeekReading } from './core'

/**
 * Semana del 29 de octubre al 4 de noviembre de 2026.
 * Efemérides tropicales: el Sol entra en Escorpio el 23; Mercurio inicia retrogradación
 * el 24; Venus vuelve a Libra el 25; Luna llena en Tauro el 26.
 * Los tránsitos se usan como marco simbólico, no como predicciones verificables.
 */

const readings: WeekReading[] = [
  {
    slug: 'aries',
    hook: 'Revisa un acuerdo y decide qué merece tu energía.',
    titulo: 'Menos impulso, más intención',
    general: 'La semana te invita a bajar una marcha y mirar con honestidad qué compartes con los demás: tiempo, gastos, responsabilidades o confianza. El Sol entra en Escorpio el viernes y pone el foco en lo que normalmente prefieres resolver deprisa. La Luna llena del lunes 26 puede ayudarte a ver qué hábito te da estabilidad y cuál te desgasta. No necesitas decidirlo todo hoy; sí dejar de aplazar la conversación importante.',
    relaciones: 'En pareja, hablad de expectativas concretas y evitad convertir una diferencia en una competición. Si estás conociendo a alguien, deja que los hechos acompañen a las palabras. La intensidad no siempre significa compatibilidad.',
    trabajo: 'Revisa las condiciones de un proyecto antes de comprometerte. Con Mercurio retrógrado desde el sábado, confirma fechas, responsables y versiones de los documentos. Una segunda lectura puede ahorrarte una confusión.',
    dinero: 'Pon por escrito cómo se reparten los gastos compartidos. Evita prestar o adelantar dinero por presión; puedes ayudar sin comprometer tu tranquilidad.',
    ritmo: 'Te vendrá bien alternar movimiento y descanso. Una caminata sin móvil o una tarde con menos planes puede despejarte más que llenar la agenda.',
    consejo: 'No confundas rapidez con avance. Aclara el acuerdo y después actúa.'
  },
  {
    slug: 'tauro',
    hook: 'La Luna llena ilumina tus necesidades y tus vínculos.',
    titulo: 'Elige lo que también te elige',
    general: 'La Luna llena en tu signo el lunes 26 marca un momento simbólico para observar cómo estás y qué necesitas de verdad. No hace falta hacer un giro dramático: a veces basta con reconocer que una rutina, una relación o una meta ya no encaja igual. El Sol entra en tu zona de vínculos el viernes y te anima a escuchar también la perspectiva de la otra parte.',
    relaciones: 'Una conversación sincera puede acercaros si habláis desde lo que necesitáis, no desde lo que el otro hace mal. Si estás soltero o soltera, no rebajes tus límites por mantener una ilusión.',
    trabajo: 'Antes de aceptar una nueva responsabilidad, pregunta qué se espera de ti y con qué recursos contarás. Revisa mensajes y citas dos veces desde el sábado.',
    dinero: 'Prioriza lo que te aporta seguridad a largo plazo. Si haces una compra importante, compara opciones y date un margen antes de pagar.',
    ritmo: 'Cuida el descanso y vuelve a lo sencillo: comer a tus horas, estirar y dejar huecos libres. No tienes que estar disponible para todo el mundo.',
    consejo: 'Tus necesidades también cuentan. Escúchalas sin convertirlas en una exigencia para los demás.'
  },
  {
    slug: 'geminis',
    hook: 'Ordena lo cotidiano antes de abrir otro frente.',
    titulo: 'Haz sitio para pensar mejor',
    general: 'La semana pide revisar horarios, tareas y pequeños compromisos que se han ido acumulando. El cambio de signo del Sol el viernes favorece, simbólicamente, una mirada más práctica sobre tu día a día. Mercurio, tu regente, empieza a retrogradar el sábado: úsalo como recordatorio para releer, recuperar y corregir, no como motivo para temer cualquier contratiempo.',
    relaciones: 'Una conversación pendiente puede resolverse mejor si escuchas hasta el final antes de responder. En pareja, repartid las tareas con claridad. Si estás soltero o soltera, una conexión interesante puede empezar con una charla sencilla.',
    trabajo: 'Haz una lista realista y termina una cosa antes de sumar tres más. Guarda copias, confirma reuniones y no des por entendido un encargo ambiguo.',
    dinero: 'Revisa pagos automáticos, recibos y pequeños gastos. No hace falta recortar todo: basta con saber adónde se va el dinero.',
    ritmo: 'Tu cabeza necesita pausas de verdad. Prueba a agrupar mensajes en momentos concretos y reservar un rato sin pantallas antes de dormir.',
    consejo: 'La claridad no llega por pensar más deprisa, sino por ordenar lo que ya sabes.'
  },
  {
    slug: 'cancer',
    hook: 'Vuelve la creatividad; pon límites al ruido externo.',
    titulo: 'Disfruta sin pedir disculpas',
    general: 'Esta semana recupera espacio algo que te hace sentir vivo: una afición, una idea creativa, el romance o el tiempo con quienes te hacen reír. La entrada del Sol en Escorpio el viernes pone un tono más expresivo y personal. La Luna llena del lunes invita a cerrar un ciclo social o dejar de sostener un plan que ya no te ilusiona.',
    relaciones: 'En pareja, reservad tiempo para disfrutar sin convertir cada encuentro en una reunión de logística. Si estás soltero o soltera, muestra interés sin asumir que debes resolver el futuro desde la primera cita.',
    trabajo: 'Presenta una idea que llevas tiempo puliendo, pero escucha las observaciones sin tomarlas como un juicio personal. Revisa cualquier cambio de agenda por escrito.',
    dinero: 'El ocio merece un lugar en el presupuesto, con un límite que te permita disfrutar sin preocuparte después. Evita gastar para compensar un día difícil.',
    ritmo: 'Te ayudará volver a una actividad que te dé placer sin medir resultados: cocinar, dibujar, bailar o pasear con alguien querido.',
    consejo: 'El disfrute no es una recompensa que tengas que ganarte: hazle un hueco razonable.'
  },
  {
    slug: 'leo',
    hook: 'Atiende tu base y deja que los demás también aporten.',
    titulo: 'La fuerza empieza en casa',
    general: 'El foco se desplaza hacia la casa, la familia y la base emocional desde la que haces todo lo demás. Quizá haya que organizar una tarea doméstica, revisar un acuerdo familiar o simplemente reservar más tiempo para ti. La Luna llena del lunes puede mostrar qué parte de tu rutina te sostiene y cuál te está dejando sin energía.',
    relaciones: 'No tienes que dirigir todos los planes para que salgan bien. Pregunta qué necesita la otra persona y expresa lo tuyo sin convertirlo en una orden. Un gesto cotidiano puede decir más que una gran declaración.',
    trabajo: 'Define un cierre claro para la jornada y evita llevarte cada asunto a casa. Desde el sábado, confirma instrucciones y plazos para reducir malentendidos.',
    dinero: 'Si aparece un gasto doméstico, comparad opciones y acordad quién se ocupa de cada parte. No tomes una decisión económica solo por quitarte el tema de encima.',
    ritmo: 'Ordenar un rincón, cocinar con calma o acostarte un poco antes puede devolverte sensación de control. No necesitas transformar toda la casa.',
    consejo: 'Ser fuerte también significa dejar que alguien te eche una mano.'
  },
  {
    slug: 'virgo',
    hook: 'Una conversación pide precisión y menos autocrítica.',
    titulo: 'Di lo importante de forma sencilla',
    general: 'Los mensajes, las gestiones y las conversaciones breves ocupan buena parte de la semana. El Sol entra en Escorpio el viernes y favorece una mirada más profunda sobre lo que dices y lo que callas. Como Mercurio empieza a retrogradar el sábado, tu mejor herramienta será la precisión: pregunta, confirma y no rellenes con suposiciones lo que falta por saber.',
    relaciones: 'Explica lo que necesitas con palabras sencillas y deja espacio para la respuesta. En pareja, no conviertas un detalle olvidado en una conclusión sobre toda la relación. Si estás soltero o soltera, la curiosidad genuina abre mejores puertas que un guion perfecto.',
    trabajo: 'Revisa correos, archivos y fechas antes de enviarlos. Una tarea que parecía menor puede avanzar si la divides en pasos concretos y pides la información que falta.',
    dinero: 'Comprueba facturas y condiciones antes de aceptar un cambio. Una revisión breve de tus gastos habituales te dará una imagen más útil que preocuparte sin datos.',
    ritmo: 'Alterna concentración con pausas cortas y no intentes corregir cada imperfección del día. Descansar también forma parte del trabajo bien hecho.',
    consejo: 'No hace falta encontrar la frase perfecta: basta con decir la verdad con respeto.'
  },
  {
    slug: 'libra',
    hook: 'Revisa prioridades y pon valor a lo que aportas.',
    titulo: 'Tu equilibrio también tiene límites',
    general: 'La semana pone el acento en tus recursos, tu tiempo y la manera en que valoras lo que aportas. Con el Sol saliendo de tu signo el viernes, quizá te resulte más fácil mirar tus necesidades sin medir cada decisión según la reacción ajena. La Luna llena del lunes invita a revisar qué te da seguridad y qué te cuesta más de lo que devuelve.',
    relaciones: 'Ser flexible no significa decir que sí por evitar una incomodidad. Habla de lo que puedes ofrecer y de lo que necesitas recibir. Un vínculo sano admite conversaciones poco cómodas.',
    trabajo: 'Haz visible tu contribución con ejemplos concretos. Si negocias plazos o responsabilidades, evita prometer más de lo que cabe en tu semana y confirma los acuerdos por escrito.',
    dinero: 'Mira el presupuesto sin dramatizar: distingue entre lo necesario, lo que disfrutas y lo que pagas por inercia. No hagas una compra para compensar el cansancio.',
    ritmo: 'Busca belleza en lo cotidiano, pero sin convertir el autocuidado en otra lista de tareas. Un paseo, música o una conversación tranquila son suficientes.',
    consejo: 'El equilibrio no consiste en dejar a todos contentos, sino en no dejarte fuera.'
  },
  {
    slug: 'escorpio',
    hook: 'Empieza tu temporada: elige qué quieres renovar.',
    titulo: 'Un comienzo que no necesita espectáculo',
    general: 'El Sol entra en tu signo el viernes 23 y abre tu temporada: un buen símbolo para revisar cómo quieres presentarte y qué deseas iniciar en las próximas semanas. No necesitas anunciar un cambio para que sea real. La Luna llena del lunes te invita a mirar tus relaciones con el dinero, el valor personal y la estabilidad sin caer en extremos.',
    relaciones: 'La honestidad te favorece, pero no tienes que contar todo de golpe. Si hay una conversación delicada, elige el momento y escucha también lo que la otra persona intenta expresar. Si estás soltero o soltera, deja que la confianza se construya con hechos.',
    trabajo: 'Revisa tu objetivo principal y elimina una distracción. Desde el sábado, comprueba detalles y evita dar por cerrada una propuesta si quedan puntos por acordar.',
    dinero: 'Haz una revisión serena de tus recursos y obligaciones. Evita usar el dinero como prueba de afecto o como forma de recuperar control en una discusión.',
    ritmo: 'Reserva un rato para estar a solas sin convertirlo en aislamiento. Descansar y ordenar tus ideas puede ayudarte a empezar tu temporada con intención.',
    consejo: 'Renovarte no exige romper con todo: empieza por una decisión que puedas sostener.'
  },
  {
    slug: 'sagitario',
    hook: 'Baja el ruido y escucha qué necesitas cerrar.',
    titulo: 'Una pausa también te lleva lejos',
    general: 'Puede que esta semana necesites más silencio del habitual. Antes de lanzarte al siguiente plan, conviene revisar lo que se está terminando, una tarea, una expectativa o una etapa que ya ha dado lo que podía dar. La entrada del Sol en Escorpio el viernes favorece una lectura más introspectiva; no es retroceder, sino recuperar energía para elegir mejor.',
    relaciones: 'No desaparezcas esperando que los demás adivinen qué te pasa. Pide espacio con cariño y explica cuándo volverás a estar disponible. Si estás conociendo a alguien, la calma también permite ver si hay interés real.',
    trabajo: 'Cierra pendientes y evita aceptar compromisos solo porque suenan estimulantes. Con Mercurio retrógrado desde el sábado, documenta lo acordado y guarda tiempo para corregir.',
    dinero: 'Comprueba cargos recurrentes y obligaciones que prefieres no mirar. Si un gasto te inquieta, busca la cifra exacta antes de sacar conclusiones.',
    ritmo: 'Protege el sueño y reduce el exceso de estímulos. Un rato al aire libre o una actividad tranquila te ayudará a recuperar perspectiva.',
    consejo: 'No todo lo nuevo empieza con movimiento; a veces empieza cuando dejas algo atrás.'
  },
  {
    slug: 'capricornio',
    hook: 'Una amistad o un proyecto compartido necesita una revisión honesta.',
    titulo: 'Construye con gente que también construye',
    general: 'La semana te lleva a mirar los planes a largo plazo y las personas con quienes intentas hacerlos realidad. Puede ser momento de repartir mejor el trabajo, cambiar una fecha o reconocer que un objetivo necesita otra estrategia. La Luna llena del lunes pone en primer plano el equilibrio entre tus ambiciones y tu vida cotidiana.',
    relaciones: 'La lealtad se demuestra con presencia, pero no significa cargar siempre con todo. Si una amistad o relación está desequilibrada, habla desde ejemplos concretos y pregunta qué está dispuesto a aportar cada uno.',
    trabajo: 'Un proyecto colectivo puede avanzar si se definen responsables y próximos pasos. Desde el sábado, revisa versiones y no confíes únicamente en acuerdos verbales.',
    dinero: 'Si compartes gastos para un viaje, una actividad o un proyecto, dejad claras las cantidades y las fechas. No confundas compromiso con asumir costes ajenos.',
    ritmo: 'Descansar no te hace menos responsable. Programa un hueco sin obligaciones y evita convertir incluso el ocio en una meta que optimizar.',
    consejo: 'Elige alianzas donde el esfuerzo y la responsabilidad circulen en ambas direcciones.'
  },
  {
    slug: 'acuario',
    hook: 'Haz visible tu trabajo sin descuidar lo que te sostiene.',
    titulo: 'Avanza sin vivir siempre en modo objetivo',
    general: 'Esta semana puede crecer la atención sobre tu papel profesional o una responsabilidad que has asumido. El Sol entra en Escorpio el viernes y te invita a preguntarte qué significa para ti hacer un buen trabajo, más allá de recibir aprobación. La Luna llena del lunes recuerda que los resultados importan, pero también la estabilidad que necesitas para mantenerlos.',
    relaciones: 'Explica cuánto tiempo tienes de verdad para compartir y escucha qué espera la otra persona. No hace falta elegir entre tus metas y tus vínculos, pero sí dejar de fingir que puedes atenderlo todo a la vez.',
    trabajo: 'Prepara una presentación, concreta una prioridad o pide claridad sobre un cambio de funciones. Revisa correos y fechas con cuidado desde el sábado, especialmente si hay varias personas implicadas.',
    dinero: 'Evita contar con una mejora económica hasta que esté confirmada. Revisa los gastos vinculados al trabajo y decide cuáles aportan valor real.',
    ritmo: 'Pon una hora de cierre y respétala cuando puedas. Una actividad fuera de la pantalla te ayudará a cambiar de registro y soltar tensión.',
    consejo: 'El éxito que puedes sostener vale más que una semana brillante a costa de tu descanso.'
  },
  {
    slug: 'piscis',
    hook: 'Una idea gana perspectiva cuando compruebas los detalles.',
    titulo: 'Sueña con los pies en el suelo',
    general: 'La semana despierta ganas de aprender, viajar o mirar una situación desde otro ángulo. El Sol entra en Escorpio el viernes y favorece, simbólicamente, ampliar horizontes sin perder el sentido práctico. La Luna llena del lunes puede ayudarte a reconocer qué creencia o plan te aporta confianza y cuál necesita actualizarse con información nueva.',
    relaciones: 'Compartir una idea o una experiencia puede acercaros, siempre que no esperes que la otra persona vea todo exactamente como tú. Si estás soltero o soltera, deja espacio a la curiosidad y ve paso a paso.',
    trabajo: 'Investiga una formación, revisa una propuesta o pide una segunda opinión antes de decidir. Con Mercurio retrógrado desde el sábado, confirma reservas, fechas y documentos relacionados con viajes o estudios.',
    dinero: 'Pon un presupuesto realista a ese plan que te ilusiona. Comprueba condiciones y posibles costes extra antes de comprometerte.',
    ritmo: 'Busca inspiración sin llenar cada minuto de estímulos. Leer, caminar o hablar con alguien de confianza puede ayudarte a ordenar lo que estás imaginando.',
    consejo: 'No apagues la ilusión: dale estructura para que pueda convertirse en un plan.'
  }
]

export const SEMANA_2026_10_29: HoroscopeWeek = {
  id: '2026-10-29',
  slug: 'semana-29-octubre-4-noviembre-2026',
  start: '2026-10-29',
  end: '2026-10-28',
  label: '29 de octubre al 4 de noviembre de 2026',
  shortLabel: '29 de octubre al 4 de noviembre',
  days: 'jueves 29, viernes 30, sábado 31 de octubre, domingo 1, lunes 2, martes 3 y miércoles 4 de noviembre de 2026',
  sky: {
    items: [
      'El Sol entra en Escorpio el viernes 23 de octubre, alrededor de las 09:38 UTC (11:38 en la Península y Baleares; 10:38 en Canarias).',
      'Mercurio inicia su retrogradación en Escorpio el sábado 24 de octubre. En esta lectura se toma como invitación simbólica a revisar mensajes, acuerdos y detalles, no como una garantía de problemas.',
      'Venus retrógrada vuelve a Libra el domingo 25 de octubre. La Luna llena ocurre en Tauro el lunes 26, aproximadamente a las 04:12 UTC (06:12 en la Península y Baleares; 05:12 en Canarias).',
      'Saturno y Neptuno siguen retrógrados en Aries y Urano en Géminis; Plutón ya está directo en Acuario. Las posiciones y horas se expresan como efemérides tropicales y pueden variar ligeramente entre cálculos.'
    ],
    sourceName: 'Efemérides astrológicas de octubre de 2026, AstroAk',
    sourceUrl: 'https://www.astroak.com/en/ephemeris/2026-10'
  },
  transits: [
    { label: 'El Sol entra en Escorpio el viernes', sign: 'escorpio' },
    { label: 'Mercurio inicia su retrogradación en Escorpio el sábado', sign: 'escorpio' },
    { label: 'Venus retrógrada vuelve a Libra el domingo', sign: 'libra' },
    { label: 'La Luna llena del lunes cae en Tauro', sign: 'tauro' },
    { label: 'Marte y Júpiter siguen en Leo', sign: 'leo' },
    { label: 'Saturno y Neptuno retrógrados siguen en Aries', sign: 'aries' }
  ],
  signs: readings.map(withSignInfo)
}
