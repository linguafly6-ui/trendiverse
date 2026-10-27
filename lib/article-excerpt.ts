import type { Article } from './types'

function shorten(value: string, max = 155): string {
  const text = value.trim().replace(/\s+/g, ' ')
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, '')}…`
}

function plainText(value: string): string {
  return value
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type Editorial = { excerpt: string; focus: string; safety: string; followup: string; evidence: string }

const CREATINE_EDITORIAL: Record<string, Editorial> = {
  'dosis-de-la-creatina-como-interpretar-las-recomendaciones': {
    excerpt: 'Gramos, porciones y fases de carga no significan lo mismo. Aprende a leer las cifras de una etiqueta sin convertirlas en una pauta personal.',
    focus: 'La cifra de una etiqueta solo se entiende cuando sabes si se refiere a creatina pura, a una mezcla o al peso de toda la porción. Compara unidades y formulaciones antes de sacar conclusiones.',
    safety: 'Las dudas sobre cantidad requieren especial cuidado si hay enfermedad renal, resultados analíticos alterados, embarazo, lactancia o medicación habitual. No ajustes la pauta para compensar una toma olvidada ni combines varios productos sin revisar sus ingredientes.',
    followup: 'Si necesitas aclarar una cifra, lleva a la consulta una foto de la etiqueta donde se vean la porción, la composición y las instrucciones. Esa información resulta más útil que mencionar únicamente la marca.',
    evidence: 'Para comparar protocolos, distingue la cantidad diaria estudiada, la duración y si el ensayo utilizó una fase de carga. No conviertas el método de un estudio en una prescripción para todas las personas.'
  },
  'quien-deberia-evitar-la-creatina': {
    excerpt: 'Enfermedad renal, embarazo, lactancia y ciertos tratamientos cambian la evaluación. Estas son las situaciones en las que conviene consultar antes de usar creatina.',
    focus: 'La pregunta no es solo quién debe evitarla, sino quién necesita una valoración previa. La historia clínica, las analíticas pertinentes y los medicamentos importan más que una regla general basada únicamente en la edad.',
    safety: 'Si existe enfermedad renal, antecedentes relevantes o una analítica alterada, no empieces por tu cuenta. En embarazo, lactancia y menores de edad, la evidencia deportiva habitual no basta para recomendar el suplemento sin valoración sanitaria.',
    followup: 'Anota el motivo por el que te planteas usar creatina y cualquier síntoma que te preocupe. La fatiga o la debilidad persistentes merecen estudiar su causa, no atribuirlas automáticamente a una necesidad de suplementación.',
    evidence: 'Al revisar la seguridad, fíjate en si los participantes eran adultos sanos o personas con la condición clínica que te afecta. Los resultados de un grupo no demuestran automáticamente seguridad en otro.'
  },
  'interacciones-de-la-creatina-con-medicamentos': {
    excerpt: 'La combinación depende del fármaco, la función renal y los demás productos que utilizas. Qué información reunir antes de consultar al médico o farmacéutico.',
    focus: 'Una revisión útil incluye medicamentos con receta, productos sin receta, preentrenos, vitaminas y preparados herbales. A veces el ingrediente añadido a una mezcla deportiva plantea más dudas que la creatina por sí sola.',
    safety: 'No hay una lista universal que permita declarar segura cualquier combinación. La función renal, la enfermedad de base y los tratamientos concomitantes pueden cambiar la valoración; no suspendas ni ajustes medicación para poder tomar un suplemento.',
    followup: 'Lleva una lista actualizada con el nombre, la cantidad indicada y la frecuencia de cada producto. Si te hacen análisis, informa de la creatina para que el profesional interprete los resultados en su contexto.',
    evidence: 'Una interacción no se descarta solo porque no aparezca en una lista comercial. Busca información del medicamento concreto y consulta a un farmacéutico cuando la evidencia sea incompleta o la combinación incluya varios productos.'
  },
  'como-elegir-un-suplemento-de-la-creatina-de-calidad': {
    excerpt: 'Composición transparente, lote identificable y controles verificables ayudan a comparar creatinas. El precio y las promesas «premium» no prueban calidad.',
    focus: 'Para comparar dos botes, calcula la cantidad real de ingrediente por porción y revisa si hay mezclas, aromas o estimulantes añadidos. Un envase llamativo no sustituye una etiqueta completa.',
    safety: 'Evita productos sin responsable identificable, con ingredientes ambiguos o con promesas de curar enfermedades. Los controles independientes pueden aportar datos sobre identidad o contaminantes, pero no prueban que el producto sea necesario ni eficaz para cada persona.',
    followup: 'Conserva el envase, el lote y el comprobante de compra. Si la etiqueta no aclara la composición o las instrucciones, pide información al responsable antes de utilizar el producto.',
    evidence: 'Las afirmaciones de calidad deben indicar qué se analizó y con qué alcance. Un certificado sobre contaminantes no equivale a un ensayo clínico que demuestre beneficios deportivos.'
  },
  'la-creatina-polvo-capsulas-o-comprimidos': {
    excerpt: 'Polvo, cápsulas y comprimidos cambian la comodidad y el tamaño de la porción, no necesariamente el efecto. Compara la cantidad real y los excipientes.',
    focus: 'El formato más práctico depende de si prefieres medir polvo o llevar unidades preparadas. Para comparar, calcula cuántas cápsulas forman una porción y qué cantidad de creatina aporta el conjunto.',
    safety: 'No midas el polvo a ojo ni supongas que una cápsula equivale a una cucharada. Revisa excipientes, alérgenos e ingredientes añadidos, especialmente en mezclas deportivas con estimulantes.',
    followup: 'Si cambiar de formato te obliga a modificar el número de unidades o la cantidad por toma, revisa de nuevo la etiqueta en vez de trasladar automáticamente las medidas del producto anterior.',
    evidence: 'Los estudios sobre creatina no demuestran que una presentación sea superior solo por ser cápsula, polvo o comprimido. Importan la forma del ingrediente, el protocolo y el resultado medido.'
  },
  'cuanto-tarda-en-hacer-efecto-la-creatina': {
    excerpt: 'Las reservas musculares, el peso y el rendimiento no cambian al mismo ritmo. Qué significan los plazos de los estudios y por qué no garantizan resultados.',
    focus: '«Notar el efecto» puede significar cosas distintas: cambios en las reservas musculares, variación de peso o rendimiento en una prueba. Define qué resultado te interesa antes de valorar si ha habido cambios.',
    safety: 'No aumentes la cantidad porque no percibas una sensación inmediata. La creatina no actúa como un estimulante y la ausencia de una sensación subjetiva no demuestra que el producto no tenga efecto ni que necesites más.',
    followup: 'Si evalúas el entrenamiento, registra el programa, la recuperación y el rendimiento de forma consistente. Cambiar varias variables a la vez hace más difícil saber qué explica una diferencia.',
    evidence: 'Al comparar plazos, comprueba si el estudio midió reservas musculares, fuerza, repeticiones o composición corporal. Son resultados distintos y no deben presentarse como si aparecieran simultáneamente.'
  },
  'que-pasa-si-dejas-de-tomar-la-creatina': {
    excerpt: 'Al interrumpir la creatina, las reservas descienden gradualmente y puede cambiar el peso por agua. Eso no equivale automáticamente a perder músculo.',
    focus: 'Conviene distinguir entre la vuelta gradual de las reservas hacia su nivel previo y los cambios en el entrenamiento. Una variación de la báscula no revela por sí sola si ha cambiado el músculo, la grasa o el agua.',
    safety: 'No necesitas reiniciar el suplemento por miedo a perder de golpe todos los progresos. Si lo dejas por una reacción adversa o por indicación médica, sigue esa orientación y no lo reintroduzcas sin revisar el motivo.',
    followup: 'Si notas cambios después de interrumpirlo, considera también alimentación, carga de entrenamiento, descanso y enfermedades recientes. Si aparecen síntomas importantes o persistentes, consulta en lugar de atribuirlos automáticamente a la retirada.',
    evidence: 'Los estudios de interrupción describen cambios fisiológicos y de rendimiento bajo condiciones concretas. No permiten prometer que todas las personas perderán la misma cantidad de peso o fuerza.'
  },
  'alimentos-ricos-en-la-creatina-frente-a-suplementos': {
    excerpt: 'Carne y pescado aportan creatina en cantidades variables; el organismo también la produce. Compara alimentos y suplementos sin perder de vista la dieta completa.',
    focus: 'La cantidad presente en un alimento depende de la especie, el corte y la preparación. Las cifras de tablas nutricionales son orientativas y no describen exactamente cada plato servido.',
    safety: 'No cambies una dieta completa por un suplemento concentrado. Si sigues una alimentación vegetariana o vegana, eso no demuestra por sí solo que debas tomar creatina; valora el objetivo y tu situación individual.',
    followup: 'Para revisar la alimentación, anota qué fuentes de proteína consumes durante varios días y cuál es tu objetivo. Un dietista-nutricionista puede ayudarte a evaluar el patrón completo en vez de centrarse en un solo ingrediente.',
    evidence: 'Las comparaciones entre alimentos y suplementos deben tener en cuenta la cantidad de creatina, el resto de nutrientes y el diseño de los estudios. No son intervenciones idénticas ni intercambiables en todos los contextos.'
  },
  'deficiencia-de-la-creatina-senales-y-evaluacion': {
    excerpt: 'El cansancio y la debilidad no diagnostican una deficiencia de creatina. Aprende a distinguir reservas bajas de trastornos poco frecuentes que requieren evaluación clínica.',
    focus: 'El término «deficiencia» puede describir reservas musculares relativamente bajas o trastornos médicos poco frecuentes del metabolismo de la creatina. Son situaciones distintas y no se identifican únicamente por cómo te sientes.',
    safety: 'No uses la respuesta a un suplemento como prueba diagnóstica. Si hay síntomas persistentes, especialmente en niños o junto con alteraciones neurológicas o del desarrollo, la evaluación corresponde a profesionales sanitarios.',
    followup: 'Si el cansancio continúa, comenta cuándo empezó, qué otros síntomas aparecen y cómo afecta a tu día a día. El profesional decidirá si hacen falta análisis u otras pruebas según el contexto.',
    evidence: 'Los trastornos hereditarios de síntesis o transporte de creatina son poco frecuentes y requieren pruebas especializadas. No deben confundirse con variaciones dietéticas ni con fatiga común.'
  },
  'la-creatina-en-dietas-vegetarianas-y-veganas': {
    excerpt: 'Las dietas vegetales suelen aportar menos creatina directamente, pero el organismo también la sintetiza. Qué puede significar esto para el entrenamiento y la dieta.',
    focus: 'Una dieta vegetariana o vegana cambia las fuentes alimentarias de creatina, pero no implica una carencia clínica automática. La decisión debe partir de la alimentación global, el entrenamiento y los objetivos.',
    safety: 'No presentes la suplementación como requisito de una dieta vegetal bien planificada. Si tienes enfermedad, tomas medicación o buscas tratar síntomas persistentes, pide una valoración individual antes de usar productos deportivos.',
    followup: 'Revisa primero la variedad de alimentos, la ingesta total de proteína, la energía y la recuperación. Si te preocupa el rendimiento o el estado nutricional, un profesional puede evaluar el conjunto de la dieta.',
    evidence: 'Los estudios en vegetarianos y veganos varían en población y resultados. Una diferencia media en reservas o en una prueba no garantiza que cada persona vaya a notar una mejora.'
  },
  'la-creatina-durante-el-embarazo-y-la-lactancia': {
    excerpt: 'La evidencia en embarazo y lactancia es insuficiente para trasladar pautas deportivas habituales. Consulta al equipo sanitario antes de usar creatina.',
    focus: 'Durante el embarazo y la lactancia, no basta con que una sustancia exista de forma natural en el cuerpo: hay que evaluar la seguridad de la suplementación en esa etapa concreta.',
    safety: 'No empieces creatina por recomendación de redes ni la utilices para tratar fatiga sin explorar la causa. Consulta con obstetra, matrona o farmacéutico antes de usar suplementos deportivos durante estas etapas.',
    followup: 'En la consulta explica qué producto tienes, por qué te interesa y si ya lo has tomado. No sustituyas recomendaciones prenatales, alimentos indicados ni tratamientos por mezclas deportivas.',
    evidence: 'Los ensayos en adultos sanos no establecen seguridad durante el embarazo o la lactancia. La falta de datos suficientes no permite asumir ni beneficio ni seguridad universal.'
  },
  'la-creatina-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: 'En personas mayores importan la fuerza, la alimentación, la función renal y la polimedicación. La edad por sí sola no indica que deban tomar creatina.',
    focus: 'La creatina se ha estudiado a menudo junto con entrenamiento de fuerza, pero no sustituye el ejercicio adaptado, una alimentación suficiente ni la prevención de caídas.',
    safety: 'Si existen varias enfermedades o tratamientos, revisa el suplemento con el médico o farmacéutico. La función renal y la interpretación de la creatinina deben valorarse en contexto, no mediante una cifra aislada.',
    followup: 'Lleva a la consulta el envase y una lista de medicamentos. Explica si el objetivo es acompañar un programa de fuerza, mejorar la función cotidiana o responder a una recomendación externa.',
    evidence: 'Los estudios en personas mayores difieren en estado de salud, programa de ejercicio y duración. No conviertas un resultado observado junto al entrenamiento en una promesa de prevenir caídas o tratar fragilidad.'
  },
  'mitos-sobre-la-creatina-que-es-verdad-y-que-no': {
    excerpt: '¿Daña los riñones, deshidrata o es un esteroide? Revisamos los mitos más comunes y lo que realmente permite concluir la evidencia.',
    focus: 'Para evaluar un mito, separa la afirmación concreta de la evidencia disponible y evita los extremos: ni todas las personas tienen el mismo riesgo ni un resultado favorable garantiza seguridad universal.',
    safety: 'La creatina no es un esteroide anabolizante, pero eso no significa que cualquier producto o combinación sea adecuada para todos. Enfermedad renal, embarazo, lactancia y tratamientos relevantes requieren valoración individual.',
    followup: 'Cuando una afirmación te preocupe, comprueba de dónde procede, a qué población se refiere y si habla de creatina monohidrato o de una mezcla. No tomes decisiones por titulares sin contexto.',
    evidence: 'Las afirmaciones sobre riñones, hidratación o aumento de peso deben precisar población, formulación y resultado. Una variación de creatinina o de peso no basta, por sí sola, para explicar la causa.'
  },
  'como-leer-la-etiqueta-de-la-creatina': {
    excerpt: 'Comprueba la forma de creatina, los gramos por porción, los ingredientes añadidos y la trazabilidad. Una etiqueta clara permite comparar sin dejarse llevar por reclamos.',
    focus: 'La parte frontal del envase suele destacar el nombre comercial; los datos útiles están en la tabla de composición y las instrucciones. Comprueba si las cifras se refieren a una porción o a cien gramos.',
    safety: 'Revisa alérgenos, excipientes, estimulantes y advertencias, sobre todo si el producto forma parte de una mezcla preentrenamiento. No utilices una etiqueta ambigua como base para calcular la cantidad.',
    followup: 'Si no queda claro cuánto ingrediente aporta una toma, pregunta al fabricante o elige un producto con información verificable. Guarda el lote y la fecha por si necesitas notificar una incidencia.',
    evidence: 'Los sellos de calidad deben poder verificarse y explicar qué control cubren. Un análisis de identidad o pureza no demuestra que el suplemento aporte un beneficio clínico.'
  },
  'preguntas-frecuentes-sobre-la-creatina-guia-para-principiantes': {
    excerpt: 'Respuestas claras sobre necesidad, horario, peso y formatos de creatina, con límites de la evidencia y situaciones en las que conviene consultar.',
    focus: 'Para empezar, separa las preguntas prácticas —formato, horario y coste— de la cuestión principal: si el suplemento encaja con tus objetivos y circunstancias.',
    safety: 'No es imprescindible para entrenar ni reemplaza una alimentación suficiente, descanso o planificación. Si eres menor, estás embarazada o en lactancia, tienes enfermedad renal o tomas medicación, pide orientación individual.',
    followup: 'Antes de comprar, define qué quieres conseguir, revisa el coste por cantidad de ingrediente y comprueba si tu alimentación ya cubre tus necesidades. No hace falta añadir un suplemento solo porque sea popular.',
    evidence: 'Las respuestas a preguntas frecuentes deben indicar cuándo hay datos consistentes y cuándo siguen existiendo dudas. No extrapoles resultados de deportistas adultos sanos a todas las edades o situaciones.'
  },
  'que-es-la-proteina-de-suero-y-para-que-sirve': {
    excerpt: 'Qué diferencia al concentrado, aislado e hidrolizado de whey, para qué puede resultar práctico y cuándo una dieta normal ya aporta suficiente proteína.',
    focus: 'La proteína de suero es una opción cómoda, no una obligación. Para saber si aporta algo, empieza por la ingesta total y por lo que puedes cubrir con las comidas habituales.',
    safety: 'Si tienes alergia a la proteína de leche, un aislado o hidrolizado no debe asumirse seguro. En enfermedad renal u otras situaciones que exigen ajustar la proteína, consulta antes de cambiar la ingesta.',
    followup: 'Compara la cantidad de proteína por porción, los ingredientes y la tolerancia digestiva. El tipo de whey no sustituye la revisión de la dieta ni garantiza un resultado muscular.',
    evidence: 'Los estudios sobre proteína de suero deben leerse junto con la ingesta total de proteína y el entrenamiento. Un beneficio observado en una situación concreta no convierte el batido en necesario para todo el mundo.'
  },
  'beneficios-de-la-proteina-de-suero-que-dice-la-evidencia': {
    excerpt: 'La whey puede ayudar a cubrir la ingesta de proteína, pero los resultados dependen de la dieta y el entrenamiento. Separamos beneficios plausibles de promesas exageradas.',
    focus: 'La evidencia sobre adaptación muscular se interpreta mejor junto con el entrenamiento de fuerza y la ingesta total. Añadir más proteína no garantiza más progreso si la alimentación ya es suficiente.',
    safety: 'No utilices un batido para reemplazar de forma habitual una alimentación variada sin valorar el conjunto de nutrientes. Si tienes una condición médica que afecta a la dieta, consulta antes de aumentar la proteína.',
    followup: 'Antes de valorar un beneficio, define qué resultado buscas y durante cuánto tiempo lo observarás. Cambios en fuerza, masa muscular y recuperación no son la misma medida.',
    evidence: 'Comprueba si el estudio compara whey con otra proteína, con placebo o con una dieta ya suficiente. El comparador cambia la interpretación y limita las conclusiones que pueden generalizarse.'
  },
  'efectos-secundarios-de-la-proteina-de-suero': {
    excerpt: 'Gases, diarrea e intolerancia a la lactosa no son lo mismo que una alergia a la leche. Aprende a identificar ingredientes y señales que requieren atención.',
    focus: 'Las molestias digestivas pueden relacionarse con lactosa, edulcorantes, cantidad o una condición independiente. La etiqueta completa ayuda a investigar sin atribuir cada síntoma a la proteína por sí sola.',
    safety: 'La alergia a la leche puede provocar reacciones graves y no se resuelve eligiendo un producto bajo en lactosa. Ante dificultad respiratoria o hinchazón de lengua o garganta, busca atención urgente.',
    followup: 'Si las molestias se repiten, anota el producto, la cantidad, el momento y los síntomas. No hagas una reexposición deliberada si sospechas una reacción alérgica.',
    evidence: 'Los informes de tolerancia dependen de la formulación y de las personas estudiadas. No todos los productos de suero tienen la misma lactosa, edulcorantes o ingredientes añadidos.'
  },
  'como-tomar-la-proteina-de-suero-correctamente': {
    excerpt: 'Calcula primero si necesitas proteína adicional, lee la porción y revisa los ingredientes. El batido es una opción práctica, no una pauta obligatoria.',
    focus: 'La cantidad total que comes durante el día suele ser más útil para evaluar la ingesta que centrarse en una única toma. El batido puede complementar una comida, pero no corrige por sí solo una dieta desequilibrada.',
    safety: 'No combines varias mezclas sin sumar la proteína y los demás ingredientes que aportan. Si hay enfermedad renal, alergia a la leche o una pauta nutricional prescrita, consulta antes de cambiar la ingesta.',
    followup: 'Usa la etiqueta para calcular la cantidad por porción y compárala con lo que aportan los alimentos. Si el envase no explica bien la composición, no estimes la cantidad a ojo.',
    evidence: 'Los estudios no convierten las instrucciones del fabricante en una necesidad individual. Valora dieta, objetivo, entrenamiento y estado de salud antes de concluir que hace falta un batido.'
  },
  'cuando-tomar-la-proteina-de-suero-manana-o-noche': {
    excerpt: 'El horario puede adaptarse a tus comidas, entrenamiento y tolerancia. La ingesta diaria importa más que perseguir una hora perfecta para tomar whey.',
    focus: 'Mañana, después de entrenar o por la noche son opciones prácticas, no ventanas mágicas. Elige un momento que encaje con la dieta y no cause molestias.',
    safety: 'Si tomar el batido por la noche altera la digestión o el sueño, cambia la organización de las comidas en lugar de forzarlo. Las necesidades y restricciones médicas individuales tienen prioridad sobre reglas de horario.',
    followup: 'Observa cómo encaja el batido con las comidas y el entrenamiento durante una rutina normal. No necesitas abandonar una pauta sostenible porque no puedas beberlo justo al terminar una sesión.',
    evidence: 'Al interpretar estudios sobre el momento de la proteína, revisa la ingesta total, el entrenamiento y la duración. Los resultados no prueban que exista una hora universalmente superior.'
  }
}

const COMMON_SAFETY = 'La mayor parte de la investigación deportiva sobre creatina se ha realizado en adultos sanos y con formulaciones concretas. No extrapoles automáticamente esos datos a personas con enfermedad renal, tratamientos complejos, embarazo, lactancia o menores de edad. En esos casos, la decisión debe revisarse con un profesional sanitario que conozca la situación individual. Si aparecen síntomas intensos o persistentes, no intentes resolverlos cambiando cantidades por tu cuenta.'
const COMMON_FOLLOWUP = 'Si tienes una analítica próxima, informa al profesional de los suplementos que utilizas. La creatinina sanguínea puede verse influida por distintos factores y un resultado aislado no diagnostica ni descarta por sí solo una enfermedad renal. La interpretación depende del contexto clínico y de otras pruebas cuando proceda.'
const COMMON_EVIDENCE = 'Al leer un estudio, comprueba qué forma de creatina se investigó, durante cuánto tiempo, en qué población y qué resultado se midió.'

/** Extractos editoriales escritos para cada artículo; no se cortan de un párrafo al azar. */
export function articleExcerpt(article: Pick<Article, 'category' | 'title' | 'slug' | 'content' | 'excerpt'>): string | null {
  if (article.category !== 'suplementos') return article.excerpt
  const editorial = CREATINE_EDITORIAL[article.slug]
  if (editorial) return shorten(editorial.excerpt, 155)
  if (!article.content) return article.excerpt

  const blocks = article.content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
  const focusBlock = blocks.find((block) => /la pregunta práctica es/i.test(block))
  if (focusBlock) {
    const text = plainText(focusBlock)
    const match = /la pregunta práctica es\s+(.+)$/i.exec(text)
    if (match?.[1]) {
      const candidate = match[1].replace(/[«»]/g, '').trim()
      if (candidate.length > 35) return shorten(candidate, 155)
    }
  }
  const candidates = blocks.filter((block) => !/^#{1,6}\s/.test(block)).map(plainText)
    .filter((text) => text.length >= 75 && !/^(esta guía|este artículo|el objetivo de esta guía|no sustituye|en esta guía)/i.test(text))
  const distinct = candidates.slice(1).find((text) => text.toLocaleLowerCase('es') !== article.title.toLocaleLowerCase('es')) ?? candidates[0]
  return distinct ? shorten(distinct, 155) : article.excerpt
}

export function withArticleExcerpt<T extends Article>(article: T): T {
  const editorial = article.category === 'suplementos' ? CREATINE_EDITORIAL[article.slug] : undefined
  let excerpt = articleExcerpt(article)
  let content = article.content

  if (editorial && content) {
    content = content
      .replaceAll(COMMON_SAFETY, editorial.safety)
      .replaceAll(COMMON_FOLLOWUP, editorial.followup)
      .replaceAll(COMMON_EVIDENCE, editorial.evidence)

    // Añade un apunte editorial propio al inicio, después del primer párrafo real.
    if (!content.includes('## Enfoque específico')) {
      const blocks = content.split(/\n\s*\n/)
      const firstParagraph = blocks.findIndex((block) => block.trim() && !/^\s*#{1,6}\s/.test(block.trim()))
      if (firstParagraph >= 0) {
        blocks.splice(firstParagraph + 1, 0, `## Enfoque específico\n\n${editorial.focus}`)
        content = blocks.join('\n\n')
      }
    }
  }
  if (excerpt === article.excerpt && content === article.content) return article
  return { ...article, excerpt, content } as T
}
