/**
 * Biblioteca de astrología. Las referencias se incluyen junto a las afirmaciones,
 * no se confunden los cálculos del cielo con sus interpretaciones simbólicas.
 * No solicita ni guarda datos de nacimiento y no simula una calculadora.
 */
export type AstrologyGuideSlug =
  | 'ascendente'
  | 'signo-lunar'
  | 'carta-natal'
  | 'eclipses'
  | 'fases-de-la-luna'
  | 'mercurio-retrogrado'

export interface AstrologyGuide {
  slug: AstrologyGuideSlug
  title: string
  seoTitle: string
  description: string
  eyebrow: string
  summary: string
  answer: string
  intro: string[]
  sections: { id: string; title: string; paragraphs: string[]; bullets?: string[] }[]
  faqs: { q: string; a: string }[]
  related: AstrologyGuideSlug[]
  updated: string
}

export const ASTROLOGY_LIBRARY_SEO = {
  title: 'Astrología: horóscopos, ascendente y Luna',
  description: 'Horóscopos semanales y guías de astrología: ascendente, signo lunar, carta natal, eclipses, fases de la Luna y Mercurio retrógrado.',
}

export const ASTROLOGY_REFERENCES = {
  ascendant: { name: 'Astrodienst: definición de ascendente', url: 'https://www.astro.com/astrowiki/en/Ascendant' },
  birthtime: { name: 'Astrodienst: hora de nacimiento', url: 'https://www.astro.com/faq/fq_de_time_e.htm' },
  moon: { name: 'Astrodienst: simbolismo de la Luna', url: 'https://www.astro.com/astrowiki/en/Moon' },
  natal: { name: 'Astrodienst: cómo se representa una carta', url: 'https://www.astro.com/faq/fq_fh_natal_e.htm' },
  lunarUncertainty: { name: 'Astrodienst: datos y posiciones inciertas', url: 'https://www.astro.com/astro-databank/Help:Astro_data' },
  science: { name: 'Understanding Science, Universidad de California', url: 'https://undsci.berkeley.edu/astrology-is-it-scientific/' },
  eclipses: { name: 'NASA: eclipses y la Luna', url: 'https://science.nasa.gov/moon/eclipses/' },
  eclipseGeometry: { name: 'NASA: por qué ocurren los eclipses', url: 'https://science.nasa.gov/eclipses/geometry/' },
  safety: { name: 'NASA: seguridad al observar eclipses', url: 'https://science.nasa.gov/eclipses/safety/' },
  phases: { name: 'NASA: preguntas sobre la Luna', url: 'https://science.nasa.gov/moon/top-moon-questions/' },
  phaseCycle: { name: 'NASA: luz solar y fases lunares', url: 'https://science.nasa.gov/learn/heat/big-ideas/big-idea-1-1/' },
  retrograde: { name: 'Sky & Telescope: movimiento retrógrado aparente', url: 'https://skyandtelescope.org/observing/stargazers-corner/tracking-venus-retrograde-motion/' },
} as const

function cited(sentence: string, source: keyof typeof ASTROLOGY_REFERENCES): string {
  const ref = ASTROLOGY_REFERENCES[source]
  return `${sentence} ([${ref.name}](${ref.url})).`
}

const limits = cited('Las interpretaciones astrológicas no constituyen un método científicamente validado para predecir acontecimientos o describir la personalidad', 'science')

