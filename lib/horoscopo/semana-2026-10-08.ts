import { withSignInfo, type HoroscopeWeek, type WeekReading } from './core'

/**
 * Semana del 8 al 14 de octubre de 2026.
 * Cielo fijado con efemérides públicas; las casas se cuentan en signos enteros desde el signo solar.
 */

const readings: WeekReading[] = [
  {
    slug: 'aries',
    hook: 'Revisa el acuerdo que ya tienes antes de abrir otro.',
    titulo: 'Revisa un acuerdo antes de abrir otro',
    general:
      'Esta semana, el foco está en la gente con la que ya tienes un trato: tu pareja, un socio, alguien con quien compartes un compromiso. Antes de decir que sí a algo nuevo, mira si lo que ya tienes sigue funcionando como crees. Quizá notes que arrancar te cuesta más de lo habitual. No pasa nada. Ir un poco más despacio también es avanzar.',
    relaciones:
      'Si tienes pareja, puede salir una conversación sobre algo que compartís: dinero, planes o un tema que lleváis tiempo dejando para luego. Elige un asunto concreto y habladlo con calma, sin meter todo en la misma charla. El fin de semana es buen momento para repasar cómo os repartís las cosas. Si estás soltero o soltera, lo mismo vale para un amigo, un compañero de piso o alguien con quien compartes gastos. Tienes ganas de disfrutar y de que la relación se note. Un plan sencillo y bien hecho vale más que una gran promesa.',
    trabajo:
      'Tienes energía de sobra y ganas de que una idea tuya se vea: una presentación, un proyecto, algo con tu nombre. Para que salga bien, elige un solo frente y ponle una fecha realista. Lo demás puede esperar en una lista. Si alguien te pide una respuesta rápida sobre un contrato o un acuerdo, pide tiempo para leerlo con tranquilidad. Contestar el lunes con la letra pequeña leída es mejor que contestar hoy sin leerla.',
    dinero:
      'El dinero compartido pide atención: una cuenta en común, una deuda, un gasto que paga otra persona por ti. Pon las cifras sobre la mesa y aclara quién paga qué. Si hay algo pendiente de devolver, acordad una fecha. Evita firmar o comprometer dinero con prisas esta semana.',
    ritmo:
      'Tu cuerpo puede pedirte bajar el ritmo. Escúchalo. Antes del fin de semana, cierra una tarea pequeña del día a día que te quite peso: una lista, una compra, una llamada. Intenta acostarte a una hora parecida cada noche y deja un hueco libre el domingo para que el lunes no empiece ya cansado.',
    consejo: 'Cuida los acuerdos que ya tienes antes de abrir otros nuevos. Ir despacio también es avanzar.',
  },
  {
    slug: 'tauro',
    hook: 'Ajusta tu rutina y di lo que te pesa en pareja.',
    titulo: 'Pon orden en tu día a día',
    general:
      'Esta semana toca mirar cómo organizas tus días: horarios, tareas, hábitos. Algo que funcionaba en teoría puede no encajar en tu rutina real, y ahora es buen momento para ajustarlo. También puede salir una conversación con tu pareja o con alguien cercano sobre lo que das y lo que recibes. No hace falta cambiarlo todo, solo ser sincero con lo que ya no te encaja.',
    relaciones:
      'En pareja, puede repetirse un patrón que conoces bien: esperar sin decir nada, ceder para evitar discusiones o exigir más de la cuenta. Esta semana es buen momento para nombrarlo con una frase sencilla y sin reproches. Si no tienes pareja, lo mismo vale para un socio o una amistad en la que notas un desequilibrio. En casa, hay ganas de calor y de compañía. Un gesto concreto, como arreglar algo pendiente o preparar una cena, dice más que muchas palabras.',
    trabajo:
      'Hay una tarea que siempre se atasca en el mismo punto. Fíjate en cuál es ese paso y prueba a cambiarlo o quitarlo. Puede que arrastres un cansancio de fondo que no se nota en las reuniones pero sí en ti. Deja márgenes: no prometas una entrega nueva sin haber cerrado la anterior. Si alguien te mete prisa, está bien decir que lo revisas el lunes con la cabeza despejada.',
    dinero:
      'Antes de gastar para sentirte mejor, pregúntate si ese gasto resuelve algo o solo tapa el malestar un rato. Repasa los pagos que ya tienes comprometidos y comprueba que las cifras cuadran. Si compartes gastos de casa, aclarad quién paga qué este mes.',
    ritmo:
      'Aguantas mucho y luego te plantas de golpe. Esta semana, intenta decir que necesitas parar antes de llegar al límite. Come y duerme a las horas que sabes que te sientan bien. No necesitas un plan nuevo de bienestar: con mantener siete días lo que ya te funciona es suficiente. El sábado por la noche, descansa en lugar de tomar decisiones.',
    consejo: 'Ajusta tu rutina a tu vida real y di lo que te pesa antes de que te pese demasiado.',
  },
  {
    slug: 'geminis',
    hook: 'Una idea pide forma. Elige una y termínala.',
    titulo: 'Dale forma a una idea',
    general:
      'Tienes la cabeza llena de ideas, como siempre. Esta semana una de ellas pide que la bajes a tierra: un proyecto creativo, un plan con alguien que te gusta, algo que lleve tu sello. Para que salga adelante, tiene que caber en tu agenda real, no solo en tu imaginación. Puede que notes que la forma de hacer las cosas de siempre ya te queda pequeña. No hace falta un cambio enorme; uno pequeño y constante vale más.',
    relaciones:
      'Hay más mensajes de los que puedes contestar bien: chats de grupo, conversaciones a medias, hilos que no se cierran. Si quieres cuidar una relación, queda a una hora concreta y cúmplela. Eso dice más que escribirse hasta las once de la noche. Si hay un malentendido, resuélvelo con tres líneas claras en lugar de dar vueltas. Puede que un plan de amigos o un proyecto en grupo se haya convertido en una obligación. Está bien decir qué parte quieres seguir asumiendo y cuál no.',
    trabajo:
      'El centro de la semana es práctico: herramientas, versiones, tareas pendientes. Entregar algo breve y terminado el martes vale más que un esquema brillante que no sale del borrador. Si tienes dos proyectos creativos compitiendo por la misma tarde, elige uno. El otro puede esperar a la semana que viene sin que pase nada. Pon tu nombre en lo que entregues.',
    dinero:
      'Las compras rápidas por impulso, sobre todo las que haces con el móvil a última hora, son las que luego cuesta recordar. Antes de pagar, deja pasar un día. Si necesitas una herramienta o un curso para tu proyecto, compáralo con calma y elige la opción que de verdad vas a usar.',
    ritmo:
      'Tanto estímulo se nota en el sueño y en el ánimo. Al terminar el día, apunta en una sola nota lo que queda pendiente y deja el resto de mensajes para mañana. Si estudias o escribes, prueba a estar veinticinco minutos seguidos sin cambiar de pestaña. Y reserva un rato para jugar de verdad: una hora sin móvil y sin objetivo también alimenta tus ideas.',
    consejo: 'Elige una idea y termínala. Lo demás puede esperar en la lista.',
  },
  {
    slug: 'cancer',
    hook: 'Haz sitio para tu casa sin descuidar el trabajo.',
    titulo: 'Haz sitio para tu casa',
    general:
      'Esta semana el foco está en tu hogar y en tu familia: la casa, las personas con las que vives, el espacio desde el que trabajas. Puede ser un buen momento para ordenar quién hace qué o para recuperar una hora que la casa se había comido. Al mismo tiempo, el trabajo sigue pidiendo resultados. Las dos cosas caben en la misma semana si les das a cada una su momento.',
    relaciones:
      'En el amor, se agradece una verdad sencilla, del tamaño de una tarde juntos. Un plan en casa el fin de semana puede sentar mejor que una salida pensada para contarla después. Si estás conociendo a alguien, no hace falta impresionar: una conversación tranquila ya es un buen comienzo. Si hay distancia con alguien de la familia, di qué necesitas estos días y qué puedes ofrecer. Con eso basta para empezar.',
    trabajo:
      'En el trabajo se te pide una entrega clara. Elige el resultado que tu responsable o tu cliente pueda ver a mitad de semana y céntrate en eso. Si el trabajo se cuela en la cena todos los días, pon una frontera: una hora a partir de la cual la casa vuelve a ser casa. Anota qué parte de tu puesto es realmente tuya y qué parte sostienes por costumbre. Esa nota te ahorrará decisiones tomadas en caliente.',
    dinero:
      'Hay ganas de gastar en casa y en comodidad. Antes de hacerlo, revisa algún gasto fijo del hogar que ya no corresponda al uso real, como una suscripción o un servicio que apenas usas. Mira las cifras con calma y sin prisa por tapar nada con una compra.',
    ritmo:
      'Notas el estado de ánimo de los demás en tu propio cuerpo. Esta semana, antes de hacerte cargo del día de otra persona, termina el tuyo: una comida tranquila, una hora fija para volver a casa, la puerta cerrada un rato. El jueves y el viernes son buenos días para vaciar un cajón o una lista. Primero tu cuidado; luego el de los demás.',
    consejo: 'Pon una frontera entre el trabajo y la casa, y defiéndela con cariño.',
  },
  {
    slug: 'leo',
    hook: 'Habla claro y no te cargues de más.',
    titulo: 'Habla claro y no te cargues de más',
    general:
      'Esta semana, céntrate en expresar lo que necesitas y en organizar tus pendientes. Tienes energía y ganas de que se te vea, y eso está bien. Pero no tienes que hacerlo todo ni demostrar constantemente de lo que eres capaz. Elige qué merece tu atención y deja espacio para ti. Una frase clara que otra persona pueda repetir vale más que un gran gesto.',
    relaciones:
      'Si hay algo que quieres hablar con tu pareja, busca un momento tranquilo. Explica cómo te sientes sin esperar a que la otra persona lo adivine. Una conversación sencilla puede ser un buen comienzo, aunque no lo resolváis todo en ese momento. En casa y con la familia pueden aparecer temas que llevaban tiempo callados; una charla en la cocina sienta mejor que una gran declaración. Si estás conociendo a alguien, no necesitas impresionar con grandes planes. Un mensaje sincero o una propuesta que os apetezca a los dos puede ser suficiente.',
    trabajo:
      'Tienes una idea que quieres sacar adelante. Antes de compartirla, ordénala: qué quieres hacer, qué necesitas y cuál sería el primer paso. Escríbela en cinco líneas antes de contarla en voz alta. Evita comprometerte con más de lo que puedes asumir. Si trabajas con otras personas, explica bien las tareas y los plazos. Ser claro te ayudará más que intentar estar pendiente de todo.',
    dinero:
      'Dedica un rato a revisar los gastos que tienes por delante. Si compartes pagos con alguien, dejad claro cuánto aporta cada uno y cuándo hay que pagarlo. ¿Te apetece darte un capricho? Comprueba primero si encaja en tu presupuesto y evita decidir con prisas.',
    ritmo:
      'No conviertas cada rato libre en otra tarea. Busca un momento para disfrutar de algo sin exigirte un resultado: escuchar música, salir a pasear o quedar con alguien con quien estés a gusto. También puedes dejar un plan para otro día si necesitas descansar. Y si algo te duele o no descansas bien, consúltalo con quien te atiende; el horóscopo no es el sitio para eso.',
    consejo: 'Expresa lo que necesitas, cumple lo que prometes y no te exijas llegar a todo.',
  },
  {
    slug: 'virgo',
    hook: 'Ponle un número a lo que vales y a lo que regalas.',
    titulo: 'Ponle un número a lo que vales',
    general:
      'Esta semana el tema es tu dinero y tu valor: qué cobras, qué gastas, qué das gratis y qué podrías dejar de dar. A veces demuestras lo que vales trabajando de más. Ahora toca ponerle cifras. También es una buena semana para tener esa conversación que llevas tiempo aplazando con alguien cercano. Hablarlo o escribirlo te sacará de darle vueltas a solas.',
    relaciones:
      'Salen conversaciones pendientes con hermanos, compañeros, vecinos o con la persona con la que compartes gestiones. Di lo que ha pasado, sin la lista de defectos. Antes de enviar un mensaje nuevo, relee el anterior: a veces el malentendido se arregla con tres líneas. En pareja, hay un esfuerzo que haces y que nadie ve. Decide si sigue siendo útil o si ya es solo costumbre, y dilo en una frase tranquila.',
    trabajo:
      'Si tienes varios frentes abiertos, se pisan entre ellos. Elige tres tareas y deja la cuarta para después. Tu trabajo mejora esta semana con un proceso más corto, no con un estándar imposible. Si un cliente o un socio te debe algo, escríbelo y ponle una fecha de seguimiento después del fin de semana.',
    dinero:
      'Separa lo tuyo de lo compartido: impuestos, deudas, dinero que no es solo tuyo. Revisa un papel que tengas pendiente. Haz una lista sencilla de lo que entra y lo que sale este mes, y fíjate en qué estás regalando, en tiempo o en dinero, sin que nadie te lo haya pedido.',
    ritmo:
      'A veces usas el orden como forma de controlar lo que te preocupa. Esta semana, ordena, y luego para cuando la lista ya esté hecha. Dormir y comer bien es la base para no vivir de parches. Si una cifra te quita el sueño, apúntala por la mañana con luz y déjala en el papel. Las decisiones de dinero se toman con tus números delante, no a las tres de la madrugada.',
    consejo: 'Deja de regalar lo que para ti tiene valor. Ponle un número y cuídalo.',
  },
  {
    slug: 'libra',
    hook: 'Tu semana para empezar algo, aunque sea pequeño.',
    titulo: 'Esta semana empieza contigo',
    general:
      'Esta es tu semana para empezar algo. Puede ser pequeño: decir en voz alta lo que quieres, cortar con una costumbre, presentarte de una manera más clara. Mientras tanto, por dentro, estás revisando qué te importa de verdad y qué te está costando más de lo que vale. Las dos cosas van juntas: empiezas por fuera mientras ordenas por dentro.',
    relaciones:
      'En pareja o con un socio, puede que notes el peso de un compromiso. Tiendes a equilibrar cediendo; esta semana, el equilibrio pasa por decir a qué dices que sí y qué dejas fuera. Si hay un acuerdo que renegociar, ponle una condición concreta y un plazo. Tus amigos te animan y te dan ideas, pero la decisión sobre la relación es de las dos personas que la sostienen. El grupo puede escuchar; el acuerdo se cierra en otro sitio.',
    trabajo:
      'Mira si lo que cobras corresponde a lo que haces. Si aceptas tareas sin reconocimiento para evitar roces, el roce ya está ahí, solo que lo pagas tú. Escribe una cifra y una tarea y comprueba si coinciden. Si tienes que pedir algo, hazlo con tu nombre delante y sin pedir perdón. Un proyecto nuevo puede esperar a que el actual tenga un precio justo.',
    dinero:
      'Evita la compra que busca hacerte sentir otra persona. Si el fin de semana ibas a gastar para cambiar de imagen, deja el dinero en el bolsillo unos días y mira si sigues queriéndolo. Repasa precios, sueldos o presupuestos que aceptaste sin pensarlo mucho.',
    ritmo:
      'Decidir te cansa más que hacer. Elige una sola cosa nueva en tu manera de presentarte esta semana, y deja el resto como está. Cuida el sueño alrededor del fin de semana: una noche corta pide menos planes al día siguiente. El domingo, date permiso para no hacer nada.',
    consejo: 'Deja de equilibrar a los demás un momento y pregúntate qué quieres tú.',
  },
  {
    slug: 'escorpio',
    hook: 'Cierra temas y descansa. Tu momento llega después.',
    titulo: 'Cierra, descansa y prepara lo que viene',
    general:
      'Esta semana te toca de cerca: en lo que deseas, en cómo lo dices y en cómo te tratas a ti. Un gusto, una lealtad o una atracción se miran otra vez, con más calma. Al mismo tiempo, el momento pide cerrar temas y descansar, no estrenar nada grande. Lo que prepares ahora en silencio tendrá su momento en unas semanas, cuando llegue tu temporada.',
    relaciones:
      'Si tienes pareja, pregúntale algo que de verdad necesitas saber y deja espacio para la respuesta. Las conversaciones privadas y cortas funcionan mejor que las largas discusiones. También es una buena semana para revisar qué quieres tú de una relación, con independencia de lo que esperen los demás. Si estás soltero o soltera, no te apresures: ahora toca aclararte, no decidir.',
    trabajo:
      'Tienes ambición y ganas de que tu trabajo se note. Úsalas en algo concreto que se pueda evaluar: un informe, una propuesta, un resultado. Por fuera el puesto luce, pero por dentro tu agenda puede estar más apretada de lo que parece. Ajusta una franja de tu día y deja el sobreesfuerzo heroico para otra temporada. El sábado es buen día para archivar y ponerte al día, no para hacer anuncios.',
    dinero:
      'Antes de gastar por impulso, espera. Esta semana el dinero se gestiona mejor en silencio: revisa cuentas, cierra pagos pendientes y no tomes decisiones grandes hasta tener claro qué quieres. Si alguien te propone un negocio o una inversión, pide tiempo para pensarlo.',
    ritmo:
      'Aguantas en silencio y luego cortas de golpe. Esta semana, el corte útil es con un hábito que te mantiene en alerta: un chat, una noticia, una vigilancia constante. Duerme más. Si algo te inquieta en el cuerpo o en el ánimo varios días seguidos, habla con un profesional. Las ganas de cerrar relaciones pasarán; no tomes decisiones definitivas en caliente.',
    consejo: 'Descansa y cierra temas. Lo que quieres mostrar puede esperar una semana más.',
  },
  {
    slug: 'sagitario',
    hook: 'Un plan grande pide un paso pequeño esta semana.',
    titulo: 'Un plan grande, un paso pequeño',
    general:
      'Tienes ganas de ampliar horizontes: un viaje, un curso, una idea que te saque de lo de siempre. Esta semana ese impulso pide un paso que se pueda medir: una fecha, una reserva, una hora de estudio. También es un buen momento para arrancar algo con tu grupo de amigos o con un equipo, siempre que cada uno sepa qué le toca. Lo que antes salía solo ahora pide compromiso, y con compromiso se queda.',
    relaciones:
      'En el amor, menos prisa y más constancia. Si hay una cita o una historia que te importa, dilo claro y propón una próxima vez concreta, con día y hora. El «ya veremos» de siempre no funciona esta semana. Por dentro, puede aparecer un recuerdo o un sentimiento que prefieres guardarte. Escríbelo o cuéntaselo a una sola persona de confianza. No hace falta compartirlo con todo el grupo.',
    trabajo:
      'Si estudias, dedica una hora a un texto real, no a planear cómo vas a estudiar. Si preparas un viaje, hazlo con fechas y presupuesto, no solo con ganas. En el trabajo en equipo, asegúrate de que cada persona sepa qué hace el lunes. Te encanta abrir el mapa; esta semana, el mapa cabe en una hoja. La parte aburrida también es parte del camino.',
    dinero:
      'Los planes grandes tienen un coste. Antes de comprometerte con un viaje o un curso, pon los números sobre la mesa: cuánto cuesta, cuándo lo pagas, qué dejas de hacer para poder permitírtelo. Si compartes gastos con amigos, aclarad las cuentas antes, no después.',
    ritmo:
      'Moverte te regula, pero también te dispersa. Elige un movimiento con sentido: andar, un recado, una clase. El sábado puede tener un plan, pero el segundo plan encadenado puede quedarse en casa. Reserva una noche sin compañía. Si el grupo te deja vacío, pon un límite de horas; las amistades seguirán ahí.',
    consejo: 'Da el paso pequeño de esta semana en lugar de contar el plan grande.',
  },
  {
    slug: 'capricornio',
    hook: 'Enseña tu trabajo sin esperar a que sea perfecto.',
    titulo: 'Enseña tu trabajo sin esperar a que sea perfecto',
    general:
      'Esta semana puedes mostrar un resultado en el trabajo: un informe, una decisión, un mensaje a quien decide. No hace falta que sea enorme. Al mismo tiempo, tu casa y tu familia piden atención, y esa revisión seguirá más allá de esta semana. Lo que enseñas fuera se sostiene mejor cuando lo de dentro está ordenado.',
    relaciones:
      'Con los amigos y los grupos, pregúntate si sigues ahí porque quieres o por costumbre. Si hay algo que decir, hazlo en privado para evitar malentendidos de grupo. En casa, los conflictos se arreglan con una tarea compartida y un horario, en una conversación corta. Si cuidas de alguien, piensa qué parte es cuidado y qué parte es querer controlarlo todo. En pareja, la intimidad y el dinero compartido pueden ir de la mano esta semana: hablad de ambas cosas con sinceridad.',
    trabajo:
      'A veces escondes tu trabajo hasta que está perfecto. Esta semana, deja salir una versión completa y mejorable. Escríbela antes del fin de semana y envíala con los matices justos. Si te ofrecen un puesto o una responsabilidad nueva, pregunta por el horario real y mídelo con lo que tu casa ya necesita de ti. El halago y el calendario se leen juntos.',
    dinero:
      'Elige una cifra del dinero compartido (una deuda, una herencia, una cuenta en común, un préstamo) y mírala de frente. No hace falta resolverlo todo; basta con saber de qué número hablamos. Si hay algo que renegociar con un banco o con otra persona, prepara los datos antes de la conversación.',
    ritmo:
      'El peso de la casa se nota en el cuerpo. Acuéstate a una hora que puedas repetir. Haz una comida al día sin pantalla de trabajo. Si el sábado se convierte en otra jornada laboral, el resultado se comerá la base que necesitas. El cuidado del cuerpo, cuando hace falta, se habla con quien te atiende.',
    consejo: 'Muestra lo que has hecho, y cuida la casa para que el resultado no salga del cansancio.',
  },
  {
    slug: 'acuario',
    hook: 'Baja tu idea a una fecha o a un mensaje claro.',
    titulo: 'Baja tu idea a una fecha',
    general:
      'Esta semana nace una idea, un curso, un viaje o una convicción nueva. Te mueves cómodo en el terreno de las ideas, pero ahora el concepto necesita un dato o una fecha para hacerse real. Al mismo tiempo, los mensajes, los trámites y las gestiones cercanas van más lentos y pesados. Decir menos y más claro te ordenará la bandeja de entrada.',
    relaciones:
      'En pareja hay más ganas, más opiniones y más intensidad. Separa dos conversaciones: una sobre cómo estáis como pareja y otra sobre tu trabajo y cómo te ven. Si tu pareja también forma parte de tu proyecto profesional, poner cada tema en su sitio os ayudará a los dos. Un amigo puede escucharte, pero la decisión es tuya. Si estás conociendo a alguien, la conexión puede ser rápida; disfrútala sin planificar demasiado.',
    trabajo:
      'Es momento de revisar alianzas laborales, reconocimiento y colaboraciones que diste por hechas. Relee un acuerdo o una expectativa que nunca se puso por escrito. Si tu trabajo echa de menos una idea que te importe, anótala y déjala reposar. Un curso corto o una lectura concreta te servirá más que rediseñar toda tu identidad profesional.',
    dinero:
      'Si una decisión de dinero relacionada con el trabajo te quita el sueño, puede esperar a que tengas los datos. No firmes nada ni cambies de rumbo solo porque alguien opina. Si vas a invertir en formación o en un viaje, compara opciones y elige la que vayas a aprovechar de verdad.',
    ritmo:
      'Te adelantas y luego te desconectas. Esta semana toca presencia: contesta lo atrasado, ve al trámite, llama a quien toca. Hazlo en un solo bloque, de día. Reserva una hora para estudiar o leer con luz natural. Come bien y deja la pantalla antes de dormir.',
    consejo: 'Convierte tu idea en un mensaje claro o en una fecha. Lo demás es ruido.',
  },
  {
    slug: 'piscis',
    hook: 'Nombra lo que compartes y cuida tu día a día.',
    titulo: 'Nombra lo que compartes',
    general:
      'Esta semana puede aclararse algo que compartes con otra persona: un dinero, una deuda, una intimidad o un tema que aún no tiene nombre. Basta una cifra, un límite o una frase sincera para que deje de ser niebla. Donde más vas a crecer es en lo cotidiano: tus horarios, tus tareas, tu cuidado diario. Es menos romántico, pero por eso se puede cumplir.',
    relaciones:
      'La confianza es el tema de la semana. Puede haber conversaciones con alguien que vive lejos o que piensa distinto a ti. Antes de ampliar el relato, revísalo. Si perdonas, que sea un acto concreto. Si pones un límite, dilo una vez y mantenlo en el día a día. Puedes impacientarte con quien no cumple lo que dice; pídele hechos, no intenciones. En pareja, hablad del reparto de lo que compartís con calma.',
    trabajo:
      'Mejora un proceso que ya tienes en lugar de inventar uno nuevo. Una hora fija de trabajo concentrado vale más que una inspiración a deshoras. Si compartes ingresos o un proyecto con alguien, pon el reparto por escrito, aunque sea en una nota sencilla. Cuando los dos la hayáis leído, será suficiente.',
    dinero:
      'Tu dinero propio lleva meses en una especie de niebla. Esta semana, aclara una cuenta pequeña y deja la decisión grande para cuando tengas los números claros. Un préstamo, un gasto importante o perdonar una deuda se deciden con tus cuentas delante, no con el ánimo del momento.',
    ritmo:
      'Absorbes el estado de ánimo de los demás. El antídoto esta semana es concreto: dormir a una hora parecida, una comida de verdad, una tarea terminada. Puede removerse una emoción vieja; escribirla o contársela a alguien de confianza le da sitio. Si el ánimo se queda bajo varios días, habla con un profesional.',
    consejo: 'Nombra lo que compartes y cuida tu rutina. Lo pequeño y constante es lo que te sostiene.',
  },
]

