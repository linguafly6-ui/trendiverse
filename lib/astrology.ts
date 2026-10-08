/**
 * Horóscopo semanal de TrendiVerse.
 * Cielo fijado con efemérides públicas de la semana del 8 al 14 de octubre de 2026.
 * Las casas se cuentan en signos enteros desde el signo solar, porque el ascendente
 * del lector no está en la página. La lectura es interpretación, no un pronóstico.
 */

export const ASTRO_GUIDE_SLUG = 'como-leemos-el-horoscopo-astrologia-tropical'

export const WEEK_LABEL = '8 al 14 de octubre de 2026'

export const DISCLAIMER =
  'Lectura de astrología tropical por signo solar. No es un pronóstico científico ni un consejo médico, legal o financiero. Ordena la semana; no anuncia un destino. Si conoces tu ascendente, las casas se cuentan desde ahí y esta distribución cambia.'

export const SKY = {
  newMoon:
    'La luna nueva es el sábado 10 de octubre de 2026, sobre las 15:50 UTC: las 17:50 en la Península y Baleares y las 16:50 en Canarias. Time and Date la sitúa a las 15:50 UTC; otra efeméride, un minuto antes. El Sol está en Libra, así que la lunación cae en Libra.',
  venus:
    'Venus está retrógrada en Escorpio toda esta semana. Varias efemérides sitúan el estacionamiento retrógrado el 3 de octubre de 2026 en Escorpio y el estacionamiento directo el 14 de noviembre, ya en Libra. El minuto cambia según el cálculo: aquí se fija el día y el signo, no el segundo.',
  planets:
    'El 8 de octubre, a las 00:00 y a las 12:00 UTC, las efemérides tropicales coinciden en el signo: Sol en Libra, Luna en Virgo, Mercurio directo en Escorpio, Venus retrógrada en Escorpio, Marte y Júpiter en Leo, Saturno retrógrado en Aries. Urano retrógrado sigue en Géminis, Neptuno retrógrado en Aries y Plutón retrógrado en Acuario. No publicamos minutos de arco cuando las fuentes no coinciden.',
  approach:
    'Time and Date anota para el 12 de octubre un acercamiento de la Luna, Venus y Mercurio en el cielo, visible sobre todo desde el hemisferio sur y cerca del ecuador, muy pegado al Sol. No apuntes prismáticos ni un telescopio hacia el Sol.',
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
    hook: 'La luna nueva cae en tu casa 7: revisa un acuerdo antes de abrir otro.',
    seoTitle: 'Aries: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Aries del 8 al 14 de octubre de 2026. La luna nueva en Libra cae en la casa 7 y Saturno retrógrado sigue en tu signo.',
    general:
      'La luna nueva del sábado cae en Libra, tu casa 7. En este método, esa casa es la del acuerdo: la otra persona, el contrato, la pareja o el socio. No es una semana para inaugurar un frente solo porque te apetece. Es una semana para comprobar si lo que ya tienes con alguien sigue siendo el pacto que crees. Saturno retrógrado está en tu propio signo, en la casa 1. El freno no viene de fuera: viene del ritmo con el que te presentas y de las promesas que haces al decir que sí. Llevas un tramo en el que empezar cuesta más de lo que Aries suele admitir. No lo leas como un castigo. Léelo como una revisión de la puerta de entrada.',
    relaciones:
      'Venus retrógrada y Mercurio en Escorpio ocupan tu casa 8: lo que se comparte y lo que no se dice. Dinero en común, una deuda, una intimidad a medias, el tema que los dos evitan. La conversación útil no es la gran declaración. Es nombrar un asunto concreto que lleva tiempo en segundo plano. Si no hay pareja, el mismo sector vale para un socio, un compañero de piso o una cuenta compartida. No firmes un acuerdo nuevo el sábado solo porque la luna nueva abre la casa 7. Ábrela repasando el que ya existe. Marte, tu regente, está en Leo, casa 5: hay ganas de que la relación se vea y se disfrute. Que el gesto sea claro, no un espectáculo para tapar el tema de la casa 8.',
    trabajo:
      'Marte y Júpiter en Leo encienden la casa 5: una idea que quieres que se vea, un ensayo, una presentación con nombre propio. Hay impulso. Saturno en la casa 1 pide que ese impulso pase por un compromiso realista: una entrega, un límite de horas, un solo frente. No conviertas la semana en cinco comienzos. Elige el que puedas enseñar el miércoles. Si alguien te pide un sí rápido en un contrato, deja el sábado para leerlo, no para firmarlo en caliente.',
    ritmo:
      'El jueves 8 la Luna todavía está en Virgo, tu casa 6, la de la rutina. Antes del sábado, cierra una tarea pequeña del día a día: una lista, una hora de fin, una comida que no dependa de improvisar. No es un aviso de salud. Es el modo en que esta semana se sostiene. Si el cuerpo pide menos velocidad, bajar el ritmo es compatible con Aries: Saturno en la casa 1 trabaja mejor con una meta corta que con un sprint sin meta.',
    pregunta: '¿Qué acuerdo estoy manteniendo por inercia y qué parte de ese acuerdo sí quiero sostener?',
  },
  {
    slug: 'tauro',
    name: 'Tauro',
    symbol: '♉',
    dates: '20 de abril – 20 de mayo',
    element: 'Tierra',
    modality: 'Fijo',
    ruler: 'Venus',
    hook: 'Venus, tu regente, retrocede en la casa de la pareja. No compres el gesto: míralo.',
    seoTitle: 'Tauro: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Tauro del 8 al 14 de octubre de 2026. Venus retrógrada, tu regente, está en la casa 7 y la luna nueva cae en la casa 6.',
    general:
      'Venus, tu regente, está retrógrada en Escorpio: tu casa 7. Cuando el planeta que rige el signo retrocede en la casa de la pareja y los pactos, la semana no pide un capricho nuevo. Pide revisar cómo se da y cómo se recibe. Tauro suele preferir lo que ya está asentado. Esta vez lo asentado también se mira. La luna nueva del sábado cae en Libra, tu casa 6: horario, tareas, la forma concreta de cuidar el día. Un acuerdo de pareja que no cabe en la rutina real no se arregla con un plan bonito. Se arregla viendo a qué hora, con qué dinero y con qué cansancio se sostiene.',
    relaciones:
      'La casa 7 con Venus retrógrada saca a la luz un gesto que se repite: una espera, un silencio, una costumbre de complacer o de exigir. No hace falta una escena. Hace falta una frase precisa. Mercurio, también en Escorpio, ayuda a decirla sin adorno. Si estás solo, el mismo tránsito vale para un socio o para la forma en que negocias. No rehagas la relación entera entre el jueves y el miércoles. Elige un punto: el tiempo, el dinero compartido o una promesa que quedó a medias. Marte y Júpiter en Leo caen en tu casa 4. La casa y la familia piden calor, no un público. Un arreglo doméstico concreto vale más que una declaración.',
    trabajo:
      'La luna nueva en la casa 6 es buen momento para corregir un método, no para cambiar de oficio. Mira una tarea que se atasca siempre en el mismo paso y quítale un paso. Saturno retrógrado en Aries ocupa tu casa 12: hay un cansancio de fondo que no sale en la reunión. No lo llames un fallo del cuerpo. Conviértelo en un margen. Deja una hora sin encargo antes de prometer otra entrega. Comprar para sentirte en calma encaja mal con Venus retrógrada: aplaza el gasto que solo tapa el malestar y revisa el que ya está comprometido.',
    ritmo:
      'Tauro aguanta mucho y luego se planta. Esta semana el plante es más útil el viernes que el domingo por la noche. Come y duerme a la hora que ya sabes que te funciona. La casa 6 no pide un plan de salud nuevo: pide cumplir el que ya tienes durante siete días. Si alguien te mete prisa, tu regente retrógrado es un argumento honesto para decir que lo miras el lunes, no el sábado a última hora.',
    pregunta: '¿Qué estoy dando por sentado en un pacto, en casa o en el trabajo, solo porque ya dura?',
  },
  {
    slug: 'geminis',
    name: 'Géminis',
    symbol: '♊',
    dates: '21 de mayo – 20 de junio',
    element: 'Aire',
    modality: 'Mutable',
    ruler: 'Mercurio',
    hook: 'La luna nueva cae en la casa 5. Mercurio, tu regente, trabaja en la casa 6.',
    seoTitle: 'Géminis: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Géminis del 8 al 14 de octubre de 2026. Luna nueva en la casa 5 y Mercurio, tu regente, en Escorpio, en la casa del horario.',
    general:
      'La luna nueva en Libra cae en tu casa 5: juego, creación, una cita, un proyecto con firma personal. Géminis enciende ideas deprisa. Esta lunación pide que una de ellas tenga forma, no que las doce sigan abiertas. Mercurio, tu regente, está en Escorpio, en la casa 6. La idea que vale es la que cabe en el horario de la semana. Urano retrógrado sigue en tu signo desde hace tiempo: es un fondo de años, no el argumento de estos siete días. No lo uses para justificar un cambio brusco el sábado. Úsalo, si acaso, para reconocer que ya no te vale el mismo guion de siempre, y elige un cambio pequeño.',
    relaciones:
      'Marte y Júpiter en Leo ocupan tu casa 3: mensajes, hermanos, vecinos, el chat que no cierra. Hay más texto del que puedes contestar bien. Venus retrógrada en la casa 6 pide que el cuidado de la relación pase por hechos de agenda, no por una conversación infinita. Quedar a una hora y cumplirla dice más que el hilo de las once de la noche. Si hay un malentendido, escríbelo en tres líneas antes de llamarlo crisis. Saturno retrógrado en Aries está en tu casa 11: un grupo, un plan de amigos o un proyecto colectivo se ha vuelto obligación. Puedes quedarte. También puedes decir qué parte sí es tuya.',
    trabajo:
      'La casa 6 con tu regente dentro es el centro práctico de la semana. Ordena herramientas, versiones y pendientes. Un entregable corto el martes vale más que un esquema brillante que no sale del borrador. La casa 5 quiere que ese entregable tenga voz propia: ponle tu nombre, no lo diluyas en un comité. Evita aceptar dos encargos creativos que compiten por la misma tarde. Géminis puede sostener dos hilos; esta semana el segundo se queda en lista de espera hasta el jueves 15.',
    ritmo:
      'El exceso de estímulo se nota en el sueño y en la voz, no hace falta convertirlo en un síntoma. Cierra el día con una sola nota de lo que quedó pendiente, no con otra ronda de mensajes. Si estudias o escribes, veinticinco minutos seguidos sin cambiar de pestaña es el experimento. La casa 5 se alimenta de juego de verdad: una hora sin rendimiento también cuenta, siempre que no sea otra pantalla de trabajo disfrazada.',
    pregunta: '¿Qué idea estoy manteniendo abierta para no tener que terminarla?',
  },
  {
    slug: 'cancer',
    name: 'Cáncer',
    symbol: '♋',
    dates: '21 de junio – 22 de julio',
    element: 'Agua',
    modality: 'Cardinal',
    ruler: 'Luna',
    hook: 'La luna nueva abre tu casa 4. Saturno aprieta la casa 10.',
    seoTitle: 'Cáncer: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Cáncer del 8 al 14 de octubre de 2026. La luna nueva cae en la casa 4 y Saturno retrógrado marca la casa del oficio.',
    general:
      'Tu regente es la Luna, y esta semana la Luna va hacia la conjunción con el Sol. El jueves todavía está en Virgo, tu casa 3: recados, familia cercana, mensajes de la casa. El sábado se hace nueva en Libra, tu casa 4. La casa 4 es la base: vivienda, padres, la habitación desde la que trabajas, el clima de quienes viven contigo. Una luna nueva ahí no anuncia una mudanza. Anuncia un comienzo pequeño en la base. Puede ser una conversación que ordena quién hace qué en casa, o recuperar una hora que la casa se había comido. Saturno retrógrado en Aries ocupa tu casa 10. El oficio visible pesa. La tensión de la semana es real: lo de fuera pide resultado y lo de dentro pide sitio.',
    relaciones:
      'Venus retrógrada y Mercurio en Escorpio caen en tu casa 5. El romance, el juego y los hijos —si los hay— piden verdad, no un plan de escaparate. Un plan sencillo en casa el fin de semana encaja mejor con la luna nueva de la casa 4 que una salida pensada para contar. Si hay una distancia con alguien de la familia, no la resuelvas entera. Di qué necesitas esta semana y qué puedes ofrecer. Marte y Júpiter en Leo están en tu casa 2: el dinero propio y la autoestima van juntos. No compres tranquilidad. Revisa un gasto de la casa que ya no corresponde al uso real.',
    trabajo:
      'Saturno en la casa 10 no se salta con entusiasmo. Se salta —o se atraviesa— con una entrega clara y un límite. Elige el resultado que tu responsable, o tu cliente, puede ver el miércoles. Protege la casa 4: si el trabajo se mete en la cena todos los días, la luna nueva te está pidiendo una frontera, no otra hora extra. No dimitas por un mal día. Anota qué parte del cargo es tuya y qué parte estás sosteniendo por costumbre.',
    ritmo:
      'Cáncer nota el clima de los demás en el cuerpo. Esta semana, antes de absorber el día de otra persona, termina el tuyo: comida, una vuelta a casa a una hora decidida, la puerta un rato cerrada. No es una pauta médica. Es higiene de la casa 4. La Luna menguante del jueves y el viernes sirve para vaciar, no para llenar la agenda de cuidados ajenos.',
    pregunta: '¿Qué estoy sosteniendo en el trabajo que le está quitando sitio a la casa, o al revés?',
  },
  {
    slug: 'leo',
    name: 'Leo',
    symbol: '♌',
    dates: '23 de julio – 22 de agosto',
    element: 'Fuego',
    modality: 'Fijo',
    ruler: 'Sol',
    hook: 'Marte y Júpiter están en tu signo. La luna nueva, en cambio, cae en la casa 3.',
    seoTitle: 'Leo: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Leo del 8 al 14 de octubre de 2026. Marte y Júpiter transitan tu signo y la luna nueva en Libra cae en la casa 3.',
    general:
      'Marte y Júpiter están en Leo. En casas enteras desde tu Sol, eso es la casa 1: más ganas de actuar, de que se te vea, de ampliar el gesto. No están juntos grado con grado; Marte va más atrás en el signo y Júpiter más adelante. El efecto de la semana es empuje, no una conjunción exacta que haya que celebrar como un evento. El Sol, tu regente, está en Libra, y la luna nueva del sábado cae ahí: tu casa 3. El foco no es el escenario. Es el mensaje, el hermano, el vecino, el texto, el trámite. Si solo amplías la presencia y no aclaras lo que dices, la casa 1 hace ruido y la casa 3 se queda sin contenido.',
    relaciones:
      'Venus retrógrada en Escorpio ocupa tu casa 4. La casa y la familia revisan lealtades, no quieren una función. Una conversación en la cocina importa más que una entrada triunfal. Mercurio en el mismo signo ayuda a ponerle palabras a algo doméstico que se venía callando. Saturno retrógrado en Aries está en tu casa 9: un plan de viaje, un curso o una convicción se ha puesto seria. No lo abandones por aburrimiento. Pregunta si sigue siendo tuyo. En la pareja, promete menos brillo y más una frase que se pueda cumplir el martes.',
    trabajo:
      'La casa 3 es donde se gana o se pierde la semana laboral: el correo, la reunión corta, las instrucciones. Escribe lo que ofreces en cinco líneas antes de presentarlo en voz alta. Júpiter en tu signo tienta a prometer de más. Marte tienta a hacerlo ya. Entre los dos, deja una versión que otra persona pueda ejecutar sin adivinarte. Si diriges a alguien, el tono de Leo se calibra esta semana en la claridad, no en el volumen.',
    ritmo:
      'Con tanto planeta en el signo, el riesgo es saltarte comidas y sueño porque el impulso parece suficiente. No lo es durante siete días. Reserva una tarde sin audiencia. La casa 4 con Venus retrógrada se repara en lo pequeño: una cama, una cuenta de la casa, una llamada que debías. El cuerpo no es un escenario. Si algo duele o no descansa, eso se consulta con quien te atiende, no con el horóscopo.',
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
    hook: 'La Luna empieza en tu signo. La luna nueva del sábado toca la casa 2.',
    seoTitle: 'Virgo: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Virgo del 8 al 14 de octubre de 2026. La Luna abre en tu signo y la luna nueva en Libra cae en la casa del dinero propio.',
    general:
      'El jueves 8 la Luna está en Virgo, menguante y fina, cerca de un 5 % de iluminación según las efemérides del día. Es tu casa 1 durante unas horas, no durante el mes: la Luna cambia de signo enseguida y el sábado se hace nueva en Libra. Esa luna nueva cae en tu casa 2, la del dinero propio, las herramientas y el valor que te asignas. Virgo a menudo demuestra su valor trabajando de más. Esta lunación pide un número: qué cobras, qué gastas, qué das gratis y qué ya no. Mercurio, tu regente, está en Escorpio, casa 3. La cuenta se habla. No se rumia solo.',
    relaciones:
      'La casa 3 con Mercurio en Escorpio saca conversaciones que suelen quedar en la lista de “luego”. Un hermano, un compañero, un vecino, la persona con la que compartes trámites. Di el hecho, no el inventario de defectos. Venus retrógrada en esa misma casa pide revisar un mensaje antiguo antes de enviar uno nuevo: puede haber un malentendido barato de arreglar. Marte y Júpiter en Leo ocupan tu casa 12. Hay un esfuerzo entre bastidores que nadie ve. No lo conviertas en queja eterna ni en sacrificio. Decide si sigue siendo útil o si ya es costumbre.',
    trabajo:
      'Saturno retrógrado en Aries está en tu casa 8: impuestos, deudas, el dinero que no es solo tuyo, la parte del trabajo que depende de otro. Revisa un papel, no abras tres frentes. La casa 2 y la casa 8 juntas piden separar lo propio de lo compartido. Si un cliente o un socio debe una cifra, escríbela y ponle fecha de seguimiento después del sábado, no un ultimátum a medianoche. Tu oficio mejora esta semana con un proceso más corto, no con otro estándar imposible.',
    ritmo:
      'Virgo puede usar el cuidado como control. La Luna en tu signo al empezar la semana invita a ordenar, y también a parar cuando la lista ya está hecha. Elige tres tareas. La cuarta espera. Dormir y comer no son ítems de productividad: son la base para que la casa 2 no se llene de parches. Si la preocupación por el dinero quita el sueño, anota la cifra real por la mañana. El horóscopo no dice en qué gastar ni en qué invertir.',
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
    hook: 'La luna nueva es en tu signo. Venus, tu regente, retrocede en la casa 2.',
    seoTitle: 'Libra: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Libra del 8 al 14 de octubre de 2026. La luna nueva cae en tu signo y Venus retrógrada revisa la casa del valor y del dinero.',
    general:
      'Esta luna nueva es tuya: Sol y Luna se encuentran en Libra, tu casa 1. En un horóscopo solar, la casa 1 es la manera de empezar y de presentarte. El sábado puede servir para elegir un comienzo pequeño y visible: una frase que diga qué quieres, un corte con una costumbre, una forma más clara de entrar en la semana que viene. No es un cumpleaños astrológico todavía —el Sol sigue en Libra y la temporada de Escorpio llega más adelante—, pero sí es el reinicio mensual dentro de tu signo. Venus, tu regente, no acompaña ese reinicio desde Libra. Está retrógrada en Escorpio, tu casa 2. Empiezas por fuera mientras revisas por dentro qué valoras y qué te cuesta.',
    relaciones:
      'Saturno retrógrado en Aries ocupa tu casa 7. La otra persona, el socio o el contrato llevan peso de verdad, no un malentendido ligero. Libra tiende a equilibrar cediendo. Esta semana el equilibrio se mide al revés: qué puedes decir que no sin romper lo que sí quieres conservar. No forces una reconciliación de película el sábado. Si hay un pacto, ponle una condición concreta y un plazo. Marte y Júpiter en Leo caen en tu casa 11. Los amigos y el grupo animan. Úsalos de contraste, no de tribunal. La decisión de la casa 7 no se vota en el chat.',
    trabajo:
      'La casa 2 con Venus retrógrada es una revisión de precio, de sueldo o de lo que aceptas hacer sin que te lo reconozcan. No es una orden de pedir un aumento el lunes ni de dejar un cliente. Es mirar una cifra y una tarea, y ver si coinciden. Si cobras de menos por no querer el conflicto, el conflicto ya está en la cifra. Escríbela. La casa 1 pide que esa escritura tenga tu nombre, no una disculpa delante. Un proyecto nuevo puede esperar a que el viejo tenga un precio justo.',
    ritmo:
      'Decidir cansa a Libra más que ejecutar. Elige una sola presentación nueva de ti mismo esta semana: cómo respondes, qué ropa de trabajo, qué frase de entrada. El resto se queda. Venus retrógrada desalienta la compra que busca una identidad. Si ibas a gastar para sentirte otra persona el sábado, espera. Cuida el sueño alrededor de la lunación: una noche corta no se compensa con más planes sociales.',
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
    hook: 'Venus y Mercurio están en tu signo. La luna nueva queda en la casa 12.',
    seoTitle: 'Escorpio: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Escorpio del 8 al 14 de octubre de 2026. Venus retrógrada y Mercurio transitan tu signo; la luna nueva cae en la casa 12.',
    general:
      'Venus retrógrada y Mercurio directo están en Escorpio. Desde tu Sol, eso es la casa 1: la semana te toca de cerca, en el deseo, en la palabra y en la forma de relacionarte contigo. Venus no avanza; revisa. Un gusto, una lealtad o una atracción de estas semanas se mira otra vez, sin drama obligatorio. Mercurio permite nombrarlo. La luna nueva en Libra cae en tu casa 12, entre bastidores. Antes de tu temporada solar —el Sol entra en Escorpio más adelante, hacia el 23 de octubre— esta lunación pide cerrar, descansar y no estrenar a lo grande. Lo que prepares ahora se enseña después. Plutón retrógrado en Acuario es un tránsito de años sobre otros signos; no es el motor de estos siete días.',
    relaciones:
      'Con Venus en la casa 1, la relación importante puede ser la que tienes con lo que quieres, no solo la de pareja. Si hay pareja, evita la prueba de lealtad. Pregunta una cosa que de verdad necesitas saber y deja espacio para la respuesta. La casa 12 no favorece el careo público. Una conversación privada, corta, basta. Marte, regente tradicional de Escorpio, está en Leo junto con Júpiter: tu casa 10. El deseo de la semana también mira al oficio y a cómo te ven. No mezcles una herida personal con una reunión de trabajo. Sepáralas.',
    trabajo:
      'La casa 10 con Marte y Júpiter da ambición visible. Úsala en una pieza de trabajo que pueda juzgarse, no en una lucha de poder. Saturno retrógrado en Aries está en tu casa 6: el horario y el método están más duros de lo que el cargo luce por fuera. Ajusta una franja del día en lugar de prometer un sobreesfuerzo heroico. La casa 12 pide que no lleves el sábado lleno de estrenos. Archiva, entrega lo atrasado, deja el anuncio para cuando el Sol cambie de signo.',
    ritmo:
      'Escorpio aguanta en silencio y luego corta. Esta semana el corte útil es con un hábito, no con una persona. Duerme. Baja un estímulo que te tiene en alerta —un chat, una noticia, una vigilancia— durante la luna nueva. No es una lectura clínica. Si algo de la casa 1 te inquieta en el cuerpo o en el ánimo de forma sostenida, eso se habla con un profesional, no se interpreta como destino. El retroceso de Venus pasa. No tienes que resolver tu vida afectiva antes del miércoles.',
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
    hook: 'Júpiter, tu regente, sigue en Leo: tu casa 9. La luna nueva cae en la 11.',
    seoTitle: 'Sagitario: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Sagitario del 8 al 14 de octubre de 2026. Júpiter en Leo activa la casa 9 y la luna nueva en Libra cae en la casa 11.',
    general:
      'Júpiter, tu regente, está en Leo, tu casa 9: estudios, un viaje, una idea que te amplía, la fe en un plan largo. No promete un billete ni un título esta semana. Sí pide que ese horizonte tenga un paso medible entre el jueves y el miércoles. La luna nueva en Libra cae en tu casa 11, la de los amigos, el grupo y el futuro compartido. Un proyecto colectivo puede arrancar en pequeño el sábado: una reunión con orden del día, un grupo con una tarea, no una visión sin dueño. Saturno retrógrado en Aries ocupa tu casa 5. El juego, el romance y la creación están más serios. Lo que antes era espontáneo ahora pide compromiso o pierde sitio.',
    relaciones:
      'La casa 5 con Saturno no apaga el afecto. Le quita la prisa. Si hay una cita o una historia, dilo claro y con una próxima vez concreta, no con un “ya veremos” que Sagitario usa para no cerrar. Venus retrógrada y Mercurio en Escorpio caen en tu casa 12. Algo afectivo se mueve en privado: un recuerdo, una persona que no está en la foto pública, un sentimiento que no quieres publicar. No lo conviertas en secreto tóxico ni en confesión en el grupo. Escribe una página o cuéntaselo a una sola persona de confianza.',
    trabajo:
      'La casa 9 mejora si estudias una hora con un texto real, o si preparas el viaje con fechas y dinero, no con ganas. La casa 11 mejora si el grupo sabe quién hace qué el lunes. Tu tendencia es abrir el mapa. Esta semana el mapa cabe en una cuartilla. Marte también en Leo empuja la casa 9: cuidado con el tono de quien ya tiene la razón. Enseña el argumento. Deja que otro lo discuta. No es una semana para dimitir de un estudio porque el tramo es aburrido: Saturno en la 5 y Júpiter en la 9 piden oficio, no solo horizonte.',
    ritmo:
      'Moverte te regula, y también te dispersa. Elige un desplazamiento con fin —andar, un recado, una clase— y no llenes el sábado de planes encadenados. La casa 12 pide una noche sin audiencia. Si el grupo de la casa 11 te deja vacío, no hace falta romper con nadie: falta un límite de horas. El horóscopo no te dice que dejes un trabajo ni que reserves un vuelo.',
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
    hook: 'La luna nueva cae en tu casa 10. Saturno, tu regente, retrocede en la casa 4.',
    seoTitle: 'Capricornio: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Capricornio del 8 al 14 de octubre de 2026. Luna nueva en la casa 10 y Saturno retrógrado, tu regente, en la casa 4.',
    general:
      'La luna nueva en Libra cae en tu casa 10: oficio visible, reputación, la responsabilidad que los demás pueden señalar. Es un buen sábado para definir un resultado público pequeño, no para rehacer la carrera. Saturno, tu regente, está retrógrado en Aries, tu casa 4. La base —casa, padres, vida privada— está en revisión desde hace un tramo, y el retroceso no se acaba esta semana. La lectura junta las dos cosas: lo que enseñas fuera se apoya en cómo está la casa por dentro. Si la casa 4 está desordenada, la casa 10 se sostiene con sobreesfuerzo. No es una orden de elegir entre familia y trabajo. Es ver el apoyo real.',
    relaciones:
      'Venus retrógrada y Mercurio en Escorpio ocupan tu casa 11. Un amigo, un colectivo o un plan de futuro pide una revisión honesta: ¿sigues ahí porque quieres o porque ya estás en la lista? Hablarlo en privado evita el malentendido de grupo. En casa, la casa 4 con Saturno no se arregla con una discusión larga. Se arregla con una tarea compartida y un horario. Si cuidas de alguien, anota qué parte es cuidado y qué parte es control. Marte y Júpiter en Leo caen en tu casa 8: temas de dinero compartido, herencias, deudas o intimidad pueden subir el volumen. Trata una cifra, no el simbolismo entero.',
    trabajo:
      'La casa 10 quiere una prueba visible: un informe, una reunión con decisión, un mensaje a quien decide. Escríbelo antes del sábado y déjalo salir sin doce matices. Capricornio a veces esconde el trabajo hasta que está perfecto. La luna nueva premia una versión completa y mejorable. No aceptes un cargo nuevo solo porque halaga la casa 10 si la casa 4 no tiene margen. Pregunta por el horario real.',
    ritmo:
      'Tu regente retrógrado en la casa 4 se nota como peso en casa, no como fallo personal. Acuéstate a una hora que puedas repetir. Deja una comida sin pantalla de trabajo. Si el sábado lo conviertes en otra jornada laboral, la lunación de la casa 10 se te come la base que Saturno te está pidiendo mirar. Nada de esto sustituye un consejo médico. Es ritmo.',
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
    hook: 'La luna nueva cae en tu casa 9. Venus retrógrada trabaja la casa 10.',
    seoTitle: 'Acuario: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Acuario del 8 al 14 de octubre de 2026. La luna nueva en Libra abre la casa 9 y Venus retrógrada revisa la casa del oficio.',
    general:
      'La luna nueva en Libra cae en tu casa 9: una idea, un curso, un viaje, una convicción. Acuario vive cómodo en el concepto. Esta semana el concepto necesita un dato o una fecha. Saturno, regente tradicional del signo, está retrógrado en Aries, tu casa 3. Los mensajes, los hermanos y los trámites cercanos van más lentos y más serios. No lo leas como mala suerte de la bandeja de entrada. Léelo como una invitación a decir menos y más claro. Urano, regente moderno, sigue retrógrado en Géminis: es contexto de fondo, no el acontecimiento del sábado. Plutón retrógrado en tu signo es un ciclo de años sobre la casa 1. No lo conviertas en la excusa de un giro teatral esta semana.',
    relaciones:
      'Marte y Júpiter en Leo ocupan tu casa 7. La pareja o el socio ganan volumen: más ganas, más opinión, más escena. Con Venus retrógrada en tu casa 10, cuidado con mezclar el oficio y la relación en la misma conversación. Lo que se discute en casa 7 es el pacto entre dos. Lo que se revisa en casa 10 es cómo te ven en el trabajo y si ese papel te representa. Si tu pareja también es tu proyecto público, sepáralo al menos en dos charlas. Un amigo de la casa 11 puede escucharte; no tiene que decidir.',
    trabajo:
      'Venus retrógrada en Escorpio, casa 10, revisa alianzas laborales, el reconocimiento y una colaboración que se dio por hecha. No rompas un contrato por una corazonada del sábado. Relee una cláusula o una expectativa que nunca se escribió. La casa 9 aporta el para qué: si el oficio ya no tiene una idea que te importe, anótala, no dimitas en caliente. Un curso corto o una lectura concreta esta semana vale más que rediseñar la identidad profesional entera.',
    ritmo:
      'Acuario se adelanta y luego se desconecta. La casa 3 con Saturno pide presencia en lo cercano: contestar lo atrasado, ir al trámite, llamar a quien toca. Hazlo en un bloque, no a rachas de medianoche. Deja la casa 9 para una hora de estudio de día. El cuerpo no es una teoría: come y corta la pantalla antes de dormir. Si una decisión laboral te quita el sueño, la decisión puede esperar a tener los datos, no a tener más opiniones.',
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
    hook: 'La luna nueva cae en tu casa 8. Júpiter, tu regente, trabaja la casa 6.',
    seoTitle: 'Piscis: horóscopo del 8 al 14 de octubre',
    description: 'Horóscopo de Piscis del 8 al 14 de octubre de 2026. La luna nueva en Libra cae en la casa 8 y Júpiter activa la rutina de la casa 6.',
    general:
      'La luna nueva en Libra cae en tu casa 8: bienes compartidos, deudas, intimidad y lo que no se nombra. Una lunación ahí no anuncia una crisis. Pide que un asunto compartido deje de ser niebla. Una cifra, un límite, una frase. Júpiter, regente tradicional de Piscis, está en Leo, tu casa 6. El crecimiento de la semana es prosaico: horario, tarea, cuidado diario. Neptuno retrógrado en Aries ocupa tu casa 2 junto con el fondo de Saturno en el mismo signo. El dinero propio y el valor personal llevan un velo de meses, no de esta semana. No tomes una decisión grande de dinero el sábado. Aclara una cuenta pequeña.',
    relaciones:
      'La casa 8 es el lugar de la confianza. Venus retrógrada y Mercurio en Escorpio caen en tu casa 9: una creencia sobre el amor, un viaje que era también una relación, una conversación con alguien que vive en otra ciudad o en otra idea. Revisa el relato antes de ampliarlo. Si perdonas, que sea un acto concreto, no una disolución. Si pones un límite, dilo una vez y sostén el horario de la casa 6: la disponibilidad infinita no es generosidad, es ausencia de borde. Marte en Leo en la casa 6 puede impacientarte con quien no cumple. Pide el hecho, no la intención.',
    trabajo:
      'Júpiter en la casa 6 premia mejorar un proceso que ya tienes, no abrir un sueño paralelo. Una hora fija de trabajo profundo vale más que una inspiración a deshoras. Si compartes ingresos o un proyecto, la casa 8 quiere el reparto por escrito. No hace falta un abogado para una nota clara entre dos; sí hace falta que los dos la hayan leído. No uses el horóscopo para invertir, prestar o condonar. Úsalo para sentarte a mirar el número.',
    ritmo:
      'Piscis absorbe climas. La casa 6 es el antídoto de esta semana: sueño a hora parecida, una comida de verdad, una tarea terminada. La luna nueva en la casa 8 puede remover emoción vieja. Eso no es una orden de bucear en ella toda la noche. Una página escrita o una charla con alguien de fiar basta. Si el ánimo se queda abajo varios días, el recurso es una persona que te atienda, no una interpretación del cielo.',
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
