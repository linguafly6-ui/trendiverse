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
  },
  'dosis-de-la-proteina-de-suero-como-interpretar-las-recomendaciones': {
    excerpt: "La cantidad útil depende de la dieta completa, el objetivo y la etiqueta. Aprende a distinguir gramos de polvo y gramos de proteína real.",
    focus: "En un batido, el peso del polvo no equivale necesariamente a la cantidad de proteína: una porción también puede incluir aromas, edulcorantes y otros ingredientes. La comparación empieza por los gramos de proteína por ración y por el conjunto de la dieta.",
    safety: "No conviertas cifras de estudios deportivos en una pauta individual si tienes enfermedad renal, una indicación dietética clínica o necesidades nutricionales especiales. En esos casos, acuerda la cantidad total con un profesional que conozca tu situación.",
    followup: "Para revisar un producto, apunta cuántos gramos de proteína aporta la porción, cuánto polvo requiere y qué otras fuentes proteicas comes en un día habitual. Así se puede valorar si el batido aporta algo que realmente falta.",
    evidence: "Los estudios suelen evaluar cantidades dentro de dietas y programas de ejercicio concretos. Comprueba la población, la ingesta total y el resultado medido antes de interpretar una cifra como recomendación universal."
  },
  'quien-deberia-evitar-la-proteina-de-suero': {
    excerpt: "Alergia a la leche, intolerancia a la lactosa y ciertas enfermedades requieren enfoques distintos. Descubre qué conviene comprobar antes de usar whey.",
    focus: "No es lo mismo una alergia a las proteínas de la leche que una dificultad para digerir la lactosa. Los aislados pueden contener menos lactosa que algunos concentrados, pero no se consideran seguros automáticamente para quien tiene alergia a la leche.",
    safety: "Si has tenido una reacción alérgica a lácteos, no pruebes un suplemento de suero por tu cuenta. Si tienes enfermedad renal, una dieta prescrita o síntomas digestivos persistentes, consulta antes de cambiar de forma importante la ingesta de proteína.",
    followup: "Revisa la lista de alérgenos y el tipo de proteína que declara el envase. Si aparecen urticaria, hinchazón o dificultad para respirar tras consumir un producto, busca atención urgente; no intentes resolver una posible alergia cambiando de marca.",
    evidence: "Las tolerancias digestivas dependen de la formulación y de la persona. Los estudios en adultos sanos no establecen la seguridad de un producto para alguien con alergia diagnosticada o una enfermedad concreta."
  },
  'interacciones-de-la-proteina-de-suero-con-medicamentos': {
    excerpt: "Los batidos pueden afectar la organización de una dieta terapéutica aunque no exista una interacción universal. Revisa el producto junto con tu tratamiento.",
    focus: "La proteína de suero es un alimento concentrado, no un medicamento. La cuestión práctica es si añadirla modifica la dieta prescrita, el aporte de determinados nutrientes o la forma en que debes organizar una toma de medicación.",
    safety: "No suspendas ni separes medicamentos por tu cuenta para poder tomar un batido. Si sigues una dieta clínica, tomas medicación con instrucciones relacionadas con alimentos o tienes una enfermedad crónica, pide a tu farmacéutico o profesional sanitario que revise el caso concreto.",
    followup: "Lleva el nombre del suplemento, la lista completa de ingredientes y el horario de tus medicamentos a la consulta. Menciona también otros batidos o productos enriquecidos para que la revisión contemple el conjunto.",
    evidence: "Las afirmaciones sobre interacciones deben apoyarse en datos del ingrediente y del fármaco concretos. No deduzcas una interacción ni su ausencia a partir de estudios generales sobre proteína en deportistas."
  },
  'como-elegir-un-suplemento-de-la-proteina-de-suero-de-calidad': {
    excerpt: "Compara proteína por ración, alérgenos, ingredientes y controles de calidad. El marketing llamativo no sustituye una etiqueta clara.",
    focus: "Empieza por la información verificable: tipo de suero, gramos de proteína por porción, tamaño de esa porción, lista de ingredientes y alérgenos. Después valora si necesitas saborizantes, edulcorantes u otros componentes añadidos.",
    safety: "Desconfía de productos que prometen tratar enfermedades, ganar músculo sin entrenamiento o producir resultados garantizados. Si tienes alergia a la leche, no te fíes solo de términos como «aislado» o «purificado»: verifica los alérgenos y consulta si hay dudas.",
    followup: "Compara dos etiquetas con la misma base: proteína por 100 gramos y por ración preparada, no solo el tamaño del cacito. Comprueba también el lote, la fecha de consumo preferente y si el fabricante aporta análisis independientes verificables.",
    evidence: "Un sello de control puede informar sobre ciertos análisis, pero no demuestra que el suplemento sea necesario ni que produzca beneficios extraordinarios. Distingue calidad del producto, adecuación a tus necesidades y eficacia del uso que se anuncia."
  },
  'la-proteina-de-suero-polvo-capsulas-o-comprimidos': {
    excerpt: "El formato cambia la comodidad, el tamaño de la toma y los ingredientes añadidos, pero no vuelve superior a un producto por sí solo.",
    focus: "La proteína de suero se vende sobre todo en polvo; las cápsulas o comprimidos suelen aportar cantidades mucho menores por unidad. Mira cuántas unidades harían falta para igualar la proteína de una ración de polvo antes de comparar formatos.",
    safety: "Lee los excipientes, los alérgenos y las instrucciones de uso de cada presentación. Si te cuesta tragar comprimidos o tienes restricciones dietéticas, no elijas solo por la comodidad anunciada: comprueba que el formato sea apropiado para ti.",
    followup: "Haz la comparación por gramos de proteína y coste por esa misma cantidad, no por número de cápsulas ni por peso del envase. Ten en cuenta también el tamaño de la ración y si necesitas mezclar el polvo con otros alimentos.",
    evidence: "Para comparar efectos, importa la cantidad de proteína realmente consumida y el contexto dietético, no solo la presentación comercial. No asumas que dos productos son equivalentes sin revisar su composición."
  },
  'cuanto-tarda-en-hacer-efecto-la-proteina-de-suero': {
    excerpt: "Un batido aporta proteína en el momento, pero los cambios en fuerza o masa muscular dependen del entrenamiento, la dieta y el tiempo.",
    focus: "Conviene separar el efecto inmediato —ingerir proteína— de los cambios que se buscan con semanas de alimentación y entrenamiento consistentes. No existe un plazo fijo en el que todo el mundo deba notar una diferencia visible.",
    safety: "Si el cansancio, la pérdida de peso o la debilidad persisten, no los atribuyas automáticamente a una falta de proteína ni intentes solucionarlos solo con suplementos. Consulta para valorar las posibles causas.",
    followup: "Evalúa tu rutina durante varias semanas y observa la alimentación total, la progresión del entrenamiento, el descanso y la recuperación. Un único batido o una variación diaria del peso no permite concluir si el producto funciona.",
    evidence: "Los ensayos difieren en duración, entrenamiento, dieta de base y características de los participantes. Revisa qué resultado se midió y cuánto duró el estudio antes de traducirlo en una expectativa personal."
  },
  'que-pasa-si-dejas-de-tomar-la-proteina-de-suero': {
    excerpt: "Dejar el batido no elimina de golpe los progresos: lo importante es si mantienes suficiente proteína y energía con el resto de la dieta.",
    focus: "La proteína de suero no crea una dependencia fisiológica. Si la retiras, el resultado nutricional dependerá de si la sustituyes con alimentos u otras fuentes adecuadas y de cómo evolucione tu entrenamiento.",
    safety: "Si el suplemento formaba parte de una pauta clínica por una necesidad nutricional específica, consulta antes de cambiarla. En caso contrario, puedes revisar la alimentación completa para evitar que la retirada reduzca demasiado el aporte total.",
    followup: "Antes de dejarlo, identifica qué comidas pueden cubrir la proteína que aportaba el batido: por ejemplo, huevos, lácteos tolerados, legumbres, tofu, pescado o carne, según tus preferencias. No necesitas reemplazarlo por otro polvo automáticamente.",
    evidence: "Los cambios de composición corporal dependen de múltiples factores y no se pueden atribuir solo a dejar un producto. Diferencia los estudios sobre ingesta total de proteína de los que evalúan una marca o formulación concreta."
  },
  'alimentos-ricos-en-la-proteina-de-suero-frente-a-suplementos': {
    excerpt: "El suero procede de la leche y no es un alimento independiente que se encuentre en cualquier comida. Compara el batido con fuentes proteicas habituales.",
    focus: "La proteína de suero se obtiene durante el procesamiento de la leche para elaborar queso y otros productos. Para la dieta cotidiana, la comparación más útil es entre el batido y alimentos que aportan proteína, como yogur, queso fresco, huevos, legumbres, pescado, tofu o carnes.",
    safety: "Ten en cuenta alergias, tolerancia a la lactosa, preferencias culturales y necesidades médicas al elegir alimentos. Si debes seguir una dieta terapéutica, las sustituciones conviene revisarlas con el profesional que la indicó.",
    followup: "Prueba a calcular qué aporta una comida habitual antes de añadir un batido. La opción más práctica será la que encaje en tu horario, presupuesto y apetito sin desplazar innecesariamente otros alimentos variados.",
    evidence: "Los suplementos facilitan consumir una cantidad concentrada, pero no son automáticamente mejores que los alimentos. Al comparar estudios, distingue el efecto de la proteína total del efecto específico de una fuente o producto."
  },
  'deficiencia-de-la-proteina-de-suero-senales-y-evaluacion': {
    excerpt: "No existe una deficiencia clínica específica de «proteína de suero». Aprende a distinguir una ingesta proteica insuficiente de otros problemas de salud.",
    focus: "El suero es una fuente de proteína, no un nutriente esencial separado. La evaluación se centra en la ingesta total, el estado nutricional, los síntomas y el contexto médico; no en diagnosticar una carencia de una marca o ingrediente concreto.",
    safety: "La pérdida de peso involuntaria, la debilidad persistente, la hinchazón u otros síntomas merecen valoración clínica. No uses un batido como sustituto de una evaluación ni interpretes síntomas inespecíficos como prueba de que necesitas suero.",
    followup: "Si te preocupa tu alimentación, registra durante unos días las comidas y los cambios de apetito o peso, sin obsesionarte con cifras aisladas. Lleva esa información a un profesional para decidir si hace falta una evaluación nutricional.",
    evidence: "Los indicadores de desnutrición y la evaluación de la ingesta requieren contexto clínico. No confundas estudios sobre suplementación deportiva con pruebas diagnósticas de una deficiencia."
  },
  'la-proteina-de-suero-en-dietas-vegetarianas-y-veganas': {
    excerpt: "El suero es de origen lácteo: puede encajar en algunas dietas vegetarianas, pero no es vegano. Revisa alternativas según tus preferencias.",
    focus: "La proteína de suero procede de la leche y, por tanto, no es adecuada para una dieta vegana. Algunas personas vegetarianas que consumen lácteos pueden elegirla; otras prefieren fuentes como soja, guisante, arroz o mezclas vegetales.",
    safety: "Comprueba los ingredientes y el etiquetado si evitas productos animales, tienes alergia a la leche o sigues una dieta por motivos médicos. Las declaraciones «vegetal» o «sin lactosa» no sustituyen la revisión de la composición completa.",
    followup: "Si buscas una opción vegetal, compara proteína por ración, perfil de ingredientes, alérgenos y sabor, y considera también alimentos como legumbres, tofu, tempeh y bebidas de soja enriquecidas. No es obligatorio utilizar polvos para llevar una dieta vegetariana equilibrada.",
    evidence: "Las fuentes proteicas difieren en composición y digestibilidad, pero la adecuación depende de la ingesta total y de la variedad de la dieta. No extrapoles directamente resultados de un ensayo con suero a todos los productos vegetales."
  },
  'la-proteina-de-suero-durante-el-embarazo-y-la-lactancia': {
    excerpt: "Durante el embarazo y la lactancia, prioriza la alimentación y consulta antes de añadir un polvo con ingredientes o aditivos adicionales.",
    focus: "El hecho de que el suero proceda de la leche no convierte todos los suplementos comerciales en productos automáticamente adecuados para el embarazo o la lactancia. Importan la composición, la seguridad alimentaria y las necesidades individuales.",
    safety: "No empieces un suplemento deportivo durante el embarazo o la lactancia sin comentarlo con tu profesional sanitario. Revisa especialmente mezclas con estimulantes, hierbas, vitaminas añadidas o ingredientes cuya seguridad no esté clara.",
    followup: "Si te han recomendado aumentar la proteína, pregunta si puede cubrirse con alimentos o si existe una razón concreta para usar un suplemento. Lleva el envase o una foto completa de la etiqueta a la consulta.",
    evidence: "Los estudios en adultos deportistas no establecen por sí solos la seguridad de mezclas comerciales durante el embarazo o la lactancia. La ausencia de datos específicos no debe presentarse como prueba de seguridad."
  },
  'la-proteina-de-suero-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: "En personas mayores, el apetito, la actividad, la salud renal y la facilidad para comer influyen en si un batido resulta útil.",
    focus: "Un suplemento puede ser práctico cuando el apetito es bajo o cuesta cubrir las necesidades con comidas, pero no sustituye valorar la dieta, la función física, la salud dental y las enfermedades presentes.",
    safety: "Si hay enfermedad renal, dificultades para tragar, pérdida de peso involuntaria o una dieta prescrita, consulta antes de añadir proteína concentrada. Revisa también la tolerancia a la leche y los ingredientes de la fórmula.",
    followup: "Observa si el batido ayuda realmente a completar una comida o si desplaza alimentos que antes se consumían. Si existe fragilidad o pérdida de fuerza, una valoración nutricional y funcional es más útil que elegir un producto por publicidad.",
    evidence: "Los resultados de investigación dependen de la edad, el estado nutricional y el ejercicio realizado. No supongas que el mismo efecto se obtiene en todas las personas mayores ni que más proteína siempre sea mejor."
  },
  'mitos-sobre-la-proteina-de-suero-que-es-verdad-y-que-no': {
    excerpt: "¿Es imprescindible para ganar músculo? ¿Daña siempre los riñones? Repasamos afirmaciones frecuentes y qué se puede concluir realmente.",
    focus: "Un mito común es que el polvo tenga propiedades especiales que no puedan obtenerse con otros alimentos. El suero es una forma cómoda de aportar proteína, pero el resultado depende de la dieta total, el entrenamiento y la situación individual.",
    safety: "Evita tanto las promesas absolutas como el alarmismo. Si tienes una enfermedad renal, alergia a la leche u otra condición clínica, la respuesta adecuada depende de tu caso y no de una frase general en redes sociales.",
    followup: "Cuando encuentres una afirmación, pregunta qué población se estudió, qué producto se utilizó, con qué se comparó y qué resultado se midió. Las experiencias personales no bastan para establecer que un suplemento funcione para todo el mundo.",
    evidence: "Distingue estudios controlados, revisiones científicas y publicidad. Una mejora observada al añadir proteína no demuestra que el suero sea superior a todas las fuentes alimentarias en cualquier circunstancia."
  },
  'como-leer-la-etiqueta-de-la-proteina-de-suero': {
    excerpt: "Aprende a comparar gramos de proteína, tamaño de la porción, alérgenos y aditivos sin dejarte guiar solo por el frontal del envase.",
    focus: "El frontal puede destacar el peso total del envase o la cantidad de polvo por cacito, mientras que la tabla nutricional indica la proteína aportada. Busca también la lista de ingredientes, los alérgenos y las instrucciones de preparación.",
    safety: "Si tienes alergia a la leche, comprueba la declaración de alérgenos y no des por seguro un producto porque se anuncie como aislado. Si una etiqueta es confusa o no está disponible en un idioma que comprendas, elige una opción con información clara.",
    followup: "Compara dos productos usando la misma base —por ejemplo, proteína por 100 gramos y por ración— y anota los ingredientes añadidos. Revisa la fecha, el lote y la cantidad real que indica el cacito en lugar de estimarla a ojo.",
    evidence: "La etiqueta permite conocer la composición declarada, pero no demuestra por sí misma eficacia, necesidad o superioridad. Los sellos de calidad solo deben interpretarse según los análisis y criterios que realmente cubren."
  },
  'preguntas-frecuentes-sobre-la-proteina-de-suero-guia-para-principiantes': {
    excerpt: "Respuestas claras sobre qué es el whey, cómo se compara con la comida, qué mirar en la etiqueta y cuándo conviene pedir consejo.",
    focus: "Para empezar, identifica el motivo concreto por el que te interesa el suero: comodidad, recuperación, falta de apetito o dificultad para llegar a la proteína habitual. La respuesta cambia según la dieta y no todo el mundo necesita un suplemento.",
    safety: "Si tienes alergia a la leche, enfermedad renal, embarazo, lactancia o una dieta terapéutica, consulta antes de incorporar un producto nuevo. Ante síntomas persistentes, busca la causa en lugar de confiar solo en un batido.",
    followup: "Empieza por revisar tus comidas habituales y la etiqueta del producto que te planteas comprar. Si el objetivo es deportivo, considera también el entrenamiento y el descanso; si es clínico, pide orientación individual.",
    evidence: "Las respuestas generales describen tendencias, no garantizan resultados personales. Para valorar una afirmación concreta, revisa el tipo de estudio, la población y el desenlace medido."
  },
  'que-es-la-proteina-vegetal-en-polvo-y-para-que-sirve': {
    excerpt: "La proteína vegetal en polvo concentra fuentes como guisante, soja o arroz. Descubre para qué se usa y qué revisar antes de elegirla.",
    focus: "Estos productos se elaboran con proteínas extraídas o concentradas de plantas, a menudo guisante, soja, arroz o mezclas. Su utilidad principal es aportar proteína de forma práctica cuando encaja mejor que preparar una comida completa.",
    safety: "Comprueba los alérgenos, los ingredientes añadidos y las instrucciones de uso. Si tienes enfermedad renal, una necesidad dietética clínica o estás embarazada o en lactancia, consulta antes de utilizar mezclas deportivas de composición compleja.",
    followup: "Lee qué fuente vegetal contiene el producto y cuántos gramos de proteína aporta la ración. Decide después si te resulta necesario: legumbres, tofu, tempeh, frutos secos y otros alimentos también contribuyen al aporte diario.",
    evidence: "No todos los polvos vegetales tienen la misma composición ni se pueden considerar equivalentes. Valora el producto concreto y la dieta completa en lugar de asumir que una etiqueta «plant-based» predice un resultado."
  },
  'beneficios-de-la-proteina-vegetal-en-polvo-que-dice-la-evidencia': {
    excerpt: "La evidencia depende de la fuente, la cantidad total de proteína y el entrenamiento. Separamos los posibles beneficios de las promesas comerciales.",
    focus: "La proteína vegetal en polvo puede facilitar el aporte proteico, especialmente cuando hay restricciones alimentarias o poco tiempo para cocinar. No es un beneficio exclusivo de los polvos: el contexto de la dieta sigue siendo determinante.",
    safety: "No interpretes un reclamo sobre fuerza, recuperación o control del peso como garantía. Si buscas corregir una pérdida de peso, debilidad u otro problema de salud, consulta en lugar de usar el suplemento como tratamiento.",
    followup: "Al evaluar una afirmación, identifica qué fuente se investigó —soja, guisante, arroz o una mezcla— y qué comparador se utilizó. Después comprueba si el resultado se relaciona con tu objetivo real.",
    evidence: "Los ensayos varían en cantidad, duración, participantes y programa de ejercicio. Los resultados de una formulación no se trasladan automáticamente a cualquier mezcla vegetal ni prueban que sea superior a una dieta variada."
  },
  'efectos-secundarios-de-la-proteina-vegetal-en-polvo': {
    excerpt: "Gases, molestias digestivas y alérgenos pueden variar según la fuente y los aditivos. Aprende qué revisar y cuándo buscar atención.",
    focus: "La tolerancia puede cambiar según el ingrediente principal, la cantidad tomada de una vez y componentes añadidos como edulcorantes o fibras. Si notas molestias, revisa la fórmula completa antes de atribuirlas a todas las proteínas vegetales.",
    safety: "Ante una reacción con hinchazón de labios o lengua, dificultad respiratoria o desmayo, busca atención urgente. Si los síntomas digestivos persisten, suspende el producto sospechoso y consulta; no sigas probando mezclas si sospechas una alergia.",
    followup: "Comprueba si el producto contiene soja, guisante u otros ingredientes a los que puedas reaccionar, y registra cuándo aparecen las molestias. No hagas una reintroducción deliberada tras una reacción alérgica importante.",
    evidence: "Los efectos adversos dependen de la fuente, la dosis y los ingredientes añadidos. No asumas que todos los productos vegetales comparten el mismo perfil de tolerancia ni que «natural» significa libre de riesgos."
  },
  'como-tomar-la-proteina-vegetal-en-polvo-correctamente': {
    excerpt: "Prepara la ración según la etiqueta y úsala para complementar la dieta, no como sustituto automático de comidas variadas.",
    focus: "El modo de preparación depende de la formulación y de las instrucciones del fabricante. Puede mezclarse con agua o con una bebida adecuada, o añadirse a alimentos; lo esencial es medir la ración y contarla dentro de la alimentación total.",
    safety: "No aumentes la cantidad por pensar que más polvo produce más beneficio. Si tienes una pauta médica, alergias alimentarias o dificultad para tragar, revisa los ingredientes y el uso con un profesional.",
    followup: "Prueba una preparación sencilla y observa la textura y tolerancia. Si el batido reemplaza con frecuencia una comida, comprueba que el resto de la dieta siga aportando energía, fibra, grasas y micronutrientes, además de proteína.",
    evidence: "La forma de tomar el polvo no compensa una ingesta global inadecuada ni sustituye el entrenamiento cuando ese es el objetivo. Las recomendaciones deben distinguir entre comodidad de uso y resultados demostrados."
  },
  'cuando-tomar-la-proteina-vegetal-en-polvo-manana-o-noche': {
    excerpt: "No hay una hora obligatoria para tomar proteína vegetal: importan el aporte diario, la distribución de las comidas y tu rutina.",
    focus: "El desayuno, una merienda o una comida posterior al entrenamiento pueden ser momentos prácticos, pero ninguno es universalmente correcto. Elige un horario que ayude a completar la dieta sin desplazar comidas que disfrutas o necesitas.",
    safety: "Si tienes una pauta nutricional por enfermedad o necesidades especiales, sigue la orientación individual en vez de aplicar reglas generales de horario. Si el batido nocturno te produce molestias, prueba otra hora o revisa los ingredientes.",
    followup: "Piensa en qué momento del día te resulta más difícil comer suficiente proteína y valora si el polvo resuelve ese problema. La constancia y la ingesta total suelen ser más relevantes que acertar con una ventana horaria exacta.",
    evidence: "Los estudios sobre el momento de la proteína deben interpretarse junto con la ingesta diaria, el entrenamiento y la duración. No demuestran que exista una hora única que funcione mejor para todas las personas."
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
