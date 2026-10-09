/**
 * Horóscopo semanal de TrendiVerse.
 * Cielo fijado con efemérides públicas de la semana del 8 al 14 de octubre de 2026.
 * Las casas se cuentan en signos enteros desde el signo solar, porque el ascendente
 * del lector no está en la página. La lectura es interpretación, no un pronóstico.
 */

export const ASTRO_GUIDE_SLUG = 'como-leemos-el-horoscopo-astrologia-tropical'

export const WEEK_LABEL = '8 al 14 de octubre de 2026'

export const DISCLAIMER =
  'Esto es una lectura de astrología tropical a partir de tu signo solar. No es un pronóstico científico, ni un consejo médico, legal o financiero. Ordena la semana. No anuncia un destino. Si conoces tu ascendente, las casas se cuentan desde ahí y esta lectura cambia.'

export const SKY = {
  newMoon:
    'La luna nueva llega el sábado 10 de octubre de 2026, sobre las 15:50 UTC. En la Península y en Baleares son las 17:50. En Canarias, las 16:50. Time and Date la sitúa a las 15:50 UTC. Otra efeméride la adelanta un minuto. El Sol está en Libra, así que la luna nueva también cae en Libra.',
  venus:
    'Venus pasa toda la semana retrógrada en Escorpio. Varias efemérides sitúan el inicio de ese retroceso el 3 de octubre de 2026, en Escorpio, y la vuelta al movimiento directo el 14 de noviembre, ya en Libra. El minuto exacto cambia según el cálculo. Aquí nos quedamos con el día y el signo.',
  planets:
    'El 8 de octubre, a las 00:00 y a las 12:00 UTC, las efemérides tropicales coinciden en el signo, aunque no en el minuto de arco. Sol en Libra. Luna en Virgo. Mercurio directo en Escorpio. Venus retrógrada en Escorpio. Marte y Júpiter en Leo. Saturno retrógrado en Aries. Urano retrógrado sigue en Géminis, Neptuno retrógrado en Aries y Plutón retrógrado en Acuario. Cuando las fuentes no coinciden en el grado, no lo inventamos.',
  approach:
    'Time and Date anota, para el 12 de octubre, un acercamiento de la Luna, Venus y Mercurio. Se ve mejor desde el hemisferio sur y cerca del ecuador, y queda muy pegado al Sol. No apuntes prismáticos ni un telescopio hacia el Sol.',
  source: 'https://www.timeanddate.com/news/astronomy/moon-october-2026',
}

export const HOUSES: Record<number, string> = {
  1: 'la forma de empezar y de presentarte',
  2: 'el dinero propio, el valor y lo que consideras tuyo',
  3: 'los mensajes, los trámites y la gente cercana',
  4: 'la casa, la familia y la base desde la que trabajas',
  5: 'el juego, la creación y el romance',
  6: 'la rutina, el horario y el cuidado del día a día',
  7: 'la pareja, los socios y los acuerdos',
  8: 'lo que se comparte, las deudas y lo que no se dice',
  9: 'los estudios, los viajes y las ideas grandes',
  10: 'el oficio visible, la reputación y la responsabilidad',
  11: 'los grupos, los amigos y los planes colectivos',
  12: 'el descanso y lo que ocurre entre bastidores',
}

const ORDER = [
  'aries',
  'tauro',
  'geminis',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'acuario',
  'piscis',
] as const

export type SignSlug = (typeof ORDER)[number]

export interface SignReading {
  slug: SignSlug
  name: string
  symbol: string
  dates: string
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua'
  modality: 'Cardinal' | 'Fijo' | 'Mutable'
  ruler: string
  hook: string
  seoTitle: string
  description: string
  newMoonHouse: number
  venusHouse: number
  saturnHouse: number
  marsHouse: number
  general: string
  relaciones: string
  trabajo: string
  ritmo: string
  pregunta: string
}

export function solarHouse(from: SignSlug, transit: SignSlug): number {
  const a = ORDER.indexOf(from)
  const b = ORDER.indexOf(transit)
  return ((b - a + 12) % 12) + 1
}