export const ASTROLOGY_GUIDES: AstrologyGuide[] = [
  {
    slug: 'ascendente',
    title: 'Ascendente: qué es y cómo saber el tuyo',
    seoTitle: 'Ascendente: qué es y cómo saber el tuyo',
    description: 'Qué es el ascendente y cómo saber el tuyo: fecha, hora y lugar de nacimiento, diferencias con el signo solar y qué hacer si no sabes la hora.',
    eyebrow: 'Tus datos de nacimiento',
    summary: 'Por qué necesitas la hora y el lugar, y cómo evitar un resultado inventado.',
    answer: cited('El ascendente es el punto del zodiaco que cruza el horizonte oriental en un momento y lugar determinados; para conocer el natal necesitas la fecha, la hora y el lugar de nacimiento', 'ascendant'),
    intro: [
      'Si conoces tu signo pero no te reconoces en una descripción, quizá hayas llegado al ascendente buscando otra pieza del mapa. Antes de interpretar nada, conviene aclarar qué se calcula y con qué datos. No basta con elegir el signo que más se parece a ti: aquí hablamos de una posición concreta, no de un test de personalidad.',
      limits,
    ],
    sections: [
      {
        id: 'que-significa',
        title: 'Qué significa el ascendente en astrología',
        paragraphs: [
          cited('La tradición astrológica relaciona el ascendente con la manera de presentarse, iniciar experiencias e interactuar con el entorno', 'ascendant'),
          'Esa asociación puede servir como pregunta de reflexión: ¿cómo entro en un grupo nuevo?, ¿me doy tiempo o me lanzo?, ¿qué diferencia hay entre mi primera reacción y lo que decido después? La pregunta es más útil que una etiqueta rígida. No hace falta que te reconozcas en cada frase ni que ajustes tu conducta para encajar en un signo.',
          cited('El ascendente no es un planeta y su punto opuesto se llama descendente', 'ascendant'),
        ],
      },
      {
        id: 'datos-necesarios',
        title: 'Cómo saber tu ascendente: los datos necesarios',
        paragraphs: [
          cited('La precisión de la hora influye en el cálculo y Astrodienst distingue la hora local de nacimiento de las correcciones de zona horaria y horario de verano', 'birthtime'),
          'Reúne los datos antes de abrir una herramienta. Si tienes una hora documentada, consérvala tal como figura en el registro y deja que el programa haga las conversiones que le correspondan. Corregirla por tu cuenta y pedir después otra corrección puede producir un resultado incoherente. Si dos calculadoras discrepan, compara sus entradas antes de interpretar la diferencia.',
        ],
        bullets: [
          'Fecha completa: día, mes y año, no solo la fecha de cumpleaños.',
          'Hora local: comprueba también si el formato es de 12 o de 24 horas.',
          'Localidad de nacimiento: no la ciudad en la que vives actualmente.',
          'Configuración: anota el zodiaco y el sistema de casas empleados para poder reproducir el resultado.',
        ],
      },
      {
        id: 'hora-desconocida',
        title: 'Qué hacer si no sabes a qué hora naciste',
        paragraphs: [
          cited('Astrodienst permite marcar la hora como desconocida y representar una carta sin casas, usando una hora hipotética para las posiciones aproximadas', 'birthtime'),
          'No conviertas esa hora hipotética en una hora real. La opción responsable es mantener el ascendente como desconocido mientras buscas un registro fiable. Un recuerdo como «por la mañana» puede delimitar una franja, pero no autoriza a publicar un signo exacto. Tampoco deduciremos la hora a partir de tu aspecto o de una descripción con la que te identifiques.',
          'Esta guía no calcula tu ascendente ni recoge tus datos de nacimiento. Si utilizas una herramienta externa, revisa su política de privacidad y guarda solo la información que necesites. Aprender el procedimiento no exige publicar una carta completa en una red social.',
        ],
      },
      {
        id: 'dos-horas',
        title: 'Por qué no sirve una tabla fija de dos horas',
        paragraphs: [
          cited('Aunque se suele hablar de unas dos horas por signo, los tiempos de ascensión no son iguales y varían según la latitud', 'ascendant'),
          'Por eso evitamos reglas del tipo «si naciste entre las ocho y las diez, tu ascendente es este». Una tabla sin fecha, localidad y conversiones horarias puede dar una falsa sensación de exactitud. Si la hora conocida tiene un margen de error, comprueba todo ese intervalo y conserva la incertidumbre cuando aparezcan dos resultados posibles.',
        ],
      },
      {
        id: 'solar-lunar',
        title: 'Cómo combinarlo con el signo solar y lunar',
        paragraphs: [
          cited('Una carta representa por separado las posiciones del Sol, la Luna y el ascendente; no son tres nombres para un mismo dato', 'natal'),
          'Empieza por distinguir las tres piezas y después pregunta qué quieres leer. Nuestros horóscopos semanales están escritos para el signo solar, no son una lectura individual calculada desde tu ascendente. Conocerlo puede ayudarte a estudiar otra técnica, pero no convierte automáticamente el texto general en una predicción personal.',
        ],
      },
    ],
    faqs: [
      { q: '¿Puedo saber mi ascendente solo con la fecha?', a: 'No de forma fiable: faltan la hora y el lugar. Si no conoces la hora, conserva ese dato como desconocido en vez de elegir un resultado por afinidad.' },
      { q: '¿El ascendente cambia cuando me mudo?', a: 'El ascendente natal se refiere al momento y lugar de nacimiento. Una carta calculada para otro lugar es otro tipo de análisis, no una corrección automática de tu dato natal.' },
      { q: '¿Ascendente y signo zodiacal son lo mismo?', a: 'Cuando se habla de «tu signo» suele aludirse al solar. El ascendente es otra posición de la carta y puede estar en el mismo signo o en uno diferente.' },
      { q: '¿TrendiVerse tiene una calculadora de ascendente?', a: 'No en esta versión. Explicamos cómo comprobar los datos y no mostramos un cálculo personal sin un motor validado.' },
    ],
    related: ['carta-natal', 'signo-lunar', 'eclipses'],
    updated: '2026-10-09',
  },
  {
    slug: 'signo-lunar',
    title: 'Signo lunar: qué es y cómo conocer el tuyo',
    seoTitle: 'Signo lunar: qué es y cómo saber el tuyo',
    description: 'Descubre qué es el signo lunar, cómo consultarlo en tu carta natal y por qué no es lo mismo que el signo solar ni que la fase de la Luna.',
    eyebrow: 'Sol, Luna y ascendente',
    summary: 'La posición de la Luna al nacer, su simbolismo y los límites cuando falta la hora.',
    answer: cited('El signo lunar es el signo zodiacal ocupado por la Luna en la carta natal; la tradición astrológica lo relaciona con necesidades y respuestas emocionales', 'moon'),
    intro: [
      '«Soy Libra, pero mi Luna es Cáncer»: la frase no habla de dos cumpleaños. Habla de dos posiciones distintas dentro de una carta. Para entender el signo lunar conviene separar el dato que se consulta de la historia que se construye después alrededor de él. Esta guía te ayuda a hacerlo sin convertir una lectura simbólica en una explicación de todo lo que sientes.',
      limits,
    ],
    sections: [
      {
        id: 'luna-natal',
        title: 'Qué representa la Luna natal',
        paragraphs: [
          cited('En astrología, la Luna se asocia con los sentimientos, las reacciones instintivas y la búsqueda de seguridad emocional', 'moon'),
          'Se trata de un vocabulario simbólico, no de un diagnóstico. Puedes utilizarlo para formular preguntas sobre tu vida cotidiana: ¿qué me ayuda a sentir confianza?, ¿cómo pido compañía?, ¿qué hago cuando necesito descansar? No es una prueba de que una posición celeste cause tu reacción. Si una frase no encaja, no hace falta forzar la experiencia para que encaje.',
          'Tampoco usaremos el signo lunar para clasificar a alguien como incapaz de amar, emocionalmente inestable o destinado a una relación difícil. La conducta se observa y se conversa; no se sustituye por una etiqueta de la carta. Si existe un problema de bienestar, el horóscopo no es la herramienta para evaluarlo.',
        ],
      },
      {
        id: 'consultar',
        title: 'Cómo saber tu signo lunar',
        paragraphs: [
          cited('Una carta natal muestra las posiciones de la Luna, el Sol y los planetas para una fecha y lugar determinados', 'natal'),
          'Utiliza datos de nacimiento comprobados y busca la entrada de la Luna en el listado de posiciones. Anota el signo y, si aparece, su posición dentro de él. No confundas la línea de la Luna natal con un calendario que dice en qué signo está hoy: ambos listados se refieren a momentos diferentes.',
          'Para comparar dos resultados, utiliza el mismo tipo de zodiaco, la misma fecha y la misma hora local. El objetivo no es encontrar la descripción más bonita, sino obtener un dato reproducible. Si no puedes verificar una entrada, señala esa limitación antes de interpretar el conjunto.',
        ],
      },
      {
        id: 'sin-hora',
        title: '¿Se puede conocer el signo lunar sin hora?',
        paragraphs: [
          cited('Cuando falta la hora y la Luna cambió de signo durante el día de nacimiento, Astro-Databank recoge ambos signos posibles', 'lunarUncertainty'),
          'Por tanto, no hay una respuesta universal. Puede haber un único signo posible durante toda la franja del día, o dos opciones si hubo un cambio. Hace falta comprobar las posiciones de ese día y el intervalo correspondiente, no simplemente aceptar una carta calculada al mediodía como si esa fuera tu hora.',
          'Si el resultado es ambiguo, puedes estudiar las dos posibilidades como hipótesis, pero no cerrar la duda diciendo «este signo se parece más a mí». La afinidad con una descripción no verifica la hora. Conservar un dato desconocido también es hacer una lectura cuidadosa.',
        ],
      },
      {
        id: 'fase',
        title: 'Signo lunar y fase lunar: dos preguntas distintas',
        paragraphs: [
          cited('Las fases describen la porción de la mitad iluminada de la Luna que vemos desde la Tierra', 'phases'),
          'El signo lunar responde a dónde se sitúa la Luna en el zodiaco utilizado por la carta. La fase responde a cómo aparece iluminada desde la Tierra. Un informe puede mostrar ambos datos, pero no debes elegir uno para reemplazar el otro. «Luna llena» no es uno de los doce signos.',
          'Esta diferencia también evita un error común al leer calendarios: conocer la fase de hoy no te dice automáticamente cuál era tu signo lunar al nacer. Para el dato natal hay que volver a tu fecha; para seguir el cielo actual hay que consultar una fecha actual.',
        ],
      },
      {
        id: 'leer-conjunto',
        title: 'Cómo leerla junto al Sol y al ascendente',
        paragraphs: [
          cited('Astrodienst considera el Sol, la Luna y el ascendente tres componentes importantes de la interpretación astrológica', 'moon'),
          'No hace falta escoger cuál es «el verdadero tú». Puedes empezar por una ficha con tres entradas y una pregunta para cada una, sin hacerlas competir. Después añade las relaciones entre posiciones y las limitaciones de los datos que conoces. Nuestra lectura semanal sigue siendo general y está organizada por signo solar; no cambia de técnica porque consultes también tu Luna.',
        ],
      },
    ],
    faqs: [
      { q: '¿Mi signo lunar es el mismo que mi signo solar?', a: 'Puede coincidir o ser diferente. El solar corresponde al Sol y el lunar a la Luna en el momento de nacimiento.' },
      { q: '¿La Luna llena indica mi signo lunar?', a: 'No. «Llena» es una fase de iluminación, mientras que el signo lunar es una posición zodiacal.' },
      { q: '¿Puedo elegir entre dos signos lunares por mi personalidad?', a: 'Puedes leer ambas descripciones, pero eso no resuelve la incertidumbre de la hora. Para confirmar un dato natal hay que comprobar las posiciones y los datos de nacimiento.' },
      { q: '¿El signo lunar sirve para diagnosticar mis emociones?', a: 'No. Aquí se trata como interpretación simbólica y entretenimiento, no como evaluación psicológica ni consejo clínico.' },
    ],
    related: ['ascendente', 'carta-natal', 'fases-de-la-luna'],
    updated: '2026-10-09',
  },
  {
    slug: 'carta-natal',
    title: 'Carta natal: cómo leerla sin perderte',
    seoTitle: 'Carta natal: qué es y cómo leerla',
    description: 'Guía de carta natal para empezar: Sol, Luna, ascendente, casas y aspectos. Qué datos necesitas, cómo leerlos y qué límites tiene la interpretación.',
    eyebrow: 'Empieza por aquí',
    summary: 'Una ruta de lectura para distinguir posiciones, casas, aspectos e interpretación.',
    answer: cited('Una carta natal representa las posiciones del cielo para el momento y lugar de nacimiento, incluyendo el Sol, la Luna, los planetas y, si se conoce la hora, los ángulos y las casas', 'natal'),
    intro: [
      'La primera vez que ves una carta natal parece que necesitas descifrarlo todo a la vez. No es así. Puedes empezar con una lista corta de datos y avanzar por capas, separando el cálculo de las interpretaciones. Aquí no buscamos una frase que te defina para siempre, sino enseñarte a leer el mapa sin perder de vista qué sabes y qué falta.',
      limits,
    ],
    sections: [
      {
        id: 'antes',
        title: 'Antes de interpretar: comprueba los datos',
        paragraphs: [
          cited('Astrodienst recomienda aportar una hora lo más precisa posible y tiene en cuenta zona horaria y horario de verano al tratar los datos de nacimiento', 'birthtime'),
          'Revisa fecha completa, hora local y localidad. Después anota cómo está configurada la herramienta. Esta biblioteca emplea el marco tropical para explicar sus lecturas, pero una carta de otro marco puede representar los datos de otra manera. Compara configuraciones iguales antes de pensar que una de las herramientas se ha equivocado.',
          'La precisión del cálculo no garantiza la verdad de la interpretación. Son dos niveles distintos: un mapa puede estar bien construido y, aun así, no demostrar que sus posiciones determinen tu personalidad o tu futuro. Mantener esa diferencia es parte del criterio editorial de esta sección.',
        ],
      },
      {
        id: 'tres-piezas',
        title: 'Empieza por el Sol, la Luna y el ascendente',
        paragraphs: [
          cited('La carta muestra por separado el Sol, la Luna y el punto ascendente del horizonte', 'natal'),
          'Haz una ficha sencilla: signo del Sol, signo de la Luna y ascendente si la hora es fiable. En vez de copiar tres descripciones enteras, escribe una pregunta que quieras explorar con cada una. Si un dato es desconocido, deja el espacio abierto. No rellenes el ascendente con el signo solar solo porque esa sea la única información que tienes.',
          'Imagina una carta de ejemplo con Sol en Libra, Luna en Cáncer y ascendente en Capricornio. Es un ejemplo de lectura, no el resultado de un nacimiento que hayamos calculado. Sirve para reconocer tres entradas diferentes y estudiar cómo se relacionarían dentro de una interpretación, no para afirmar cómo es una persona real.',
        ],
      },
      {
        id: 'casas',
        title: 'Qué son las casas y por qué importa el sistema',
        paragraphs: [
          cited('Las casas son divisiones matemáticas del espacio representado en la carta, relacionadas con sus líneas de horizonte y meridiano', 'natal'),
          'En nuestra explicación distinguimos esa división de las áreas de vida que la lectura astrológica le atribuye. Cuando compares cartas, registra el sistema de casas empleado en cada una y evita mezclar numeraciones sin indicarlo. Nuestros horóscopos semanales utilizan un esquema desde el signo solar, descrito en la guía del método; eso no es tu carta natal individual.',
          cited('Si la hora es desconocida, Astrodienst ofrece la posibilidad de elaborar una carta sin casas', 'birthtime'),
          'Ese límite no debe esconderse bajo una interpretación muy segura. Es preferible explicar qué posiciones se pueden consultar y cuáles siguen abiertas antes que presentar todos los detalles con la misma certeza.',
        ],
      },
      {
        id: 'aspectos',
        title: 'Qué son los aspectos entre planetas',
        paragraphs: [
          cited('Los aspectos son relaciones angulares entre posiciones y suelen aparecer como líneas de colores en la representación de la carta', 'natal'),
          'No hace falta memorizarlos todos el primer día. Empieza por leer la leyenda de la herramienta y comprobar qué posiciones conecta cada línea. La distancia angular es una medida; el significado de facilidad, tensión o aprendizaje que se le atribuya pertenece a la interpretación. No confundas una línea llamativa con la prueba de un problema inevitable.',
          'Cuando una lectura menciona un aspecto, pide que lo identifique y explique por qué lo considera relevante. Una buena explicación puede ser sencilla sin borrar sus límites. Tampoco una única relación angular debería desplazar todo lo que sabes de tu vida real.',
        ],
      },
      {
        id: 'orden',
        title: 'Una ruta de lectura que puedes repetir',
        paragraphs: [
          'Lee en este orden: calidad de los datos, Sol y Luna, ascendente si está confirmado, casas si procede y relaciones entre posiciones. Es una propuesta de estudio para no abrumarte, no una norma universal de todas las escuelas. Guarda tus preguntas y revisa las interpretaciones que no entiendas antes de aceptar conclusiones.',
          'La carta no sustituye una conversación sobre pareja, una consulta de salud ni el análisis de una decisión económica. Tampoco convierte un horóscopo general en asesoramiento personalizado. Si vuelves a esta guía dentro de unos meses, lo importante es que puedas reconstruir el procedimiento y distinguir un dato comprobado de una idea que te ayudó a reflexionar.',
        ],
      },
    ],
    faqs: [
      { q: '¿Carta natal y horóscopo semanal son lo mismo?', a: 'No. La carta se refiere a un nacimiento concreto; nuestros horóscopos semanales son textos generales por signo solar y una semana fechada.' },
      { q: '¿Puedo leer una carta sin hora de nacimiento?', a: 'Puedes estudiar posiciones con sus limitaciones, pero no dar por confirmados el ascendente y las casas. La Luna también puede tener más de un signo posible.' },
      { q: '¿Una carta natal predice exactamente mi futuro?', a: 'No presentamos sus interpretaciones como predicciones científicas ni resultados garantizados.' },
      { q: '¿Tengo que compartir mis datos para leer estas guías?', a: 'No. Las guías se leen sin formularios de nacimiento y no calculan ni almacenan una carta personal.' },
    ],
    related: ['ascendente', 'signo-lunar', 'mercurio-retrogrado'],
    updated: '2026-10-09',
  },
  {
    slug: 'eclipses',
    title: 'Eclipses: qué ocurre y cómo leer su simbolismo',
    seoTitle: 'Eclipses: astronomía y significado astrológico',
    description: 'Qué es un eclipse solar o lunar, cómo comprobar su visibilidad y cómo separar los datos astronómicos del significado que le atribuye la astrología.',
    eyebrow: 'Astronomía e interpretación',
    summary: 'Lo que sucede en el cielo, lo que se interpreta y cómo observarlo con seguridad.',
    answer: cited('Un eclipse solar ocurre cuando la Luna tapa total o parcialmente el Sol desde nuestra perspectiva; en uno lunar, la Luna pasa por la sombra de la Tierra', 'eclipses'),
    intro: [
      'Los eclipses atraen tanto a quien quiere mirar el cielo como a quien busca una lectura astrológica. Esta guía mantiene las dos conversaciones separadas. Primero explicamos el fenómeno y la observación; después, cómo abordar una interpretación simbólica sin convertirla en anuncio de desgracias, decisiones urgentes o acontecimientos inevitables.',
      limits,
    ],
    sections: [
      {
        id: 'solar-lunar',
        title: 'Eclipse solar y lunar: qué diferencia hay',
        paragraphs: [
          cited('Los eclipses solares ocurren en luna nueva, mientras que los lunares se producen en luna llena', 'eclipses'),
          cited('No hay un eclipse en cada luna nueva o llena porque la órbita lunar está inclinada y la alineación necesaria no ocurre todos los meses', 'eclipses'),
          'La fase y el eclipse no son sinónimos. Si lees que hay luna llena, no deduzcas que existe un eclipse ni que vaya a ser visible desde tu ciudad. Para una fecha concreta hace falta comprobar el evento y su mapa, no enlazar automáticamente una interpretación a cualquier cambio de fase.',
        ],
      },
      {
        id: 'visibilidad',
        title: 'Cómo comprobar fecha, hora y visibilidad',
        paragraphs: [
          cited('La sombra de la Luna recorre una trayectoria sobre la Tierra durante un eclipse solar', 'eclipseGeometry'),
          'Un calendario global no equivale a un horario local. Antes de organizar una observación, busca el mapa del evento y los datos para tu localidad: tipo de eclipse, fase visible y horas de comienzo y final. No reutilices una hora publicada para otra ciudad ni presupongas totalidad porque un titular diga que se verá en España.',
          'En futuras fichas fechadas de esta sección indicaremos el fenómeno, la referencia consultada y las horas con su zona horaria. Esta página es una guía permanente, no una agenda actualizada de próximos eclipses. No contiene una fecha de observación inventada para rellenar una búsqueda.',
        ],
      },
      {
        id: 'seguridad',
        title: 'Seguridad: no mires el Sol sin protección adecuada',
        paragraphs: [
          cited('Las gafas de sol comunes no sirven para mirar el Sol, y los visores solares deben cumplir la norma ISO 12312-2 y estar en buen estado', 'safety'),
          cited('No uses gafas de eclipse para mirar a través de cámaras, prismáticos o telescopios: esos instrumentos requieren filtros solares adecuados delante de la óptica', 'safety'),
          cited('En eclipses parciales y anulares no existe una fase en la que sea seguro mirar el Sol directamente sin protección adecuada', 'safety'),
          cited('La excepción de observación sin visor corresponde únicamente a la breve totalidad de un eclipse solar total, y la protección debe recuperarse en cuanto reaparece cualquier parte brillante del Sol', 'safety'),
          'Si no sabes identificar esas condiciones con seguridad, mantén la protección adecuada y sigue las indicaciones de una entidad astronómica. Una práctica simbólica, una foto para redes o un ritual nunca justifica asumir un riesgo ocular.',
        ],
      },
      {
        id: 'simbolismo',
        title: 'Cómo tratamos el significado astrológico',
        paragraphs: [
          'En TrendiVerse proponemos abordar una lectura de eclipses como reflexión sobre cambios, prioridades o asuntos que quieres revisar. Es nuestro enfoque editorial de entretenimiento, no una afirmación de que el eclipse provoque esos cambios. El mismo evento puede inspirar preguntas distintas y no obliga a todas las personas de un signo a vivir lo mismo.',
          'Para una interpretación más específica explicaremos qué posiciones se comparan y qué datos se conocen. No completaremos una carta desconocida con una casa inventada ni anunciaremos rupturas, accidentes o pérdidas. Si una lectura te genera miedo, puedes dejar de leerla; ningún evento celeste te obliga a actuar por urgencia.',
        ],
      },
      {
        id: 'uso',
        title: 'Una forma tranquila de acercarte a un eclipse',
        paragraphs: [
          'Puedes separar dos páginas de notas. En una, apunta la fecha, la fuente y las condiciones de observación comprobadas. En otra, si te interesa la interpretación, escribe qué te gustaría revisar por decisión propia. Así evitas confundir información del cielo con una orden sobre tu vida.',
          'No recomendamos posponer una consulta médica, firmar un compromiso económico o terminar una relación por un eclipse. Las decisiones importantes necesitan información de su ámbito y tiempo para valorarlas. La especialización de esta sección consiste también en no atribuir al cielo lo que no podemos demostrar.',
        ],
      },
    ],
    faqs: [
      { q: '¿Todas las lunas llenas son eclipses?', a: 'No. La fase llena no garantiza la alineación necesaria para un eclipse lunar.' },
      { q: '¿Un eclipse afecta igual a todos los signos?', a: 'No ofrecemos efectos personales garantizados. Una lectura simbólica no demuestra una consecuencia real para todas las personas de un signo.' },
      { q: '¿Sirven las gafas de sol para ver un eclipse solar?', a: 'No. Hay que utilizar protección solar especializada y seguir las instrucciones de seguridad de NASA; cámaras y telescopios necesitan sus propios filtros adecuados.' },
      { q: '¿Aquí puedo consultar la hora del próximo eclipse?', a: 'Esta es una guía conceptual. Para una observación concreta consulta el evento y tu localidad en una fuente astronómica; no extrapoles una hora global a tu ciudad.' },
    ],
    related: ['fases-de-la-luna', 'carta-natal', 'signo-lunar'],
    updated: '2026-10-09',
  },
  {
    slug: 'fases-de-la-luna',
    title: 'Fases de la Luna: cómo entender el ciclo',
    seoTitle: 'Fases de la Luna: ciclo y significado',
    description: 'Entiende las fases de la Luna, la diferencia entre ciclo lunar y signo lunar, y cómo consultar fechas sin confundir astronomía con interpretación.',
    eyebrow: 'El cielo que puedes observar',
    summary: 'Luna nueva, creciente, llena y menguante, sin confundir fases con signos.',
    answer: cited('Las fases lunares son los cambios de apariencia de la parte iluminada de la Luna que vemos desde la Tierra; el ciclo de luna nueva a luna nueva dura unos 29,5 días', 'phases'),
    intro: [
      'Mirar la Luna varios días seguidos es una forma sencilla de familiarizarte con el cielo. Para entender lo que cambia no hace falta empezar por una interpretación. Primero puedes reconocer la fase; después, si te interesa la astrología, utilizar el ciclo como referencia simbólica sin atribuirle obligaciones ni promesas.',
      limits,
    ],
    sections: [
      {
        id: 'causa',
        title: 'Por qué cambia de aspecto la Luna',
        paragraphs: [
          cited('Las fases dependen de la porción de la mitad iluminada que vemos a medida que la Luna orbita la Tierra, no de que la sombra terrestre tape la Luna cada mes', 'phases'),
          'Esta es una distinción importante al mirar ilustraciones: una zona oscura en el disco lunar no significa automáticamente un eclipse. Para aprender, observa la forma que aparece y consulta una fuente astronómica con fecha. No necesitas interpretar cada cambio como una señal sobre tus relaciones o tus planes.',
        ],
      },
      {
        id: 'fases',
        title: 'Las fases principales y las intermedias',
        paragraphs: [
          cited('El ciclo se describe con ocho fases: nueva, creciente fina, cuarto creciente, gibosa creciente, llena, gibosa menguante, cuarto menguante y menguante fina', 'phaseCycle'),
          cited('En los cuartos vemos aproximadamente la mitad iluminada del disco lunar, aunque el nombre se refiere a la posición dentro del ciclo', 'phaseCycle'),
          'Puedes empezar identificando cuatro referencias: nueva, cuarto creciente, llena y cuarto menguante. Después añade las formas intermedias. Es una manera de organizar la observación, no de afirmar que el cielo salta de una forma a otra: la apariencia cambia de manera continua entre esas referencias.',
        ],
      },
      {
        id: 'ciclos',
        title: 'Por qué aparecen 27,3 y 29,5 días',
        paragraphs: [
          cited('La Luna tarda unos 27,3 días en completar una órbita, pero unos 29,5 en volver de una luna nueva a la siguiente porque la Tierra también se desplaza alrededor del Sol', 'phases'),
          'Las dos cifras responden a referencias diferentes. Para seguir fases, busca el calendario de fases; para consultar una posición zodiacal, revisa un listado de posiciones. No uses la duración de un ciclo como regla fija para calcular una fecha exacta del otro.',
          'Por el mismo motivo, una agenda permanente debería separar una guía como esta de las fichas de un mes concreto. La explicación sirve para aprender; el calendario fechado sirve para consultar un evento. Añadir el año a un título no sustituye la verificación de cada fecha.',
        ],
      },
      {
        id: 'hora',
        title: 'Cómo leer un calendario lunar',
        paragraphs: [
          cited('La fase es la misma en ambos hemisferios, aunque la orientación con la que se observa puede parecer invertida', 'phases'),
          'Comprueba qué zona horaria acompaña al instante de una fase. Una hora en UTC no es directamente la hora local de España, y una conversión puede incluso cambiar la fecha del calendario. Tampoco el instante de luna llena garantiza que la Luna esté sobre el horizonte de tu localidad.',
          'Una ficha útil debe decir si habla del instante calculado de la fase, de la observación local o de la posición en un zodiaco. Si esos datos no aparecen, evita completar los huecos por intuición. Nuestros horóscopos semanales explican por separado las referencias del cielo utilizadas para cada semana.',
        ],
      },
      {
        id: 'simbolico',
        title: 'Cómo usar el ciclo como referencia simbólica',
        paragraphs: [
          'Como propuesta de reflexión, puedes escoger un propósito pequeño, revisarlo unos días después y decidir qué quieres mantener. No tiene que empezar obligatoriamente en luna nueva ni terminar en luna llena. El calendario puede ayudarte a recordar una revisión; no es el responsable del resultado.',
          'No vinculamos las fases a garantías de dinero, cambios inevitables de ánimo ni instrucciones clínicas. Si te gusta llevar un diario, registra lo que ocurrió de verdad además de lo que esperabas: evita anotar solo las coincidencias que parecen confirmar una idea. También puedes observar la Luna únicamente por curiosidad, sin interpretación.',
        ],
      },
    ],
    faqs: [
      { q: '¿La fase de la Luna es mi signo lunar?', a: 'No. La fase describe iluminación; el signo lunar natal describe una posición zodiacal en el momento del nacimiento.' },
      { q: '¿La sombra de la Tierra causa las fases?', a: 'No. La sombra terrestre interviene en los eclipses lunares, no explica el ciclo mensual normal de fases.' },
      { q: '¿El ciclo lunar dura exactamente 28 días?', a: 'No: el ciclo de fases dura aproximadamente 29,5 días. No uses una regla fija de 28 días para fechas exactas.' },
      { q: '¿Tengo que tomar decisiones según la Luna?', a: 'No. Puedes utilizar el ciclo como referencia de entretenimiento o reflexión, sin sustituir información médica, legal o financiera.' },
    ],
    related: ['signo-lunar', 'eclipses', 'mercurio-retrogrado'],
    updated: '2026-10-09',
  },
  {
    slug: 'mercurio-retrogrado',
    title: 'Mercurio retrógrado: qué significa de verdad',
    seoTitle: 'Mercurio retrógrado: qué es y qué no es',
    description: 'Qué es Mercurio retrógrado, por qué es un movimiento aparente y cómo leer su interpretación sin culpar al planeta de errores o decisiones.',
    eyebrow: 'Planetas y movimiento aparente',
    summary: 'La diferencia entre retroceso aparente, interpretación y consejos cotidianos.',
    answer: cited('El movimiento retrógrado aparente es un cambio de dirección observado desde la Tierra, causado por el movimiento relativo de los planetas alrededor del Sol', 'retrograde'),
    intro: [
      'Un correo que no llega, una conversación incómoda o un viaje que cambia: es fácil encontrar después una etiqueta que parezca explicarlo todo. Esta guía propone lo contrario. Primero aclaramos qué significa el término astronómico y después cómo leer una interpretación sin usarla como explicación automática de cualquier contratiempo.',
      limits,
    ],
    sections: [
      {
        id: 'aparente',
        title: '¿Mercurio se mueve realmente hacia atrás?',
        paragraphs: [
          cited('La trayectoria retrógrada que vemos respecto al fondo de estrellas se explica por la perspectiva cambiante de la Tierra y los otros planetas en sus órbitas', 'retrograde'),
          '«Aparente» no significa que la observación sea imaginaria: significa que describe lo que vemos desde una referencia concreta. No es lo mismo observar un cambio de dirección en el cielo que afirmar que el planeta cambió de sentido orbital. Mantener esa distinción evita una explicación engañosa desde la primera frase.',
          'También conviene separar una descripción permanente como esta de un calendario anual. Aquí explicamos el concepto; no mostramos fechas nuevas sin comprobarlas ni anunciamos que Mercurio está retrógrado solo porque la palabra atrae búsquedas.',
        ],
      },
      {
        id: 'interpretacion',
        title: 'Cómo planteamos su lectura astrológica',
        paragraphs: [
          'En esta sección usaremos la idea de revisión como propuesta de reflexión: releer un mensaje, ordenar una tarea pendiente o aclarar un acuerdo. Es un encuadre editorial, no una prueba de que Mercurio determine la comunicación o de que esos gestos funcionen únicamente durante un periodo del calendario.',
          'La lectura debe dejar espacio a tu decisión. Si tienes un plazo, un viaje o una conversación importante, atiende a los hechos de ese asunto. No pospongas automáticamente algo útil ni interpretes cualquier dificultad como una señal de que vas por el camino equivocado. Los consejos cotidianos deben poder justificarse sin depender de una posición planetaria.',
        ],
      },
      {
        id: 'calendario',
        title: 'Qué debe incluir un calendario de retrogradación',
        paragraphs: [
          'Antes de usar una lista de fechas, comprueba el año, la fuente y la zona horaria. La ficha debe indicar qué considera inicio y final del periodo y distinguir esos momentos de otras etiquetas astrológicas, como la llamada sombra previa o posterior. Si las fuentes discrepan en un minuto, no inventaremos una precisión que no hemos confirmado.',
          'Nuestros textos semanales remiten a su semana concreta y explican el cielo en una nota técnica. Esta guía permanece útil fuera de esas fechas porque no trata una observación pasada como si siguiera vigente. La especialización exige mantener separados los conceptos que no caducan y las efemérides que sí necesitan actualización.',
        ],
      },
      {
        id: 'practico',
        title: 'Qué puedes revisar sin caer en supersticiones',
        paragraphs: [
          'Si te apetece utilizar la lectura como recordatorio, empieza por una tarea verificable. Comprueba el destinatario antes de enviar un correo, confirma una reserva o guarda una copia de un documento. Son hábitos útiles por sí mismos. La guía no promete que eviten todo error ni que un planeta sea la causa de los fallos.',
          'Cuando aparezca un problema, investiga primero su causa concreta: una fecha mal escrita, una condición del contrato o una incidencia del servicio. Después decide cómo resolverlo. Una interpretación simbólica no sustituye esa comprobación y no debe añadir miedo a un asunto que ya puedes gestionar con información.',
        ],
        bullets: [
          'Mensajes: revisa lo que dice el texto antes de suponer la intención de la otra persona.',
          'Trámites: comprueba plazos y requisitos en la entidad responsable.',
          'Viajes: utiliza la información de la reserva y del operador, no una prohibición astrológica.',
          'Dinero: valora condiciones y riesgos reales; pide asesoramiento cuando lo necesites.',
        ],
      },
      {
        id: 'limites',
        title: 'Lo que no vamos a atribuir a Mercurio',
        paragraphs: [
          'No diremos que garantiza una ruptura, que impide firmar cualquier documento o que avería tu teléfono. Tampoco vincularemos una vuelta de alguien del pasado a una orden de retomar la relación. Las personas y las decisiones merecen una valoración propia, no una explicación que encaje con cualquier resultado.',
          'Puedes disfrutar del lenguaje astrológico y mantener una mirada crítica al mismo tiempo. Si un contenido presenta miedo, certeza absoluta o urgencia para comprar una solución, detente y revisa qué evidencia ofrece. La lectura de TrendiVerse debe acompañar la reflexión, no quitarte autonomía.',
        ],
      },
    ],
    faqs: [
      { q: '¿Mercurio invierte su órbita cuando está retrógrado?', a: 'No es lo que significa el término en esta lectura: hablamos de un movimiento aparente observado desde la Tierra.' },
      { q: '¿No debo firmar nada durante Mercurio retrógrado?', a: 'No establecemos esa prohibición. Evalúa el documento, sus condiciones y el asesoramiento que corresponda, con independencia del calendario astrológico.' },
      { q: '¿Mercurio retrógrado explica todos los problemas de comunicación?', a: 'No. Ante un error conviene comprobar su causa concreta; no presentamos una posición planetaria como explicación universal.' },
      { q: '¿Esta página contiene las fechas de este año?', a: 'No. Es una guía del concepto, no un calendario anual. Las fechas requieren una ficha específica con fuente y zona horaria.' },
    ],
    related: ['carta-natal', 'fases-de-la-luna', 'eclipses'],
    updated: '2026-10-09',
  },
]

export function astrologyGuideBySlug(slug: string): AstrologyGuide | undefined {
  return ASTROLOGY_GUIDES.find((guide) => guide.slug === slug)
}

export function astrologyGuidePath(slug: AstrologyGuideSlug): string {
  return `/astrologia/guias/${slug}`
}

/** Texto plano para JSON-LD y métricas de longitud, manteniendo las citas en la página. */
export function plainAstrologyText(text: string): string {
  return text.replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g, '$1')
}

export function astrologyGuideBody(guide: AstrologyGuide): string {
  return [
    guide.answer,
    ...guide.intro,
    ...guide.sections.flatMap((section) => [section.title, ...section.paragraphs, ...(section.bullets ?? [])]),
    ...guide.faqs.flatMap((faq) => [faq.q, faq.a]),
  ].map(plainAstrologyText).join('\n\n')
}

export function astrologyGuideSources(guide: AstrologyGuide) {
  const body = JSON.stringify(guide)
  return Object.values(ASTROLOGY_REFERENCES).filter((ref) => body.includes(ref.url))
}