export const SEMANA_2026_10_08: HoroscopeWeek = {
  id: '2026-10-08',
  slug: 'semana-8-14-octubre-2026',
  start: '2026-10-08',
  end: '2026-10-14',
  label: '8 al 14 de octubre de 2026',
  shortLabel: '8 al 14 de octubre',
  days: 'jueves 8, viernes 9, sábado 10, domingo 11, lunes 12, martes 13 y miércoles 14 de octubre de 2026',
  sky: {
    items: [
      'La luna nueva llega el sábado 10 de octubre de 2026, sobre las 15:50 UTC. En la Península y en Baleares son las 17:50. En Canarias, las 16:50. Time and Date la sitúa a las 15:50 UTC. Otra efeméride la adelanta un minuto. El Sol está en Libra, así que la luna nueva también cae en Libra.',
      'Venus pasa toda la semana retrógrada en Escorpio. Varias efemérides sitúan el inicio de ese retroceso el 3 de octubre de 2026, en Escorpio, y la vuelta al movimiento directo el 14 de noviembre, ya en Libra. El minuto exacto cambia según el cálculo. Aquí nos quedamos con el día y el signo.',
      'El 8 de octubre, a las 00:00 y a las 12:00 UTC, las efemérides tropicales coinciden en el signo, aunque no en el minuto de arco. Sol en Libra. Luna en Virgo. Mercurio directo en Escorpio. Venus retrógrada en Escorpio. Marte y Júpiter en Leo. Saturno retrógrado en Aries. Urano retrógrado sigue en Géminis, Neptuno retrógrado en Aries y Plutón retrógrado en Acuario. Cuando las fuentes no coinciden en el grado, no lo inventamos.',
      'Time and Date anota, para el 12 de octubre, un acercamiento de la Luna, Venus y Mercurio. Se ve mejor desde el hemisferio sur y cerca del ecuador, y queda muy pegado al Sol. No apuntes prismáticos ni un telescopio hacia el Sol.',
    ],
    sourceName: 'Fases de la Luna en octubre de 2026, Time and Date',
    sourceUrl: 'https://www.timeanddate.com/news/astronomy/moon-october-2026',
  },
  transits: [
    { label: 'La luna nueva del sábado cae en Libra', sign: 'libra' },
    { label: 'Venus retrógrada y Mercurio están en Escorpio', sign: 'escorpio' },
    { label: 'Saturno retrógrado está en Aries', sign: 'aries' },
    { label: 'Marte y Júpiter están en Leo', sign: 'leo' },
  ],
  signs: readings.map(withSignInfo),
}