const readings: Omit<SignReading, 'newMoonHouse' | 'venusHouse' | 'saturnHouse' | 'marsHouse'>[] = [
  {
    slug: 'aries',
    name: 'Aries',
    symbol: '♈',
    dates: '21 de marzo – 19 de abril',
    element: 'Fuego',
    modality: 'Cardinal',
    ruler: 'Marte',
    hook: 'El sábado mira el acuerdo que ya tienes, antes de abrir otro.',
    seoTitle: 'Aries: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Aries del 8 al 14 de octubre de 2026. La luna nueva en Libra cae en la casa 7 y Saturno retrógrado sigue en tu signo.',
    general:
      'Si esta semana te reconoces en Aries, el sábado te pone delante un pacto. La luna nueva cae en Libra y, desde tu signo, eso es tu casa 7: la pareja, el socio, el contrato, la persona con la que ya tienes un trato. El gesto que encaja es mirar si ese trato sigue siendo el que crees. Saturno va hacia atrás en tu propio signo. Se nota en el ritmo con el que te presentas y en los síes que das demasiado pronto. Empezar cuesta más de lo que Aries suele contar en voz alta. Esa puerta de entrada se revisa despacio, con una promesa que sí puedas cumplir entre el jueves y el miércoles.',
    relaciones:
      'Venus va hacia atrás, y Mercurio también está en Escorpio. En tu semana eso es lo compartido y lo que cuesta decir: un dinero en común, una deuda, una intimidad a medias, el tema que los dos dejáis para luego. La conversación que sirve nombra un asunto concreto y se queda ahí. Si ahora mismo no hay pareja, el mismo sitio vale para un socio, un compañero de piso o una cuenta compartida. El sábado, con la luna nueva en la zona de los pactos, sirve para releer el acuerdo que ya existe. Marte, tu regente, está en Leo, en la parte del juego y del romance. Hay ganas de que la relación se vea y se disfrute. Que el gesto sea claro y pequeño, del tamaño de algo que se pueda cumplir el martes.',
    trabajo:
      'Marte y Júpiter en Leo encienden las ganas de que una idea se vea: un ensayo, una presentación, un trabajo con tu nombre. Hay impulso de sobra. Saturno, en tu signo, pide que ese impulso quepa en la semana. Una entrega. Un límite de horas. Un solo frente. Elige el que puedas enseñar el miércoles y deja los otros en una lista, quietos. Si alguien te pide un sí rápido en un contrato, el sábado está para leerlo con calma y contestar cuando hayas visto la letra pequeña.',
    ritmo:
      'El jueves la Luna todavía está en Virgo, en la zona de la rutina. Antes del sábado, cierra una tarea pequeña del día a día: una lista, una hora de fin, una comida que no dependa de improvisar. Así se sostiene la semana. Si el cuerpo pide menos velocidad, bajar el ritmo cabe en Aries. Saturno trabaja mejor con una meta corta que con un sprint sin meta. Duerme a una hora que puedas repetir y deja el domingo con un hueco libre, para que el lunes no empiece ya cansado.',
    pregunta: '¿Qué acuerdo mantengo por costumbre, y qué parte de ese acuerdo sí quiero seguir sosteniendo?',
  },
  {
    slug: 'tauro',
    name: 'Tauro',
    symbol: '♉',
    dates: '20 de abril – 20 de mayo',
    element: 'Tierra',
    modality: 'Fijo',
    ruler: 'Venus',
    hook: 'Venus, tu regente, vuelve sobre un pacto. Míralo antes de comprar el gesto.',
    seoTitle: 'Tauro: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Tauro del 8 al 14 de octubre de 2026. Venus retrógrada, tu regente, está en la casa 7 y la luna nueva cae en la casa 6.',
    general:
      'Tauro suele fiarse de lo que ya está asentado. Esta semana ese suelo también se mira. Venus, tu regente, va hacia atrás en Escorpio, en la zona de la pareja y de los pactos. La pregunta es sencilla: cómo das y cómo recibes. La luna nueva del sábado cae en Libra, tu casa 6, la del horario, las tareas y la forma concreta de cuidar el día. Un acuerdo bonito que no cabe en la rutina real se arregla viendo a qué hora, con qué dinero y con qué cansancio se sostiene. El plan que no cabe en el martes puede esperar.',
    relaciones:
      'Con Venus hacia atrás, sale a la luz un gesto que se repite: una espera, un silencio, una costumbre de complacer o de exigir. Basta una frase precisa. Mercurio, también en Escorpio, ayuda a decirla sin adorno. Si estás solo, el mismo cielo vale para un socio o para la forma en que negocias. Entre el jueves y el miércoles elige un solo punto: el tiempo, el dinero compartido o una promesa que quedó a medias. Marte y Júpiter en Leo caen en la parte de la casa y de la familia. Piden calor de puertas adentro. Un arreglo doméstico concreto acompaña mejor que una declaración pensada para que otros la oigan.',
    trabajo:
      'La luna nueva en tu casa 6 invita a corregir un método. Mira una tarea que se atasca siempre en el mismo paso y quítale ese paso. Saturno, hacia atrás en Aries, está en la zona de lo que ocurre entre bastidores: un cansancio de fondo que no sale en la reunión. Conviértelo en un margen. Deja una hora sin encargo antes de prometer otra entrega. El gasto que solo tapa el malestar puede esperar. El que ya está comprometido, ese sí conviene repasarlo con la cifra delante.',
    ritmo:
      'Tauro aguanta mucho y luego se planta. Esta semana ese plante llega mejor el viernes que el domingo por la noche. Come y duerme a la hora que ya sabes que te funciona. Siete días cumpliendo el ritmo que ya tienes valen más que un plan nuevo de cuidado. Si alguien te mete prisa, tu regente hacia atrás te da una frase honesta: lo miras el lunes, con la cabeza fresca. El sábado a última hora puede quedarse para cerrar el día, no para decidir.',
    pregunta: '¿Qué doy por sentado en un pacto, en casa o en el trabajo, solo porque ya dura?',
  },
  {
    slug: 'geminis',
    name: 'Géminis',
    symbol: '♊',
    dates: '21 de mayo – 20 de junio',
    element: 'Aire',
    modality: 'Mutable',
    ruler: 'Mercurio',
    hook: 'El sábado pide una idea con forma. Mercurio, tu regente, la mete en el horario.',
    seoTitle: 'Géminis: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Géminis del 8 al 14 de octubre de 2026. Luna nueva en la casa 5 y Mercurio, tu regente, en Escorpio, en la casa del horario.',
    general:
      'Géminis enciende ideas deprisa. Esta semana una de ellas pide forma. La luna nueva en Libra cae en tu casa 5: el juego, la creación, una cita, un proyecto con tu firma. Mercurio, tu regente, está en Escorpio, en la zona del horario y de las tareas. La idea que vale es la que cabe entre el jueves y el miércoles. Urano sigue hacia atrás en tu signo desde hace tiempo. Es un fondo de años. Sirve para reconocer que el guion de siempre ya te queda estrecho, y para elegir un cambio pequeño, del tamaño de esta semana.',
    relaciones:
      'Marte y Júpiter en Leo ocupan la parte de los mensajes, los hermanos, los vecinos y el chat que no cierra. Hay más texto del que puedes contestar bien. Venus, hacia atrás, pide que el cuidado de la relación pase por la agenda: quedar a una hora y cumplirla dice más que el hilo de las once de la noche. Si hay un malentendido, escríbelo en tres líneas y mándalo así. Saturno, hacia atrás en Aries, está en la zona de los grupos. Un plan de amigos o un proyecto colectivo se ha vuelto obligación. Puedes quedarte. También puedes decir, en una frase, qué parte sí es tuya.',
    trabajo:
      'Con tu regente en la zona del día a día, el centro de la semana es práctico: herramientas, versiones, pendientes. Un entregable corto el martes vale más que un esquema brillante que no sale del borrador. La luna nueva en tu casa 5 quiere que ese entregable tenga voz propia. Ponle tu nombre. Dos encargos creativos que compiten por la misma tarde se pisan. Géminis puede sostener dos hilos. Esta semana el segundo espera en la lista hasta el jueves 15.',
    ritmo:
      'El exceso de estímulo se nota en el sueño y en la voz. Ciérralo con una sola nota de lo que quedó pendiente, y deja la otra ronda de mensajes para mañana. Si estudias o escribes, prueba veinticinco minutos seguidos sin cambiar de pestaña. El juego de verdad también cuenta: una hora sin rendimiento, con el móvil en otra habitación, alimenta la parte creativa de la semana. Otra pantalla de trabajo disfrazada de descanso puede esperar al día siguiente.',
    pregunta: '¿Qué idea dejo abierta para no tener que terminarla?',
  },
  {
    slug: 'cancer',
    name: 'Cáncer',
    symbol: '♋',
    dates: '21 de junio – 22 de julio',
    element: 'Agua',
    modality: 'Cardinal',
    ruler: 'Luna',
    hook: 'El sábado abre un hueco en casa. El trabajo, mientras, sigue pesando.',
    seoTitle: 'Cáncer: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Cáncer del 8 al 14 de octubre de 2026. La luna nueva cae en la casa 4 y Saturno retrógrado marca la casa del oficio.',
    general:
      'Tu regente es la Luna, y esta semana la Luna se encuentra con el Sol. El jueves todavía está en Virgo: recados, familia cercana, mensajes de la casa. El sábado se hace nueva en Libra, tu casa 4. Esa casa es la base. La vivienda, los padres, la habitación desde la que trabajas, el clima de quienes viven contigo. El comienzo que cabe ahí es pequeño: una conversación que ordena quién hace qué, o una hora que la casa se había comido y recuperas. Saturno va hacia atrás en Aries, en la zona del oficio visible. Lo de fuera pide resultado. Lo de dentro pide sitio. Las dos cosas pueden hablarse en la misma semana, cada una en su hora.',
    relaciones:
      'Venus, hacia atrás, y Mercurio están en Escorpio, en la parte del romance, del juego y de los hijos, si los hay. Piden una verdad sencilla, del tamaño de una tarde. Un plan en casa el fin de semana acompaña mejor a la luna nueva en tu casa 4 que una salida pensada para contarla después. Si hay distancia con alguien de la familia, di qué necesitas estos siete días y qué puedes ofrecer. Marte y Júpiter en Leo están en la zona del dinero propio. Revisa un gasto de la casa que ya no corresponde al uso real, con el número delante y sin prisa por taparlo con una compra.',
    trabajo:
      'Saturno en la zona del oficio se atraviesa con una entrega clara y un límite. Elige el resultado que tu responsable, o tu cliente, puede ver el miércoles. Si el trabajo se mete en la cena todos los días, la luna nueva en la base te pide una frontera: una hora en la que la casa vuelve a ser casa. Anota qué parte del cargo es tuya y qué parte sostienes por costumbre. Esa nota cabe en media cuartilla y te ahorra una decisión tomada en caliente.',
    ritmo:
      'Cáncer nota el clima de los demás en el cuerpo. Esta semana, antes de hacerte cargo del día de otra persona, termina el tuyo: una comida, una vuelta a casa a una hora decidida, la puerta un rato cerrada. Es cuidado de la base, el mismo terreno de la luna nueva. El jueves y el viernes, con la Luna todavía menguante, sirven para vaciar un cajón o una lista. La agenda de cuidados ajenos puede esperar a que el tuyo ya tenga sitio.',
    pregunta: '¿Qué sostengo en el trabajo que le está quitando sitio a la casa, o al revés?',
  },
  {
    slug: 'leo',
    name: 'Leo',
    symbol: '♌',
    dates: '23 de julio – 22 de agosto',
    element: 'Fuego',
    modality: 'Fijo',
    ruler: 'Sol',
    hook: 'Hay ganas de que se te vea. El sábado, el trabajo está en lo que dices.',
    seoTitle: 'Leo: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Leo del 8 al 14 de octubre de 2026. Marte y Júpiter transitan tu signo y la luna nueva en Libra cae en la casa 3.',
    general:
      'Marte y Júpiter están en Leo, tu propio signo. Hay más ganas de actuar y de que se te vea. Van en el mismo signo, con Marte más atrás y Júpiter más adelante: el efecto de la semana es empuje, y las efemérides no los juntan grado con grado. El Sol, tu regente, está en Libra, y la luna nueva del sábado cae ahí, en tu casa 3. El foco es el mensaje, el hermano, el vecino, el texto, el trámite. Si amplías la presencia y además aclaras lo que dices, el empuje tiene contenido. Una frase que otra persona pueda repetir vale más que un gesto grande.',
    relaciones:
      'Venus va hacia atrás en Escorpio, en la parte de la casa y de la familia. Ahí se revisan lealtades, en voz baja. Una conversación en la cocina acompaña mejor que una entrada triunfal. Mercurio, en el mismo signo, ayuda a ponerle palabras a algo doméstico que se venía callando. Saturno, hacia atrás en Aries, está en la zona de los viajes, los cursos y las convicciones. Pregunta si ese plan sigue siendo tuyo y, si lo es, dale una fecha. En la pareja, una frase que se pueda cumplir el martes deja más huella que un brillo de un día.',
    trabajo:
      'Tu casa 3 es donde se juega la semana laboral: el correo, la reunión corta, las instrucciones. Escribe lo que ofreces en cinco líneas antes de decirlo en voz alta. Júpiter en tu signo tienta a prometer de más. Marte tienta a hacerlo ya. Entre los dos, deja una versión que otra persona pueda ejecutar sin adivinarte. Si diriges a alguien, el tono de Leo esta semana se mide en la claridad. El volumen puede bajar y el encargo se entiende igual.',
    ritmo:
      'Con Marte y Júpiter en tu signo, el impulso parece suficiente para saltarte comidas y sueño. Siete días piden lo contrario: reserva una tarde sin audiencia. Venus, hacia atrás, repara la casa en lo pequeño. Una cama hecha, una cuenta doméstica, una llamada que debías. Si algo duele o el descanso no llega, eso se consulta con quien te atiende. El horóscopo ordena la semana. El cuerpo tiene su propio sitio, fuera de esta lectura.',
    pregunta: '¿Qué quiero que se entienda de mí esta semana, en una frase que otra persona pueda repetir?',
  },
  {
    slug: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    dates: '23 de agosto – 22 de septiembre',
    element: 'Tierra',
    modality: 'Mutable',
    ruler: 'Mercurio',
    hook: 'La Luna abre la semana en tu signo. El sábado toca el dinero propio.',
    seoTitle: 'Virgo: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Virgo del 8 al 14 de octubre de 2026. La Luna abre en tu signo y la luna nueva en Libra cae en la casa del dinero propio.',
    general:
      'El jueves 8 la Luna está en Virgo, menguante y fina, cerca de un 5 % de iluminación según las efemérides del día. Pasa por tu signo unas horas, y el sábado se hace nueva en Libra. Esa luna nueva cae en tu casa 2: el dinero propio, las herramientas y el valor que te asignas. Virgo a menudo demuestra ese valor trabajando de más. Esta semana pide un número. Qué cobras, qué gastas, qué das gratis y qué ya puedes dejar de dar. Mercurio, tu regente, está en Escorpio, en la zona de los mensajes. La cuenta se habla con alguien, o se escribe. Rumiarla a solas la deja en el mismo sitio.',
    relaciones:
      'Mercurio en Escorpio saca conversaciones que suelen quedar en la lista de luego. Un hermano, un compañero, un vecino, la persona con la que compartes trámites. Di el hecho. El inventario de defectos puede quedarse en el cajón. Venus, hacia atrás en esa misma zona, invita a releer un mensaje antiguo antes de enviar uno nuevo: a veces el malentendido se arregla con tres líneas. Marte y Júpiter en Leo están en la parte de lo que ocurre entre bastidores. Hay un esfuerzo que nadie ve. Decide si sigue siendo útil o si ya es costumbre, y dilo en una frase.',
    trabajo:
      'Saturno va hacia atrás en Aries, en la zona de los impuestos, las deudas y el dinero que no es solo tuyo. Revisa un papel. Tres frentes abiertos a la vez se pisan. La luna nueva en tu casa 2 y ese Saturno piden separar lo propio de lo compartido. Si un cliente o un socio debe una cifra, escríbela y ponle una fecha de seguimiento después del sábado. El oficio mejora esta semana con un proceso más corto. Un estándar imposible puede esperar a la semana que viene.',
    ritmo:
      'Virgo a veces usa el cuidado como control. La Luna en tu signo, al empezar la semana, invita a ordenar y también a parar cuando la lista ya está hecha. Elige tres tareas. La cuarta espera. Dormir y comer son la base para que el dinero propio deje de llenarse de parches. Si la preocupación por una cifra quita el sueño, anótala por la mañana, con luz, y déjala en el papel. El horóscopo ordena la mirada. La decisión de gasto se toma con tus números, en otro momento.',
    pregunta: '¿Qué estoy regalando —tiempo, dinero o atención— que ya no coincide con lo que vale para mí?',
  },
  {
    slug: 'libra',
    name: 'Libra',
    symbol: '♎',
    dates: '23 de septiembre – 22 de octubre',
    element: 'Aire',
    modality: 'Cardinal',
    ruler: 'Venus',
    hook: 'La luna nueva es en tu signo. Venus, tu regente, revisa lo que vale.',
    seoTitle: 'Libra: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Libra del 8 al 14 de octubre de 2026. La luna nueva cae en tu signo y Venus retrógrada revisa la casa del valor y del dinero.',
    general:
      'Esta luna nueva es tuya. Sol y Luna se encuentran en Libra, tu casa 1: la manera de empezar y de presentarte. El sábado cabe un comienzo pequeño y visible. Una frase que diga qué quieres, un corte con una costumbre, una forma más clara de entrar en la semana que viene. El Sol sigue en Libra y la temporada de Escorpio llega más adelante, hacia el 23 de octubre. Esto es el reinicio mensual dentro de tu signo. Venus, tu regente, va hacia atrás en Escorpio, en la zona del dinero y del valor. Empiezas por fuera mientras revisas, por dentro, qué te importa y qué te cuesta.',
    relaciones:
      'Saturno va hacia atrás en Aries, en la zona de la otra persona, el socio y el contrato. Ese peso es real. Libra tiende a equilibrar cediendo. Esta semana el equilibrio se mide en lo que puedes decir que sí y en lo que puedes dejar fuera, conservando lo que sí quieres. Si hay un pacto, ponle una condición concreta y un plazo. Marte y Júpiter en Leo caen en la parte de los amigos y del grupo. Te animan, y la decisión del pacto se queda entre las dos personas que lo sostienen. El chat puede escuchar. El acuerdo se escribe en otro sitio.',
    trabajo:
      'Venus hacia atrás, en la zona del valor, invita a mirar un precio, un sueldo o una tarea que aceptas sin que te la reconozcan. Mira una cifra y una tarea, y comprueba si coinciden. Si cobras de menos para evitar el roce, el roce ya está en la cifra. Escríbela. La luna nueva en tu casa 1 pide que esa nota lleve tu nombre, delante, sin una disculpa. Un proyecto nuevo puede esperar a que el de ahora tenga un precio que reconozcas como justo.',
    ritmo:
      'Decidir cansa a Libra más que ejecutar. Elige una sola forma nueva de presentarte esta semana: cómo respondes, qué llevas al trabajo, qué frase de entrada. El resto se queda. Venus hacia atrás invita a dejar para luego la compra que busca una identidad. Si el sábado ibas a gastar para sentirte otra persona, el dinero puede quedarse en el bolsillo. Cuida el sueño alrededor de la luna nueva. Una noche corta pide menos planes, y el domingo se agradece.',
    pregunta: 'Si dejo de equilibrar a los demás un momento, ¿qué quiero yo que quepa en la semana?',
  },
  {
    slug: 'escorpio',
    name: 'Escorpio',
    symbol: '♏',
    dates: '23 de octubre – 21 de noviembre',
    element: 'Agua',
    modality: 'Fijo',
    ruler: 'Marte, y Plutón en la tradición moderna',
    hook: 'Venus y Mercurio están en tu signo. El sábado pide cerrar entre bastidores.',
    seoTitle: 'Escorpio: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Escorpio del 8 al 14 de octubre de 2026. Venus retrógrada y Mercurio transitan tu signo; la luna nueva cae en la casa 12.',
    general:
      'Venus va hacia atrás y Mercurio, directo, está en Escorpio. La semana te toca de cerca: en el deseo, en la palabra y en la forma de tratarte. Venus revisa. Un gusto, una lealtad o una atracción de estos días se mira otra vez, con calma. Mercurio permite nombrarlo. La luna nueva en Libra cae en tu casa 12, entre bastidores. El Sol entra en Escorpio más adelante, hacia el 23 de octubre. Hasta entonces, esta lunación pide cerrar, descansar y dejar el estreno grande para después. Lo que prepares ahora se enseña cuando el Sol cambie de signo. Plutón, hacia atrás en Acuario, es un ciclo de años. Estos siete días tienen otro motor.',
    relaciones:
      'Con Venus en tu signo, la relación importante puede ser la que tienes con lo que quieres, y también la de pareja. Si hay pareja, pregunta una cosa que de verdad necesitas saber y deja sitio para la respuesta. La luna nueva en tu casa 12 prefiere la conversación privada y corta. Marte, regente tradicional de Escorpio, está en Leo junto con Júpiter, en la zona del oficio y de cómo te ven. El deseo de la semana también mira al trabajo. Una herida personal y una reunión caben en días distintos. Así cada una se escucha.',
    trabajo:
      'Marte y Júpiter en la zona del oficio dan ambición visible. Úsala en una pieza de trabajo que se pueda juzgar. Saturno, hacia atrás en Aries, está en la parte del horario y del método. Por fuera el cargo luce. Por dentro la agenda está más dura. Ajusta una franja del día y deja el sobreesfuerzo heroico para otra temporada. Tu casa 12 pide un sábado de archivo y de entregas atrasadas. El anuncio puede esperar a que el Sol entre en tu signo.',
    ritmo:
      'Escorpio aguanta en silencio y luego corta. Esta semana el corte útil es con un hábito. Duerme. Durante la luna nueva, baja un estímulo que te tiene en alerta: un chat, una noticia, una vigilancia. Si algo te inquieta en el cuerpo o en el ánimo varios días seguidos, eso se habla con un profesional. El retroceso de Venus pasa. La vida afectiva puede seguir abierta el miércoles. Nadie te pide cerrarla antes.',
    pregunta: '¿Qué estoy a punto de hacer visible que todavía necesita una semana entre bastidores?',
  },
  {
    slug: 'sagitario',
    name: 'Sagitario',
    symbol: '♐',
    dates: '22 de noviembre – 21 de diciembre',
    element: 'Fuego',
    modality: 'Mutable',
    ruler: 'Júpiter',
    hook: 'Júpiter, tu regente, abre el horizonte. El sábado lo comparte un grupo.',
    seoTitle: 'Sagitario: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Sagitario del 8 al 14 de octubre de 2026. Júpiter en Leo activa la casa 9 y la luna nueva en Libra cae en la casa 11.',
    general:
      'Júpiter, tu regente, está en Leo, en la zona de los estudios, los viajes y las ideas que te amplían. Esta semana ese horizonte pide un paso que se pueda medir entre el jueves y el miércoles. La luna nueva en Libra cae en tu casa 11: los amigos, el grupo, el futuro compartido. Un proyecto colectivo puede arrancar el sábado en pequeño. Una reunión con orden del día. Un grupo con una tarea y un nombre al lado. Saturno va hacia atrás en Aries, en la parte del juego, el romance y la creación. Lo que antes salía solo ahora pide un compromiso, y con ese compromiso se queda.',
    relaciones:
      'Saturno en la zona del romance le quita prisa al afecto y lo deja en pie. Si hay una cita o una historia, dilo claro y con una próxima vez concreta. El “ya veremos” que a veces usa Sagitario puede convertirse, esta semana, en un día y una hora. Venus, hacia atrás, y Mercurio en Escorpio están en la parte de lo privado: un recuerdo, una persona que no está en la foto, un sentimiento que prefieres guardar. Escríbelo en una página o cuéntaselo a una sola persona de confianza. El grupo puede esperar.',
    trabajo:
      'La zona de Júpiter mejora si estudias una hora con un texto real, o si preparas el viaje con fechas y con dinero, además de con ganas. Tu casa 11 mejora si el grupo sabe quién hace qué el lunes. Abres el mapa con facilidad. Esta semana el mapa cabe en una cuartilla. Marte, también en Leo, empuja ese horizonte. Enseña el argumento y deja que otro lo discuta. El tramo aburrido de un estudio forma parte del oficio. Júpiter da el horizonte y Saturno, en la creación, pide que lo sostengas.',
    ritmo:
      'Moverte te regula, y también te dispersa. Elige un desplazamiento con fin: andar, un recado, una clase. El sábado puede tener un plan, y el segundo plan encadenado puede quedarse en casa. La zona privada pide una noche sin audiencia. Si el grupo te deja vacío, un límite de horas ordena la semana y las amistades siguen en su sitio. El horóscopo acompaña la pregunta. El trabajo y el viaje se deciden con fechas, con dinero y con tu criterio.',
    pregunta: '¿Qué plan grande estoy contando en voz alta para no dar el paso pequeño de esta semana?',
  },
  {
    slug: 'capricornio',
    name: 'Capricornio',
    symbol: '♑',
    dates: '22 de diciembre – 19 de enero',
    element: 'Tierra',
    modality: 'Cardinal',
    ruler: 'Saturno',
    hook: 'El sábado define un resultado visible. Saturno, tu regente, mira la casa.',
    seoTitle: 'Capricornio: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Capricornio del 8 al 14 de octubre de 2026. Luna nueva en la casa 10 y Saturno retrógrado, tu regente, en la casa 4.',
    general:
      'La luna nueva en Libra cae en tu casa 10: el oficio visible, la reputación, la responsabilidad que los demás pueden señalar. El sábado cabe un resultado público pequeño. Un informe, una decisión, un mensaje. La carrera entera puede quedarse como está. Saturno, tu regente, va hacia atrás en Aries, en la zona de la casa, los padres y la vida privada. Esa revisión lleva un tramo y sigue después de esta semana. Lo que enseñas fuera se apoya en cómo está la casa por dentro. Cuando la base está ordenada, el oficio se sostiene con el horario real, y la familia y el trabajo caben en la misma semana.',
    relaciones:
      'Venus, hacia atrás, y Mercurio están en Escorpio, en la parte de los amigos, el colectivo y los planes de futuro. Pregúntate si sigues ahí porque quieres. Hablarlo en privado evita el malentendido de grupo. En casa, Saturno se arregla con una tarea compartida y un horario, en una conversación corta. Si cuidas de alguien, anota qué parte es cuidado y qué parte es control. Marte y Júpiter en Leo caen en la zona del dinero compartido, las deudas y la intimidad. Elige una cifra y mírala. El resto del simbolismo puede esperar a tener ese número claro.',
    trabajo:
      'Tu casa 10 quiere una prueba visible: un informe, una reunión con decisión, un mensaje a quien decide. Escríbelo antes del sábado y déjalo salir con los matices justos. Capricornio a veces esconde el trabajo hasta que está perfecto. La luna nueva acompaña una versión completa y mejorable. Si te ofrecen un cargo nuevo, pregunta por el horario real y míralo al lado de lo que la casa ya sostiene. El halago y el calendario pueden leerse juntos.',
    ritmo:
      'Tu regente, hacia atrás en la zona de la casa, se nota como peso en casa. Acuéstate a una hora que puedas repetir. Deja una comida sin pantalla de trabajo. Si el sábado se convierte en otra jornada laboral, el resultado visible se come la base que Saturno te está pidiendo mirar. Esto es ritmo. El cuidado del cuerpo, cuando hace falta, se habla con quien te atiende.',
    pregunta: '¿Qué resultado quiero que se vea, y qué necesita la casa para que ese resultado no salga del cansancio?',
  },
  {
    slug: 'acuario',
    name: 'Acuario',
    symbol: '♒',
    dates: '20 de enero – 18 de febrero',
    element: 'Aire',
    modality: 'Fijo',
    ruler: 'Saturno, y Urano en la tradición moderna',
    hook: 'El sábado pide una idea con fecha. Venus revisa cómo te ven en el oficio.',
    seoTitle: 'Acuario: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Acuario del 8 al 14 de octubre de 2026. La luna nueva en Libra abre la casa 9 y Venus retrógrada revisa la casa del oficio.',
    general:
      'La luna nueva en Libra cae en tu casa 9: una idea, un curso, un viaje, una convicción. Acuario vive cómodo en el concepto. Esta semana el concepto necesita un dato o una fecha. Saturno, regente tradicional del signo, va hacia atrás en Aries, en la zona de los mensajes, los hermanos y los trámites cercanos. Van más lentos y más serios. Decir menos, y más claro, ordena la bandeja de entrada. Urano, el regente moderno, sigue hacia atrás en Géminis: es contexto de fondo. Plutón, hacia atrás en tu signo, es un ciclo de años sobre la forma de presentarte. El sábado tiene un acontecimiento más concreto, y cabe en una fecha.',
    relaciones:
      'Marte y Júpiter en Leo ocupan la zona de la pareja y del socio. Hay más ganas, más opinión, más escena. Venus va hacia atrás en la parte del oficio, así que el pacto entre dos y el papel laboral caben en dos charlas distintas. En una se habla de cómo estáis. En la otra, de cómo te ven en el trabajo y de si ese papel te representa. Si tu pareja también es tu proyecto público, separarlas deja cada tema en su sitio. Un amigo puede escucharte. La decisión se queda contigo.',
    trabajo:
      'Venus, hacia atrás en Escorpio, revisa alianzas laborales, el reconocimiento y una colaboración que se dio por hecha. Relee una cláusula o una expectativa que nunca se escribió. Tu casa 9 aporta el para qué. Si el oficio echa de menos una idea que te importe, anótala y déjala reposar. Un curso corto o una lectura concreta esta semana acompaña mejor que un rediseño entero de la identidad profesional. El contrato puede seguir en pie mientras lo miras.',
    ritmo:
      'Acuario se adelanta y luego se desconecta. Saturno, en la zona de lo cercano, pide presencia: contestar lo atrasado, ir al trámite, llamar a quien toca. Hazlo en un bloque, de día. Deja tu casa 9 para una hora de estudio con luz. Come y corta la pantalla antes de dormir. Si una decisión laboral quita el sueño, puede esperar a tener los datos. Las opiniones de más pueden quedarse fuera de esa hora.',
    pregunta: '¿Qué idea estoy defendiendo que todavía no he bajado a un mensaje claro o a una fecha?',
  },
  {
    slug: 'piscis',
    name: 'Piscis',
    symbol: '♓',
    dates: '19 de febrero – 20 de marzo',
    element: 'Agua',
    modality: 'Mutable',
    ruler: 'Júpiter, y Neptuno en la tradición moderna',
    hook: 'El sábado nombra un asunto compartido. Júpiter, tu regente, lo baja al horario.',
    seoTitle: 'Piscis: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Piscis del 8 al 14 de octubre de 2026. La luna nueva en Libra cae en la casa 8 y Júpiter activa la rutina de la casa 6.',
    general:
      'La luna nueva en Libra cae en tu casa 8: lo que se comparte, las deudas, la intimidad y lo que todavía no tiene nombre. Un asunto compartido puede dejar de ser niebla. Basta una cifra, un límite o una frase. Júpiter, regente tradicional de Piscis, está en Leo, en la zona del horario, la tarea y el cuidado diario. El crecimiento de la semana es prosaico, y por eso se puede cumplir. Neptuno, hacia atrás en Aries, ocupa la parte del dinero propio, con Saturno también en ese signo. Ese velo lleva meses. El sábado cabe aclarar una cuenta pequeña y dejar la decisión grande de dinero para cuando el número esté quieto.',
    relaciones:
      'Tu casa 8 es el lugar de la confianza. Venus, hacia atrás, y Mercurio en Escorpio caen en la zona de las creencias, los viajes y las conversaciones con alguien que vive en otra ciudad o en otra idea. Revisa el relato antes de ampliarlo. Si perdonas, que sea un acto concreto. Si pones un límite, dilo una vez y sostén el horario del día a día. La disponibilidad con borde es la que se puede mantener. Marte en Leo, en esa misma zona del horario, puede impacientarte con quien no cumple. Pide el hecho. La intención se entiende mejor cuando el hecho ya está dicho.',
    trabajo:
      'Júpiter en la zona de la rutina acompaña mejorar un proceso que ya tienes. Una hora fija de trabajo profundo vale más que una inspiración a deshoras. Si compartes ingresos o un proyecto, la luna nueva en tu casa 8 quiere el reparto por escrito. Una nota clara entre dos basta cuando los dos la han leído. El horóscopo sirve para sentarte a mirar el número. El préstamo, el gasto grande y el perdón de una deuda se deciden con tus cuentas, fuera de esta lectura.',
    ritmo:
      'Piscis absorbe climas. El antídoto de esta semana es concreto: sueño a una hora parecida, una comida de verdad, una tarea terminada. La luna nueva en la zona de lo compartido puede remover una emoción vieja. Una página escrita, o una charla con alguien de fiar, le da sitio. Si el ánimo se queda abajo varios días, el recurso es una persona que te atienda. El cielo ordena la pregunta. El cuidado sostenido tiene otro interlocutor.',
    pregunta: '¿Qué asunto compartido estoy dejando en la niebla porque nombrarlo cambiaría el horario?',
  },
]

export const SIGNS: SignReading[] = readings.map((sign) => ({
  ...sign,
  newMoonHouse: solarHouse(sign.slug, 'libra'),
  venusHouse: solarHouse(sign.slug, 'escorpio'),
  saturnHouse: solarHouse(sign.slug, 'aries'),
  marsHouse: solarHouse(sign.slug, 'leo'),
}))

export function signBySlug(slug: string): SignReading | undefined {
  return SIGNS.find((sign) => sign.slug === slug)
}

export function neighborSigns(slug: string): { prev: SignReading; next: SignReading } {
  const index = SIGNS.findIndex((sign) => sign.slug === slug)
  return {
    prev: SIGNS[(index + SIGNS.length - 1) % SIGNS.length],
    next: SIGNS[(index + 1) % SIGNS.length],
  }
}
