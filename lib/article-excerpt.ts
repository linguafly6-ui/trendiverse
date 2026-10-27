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
  },
  'dosis-de-la-proteina-vegetal-en-polvo-como-interpretar-las-recomendaciones': {
    excerpt: "La porción de polvo no equivale siempre a la cantidad de proteína. Aprende a comparar gramos, mezclas vegetales y necesidades de la dieta.",
    focus: "Mira primero la proteína por ración y la fuente principal —guisante, soja, arroz u otra—, no solo el peso del cacito. Las mezclas pueden incluir aromas, espesantes y otros ingredientes que cambian el peso total.",
    safety: "No conviertas una cifra de un estudio deportivo en una pauta para todo el mundo. Si tienes enfermedad renal, una dieta terapéutica, embarazo o necesidades nutricionales específicas, acuerda el aporte total con un profesional sanitario.",
    followup: "Para valorar el producto, anota la proteína por ración, el tamaño de la porción y cuánto aportan tus comidas habituales. Así podrás decidir si el polvo cubre una necesidad real o solo añade una toma más.",
    evidence: "Los estudios difieren en la fuente vegetal, la cantidad, la duración y la dieta de base. Antes de trasladar sus resultados, comprueba qué producto se investigó y qué resultado se midió."
  },
  'quien-deberia-evitar-la-proteina-vegetal-en-polvo': {
    excerpt: "Alergias a soja, guisante u otros ingredientes y ciertas condiciones médicas requieren revisar la fórmula antes de usarla.",
    focus: "«Vegetal» no significa que un producto esté libre de alérgenos. Las fórmulas pueden contener soja, legumbres, aromas, edulcorantes u otros componentes, y la tolerancia depende de la composición concreta.",
    safety: "Si tienes una alergia alimentaria diagnosticada, comprueba los ingredientes y las advertencias de contaminación cruzada antes de consumirlo. Con enfermedad renal, embarazo, lactancia o una dieta clínica, consulta antes de añadir una fuente concentrada de proteína.",
    followup: "Guarda una foto de la lista de ingredientes y del apartado de alérgenos. Si aparecen hinchazón de labios o lengua, dificultad respiratoria o desmayo tras tomarlo, busca atención urgente.",
    evidence: "La tolerancia y la seguridad no pueden inferirse solo por el origen vegetal. Los datos sobre una proteína concreta no garantizan que todas las mezclas comerciales sean adecuadas para cada persona."
  },
  'interacciones-de-la-proteina-vegetal-en-polvo-con-medicamentos': {
    excerpt: "No existe una interacción universal para todos los polvos vegetales. Revisa ingredientes, dieta prescrita y horario de medicación con un profesional.",
    focus: "Un polvo proteico suele funcionar como alimento concentrado, pero puede modificar la dieta prescrita o añadir minerales y otros ingredientes. Por eso conviene revisar el producto completo, no solo su nombre comercial.",
    safety: "No cambies horarios ni suspendas medicamentos por tu cuenta para incorporar un batido. Si tomas medicación con instrucciones relacionadas con comidas o sigues una dieta terapéutica, pregunta al médico o farmacéutico sobre el producto específico.",
    followup: "Lleva el envase o una foto legible de la etiqueta y la lista de tus medicamentos a la consulta. Incluye también otros suplementos y productos enriquecidos para que la revisión tenga en cuenta el conjunto.",
    evidence: "Las afirmaciones sobre interacciones requieren datos del ingrediente y del medicamento concretos. No deduzcas que existe una interacción —ni que no existe— a partir de estudios generales sobre proteínas vegetales."
  },
  'como-elegir-un-suplemento-de-la-proteina-vegetal-en-polvo-de-calidad': {
    excerpt: "Compara la fuente vegetal, la proteína por ración, los alérgenos y los controles de calidad antes de decidirte.",
    focus: "Empieza por identificar si el producto se basa en soja, guisante, arroz u otra fuente, y revisa los gramos de proteína por porción. Después comprueba los ingredientes añadidos, la información del fabricante y las advertencias.",
    safety: "Desconfía de promesas de tratar enfermedades o transformar el cuerpo sin cambios de alimentación y entrenamiento. Si tienes alergias, no des por segura una mezcla porque se anuncie como «natural» o «plant-based».",
    followup: "Compara productos usando la misma medida: proteína por 100 gramos y por ración, además del coste por cantidad de proteína. Revisa lote, fecha de consumo preferente y si los análisis independientes anunciados son verificables.",
    evidence: "Un control de calidad puede aportar información sobre determinados contaminantes o composición, pero no demuestra que el suplemento sea necesario ni que produzca resultados excepcionales."
  },
  'la-proteina-vegetal-en-polvo-polvo-capsulas-o-comprimidos': {
    excerpt: "El polvo permite aportar una cantidad considerable por toma; cápsulas y comprimidos pueden requerir muchas unidades para igualarla.",
    focus: "En proteína vegetal, el polvo suele ser el formato más práctico para aportar varios gramos en una toma. Las cápsulas y comprimidos pueden contener cantidades pequeñas, así que conviene calcular cuántas unidades harían falta para igualar una ración.",
    safety: "Revisa excipientes, alérgenos, tamaño de las unidades e instrucciones del fabricante. Si tienes dificultades para tragar comprimidos o sigues restricciones dietéticas, prioriza un formato que puedas utilizar con seguridad.",
    followup: "Compara el coste por 20 gramos de proteína —o por la cantidad que indique la etiqueta—, no por número de cápsulas ni por tamaño del bote. Considera también el sabor, la preparación y la facilidad para medir la porción.",
    evidence: "La presentación comercial no determina por sí sola el efecto. Para comparar productos, importa la cantidad y composición de proteína realmente consumida y el contexto de la dieta."
  },
  'cuanto-tarda-en-hacer-efecto-la-proteina-vegetal-en-polvo': {
    excerpt: "Tomar proteína aumenta la ingesta de inmediato, pero los cambios físicos dependen de la dieta, el entrenamiento y el tiempo.",
    focus: "Conviene separar el hecho inmediato de consumir proteína de los objetivos a medio plazo, como recuperación o cambios en masa muscular. No hay un plazo fijo en el que todo el mundo deba notar un resultado visible.",
    safety: "La debilidad persistente, la pérdida de peso involuntaria o el cansancio no prueban que falte proteína. Si estos síntomas continúan, busca una evaluación en vez de aumentar suplementos sin conocer la causa.",
    followup: "Observa la rutina durante varias semanas y ten en cuenta comidas, entrenamiento, descanso y recuperación. Un cambio puntual en el peso o las sensaciones de un día no permite juzgar si el producto es eficaz.",
    evidence: "Los ensayos pueden usar fuentes vegetales distintas, diferentes cantidades y programas de ejercicio. Comprueba la duración, los participantes y el resultado medido antes de aplicar las conclusiones a tu caso."
  },
  'que-pasa-si-dejas-de-tomar-la-proteina-vegetal-en-polvo': {
    excerpt: "Dejar el batido no implica perder progresos de golpe: importa cómo cubres la proteína y la energía con el resto de la alimentación.",
    focus: "La proteína vegetal en polvo no genera dependencia. Si dejas de tomarla, el efecto nutricional dependerá de si las comidas siguen aportando suficiente proteína y energía para tus necesidades.",
    safety: "Si el producto forma parte de un plan nutricional indicado por un profesional, consulta antes de modificarlo. Si lo usabas por comodidad, revisa la dieta completa para que la retirada no reduzca sin querer tu ingesta total.",
    followup: "Piensa en fuentes que encajen con tus preferencias, como legumbres, tofu, tempeh, soja, frutos secos y cereales. No es obligatorio sustituir un polvo por otro: la decisión depende de lo que ya comes.",
    evidence: "Los cambios en fuerza o composición corporal dependen de muchos factores y no se pueden atribuir solo a retirar un suplemento. Distingue los estudios sobre ingesta total de los que evalúan una formulación específica."
  },
  'alimentos-ricos-en-la-proteina-vegetal-en-polvo-frente-a-suplementos': {
    excerpt: "Legumbres, tofu, tempeh, frutos secos y cereales aportan proteína sin necesidad de recurrir siempre a un polvo.",
    focus: "La proteína vegetal en polvo concentra ingredientes derivados de plantas, pero la alimentación cotidiana ofrece muchas fuentes proteicas: lentejas, garbanzos, alubias, soja, tofu, tempeh, frutos secos y algunos cereales.",
    safety: "La elección debe considerar alergias, tolerancia digestiva, preferencias y necesidades médicas. Si sigues una dieta terapéutica o tienes una enfermedad que exige ajustar nutrientes, revisa los cambios con el profesional que te atiende.",
    followup: "Antes de comprar un suplemento, mira qué aportan tus comidas habituales y qué momentos te resultan difíciles. Una comida preparada o una opción sencilla de legumbres puede ser igual de práctica para algunas personas.",
    evidence: "Los polvos facilitan consumir proteína concentrada, pero no son automáticamente superiores a los alimentos. La comparación debe tener en cuenta la dieta total, la variedad y los objetivos concretos."
  },
  'deficiencia-de-la-proteina-vegetal-en-polvo-senales-y-evaluacion': {
    excerpt: "No existe una carencia clínica de «proteína en polvo». La evaluación se centra en la ingesta total y el estado nutricional.",
    focus: "La proteína vegetal en polvo es una forma de aportar proteína, no un nutriente separado cuya ausencia produzca una deficiencia específica. Lo relevante es la cantidad total de proteína y energía, la variedad de la dieta y el contexto de salud.",
    safety: "La pérdida de peso involuntaria, la debilidad persistente o los cambios importantes de apetito merecen valoración clínica. No interpretes esos síntomas como prueba de que necesitas un polvo vegetal concreto.",
    followup: "Si te preocupa tu alimentación, anota de forma orientativa qué comes y cualquier cambio de apetito o peso, sin sacar conclusiones de un solo día. Un profesional puede decidir si hace falta una evaluación nutricional.",
    evidence: "La desnutrición y la ingesta insuficiente se evalúan con contexto clínico y dietético. Los ensayos deportivos sobre suplementos no son pruebas diagnósticas de una deficiencia."
  },
  'la-proteina-vegetal-en-polvo-en-dietas-vegetarianas-y-veganas': {
    excerpt: "Puede ser una opción práctica, pero no es imprescindible: compara mezclas y prioriza la variedad de fuentes vegetales.",
    focus: "Los polvos vegetales pueden encajar en dietas vegetarianas y veganas, aunque no son un requisito para comer suficiente proteína. La soja, las legumbres, el tofu, el tempeh, los frutos secos y los cereales también contribuyen al aporte diario.",
    safety: "Comprueba la fuente principal y los alérgenos, especialmente en mezclas de varias proteínas. Si tienes necesidades clínicas, embarazo, lactancia o dudas sobre la suficiencia de tu dieta, solicita orientación individual.",
    followup: "Elige el producto por composición, sabor, precio y utilidad real, no solo porque lleve una etiqueta vegana. Considera primero si tus comidas habituales ya cubren las necesidades y qué variedad puedes mantener a largo plazo.",
    evidence: "Las fuentes vegetales difieren en composición y digestibilidad, pero la adecuación depende de la cantidad total y de la variedad dietética. No todos los productos vegetales son equivalentes entre sí."
  },
  'la-proteina-vegetal-en-polvo-durante-el-embarazo-y-la-lactancia': {
    excerpt: "Durante el embarazo y la lactancia, revisa la fórmula completa y consulta antes de incorporar mezclas deportivas o ingredientes añadidos.",
    focus: "Que la proteína proceda de plantas no garantiza que cualquier mezcla comercial sea adecuada en embarazo o lactancia. Importan la seguridad de los ingredientes, los aditivos y las necesidades nutricionales individuales.",
    safety: "No empieces un suplemento deportivo durante el embarazo o la lactancia sin comentarlo con tu profesional sanitario. Revisa especialmente mezclas con hierbas, estimulantes, vitaminas añadidas o ingredientes cuya seguridad no esté clara.",
    followup: "Si te han recomendado aumentar la proteína, pregunta si puede cubrirse con alimentos o si existe una razón concreta para usar un suplemento. Lleva la etiqueta completa a la consulta.",
    evidence: "Los estudios en adultos deportistas no establecen por sí solos la seguridad de todas las mezclas durante el embarazo o la lactancia. La falta de datos específicos no debe presentarse como prueba de seguridad."
  },
  'la-proteina-vegetal-en-polvo-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: "El apetito, la facilidad para comer, la actividad y la salud renal influyen en si un batido resulta útil en personas mayores.",
    focus: "Un polvo proteico puede resultar práctico si cuesta cubrir las necesidades con las comidas, pero conviene valorar primero el apetito, la capacidad para masticar y tragar, la actividad física y el estado nutricional.",
    safety: "Si hay enfermedad renal, dificultad para tragar, pérdida de peso involuntaria o una dieta prescrita, consulta antes de añadir proteína concentrada. Comprueba también la tolerancia y los ingredientes del producto.",
    followup: "Observa si el batido complementa las comidas o acaba sustituyendo alimentos variados. Ante fragilidad o pérdida de fuerza, una valoración nutricional y funcional ayuda más que elegir por publicidad.",
    evidence: "Los resultados dependen de la edad, el estado nutricional, la fuente proteica y el ejercicio. No supongas que todas las personas mayores necesitan el mismo aporte o se benefician del mismo producto."
  },
  'mitos-sobre-la-proteina-vegetal-en-polvo-que-es-verdad-y-que-no': {
    excerpt: "¿Las proteínas vegetales son siempre incompletas? ¿Un polvo es imprescindible para ganar músculo? Revisamos los matices de la evidencia.",
    focus: "Las proteínas vegetales no son todas iguales, pero tampoco puede juzgarse una dieta por un único ingrediente aislado. La variedad de alimentos y la ingesta total importan más que una etiqueta que prometa una solución sencilla.",
    safety: "Evita las afirmaciones absolutas, tanto las promesas de resultados garantizados como el alarmismo. Si tienes una condición médica o una necesidad nutricional específica, las decisiones deben adaptarse a tu caso.",
    followup: "Ante una afirmación, pregunta qué fuente vegetal se estudió, con qué se comparó y qué resultado se midió. Las experiencias personales y los mensajes de marketing no bastan para establecer una regla general.",
    evidence: "Los ensayos de soja, guisante, arroz o mezclas no son automáticamente intercambiables. Revisa el diseño y la población antes de extrapolar los resultados a cualquier producto vegetal."
  },
  'como-leer-la-etiqueta-de-la-proteina-vegetal-en-polvo': {
    excerpt: "Identifica la fuente vegetal, los gramos de proteína por ración, los alérgenos y los ingredientes añadidos antes de comparar envases.",
    focus: "El frontal del envase puede destacar el peso total del polvo, pero la tabla nutricional ayuda a ver cuánta proteína aporta una porción. Busca además la fuente principal, los ingredientes, los alérgenos y las instrucciones de uso.",
    safety: "Si tienes alergia a soja, legumbres u otros ingredientes, comprueba la declaración de alérgenos y las advertencias del fabricante. El término «vegetal» no garantiza que la fórmula sea adecuada para todas las personas.",
    followup: "Compara productos por proteína por 100 gramos y por ración, y revisa si incluyen edulcorantes, fibras o mezclas adicionales. Comprueba lote, fecha de consumo preferente y que las instrucciones sean claras.",
    evidence: "La etiqueta permite conocer la composición declarada, pero no demuestra necesidad ni eficacia. Los sellos o certificados solo informan sobre los criterios concretos que verifican."
  },
  'preguntas-frecuentes-sobre-la-proteina-vegetal-en-polvo-guia-para-principiantes': {
    excerpt: "Qué contiene, cómo elegir una mezcla, si hace falta tomarla y qué alternativas alimentarias considerar antes de comprar.",
    focus: "Empieza por definir por qué te interesa el polvo: comodidad, preferencias veganas, entrenamiento o dificultad para llegar a la proteína habitual. La utilidad depende de la dieta y no todo el mundo necesita suplementar.",
    safety: "Si tienes alergias alimentarias, enfermedad renal, embarazo, lactancia o una dieta terapéutica, consulta antes de incorporar un producto nuevo. Los síntomas persistentes requieren valorar su causa, no confiar solo en un batido.",
    followup: "Revisa la fuente proteica, la cantidad por ración y la lista de ingredientes. Compara después con lo que ya comes y decide si el suplemento resuelve una necesidad práctica.",
    evidence: "Las respuestas generales describen tendencias, no garantizan resultados individuales. Para valorar una afirmación, revisa el producto estudiado, la población y el resultado medido."
  },
  'que-es-el-colageno-y-para-que-sirve': {
    excerpt: "El colágeno es una proteína estructural del cuerpo y los suplementos suelen aportar péptidos derivados de fuentes animales. Esto es lo que conviene saber.",
    focus: "El colágeno forma parte de tejidos como piel, cartílago, tendones y huesos. Los suplementos suelen contener colágeno hidrolizado o péptidos, pero consumirlos no significa que se incorporen directamente al tejido que se desea mejorar.",
    safety: "Revisa el origen del producto —por ejemplo, bovino, porcino, pescado u otras fuentes— si tienes alergias, restricciones dietéticas o motivos religiosos. Consulta antes de usarlo para tratar una enfermedad o si sigues una pauta médica específica.",
    followup: "Antes de comprar, define el objetivo y revisa la etiqueta: tipo de colágeno, cantidad por ración, otros ingredientes y alérgenos. Ten en cuenta también que una alimentación suficiente y variada aporta los nutrientes necesarios para mantener los tejidos.",
    evidence: "Los resultados deben evaluarse por objetivo y formulación. Un estudio sobre una preparación concreta no demuestra que todos los suplementos de colágeno produzcan el mismo efecto ni que sustituyan un tratamiento."
  },
  'beneficios-del-colageno-que-dice-la-evidencia': {
    excerpt: "Los estudios sobre piel, articulaciones y otros objetivos no ofrecen una respuesta única. Separamos resultados preliminares de promesas comerciales.",
    focus: "El colágeno se comercializa para objetivos distintos, como apariencia de la piel o molestias articulares. Cada objetivo requiere valorar estudios específicos y no debe suponerse que un resultado en un área se repita en otra.",
    safety: "No uses el colágeno como sustituto de una evaluación médica ante dolor persistente, lesiones o cambios importantes en la piel. Revisa también el origen animal y los ingredientes añadidos si tienes alergias o restricciones alimentarias.",
    followup: "Cuando evalúes un producto, busca qué formulación y cantidad se estudió, durante cuánto tiempo y qué resultado se midió. Evita decidir solo por testimonios, fotos promocionales o promesas de cambios rápidos.",
    evidence: "La evidencia puede variar según la indicación, la calidad del ensayo y la preparación utilizada. Distingue resultados modestos o inciertos de afirmaciones de eficacia garantizada."
  },
  'efectos-secundarios-del-colageno': {
    excerpt: "La tolerancia digestiva, el origen del colágeno y los ingredientes añadidos importan. Aprende qué señales no debes pasar por alto.",
    focus: "Algunas personas pueden notar molestias digestivas o rechazo al sabor, y las fórmulas comerciales pueden incluir edulcorantes, aromas u otros componentes. No todas las molestias se deben necesariamente al colágeno en sí.",
    safety: "Comprueba el origen del producto si tienes alergia al pescado u otras fuentes animales. Si aparece una reacción alérgica, suspende el producto; ante dificultad respiratoria, hinchazón de lengua o desmayo, busca atención urgente.",
    followup: "Anota la marca, la composición y cuándo aparecieron los síntomas, y evita probar otra fórmula por tu cuenta si sospechas una alergia. Si las molestias persisten, consulta a un profesional sanitario.",
    evidence: "La seguridad debe valorarse para la formulación y la población concretas. Que un ingrediente se venda como suplemento no significa que esté libre de efectos adversos o sea adecuado para todo el mundo."
  },
  'como-tomar-el-colageno-correctamente': {
    excerpt: "La cantidad y la forma de uso dependen de la formulación. Aprende a seguir la etiqueta sin asumir que una dosis sirve para todos.",
    focus: "Los suplementos de colágeno pueden presentarse en polvo, cápsulas o bebidas, y la cantidad por ración varía mucho. Sigue las instrucciones del producto concreto y evita combinar varias fórmulas sin calcular los ingredientes compartidos.",
    safety: "No aumentes la cantidad para acelerar resultados ni lo utilices como tratamiento único para una enfermedad. Si estás embarazada, en lactancia, tomas medicación o tienes una condición médica, consulta antes de empezar.",
    followup: "Comprueba cuántos gramos o miligramos aporta la porción, de qué fuente procede y si incorpora vitaminas, minerales u otros ingredientes. Mantén expectativas realistas y revisa si el uso encaja con tu objetivo.",
    evidence: "Los estudios utilizan formulaciones y pautas distintas. Una cantidad empleada en una investigación no constituye automáticamente una recomendación universal para cualquier producto comercial."
  },
  'cuando-tomar-el-colageno-manana-o-noche': {
    excerpt: "No hay una hora universal para el colágeno. La regularidad, la formulación y el objetivo importan más que elegir mañana o noche.",
    focus: "Tomarlo en el desayuno o por la noche puede ser una cuestión de rutina y tolerancia. No hay que asumir que el cuerpo solo lo aprovecha en una franja horaria concreta sin evidencia específica para esa afirmación.",
    safety: "Sigue las instrucciones de la etiqueta y las recomendaciones de tu profesional sanitario si el producto forma parte de un plan clínico. Si te causa molestias digestivas, revisa los ingredientes y considera consultarlo antes de cambiar la pauta.",
    followup: "Elige un momento que puedas mantener sin complicar las comidas ni el descanso. Registra el producto y la cantidad que tomas, y evalúa el objetivo con expectativas realistas en vez de atribuir cada cambio a la hora de consumo.",
    evidence: "Para valorar el horario, revisa si los estudios compararon directamente mañana y noche o solo estudiaron el uso general. La evidencia sobre una formulación no prueba que exista una hora óptima para todos."
  },
  'dosis-del-colageno-como-interpretar-las-recomendaciones': {
    excerpt: "Las cantidades varían según el tipo de colágeno y la formulación. Aprende a leer la etiqueta sin convertir una cifra comercial en una pauta universal.",
    focus: "Las etiquetas pueden expresar la cantidad en gramos o miligramos y añadir otros componentes a la fórmula. Antes de comparar cifras, identifica el tipo de colágeno, el tamaño de la porción y si la cantidad se refiere al ingrediente principal o a toda la mezcla.",
    safety: "No aumentes la cantidad por tu cuenta para acelerar resultados. Si tienes una condición médica, estás embarazada o en lactancia, o tomas medicación habitual, consulta antes de iniciar un suplemento nuevo.",
    followup: "Anota el tipo de colágeno, la cantidad por porción y los ingredientes adicionales. Si un profesional te ha recomendado usarlo, confirma con él qué producto y objetivo se están considerando.",
    evidence: "Los estudios pueden usar fuentes, formas y cantidades distintas. Una dosis empleada en un ensayo no se convierte automáticamente en recomendación universal para todas las marcas."
  },
  'quien-deberia-evitar-el-colageno': {
    excerpt: "El origen animal, las alergias, los ingredientes añadidos y algunas situaciones clínicas hacen importante revisar el producto antes de usarlo.",
    focus: "El colágeno suplementario suele proceder de fuentes animales, como pescado, bovino o porcino. La elección no depende solo del objetivo anunciado: también cuentan las alergias, las restricciones dietéticas y la composición completa.",
    safety: "Si tienes alergia al pescado u otra fuente indicada en la etiqueta, no pruebes el producto sin verificar su seguridad. Durante el embarazo, la lactancia o si tienes una enfermedad crónica, consulta antes de añadir mezclas de suplementación.",
    followup: "Comprueba la especie de origen, los alérgenos y todos los ingredientes. Si buscas tratar dolor persistente, una lesión o cambios cutáneos importantes, solicita evaluación sanitaria en vez de confiar solo en el suplemento.",
    evidence: "Los resultados en adultos sanos no establecen automáticamente la seguridad o utilidad para personas con enfermedades específicas. Valora la evidencia según la población y la formulación estudiadas."
  },
  'interacciones-del-colageno-con-medicamentos': {
    excerpt: "La composición del producto y tu tratamiento concreto importan más que las afirmaciones generales sobre interacciones con colágeno.",
    focus: "El colágeno es un ingrediente proteico, pero muchos suplementos combinan péptidos con vitaminas, minerales, extractos o saborizantes. Por eso, cualquier revisión debe incluir la fórmula completa y no solo la palabra «colágeno».",
    safety: "No suspendas ni cambies el horario de tus medicamentos para incorporar un suplemento. Si tomas medicación de forma habitual o tienes una condición crónica, consulta con tu farmacéutico o profesional sanitario con la etiqueta a mano.",
    followup: "Lleva el nombre del producto, los ingredientes y la lista de medicamentos a la consulta. Incluye otros suplementos que uses, ya que podrían repetir vitaminas o minerales presentes en la fórmula.",
    evidence: "Las interacciones deben evaluarse para ingredientes y fármacos concretos. No concluyas que una combinación es segura o peligrosa solo por información general sobre suplementos proteicos."
  },
  'como-elegir-un-suplemento-del-colageno-de-calidad': {
    excerpt: "Compara la fuente, el tipo de colágeno, la cantidad por ración y los ingredientes añadidos antes de dejarte guiar por promesas de marketing.",
    focus: "Una etiqueta útil identifica el origen, la forma del colágeno, la cantidad por porción y el resto de ingredientes. Comprueba también si las afirmaciones comerciales explican qué objetivo concreto pretenden abordar.",
    safety: "Desconfía de promesas de curar enfermedades, eliminar arrugas o garantizar alivio del dolor. Si tienes alergias, revisa la fuente animal y los posibles alérgenos; «natural» no significa libre de riesgos.",
    followup: "Compara la misma cantidad de ingrediente por ración y revisa el lote, la fecha y la información del fabricante. Si se anuncian pruebas independientes, comprueba qué analizan y qué aspectos dejan fuera.",
    evidence: "Un certificado puede verificar criterios específicos de calidad, pero no demuestra por sí mismo que el producto sea necesario o que cumpla todas las promesas publicitarias."
  },
  'el-colageno-polvo-capsulas-o-comprimidos': {
    excerpt: "El formato afecta a la comodidad y a la cantidad por toma. Compara gramos por porción y excipientes, no solo el tamaño del envase.",
    focus: "El polvo suele permitir ajustar la cantidad con facilidad, mientras que las cápsulas o comprimidos aportan una cantidad limitada por unidad. Las bebidas listas para tomar pueden incluir ingredientes adicionales, así que conviene comparar la fórmula completa.",
    safety: "Revisa el tamaño de las unidades, los excipientes y los alérgenos. Si te cuesta tragar comprimidos o debes limitar determinados ingredientes, elige el formato con ayuda profesional si tienes dudas.",
    followup: "Calcula el coste por la misma cantidad de colágeno y comprueba cuántas cápsulas se necesitarían para alcanzar la porción declarada. Ten en cuenta también la facilidad de preparación y la tolerancia al sabor.",
    evidence: "No hay que asumir que cápsulas, polvo y bebidas produzcan el mismo efecto solo porque anuncien el mismo ingrediente. La equivalencia depende de la formulación, la cantidad y la evidencia disponible."
  },
  'cuanto-tarda-en-hacer-efecto-el-colageno': {
    excerpt: "Los posibles cambios dependen del objetivo, la formulación y el tiempo de uso. No existe un plazo garantizado que sirva para todas las personas.",
    focus: "El colágeno se consume con objetivos diferentes, desde la apariencia de la piel hasta las molestias articulares. Cada resultado necesita medirse de forma distinta, y notar o no un cambio en pocos días no basta para juzgar el producto.",
    safety: "No retrases la evaluación de dolor persistente, lesiones o cambios cutáneos importantes por esperar a que un suplemento haga efecto. Busca consejo sanitario si el problema continúa o empeora.",
    followup: "Define de antemano qué resultado quieres observar y en qué periodo tendría sentido revisarlo. Evita cambiar varias cosas a la vez si intentas valorar el efecto y no interpretes variaciones normales como una prueba concluyente.",
    evidence: "Los ensayos varían en duración, formulación, participantes y resultados medidos. Comprueba esos detalles antes de trasladar a tu caso el plazo anunciado en una publicidad."
  },
  'que-pasa-si-dejas-de-tomar-el-colageno': {
    excerpt: "Dejar el suplemento no provoca una retirada conocida como la de ciertos medicamentos. Lo importante es por qué lo tomabas y qué resultado buscabas.",
    focus: "El colágeno no se considera una sustancia que genere dependencia. Si dejas de tomarlo, no hay que asumir que aparecerá un efecto rebote; los cambios dependerán del objetivo, la evolución natural y otros factores.",
    safety: "Si lo usabas por recomendación sanitaria dentro de un plan concreto, pregunta antes de modificar ese plan. No suspendas tratamientos indicados ni sustituyas la atención clínica por un suplemento.",
    followup: "Revisa si el producto te aportaba un beneficio claro, si tolerabas bien la fórmula y si el coste compensa. Si no observas mejoras o los síntomas persisten, comenta alternativas con un profesional.",
    evidence: "Los datos sobre el uso continuado no permiten predecir lo que ocurrirá a cada persona al dejarlo. Distingue la evolución del problema de salud del simple hecho de interrumpir el suplemento."
  },
  'alimentos-ricos-en-el-colageno-frente-a-suplementos': {
    excerpt: "Caldo elaborado con huesos y tejidos animales puede contener gelatina y colágeno, pero la dieta también aporta los nutrientes necesarios para sintetizarlo.",
    focus: "El colágeno se encuentra en tejidos animales y sus preparaciones, como gelatina o algunos caldos, pueden contener cantidades variables. El cuerpo también produce colágeno utilizando aminoácidos y nutrientes de una dieta suficiente y variada.",
    safety: "No sustituyas comidas completas por caldos o suplementos como estrategia única. Si tienes restricciones dietéticas, alergias o una enfermedad que requiera ajustar la alimentación, revisa las opciones con un profesional.",
    followup: "Compara el papel del producto con tu dieta habitual: alimentos proteicos, frutas, verduras y otras fuentes de nutrientes. No existe obligación de tomar colágeno en polvo para mantener una alimentación equilibrada.",
    evidence: "La presencia de colágeno en un alimento no demuestra que consumirlo produzca el mismo efecto que una formulación estudiada. La evidencia depende de la preparación, la cantidad y el objetivo evaluado."
  },
  'deficiencia-del-colageno-senales-y-evaluacion': {
    excerpt: "No hay una prueba casera sencilla que diagnostique una «deficiencia de colágeno». Los síntomas relacionados con piel o articulaciones pueden tener muchas causas.",
    focus: "El colágeno es una proteína estructural del organismo, pero no suele evaluarse una supuesta carencia mediante un síntoma aislado. La valoración depende de la historia clínica, la exploración y la causa posible de las molestias.",
    safety: "Dolor persistente, problemas de movilidad, heridas que no cicatrizan o cambios importantes en la piel merecen valoración profesional. No te autodiagnostiques ni uses suplementos como sustituto de pruebas indicadas.",
    followup: "Anota cuándo comenzaron los síntomas, qué los empeora y qué otros cambios has notado. Esa información puede ayudar a la consulta mucho más que asumir que el problema se debe a falta de colágeno.",
    evidence: "Los estudios sobre suplementos para objetivos concretos no constituyen pruebas diagnósticas de una deficiencia. Distingue las hipótesis biológicas de los criterios clínicos validados."
  },
  'el-colageno-en-dietas-vegetarianas-y-veganas': {
    excerpt: "El colágeno suplementario convencional procede de animales y no es vegano. Revisa qué alternativas se anuncian y qué pueden aportar realmente.",
    focus: "Los suplementos tradicionales de colágeno se obtienen de tejidos animales, por lo que no encajan en una dieta vegana. Algunos productos comercializados como «apoyo al colágeno» aportan nutrientes para su síntesis, pero no son colágeno animal.",
    safety: "Lee con atención el origen y los ingredientes si sigues una dieta vegetariana o vegana, y comprueba si hay componentes animales añadidos. Si tienes una necesidad médica específica, consulta antes de sustituir una fuente de nutrientes por un producto comercial.",
    followup: "Busca una alimentación variada que aporte suficiente proteína y nutrientes como vitamina C, en vez de confiar solo en un producto etiquetado como potenciador. Comprueba qué contiene realmente antes de comprarlo.",
    evidence: "Los productos que aportan colágeno y los que aportan nutrientes para su síntesis son categorías distintas. No deben presentarse como equivalentes sin evidencia específica que respalde la afirmación."
  },
  'el-colageno-durante-el-embarazo-y-la-lactancia': {
    excerpt: "En embarazo y lactancia, la evidencia sobre muchas mezclas de colágeno es limitada. Revisa todos los ingredientes con tu profesional sanitario.",
    focus: "La seguridad de un suplemento no depende solo de que su ingrediente principal sea una proteína. Algunas fórmulas de colágeno incluyen vitaminas, minerales, hierbas u otros componentes que requieren una revisión independiente.",
    safety: "No empieces un suplemento de colágeno durante el embarazo o la lactancia sin consultarlo con el profesional que lleva tu atención. Evita asumir que una fórmula deportiva o estética es segura por venderse sin receta.",
    followup: "Lleva la etiqueta completa a la consulta y pregunta si hay una razón concreta para usar el producto o si basta con la alimentación habitual. No combines fórmulas sin revisar ingredientes repetidos.",
    evidence: "Los datos en adultos sanos no establecen por sí solos la seguridad de todas las formulaciones durante embarazo o lactancia. La falta de estudios específicos debe comunicarse con claridad."
  },
  'el-colageno-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: "El objetivo, la alimentación, la medicación y la salud general importan más que la edad por sí sola al valorar un suplemento de colágeno.",
    focus: "En personas mayores, el colágeno puede anunciarse para piel o articulaciones, pero conviene concretar el problema y revisar primero la salud general, la dieta y los tratamientos existentes.",
    safety: "Si hay enfermedad crónica, polimedicación, pérdida de peso involuntaria o dolor persistente, consulta antes de añadir el suplemento. No retrases una evaluación por probar productos para articulaciones o movilidad.",
    followup: "Revisa el origen del colágeno, los ingredientes añadidos y el objetivo que pretendes evaluar. Si la dificultad es moverse o mantener la fuerza, una valoración funcional y un plan adaptado pueden ser más relevantes.",
    evidence: "La edad, el estado de salud y la formulación pueden influir en los resultados. No des por hecho que todas las personas mayores se beneficiarán ni que los datos en adultos sanos sean directamente aplicables."
  },
  'mitos-sobre-el-colageno-que-es-verdad-y-que-no': {
    excerpt: "¿El colágeno elimina las arrugas o regenera el cartílago? Revisamos qué afirmaciones están estudiadas y cuáles exageran los resultados.",
    focus: "El colágeno tiene funciones estructurales en el cuerpo, pero eso no demuestra que ingerirlo se dirija de forma directa a una arruga o una articulación. Los efectos de un suplemento deben evaluarse por resultados clínicos concretos.",
    safety: "Desconfía de promesas de curar enfermedades o garantizar cambios estéticos. Si tienes dolor o síntomas persistentes, no sustituyas una evaluación sanitaria por afirmaciones de marketing.",
    followup: "Cuando leas una afirmación, busca el producto exacto, el grupo estudiado, el tiempo de seguimiento y el resultado medido. Los testimonios y las imágenes promocionales no sustituyen esa información.",
    evidence: "La evidencia varía según la formulación y el objetivo. Un resultado favorable en un estudio pequeño no demuestra eficacia universal ni confirma todas las promesas que se hacen sobre el colágeno."
  },
  'como-leer-la-etiqueta-del-colageno': {
    excerpt: "Identifica el origen, la cantidad por porción, los ingredientes añadidos y las advertencias para comparar suplementos de colágeno con criterio.",
    focus: "La etiqueta debería permitir saber si el colágeno es hidrolizado, cuál es su origen y cuánta cantidad aporta una ración. Revisa también los ingredientes adicionales y si el producto contiene alérgenos.",
    safety: "Si tienes alergias al pescado u otras fuentes animales, comprueba la procedencia y las advertencias. No uses declaraciones vagas como «belleza» o «articulaciones» como sustituto de información clara sobre composición.",
    followup: "Compara la cantidad de colágeno por ración y por envase, además del coste, y revisa lote y fecha de consumo preferente. Si incluye vitaminas o minerales, suma su aporte con el de otros productos que uses.",
    evidence: "La etiqueta informa de la composición declarada, pero no prueba que el suplemento vaya a lograr el resultado anunciado. Evalúa por separado la calidad del producto y la evidencia de eficacia."
  },
  'preguntas-frecuentes-sobre-el-colageno-guia-para-principiantes': {
    excerpt: "Qué es el colágeno, qué tipos de suplementos existen, cómo leer la etiqueta y por qué los resultados dependen del objetivo.",
    focus: "Antes de elegir un producto, concreta si buscas información sobre piel, articulaciones u otro objetivo. Las fórmulas, las pruebas disponibles y la manera de evaluar resultados pueden variar según esa finalidad.",
    safety: "Revisa el origen animal y los ingredientes añadidos, especialmente si tienes alergias, una enfermedad crónica, embarazo o lactancia. Consulta si pretendes usar el suplemento para tratar síntomas o sustituir un tratamiento.",
    followup: "Empieza por la etiqueta y por la razón práctica para usarlo; después compara la evidencia para ese objetivo concreto. No es obligatorio suplementar colágeno para llevar una dieta equilibrada.",
    evidence: "Las preguntas generales ayudan a orientarse, pero no garantizan un resultado individual. Para valorar una afirmación concreta, comprueba la formulación, la población y el desenlace estudiado."
  },
  'que-es-el-magnesio-y-para-que-sirve': {
    excerpt: "El magnesio es un mineral esencial implicado en funciones musculares, nerviosas y metabólicas. Aprende qué hace y cuándo un suplemento puede ser relevante.",
    focus: "El magnesio participa en numerosas funciones del organismo, incluidas la actividad muscular y nerviosa y el metabolismo energético. Los suplementos son una de varias fuentes y no siempre son necesarios si la dieta ya cubre las necesidades.",
    safety: "Las dosis elevadas de suplementos pueden causar molestias digestivas y el riesgo aumenta en personas con función renal reducida. Si tienes enfermedad renal, tomas medicamentos de forma habitual o quieres tratar síntomas persistentes, consulta antes de suplementarte.",
    followup: "Revisa primero las fuentes alimentarias, la cantidad declarada por porción y el tipo de compuesto de magnesio. Si sospechas una deficiencia, solicita orientación sanitaria en vez de basarte solo en síntomas inespecíficos.",
    evidence: "Que el magnesio tenga funciones esenciales no significa que suplementarlo mejore el rendimiento o el sueño en todas las personas. Distingue corregir una ingesta insuficiente de tomar más sin una necesidad identificada."
  },
  'beneficios-del-magnesio-que-dice-la-evidencia': {
    excerpt: "El magnesio es necesario para el organismo, pero los beneficios de tomarlo como suplemento dependen de la necesidad y del resultado evaluado.",
    focus: "Una cosa es que el cuerpo necesite magnesio y otra que una dosis extra mejore un síntoma en alguien que ya consume suficiente. La evidencia debe revisarse por objetivo, como corregir una carencia o evaluar una afirmación sobre sueño o calambres.",
    safety: "No uses el suplemento como sustituto de estudiar síntomas persistentes ni aumentes la dosis porque el beneficio no aparezca rápido. Si tienes enfermedad renal o tomas medicación, consulta antes de empezar.",
    followup: "Identifica qué beneficio se anuncia y busca estudios que midan ese resultado en una población comparable. Revisa también la cantidad de magnesio elemental, que no siempre equivale al peso total del compuesto.",
    evidence: "Los resultados pueden variar según la ingesta inicial, la formulación, la dosis y la calidad de los ensayos. La evidencia de una indicación no demuestra beneficios para todas las demás."
  },
  'efectos-secundarios-del-magnesio': {
    excerpt: "La diarrea y las molestias abdominales son efectos posibles de algunos suplementos de magnesio; la dosis y el compuesto importan.",
    focus: "La tolerancia depende del tipo de sal, la cantidad de magnesio elemental y la sensibilidad individual. Algunos productos pueden tener efecto laxante, y tomar varias fórmulas a la vez puede aumentar la cantidad total sin darse cuenta.",
    safety: "La enfermedad renal puede aumentar el riesgo de acumulación de magnesio, por lo que no conviene automedicarse en esa situación. Ante debilidad marcada, confusión, desmayo o dificultad respiratoria, busca atención urgente.",
    followup: "Suma el magnesio procedente de todos los suplementos y medicamentos que uses y revisa las instrucciones del envase. Si aparecen molestias persistentes, consulta antes de aumentar la cantidad o cambiar a otra fórmula.",
    evidence: "Los efectos adversos dependen de la dosis, la formulación y la situación clínica. No asumas que todos los compuestos se toleran igual ni que un producto sin receta está libre de riesgos."
  },
  'como-tomar-el-magnesio-correctamente': {
    excerpt: "La cantidad adecuada depende de la dieta, el compuesto y las necesidades individuales. Aprende a revisar el magnesio elemental y las instrucciones.",
    focus: "En la etiqueta puede aparecer el peso del compuesto y, por separado, la cantidad de magnesio elemental. Para comparar productos, identifica qué cifra se declara por porción y sigue las instrucciones específicas del envase.",
    safety: "No aumentes la dosis para tratar calambres, cansancio o problemas de sueño sin valorar otras causas. Si tienes enfermedad renal, tomas medicación o necesitas un suplemento por indicación clínica, consulta antes de modificar la pauta.",
    followup: "Comprueba cuánto aporta cada toma, si hay magnesio en otros productos y si el suplemento produce molestias digestivas. Si te lo han recomendado por una razón médica, confirma la duración y el seguimiento con el profesional.",
    evidence: "Las pautas estudiadas no son intercambiables entre todas las sales ni para todas las personas. Distingue recomendaciones nutricionales generales de dosis terapéuticas supervisadas."
  },
  'cuando-tomar-el-magnesio-manana-o-noche': {
    excerpt: "No hay una hora única para todo el mundo. La tolerancia, la formulación, las instrucciones y la razón de uso orientan el horario.",
    focus: "Tomar magnesio por la mañana o por la noche suele ser una decisión práctica condicionada por el producto y la tolerancia. No hay que asumir que una hora concreta garantiza mejor sueño, menos calambres o mayor absorción en todos los casos.",
    safety: "Sigue las instrucciones del envase y las recomendaciones clínicas si el suplemento forma parte de un tratamiento. Si tomas medicamentos con horarios específicos o tienes enfermedad renal, consulta antes de cambiar la pauta.",
    followup: "Elige un momento que puedas mantener y observa si aparecen molestias digestivas. Si el objetivo es mejorar el sueño o aliviar calambres persistentes, revisa también otras causas posibles con un profesional.",
    evidence: "Para afirmar que una hora es mejor, los estudios tendrían que comparar directamente horarios similares y medir resultados relevantes. Los datos sobre el magnesio en general no prueban una franja horaria óptima para todos."
  },
  'dosis-del-magnesio-como-interpretar-las-recomendaciones': {
    excerpt: "Las etiquetas pueden mostrar el peso del compuesto o el magnesio elemental. Aprende a distinguirlos antes de comparar cantidades o pautas.",
    focus: "Para interpretar una cifra, busca cuánto magnesio elemental aporta la porción y no confundas esa cantidad con el peso total de la sal. La formulación y el objetivo de uso también influyen en cómo se interpreta la etiqueta.",
    safety: "No aumentes la dosis para tratar síntomas por tu cuenta. Si tienes enfermedad renal, tomas medicación o te han indicado magnesio por una razón clínica, consulta antes de cambiar la cantidad.",
    followup: "Anota el compuesto, la cantidad de magnesio elemental por toma y cualquier otro producto que lo contenga. Si la recomendación procede de un profesional, confirma la duración y el seguimiento.",
    evidence: "Las pautas varían según la finalidad y el compuesto utilizado. Una cantidad de un estudio o de un producto no constituye una recomendación universal para todas las personas."
  },
  'quien-deberia-evitar-el-magnesio': {
    excerpt: "La enfermedad renal, algunos tratamientos y la suma de varios suplementos pueden cambiar el riesgo de tomar magnesio adicional.",
    focus: "Aunque el magnesio es esencial, eso no significa que todo el mundo necesite un suplemento. La función renal, los medicamentos y el magnesio que ya aportan otros productos son factores relevantes antes de añadirlo.",
    safety: "Si tienes función renal reducida, consulta antes de tomar suplementos de magnesio, ya que puede aumentar el riesgo de acumulación. No lo uses para tratar síntomas persistentes sin valorar otras causas.",
    followup: "Reúne las etiquetas de suplementos, antiácidos o laxantes que utilices, porque algunos también aportan magnesio. Un profesional puede revisar el total y comprobar si realmente hace falta añadir otro producto.",
    evidence: "Los datos de adultos sanos no se aplican automáticamente a personas con enfermedad renal o tratamientos complejos. La seguridad depende de la dosis, la formulación y el contexto clínico."
  },
  'interacciones-del-magnesio-con-medicamentos': {
    excerpt: "El magnesio puede interferir con la absorción de algunos medicamentos. El horario y el fármaco concreto deben revisarse con un profesional.",
    focus: "El punto clave no es solo la cantidad de magnesio, sino cuándo se toma respecto a determinados medicamentos. Algunos fármacos requieren separar las tomas, y las instrucciones varían según el medicamento.",
    safety: "No cambies el horario de un tratamiento por tu cuenta. Pregunta al médico o farmacéutico cómo espaciar el magnesio si tomas antibióticos, medicamentos para la tiroides u otros fármacos con instrucciones específicas.",
    followup: "Lleva el nombre y la dosis de cada medicamento junto con la etiqueta del suplemento. Incluye también antiácidos y laxantes, que pueden contener magnesio sin que se identifique como suplemento principal.",
    evidence: "Las interacciones se deben comprobar para cada medicamento y formulación. No es seguro dar un intervalo horario único sin saber qué tratamiento se está utilizando."
  },
  'como-elegir-un-suplemento-del-magnesio-de-calidad': {
    excerpt: "Compara la cantidad de magnesio elemental, el tipo de compuesto, los ingredientes y la transparencia del etiquetado antes de comprar.",
    focus: "La etiqueta debe permitir identificar el compuesto de magnesio y cuánto magnesio elemental aporta por porción. Revisa además los ingredientes añadidos y si las afirmaciones del frontal se corresponden con información verificable.",
    safety: "Desconfía de promesas de curar enfermedades o de resultados garantizados para el sueño y los calambres. Si tienes enfermedad renal o tomas medicamentos, consulta antes de elegir una fórmula.",
    followup: "Compara dos productos con la misma base: magnesio elemental por porción y coste por esa cantidad. Comprueba lote, fecha de consumo preferente y si los controles de calidad anunciados explican qué se ha analizado.",
    evidence: "Un certificado puede referirse a criterios concretos de calidad, pero no demuestra que necesites el suplemento ni que cumpla todas las promesas publicitarias."
  },
  'el-magnesio-polvo-capsulas-o-comprimidos': {
    excerpt: "Polvo, cápsulas y comprimidos difieren en facilidad de uso, tamaño de porción e ingredientes. La cantidad elemental es la comparación clave.",
    focus: "El formato influye en cómo se prepara y mide la toma, pero no basta para juzgar la calidad. Compara el magnesio elemental por porción, el compuesto utilizado y los excipientes de cada presentación.",
    safety: "Lee las instrucciones y ten en cuenta las dificultades para tragar comprimidos o medir polvo con precisión. Si tienes enfermedad renal o una pauta médica, no cambies de formato sin revisar la cantidad total.",
    followup: "Calcula el coste por la misma cantidad de magnesio elemental y comprueba cuántas cápsulas o medidas se necesitan. Considera también el sabor, la tolerancia digestiva y la facilidad para seguir las instrucciones.",
    evidence: "No asumas que dos presentaciones son equivalentes solo porque indiquen el mismo mineral. La cantidad elemental, el compuesto y los demás ingredientes pueden diferir."
  },
  'cuanto-tarda-en-hacer-efecto-el-magnesio': {
    excerpt: "El tiempo para notar cambios depende de la causa del síntoma, la ingesta inicial y el motivo por el que se usa el suplemento.",
    focus: "No existe un plazo universal para notar efectos del magnesio. Corregir una ingesta insuficiente es distinto de esperar mejoras en el sueño o los calambres cuando no se ha identificado una carencia.",
    safety: "Si los síntomas son intensos, persistentes o empeoran, no esperes a que el suplemento haga efecto para buscar orientación sanitaria. Evita aumentar la dosis sin conocer la causa.",
    followup: "Define qué cambio estás intentando observar y revisa con un profesional si tiene sentido usar magnesio para ese objetivo. Considera la dieta, los medicamentos y otras posibles causas del síntoma.",
    evidence: "Los estudios difieren en la situación inicial de los participantes, el compuesto, la dosis y el resultado medido. Un plazo promocional no garantiza una respuesta personal."
  },
  'que-pasa-si-dejas-de-tomar-el-magnesio': {
    excerpt: "Dejar un suplemento de magnesio no equivale a retirar un medicamento. El resultado depende de la dieta y de la razón por la que se tomaba.",
    focus: "El magnesio no se considera una sustancia que genere dependencia. Al dejarlo, lo importante es si la alimentación sigue cubriendo las necesidades y si el producto se utilizaba por una indicación clínica concreta.",
    safety: "Si te lo han indicado para tratar una situación médica o como parte de un plan supervisado, consulta antes de modificarlo. No suspendas otros tratamientos por confundirlos con un suplemento.",
    followup: "Revisa las fuentes alimentarias y los otros productos que aportan magnesio. Si el suplemento no tenía una indicación clara, pregunta si es necesario mantenerlo en vez de sustituirlo automáticamente por otra marca.",
    evidence: "La evolución de los síntomas tras dejar un producto varía según la causa inicial y la dieta. No puede predecirse un efecto rebote universal por el simple hecho de interrumpir el suplemento."
  },
  'alimentos-ricos-en-el-magnesio-frente-a-suplementos': {
    excerpt: "Frutos secos, semillas, legumbres y cereales integrales aportan magnesio. Compara primero la dieta con la necesidad real de suplementar.",
    focus: "El magnesio se encuentra en alimentos como semillas, frutos secos, legumbres y cereales integrales, además de otros productos de una dieta variada. Los suplementos son una opción concentrada, no la única forma de obtenerlo.",
    safety: "Si tienes una enfermedad que requiere ajustar la dieta o sigues indicaciones clínicas específicas, revisa los cambios con un profesional. No tomes dosis altas para compensar una dieta desequilibrada sin evaluar la situación.",
    followup: "Observa qué fuentes aparecen habitualmente en tus comidas y si puedes incorporarlas de forma sostenible. Si consideras un suplemento, calcula cuánto aporta junto con otros productos que ya utilizas.",
    evidence: "La utilidad de suplementar depende de la ingesta total y de la situación individual. Que un mineral sea esencial no demuestra que una dosis extra mejore el bienestar de quien ya consume suficiente."
  },
  'deficiencia-del-magnesio-senales-y-evaluacion': {
    excerpt: "Calambres, cansancio y otros síntomas no bastan por sí solos para diagnosticar falta de magnesio. La evaluación requiere contexto clínico.",
    focus: "Los síntomas que se asocian en internet con el magnesio pueden tener muchas causas. La valoración depende de la historia clínica, la alimentación, los medicamentos y, cuando corresponde, pruebas solicitadas por un profesional.",
    safety: "No te autodiagnostiques ni uses dosis elevadas para tratar calambres, debilidad o palpitaciones sin evaluación. Si aparecen síntomas intensos o nuevos, busca orientación sanitaria de forma adecuada a su gravedad.",
    followup: "Anota los síntomas, cuándo comenzaron, los medicamentos y suplementos que tomas y cualquier cambio en la dieta. Esa información facilita una evaluación más útil que guiarse por una lista genérica de señales.",
    evidence: "Los síntomas inespecíficos no son pruebas diagnósticas de deficiencia. La interpretación de análisis y la necesidad de suplementación dependen del contexto clínico."
  },
  'el-magnesio-en-dietas-vegetarianas-y-veganas': {
    excerpt: "Legumbres, semillas, frutos secos y cereales integrales pueden contribuir al aporte de magnesio en dietas vegetarianas y veganas.",
    focus: "El magnesio se encuentra en numerosos alimentos vegetales, por lo que una dieta vegetariana o vegana variada puede aportar fuentes relevantes. La suficiencia depende de la selección y cantidad de alimentos, no solo de la etiqueta dietética.",
    safety: "Si tienes síntomas persistentes, una enfermedad crónica o una dieta muy restrictiva, consulta antes de añadir suplementos. Ten en cuenta que algunos productos enriquecidos y mezclas pueden aportar minerales adicionales.",
    followup: "Incluye fuentes vegetales como semillas, frutos secos, legumbres y cereales integrales de forma que encajen con tus preferencias. Si eliges un suplemento, revisa el magnesio elemental y la cantidad total que ya recibes.",
    evidence: "La adecuación nutricional depende de la dieta completa y de las necesidades individuales. No debe asumirse que todas las personas vegetarianas o veganas necesitan magnesio suplementario."
  },
  'el-magnesio-durante-el-embarazo-y-la-lactancia': {
    excerpt: "Durante el embarazo y la lactancia, revisa la necesidad real, la cantidad total y los demás ingredientes con un profesional sanitario.",
    focus: "Las necesidades nutricionales pueden cambiar durante el embarazo y la lactancia, pero eso no significa que cualquier suplemento de magnesio sea necesario. Importan la dieta, la formulación y la situación individual.",
    safety: "No empieces ni aumentes un suplemento durante el embarazo o la lactancia sin comentarlo con el profesional que lleva tu atención. Revisa también vitaminas prenatales, antiácidos u otros productos que puedan aportar magnesio.",
    followup: "Lleva la etiqueta completa a la consulta y pregunta si el producto es necesario y cómo encaja con otros suplementos o medicamentos. Evita combinar fórmulas sin revisar cantidades repetidas.",
    evidence: "La información general sobre magnesio no sustituye una recomendación individual para embarazo o lactancia. La dosis y la necesidad deben interpretarse en el contexto sanitario concreto."
  },
  'el-magnesio-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: "La función renal, la dieta, la medicación y los productos de uso habitual son claves al valorar magnesio en personas mayores.",
    focus: "En personas mayores conviene revisar no solo la alimentación, sino también la función renal, los cambios de apetito y los medicamentos que se toman. Algunos productos de uso común pueden aportar magnesio adicional.",
    safety: "Si hay enfermedad renal, polimedicación o síntomas nuevos, consulta antes de incorporar un suplemento. Evita tratar por tu cuenta el cansancio o los calambres como si fueran necesariamente una carencia mineral.",
    followup: "Haz una lista de medicamentos, antiácidos, laxantes y suplementos y lleva las etiquetas a la consulta. Una revisión del conjunto ayuda a detectar duplicaciones y a decidir si hace falta cambiar algo.",
    evidence: "Los resultados en adultos sanos no se trasladan automáticamente a personas mayores con enfermedades o varios tratamientos. La decisión debe considerar la situación clínica individual."
  },
  'mitos-sobre-el-magnesio-que-es-verdad-y-que-no': {
    excerpt: "¿El magnesio siempre mejora el sueño o elimina los calambres? Repasamos afirmaciones frecuentes y por qué el contexto importa.",
    focus: "Que el magnesio participe en funciones musculares y nerviosas no demuestra que tomar más mejore cualquier calambre, problema de sueño o sensación de cansancio. La ingesta inicial y la causa del síntoma importan.",
    safety: "Evita las promesas absolutas y el uso de dosis altas para tratar síntomas sin evaluar. La enfermedad renal y algunos medicamentos hacen especialmente importante consultar antes de suplementar.",
    followup: "Ante una afirmación, pregunta qué población se estudió, qué compuesto se utilizó y qué resultado se midió. Distingue corregir una ingesta insuficiente de añadir un suplemento sin necesidad identificada.",
    evidence: "La evidencia puede variar entre objetivos y formulaciones. Un resultado en un grupo específico no prueba que el magnesio funcione igual para todas las personas o síntomas."
  },
  'como-leer-la-etiqueta-del-magnesio': {
    excerpt: "Comprueba el compuesto, el magnesio elemental por toma, los ingredientes añadidos y las advertencias antes de comparar productos.",
    focus: "La etiqueta puede mostrar tanto el nombre y peso del compuesto como la cantidad de magnesio elemental. Para saber qué aporta realmente una porción, identifica la cifra elemental y revisa el tamaño de la toma.",
    safety: "Si tienes enfermedad renal o tomas medicamentos, no elijas la dosis solo por el frontal del envase. Comprueba además si antiácidos, laxantes o multivitamínicos que utilizas ya contienen magnesio.",
    followup: "Compara productos con la misma unidad de magnesio elemental por porción y revisa los ingredientes adicionales, las instrucciones y la fecha. No confundas miligramos del compuesto con miligramos del mineral elemental.",
    evidence: "La etiqueta permite conocer la composición declarada, pero no demuestra que el producto sea necesario o que mejore un síntoma concreto. Evalúa por separado composición, calidad y eficacia."
  },
  'preguntas-frecuentes-sobre-el-magnesio-guia-para-principiantes': {
    excerpt: "Qué hace el magnesio, qué revisar en una etiqueta, cuándo puede ser útil un suplemento y qué precauciones conviene conocer.",
    focus: "Para empezar, diferencia el papel esencial del magnesio de la pregunta de si necesitas tomarlo en forma de suplemento. La dieta, la situación de salud y el motivo de uso cambian la respuesta.",
    safety: "Si tienes enfermedad renal, tomas medicación, estás embarazada o en lactancia, consulta antes de añadir un producto. Los síntomas persistentes merecen una evaluación y no deben atribuirse automáticamente a una carencia.",
    followup: "Lee la cantidad de magnesio elemental, el compuesto y las advertencias del envase. Revisa también otros suplementos o medicamentos que puedan aportar el mineral antes de decidir.",
    evidence: "Las respuestas generales sirven para orientarse, pero no sustituyen una evaluación individual. Comprueba qué objetivo y qué población respalda cualquier afirmación de beneficio."
  },
  'que-es-la-vitamina-d-y-para-que-sirve': {
    excerpt: "La vitamina D ayuda a regular el calcio y contribuye a la salud ósea. Aprende de dónde se obtiene y cuándo conviene valorar su aporte.",
    focus: "La vitamina D participa en la absorción del calcio y el mantenimiento de los huesos, además de otras funciones fisiológicas. La exposición solar, los alimentos y los suplementos contribuyen de manera distinta al estado de vitamina D.",
    safety: "No tomes dosis altas por tu cuenta: el exceso de vitamina D puede causar problemas por elevar demasiado el calcio. Si tienes una enfermedad, tomas medicación o sospechas una deficiencia, consulta antes de iniciar un suplemento.",
    followup: "Revisa las fuentes alimentarias, los suplementos que ya utilizas y los factores personales que puedan influir en tu situación. Un profesional puede decidir si hace falta una evaluación o una pauta específica.",
    evidence: "La importancia biológica de la vitamina D no significa que suplementar beneficie a todas las personas por igual. Distingue corregir una deficiencia de tomar dosis extra sin una necesidad identificada."
  },
  'beneficios-de-la-vitamina-d-que-dice-la-evidencia': {
    excerpt: "La vitamina D es esencial para la salud ósea, pero los beneficios de suplementar dependen del estado inicial y del resultado que se estudie.",
    focus: "La evidencia debe separar la prevención o corrección de una deficiencia de las afirmaciones sobre otros resultados, como inmunidad, ánimo o bienestar general. No todos los objetivos cuentan con el mismo respaldo.",
    safety: "No uses vitamina D como tratamiento único para síntomas persistentes ni aumentes la dosis para buscar un beneficio adicional. El exceso puede ser perjudicial, por lo que conviene revisar otros suplementos y las indicaciones clínicas.",
    followup: "Busca qué población se estudió, si tenía niveles bajos al inicio y qué resultado se midió. Esos detalles ayudan a distinguir un beneficio en una situación concreta de una promesa válida para todo el mundo.",
    evidence: "Los resultados varían según el estado inicial, la dosis, la duración y el objetivo. La evidencia sobre salud ósea o deficiencia no demuestra automáticamente beneficios para todas las afirmaciones comerciales."
  },
  'efectos-secundarios-de-la-vitamina-d': {
    excerpt: "El exceso de vitamina D puede elevar el calcio en sangre. Revisa la dosis total y los síntomas que requieren atención sanitaria.",
    focus: "La vitamina D es liposoluble y un exceso por suplementación puede acumularse y causar hipercalcemia. El riesgo suele relacionarse con cantidades demasiado altas o con la combinación inadvertida de varios productos.",
    safety: "No combines suplementos de vitamina D en dosis altas sin orientación. Náuseas persistentes, vómitos, sed intensa, micción frecuente o confusión requieren valoración sanitaria, especialmente si existe posibilidad de exceso.",
    followup: "Suma la vitamina D de multivitamínicos, gotas y otros productos y comprueba la unidad indicada en cada etiqueta. Si sospechas una dosis excesiva, contacta con un profesional sanitario en vez de intentar compensarla por tu cuenta.",
    evidence: "El riesgo depende de la cantidad total, la duración y las características personales. La seguridad de una dosis indicada en un contexto clínico no debe extrapolarse a cualquier uso prolongado."
  },
  'como-tomar-la-vitamina-d-correctamente': {
    excerpt: "La forma de uso y la cantidad dependen del producto y de la necesidad individual. Aprende a leer unidades y evitar duplicar dosis.",
    focus: "La vitamina D puede declararse en microgramos o unidades internacionales, por lo que conviene comprobar la unidad y la cantidad por toma. Sigue las instrucciones del producto y no sumes dosis de distintas fórmulas sin revisar el total.",
    safety: "No utilices dosis altas para corregir síntomas sin evaluación. Si tienes una condición médica, tomas medicamentos o te han indicado vitamina D tras una prueba, confirma la pauta y el seguimiento con el profesional sanitario.",
    followup: "Anota la cantidad por dosis, la frecuencia y los otros productos que contienen vitamina D o calcio. Si el suplemento se indicó por una deficiencia, pregunta cuándo y cómo se revisará la respuesta.",
    evidence: "Las pautas dependen de si se busca cubrir necesidades generales o tratar una deficiencia. Una pauta terapéutica supervisada no equivale a una recomendación para todo el mundo."
  },
  'cuando-tomar-la-vitamina-d-manana-o-noche': {
    excerpt: "No hay una hora universal para la vitamina D. La regularidad, las instrucciones del producto y la forma de tomarlo son más prácticas que reglas rígidas.",
    focus: "La vitamina D suele tomarse siguiendo las instrucciones del producto y puede resultar práctico hacerlo con una comida. No hay que asumir que tomarla por la mañana o por la noche garantice un beneficio superior en todas las personas.",
    safety: "Prioriza la pauta que te hayan indicado y evita cambiar la cantidad para compensar una toma olvidada sin revisar las instrucciones. Si tienes un tratamiento pautado o una condición médica, consulta antes de modificarlo.",
    followup: "Elige un momento que puedas mantener de forma constante y comprueba si la etiqueta recomienda tomarlo con alimentos. Revisa además los demás productos que utilizas para evitar duplicar vitamina D.",
    evidence: "Para afirmar que una hora es mejor, hacen falta comparaciones directas que midan resultados relevantes. Los datos sobre la función de la vitamina D no prueban por sí solos un horario óptimo universal."
  },
  'dosis-de-la-vitamina-d-como-interpretar-las-recomendaciones': {
    excerpt: "La vitamina D se expresa en microgramos o unidades internacionales. Aprende a leer ambas unidades y distinguir una pauta general de un tratamiento supervisado.",
    focus: "La etiqueta puede expresar la vitamina D en microgramos (µg) o unidades internacionales (UI). Comprueba la unidad, la cantidad por toma y la frecuencia antes de comparar productos; no interpretes solo el número más grande del envase.",
    safety: "No aumentes la dosis para acelerar resultados: el exceso puede elevar el calcio en sangre. Si te han diagnosticado una deficiencia, confirma la pauta y el seguimiento con un profesional sanitario.",
    followup: "Anota la cantidad por toma, la frecuencia y la vitamina D que aportan otros productos. Si la dosis se indicó tras una prueba, pregunta cuándo corresponde revisar la respuesta.",
    evidence: "Las pautas de mantenimiento y las utilizadas para corregir una deficiencia no son intercambiables. Una cantidad estudiada en un contexto clínico no constituye una recomendación universal."
  },
  'quien-deberia-evitar-la-vitamina-d': {
    excerpt: "Algunas enfermedades, tratamientos y la suma de varios suplementos hacen necesaria una revisión antes de añadir vitamina D.",
    focus: "La vitamina D es importante, pero suplementar sin valorar el contexto puede ser innecesario o arriesgado. La historia clínica, otros suplementos y ciertos trastornos que afectan al calcio cambian la evaluación.",
    safety: "Si tienes enfermedad renal, niveles altos de calcio, antecedentes de determinados trastornos metabólicos o tomas medicación habitual, consulta antes de iniciar dosis suplementarias. No uses dosis altas por tu cuenta.",
    followup: "Lleva una lista de medicamentos y suplementos, con las cantidades de vitamina D y calcio que contienen. Así se puede revisar el aporte total y decidir si hace falta una pauta concreta.",
    evidence: "La seguridad depende de la dosis, el estado inicial y las condiciones de salud. Los resultados de adultos sanos no se deben extrapolar automáticamente a personas con enfermedades específicas."
  },
  'interacciones-de-la-vitamina-d-con-medicamentos': {
    excerpt: "Algunos medicamentos pueden alterar el metabolismo de la vitamina D o el equilibrio del calcio. La revisión debe centrarse en tu tratamiento concreto.",
    focus: "Las interacciones no se limitan a que un producto se tome a la misma hora que otro: algunos tratamientos pueden influir en la absorción, el metabolismo de la vitamina D o los niveles de calcio.",
    safety: "No suspendas ni ajustes medicamentos para incorporar vitamina D. Si tomas tratamientos de forma habitual o tienes una enfermedad crónica, pide al médico o farmacéutico que revise el producto y la dosis.",
    followup: "Lleva el nombre del medicamento, la dosis y la etiqueta completa del suplemento. Incluye productos con calcio y multivitamínicos para que se valore el conjunto.",
    evidence: "La relevancia de una interacción depende del medicamento, la cantidad y el contexto clínico. Evita aplicar una recomendación genérica a todos los tratamientos."
  },
  'como-elegir-un-suplemento-de-la-vitamina-d-de-calidad': {
    excerpt: "Compara la cantidad por dosis, la unidad, la forma de vitamina D y la claridad del etiquetado antes de elegir un producto.",
    focus: "Una etiqueta útil identifica la forma de vitamina D, la cantidad por toma, las unidades y los ingredientes adicionales. La presentación atractiva o la promesa de alta potencia no demuestra que esa cantidad sea necesaria para ti.",
    safety: "Desconfía de promesas de prevenir o tratar múltiples enfermedades sin matices. Si tienes una condición médica o tomas otros productos con vitamina D o calcio, consulta antes de elegir una dosis alta.",
    followup: "Compara la cantidad por toma y por envase, revisa lote y fecha, y comprueba si hay otros ingredientes activos. Si se anuncian controles independientes, verifica qué aspectos evalúan realmente.",
    evidence: "Los controles de calidad pueden aportar información sobre composición, pero no demuestran que el suplemento sea necesario ni que todas sus afirmaciones estén respaldadas."
  },
  'la-vitamina-d-polvo-capsulas-o-comprimidos': {
    excerpt: "Gotas, cápsulas, comprimidos y otras presentaciones pueden aportar dosis distintas. Compara unidades, facilidad de uso y composición, no solo el formato.",
    focus: "La vitamina D aparece en gotas, cápsulas, comprimidos y preparados combinados. El formato importa para medir y seguir la pauta, pero hay que comparar la cantidad por toma y los ingredientes de cada producto.",
    safety: "Sigue las instrucciones exactas del envase, sobre todo en preparados líquidos donde el número de gotas por dosis puede variar. Si necesitas una pauta clínica, no sustituyas una presentación por otra sin confirmar la equivalencia.",
    followup: "Comprueba la cantidad por gota, cápsula o comprimido y revisa si el producto combina vitamina D con calcio u otros nutrientes. Elige un formato que puedas medir y utilizar correctamente.",
    evidence: "No asumas que distintas presentaciones son equivalentes sin comparar la dosis y la formulación. La facilidad de uso no demuestra superioridad clínica."
  },
  'cuanto-tarda-en-hacer-efecto-la-vitamina-d': {
    excerpt: "El tiempo depende del nivel inicial, la dosis y el motivo del tratamiento. Sentirse igual no confirma por sí solo que el suplemento no funcione.",
    focus: "El cambio en el estado de vitamina D no siempre se nota como una sensación inmediata. La respuesta depende del nivel inicial, la pauta y la absorción, y se evalúa de forma distinta según el motivo por el que se indicó.",
    safety: "No aumentes la cantidad porque no notes cambios en pocos días. Si persisten síntomas o te han tratado una deficiencia, sigue el plan de seguimiento recomendado en lugar de valorar el resultado solo por sensaciones.",
    followup: "Confirma cuándo corresponde revisar el estado de vitamina D si el suplemento se indicó por una deficiencia. Anota la pauta y evita añadir otros productos con la misma vitamina sin revisar el total.",
    evidence: "Los tiempos de respuesta varían según la situación inicial y el protocolo. Los plazos anunciados en publicidad no garantizan una respuesta personal ni sustituyen el seguimiento clínico."
  },
  'que-pasa-si-dejas-de-tomar-la-vitamina-d': {
    excerpt: "Al dejar la vitamina D, el estado nutricional depende de las reservas, la dieta y otros factores. Si fue un tratamiento indicado, consulta antes de interrumpirlo.",
    focus: "La vitamina D no genera una retirada como la de ciertos medicamentos. Sin embargo, si se utilizaba para corregir una deficiencia o por una indicación médica, dejarla puede cambiar el plan necesario para mantener niveles adecuados.",
    safety: "Si te la indicaron tras una prueba o por una condición clínica, no cambies la pauta sin hablar con el profesional que la recomendó. No suspendas otros tratamientos al confundirlos con un suplemento.",
    followup: "Revisa por qué empezaste a tomarla, qué cantidad usabas y si existen fuentes adicionales en la dieta o en otros productos. Pregunta si necesitas seguimiento antes de decidir si la interrumpes.",
    evidence: "No hay una respuesta única tras dejar un suplemento; depende del estado inicial y de la razón de uso. No debe prometerse que los niveles se mantendrán o caerán en un plazo fijo."
  },
  'alimentos-ricos-en-la-vitamina-d-frente-a-suplementos': {
    excerpt: "Pescado azul, huevos y alimentos enriquecidos pueden aportar vitamina D. Compara la dieta con la necesidad individual antes de suplementar.",
    focus: "La vitamina D está presente en algunos alimentos, como pescados grasos y yema de huevo, y puede añadirse a productos enriquecidos. La cantidad alimentaria varía, así que conviene mirar las etiquetas y el patrón dietético completo.",
    safety: "No intentes corregir una deficiencia diagnosticada solo cambiando la dieta sin consultar el plan indicado. Si tienes necesidades clínicas específicas, revisa las opciones con un profesional sanitario.",
    followup: "Anota las fuentes que consumes habitualmente y comprueba si los alimentos enriquecidos indican vitamina D en la etiqueta. Si consideras suplementar, suma lo que aportan otros productos para evitar duplicaciones.",
    evidence: "Los alimentos contribuyen al aporte, pero la utilidad de un suplemento depende del estado inicial y de la situación individual. No se puede asumir que una misma estrategia cubra las necesidades de todo el mundo."
  },
  'deficiencia-de-la-vitamina-d-senales-y-evaluacion': {
    excerpt: "El cansancio y las molestias musculares tienen muchas causas. La deficiencia de vitamina D se valora con contexto clínico y, cuando procede, una prueba específica.",
    focus: "Los síntomas atribuidos a la vitamina D son inespecíficos y no bastan para confirmar una deficiencia. La evaluación depende de los factores de riesgo, la historia clínica y la indicación de medir el nivel en sangre.",
    safety: "No tomes dosis altas como prueba para ver si desaparecen los síntomas. Si hay dolor óseo, debilidad importante o molestias persistentes, solicita una evaluación sanitaria en lugar de autodiagnosticarte.",
    followup: "Anota los síntomas, cuánto tiempo llevan presentes, los medicamentos y suplementos que tomas y cualquier factor de riesgo relevante. Un profesional decidirá si corresponde una prueba y cómo interpretar el resultado.",
    evidence: "Las listas de síntomas en internet no son criterios diagnósticos. La interpretación de una prueba y la necesidad de tratamiento dependen del contexto clínico."
  },
  'la-vitamina-d-en-dietas-vegetarianas-y-veganas': {
    excerpt: "Las fuentes alimentarias de vitamina D pueden ser limitadas en dietas vegetarianas y veganas. Revisa alimentos enriquecidos y necesidades individuales.",
    focus: "Algunas fuentes habituales de vitamina D son de origen animal, aunque existen alimentos enriquecidos y suplementos aptos para distintas preferencias. En productos veganos conviene comprobar la forma utilizada y el etiquetado.",
    safety: "Si sigues una dieta vegana, estás embarazada o tienes factores de riesgo de deficiencia, consulta si necesitas revisar tu aporte. No asumas que todos los suplementos son de origen vegetal o que una dosis alta es mejor.",
    followup: "Comprueba qué alimentos enriquecidos consumes y busca productos que declaren claramente su origen. Si utilizas un suplemento, revisa la cantidad por toma y evita duplicarla con multivitamínicos.",
    evidence: "La adecuación depende de la dieta, la exposición solar, los factores personales y el estado inicial. No todas las personas vegetarianas o veganas necesitan la misma pauta."
  },
  'la-vitamina-d-durante-el-embarazo-y-la-lactancia': {
    excerpt: "Durante el embarazo y la lactancia, la vitamina D debe valorarse según la dieta, los factores de riesgo y las recomendaciones sanitarias individuales.",
    focus: "Las necesidades durante el embarazo y la lactancia requieren considerar tanto la alimentación como los suplementos prenatales u otros productos ya utilizados. No todas las fórmulas comerciales tienen la misma composición.",
    safety: "No inicies dosis altas ni combines varios productos con vitamina D sin consultarlo con el profesional que lleva tu atención. Revisa también el calcio y otros ingredientes de los preparados prenatales.",
    followup: "Lleva la etiqueta de todos los suplementos a la consulta y pregunta si el aporte es adecuado para tu situación. Si te han indicado una pauta concreta, confirma cómo y cuándo se revisará.",
    evidence: "Las recomendaciones generales no sustituyen una valoración individual durante el embarazo o la lactancia. La necesidad y la dosis dependen del contexto sanitario y de las recomendaciones locales."
  },
  'la-vitamina-d-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: "La edad, la salud ósea, la exposición solar, la dieta y los tratamientos pueden influir en la valoración de vitamina D en personas mayores.",
    focus: "En personas mayores, la evaluación debe considerar la alimentación, la movilidad, la exposición solar, el estado óseo y las enfermedades presentes. No conviene decidir una dosis solo por la edad.",
    safety: "Si hay enfermedad renal, niveles de calcio alterados, polimedicación o antecedentes de caídas, consulta antes de empezar o aumentar vitamina D. Revisa los otros suplementos para evitar cantidades duplicadas.",
    followup: "Prepara una lista de medicamentos y suplementos, y comenta cualquier caída, fractura o cambio de movilidad con un profesional. Pregunta si la medición o suplementación está indicada para tu caso.",
    evidence: "Los estudios en personas mayores pueden diferir según su estado inicial y sus condiciones de salud. No se debe asumir que todas las personas mayores obtendrán el mismo beneficio de suplementar."
  },
  'mitos-sobre-la-vitamina-d-que-es-verdad-y-que-no': {
    excerpt: "¿Más vitamina D significa mejor salud? Repasamos la diferencia entre corregir una deficiencia y tomar dosis extra sin necesidad.",
    focus: "La vitamina D es esencial, pero eso no significa que cantidades cada vez mayores aporten beneficios adicionales. La pregunta clave es si existe una necesidad concreta y qué resultado se ha demostrado para la población estudiada.",
    safety: "Evita las megadosis y las promesas de prevenir múltiples enfermedades. El exceso puede causar hipercalcemia, por lo que cualquier pauta elevada debe tener una razón clara y supervisión apropiada.",
    followup: "Ante una afirmación, revisa qué población se estudió, qué dosis se usó y qué resultado se midió. Distingue los beneficios de corregir una deficiencia de los reclamos generales de bienestar.",
    evidence: "La evidencia varía por objetivo y estado inicial. Un beneficio en personas con niveles bajos no prueba que suplementar en dosis altas mejore la salud de todo el mundo."
  },
  'como-leer-la-etiqueta-de-la-vitamina-d': {
    excerpt: "Aprende a distinguir microgramos y unidades internacionales, calcular la cantidad por toma y detectar vitamina D repetida en otros productos.",
    focus: "La etiqueta puede expresar la dosis en microgramos o unidades internacionales. Comprueba la cantidad por cápsula, gota o porción y lee la frecuencia de uso, además de los ingredientes adicionales.",
    safety: "No combines multivitamínicos, gotas y otros productos sin sumar primero la vitamina D total. Si te han indicado una dosis terapéutica o tienes una condición médica, confirma la interpretación de la etiqueta con un profesional.",
    followup: "Anota la unidad, la cantidad por toma, el tamaño de la porción y otros productos que uses. Revisa también lote, fecha e instrucciones de conservación si aparecen en el envase.",
    evidence: "La etiqueta permite comparar la cantidad declarada, pero no demuestra que esa dosis sea necesaria para ti. La composición del producto y la indicación clínica son cuestiones distintas."
  },
  'preguntas-frecuentes-sobre-la-vitamina-d-guia-para-principiantes': {
    excerpt: "Qué hace la vitamina D, de dónde se obtiene, qué unidades aparecen en la etiqueta y cuándo conviene consultar sobre un suplemento.",
    focus: "Para empezar, diferencia la función de la vitamina D de la pregunta de si necesitas suplementarla. La dieta, la exposición solar, los factores de riesgo y las indicaciones clínicas pueden cambiar la respuesta.",
    safety: "No tomes dosis altas por cuenta propia ni combines varios productos con vitamina D sin revisar el total. Si sospechas una deficiencia o tienes una condición médica, consulta para valorar si hace falta una prueba.",
    followup: "Lee la etiqueta y revisa los productos que ya utilizas antes de comprar otro. Si te han indicado vitamina D, pregunta cuál es el objetivo y qué seguimiento corresponde.",
    evidence: "Las respuestas generales ayudan a orientarse, pero no predicen resultados personales. Comprueba la población y el objetivo que respaldan las afirmaciones sobre beneficios."
  },
  'que-es-la-vitamina-b12-y-para-que-sirve': {
    excerpt: "La vitamina B12 contribuye a la formación de glóbulos rojos y al funcionamiento del sistema nervioso. Descubre sus fuentes y quién puede necesitar especial atención.",
    focus: "La vitamina B12 participa en la formación de glóbulos rojos y el funcionamiento neurológico. Se encuentra de forma natural sobre todo en alimentos de origen animal y también en algunos productos enriquecidos o suplementos.",
    safety: "Una deficiencia puede causar problemas neurológicos o anemia y no siempre se corrige solo por mejorar la dieta. Si tienes hormigueo, debilidad persistente o sospechas una carencia, solicita evaluación en vez de autodiagnosticarte.",
    followup: "Revisa las fuentes de B12 de tu dieta, los alimentos enriquecidos y los factores que pueden afectar a su absorción. Si sigues una dieta vegana o tienes un problema digestivo diagnosticado, consulta qué estrategia de aporte es adecuada.",
    evidence: "La función esencial de la B12 no significa que dosis extra mejoren la energía en personas que ya tienen niveles suficientes. Distingue corregir una deficiencia de buscar beneficios no demostrados."
  },
  'beneficios-de-la-vitamina-b12-que-dice-la-evidencia': {
    excerpt: "La B12 es esencial, pero suplementarla no garantiza más energía si no existe una deficiencia. Revisamos qué beneficios están bien establecidos.",
    focus: "El beneficio más claro de la vitamina B12 es prevenir o corregir una deficiencia y sus consecuencias. Las afirmaciones sobre energía, concentración o rendimiento deben valorarse según el estado inicial y la evidencia específica.",
    safety: "No uses B12 como sustituto de evaluar cansancio persistente, cambios cognitivos u otros síntomas. Si sospechas una deficiencia, una valoración profesional ayuda a identificar la causa y el tratamiento adecuado.",
    followup: "Al valorar un producto, pregunta qué beneficio promete y para qué población existe evidencia. Revisa si la investigación estudió personas con deficiencia o personas con niveles adecuados al inicio.",
    evidence: "Los resultados en personas con déficit no prueban que suplementar mejore la energía de quienes ya reciben suficiente B12. La formulación y la indicación también importan."
  },
  'efectos-secundarios-de-la-vitamina-b12': {
    excerpt: "La vitamina B12 suele tolerarse bien, pero la fórmula, la vía de administración y la situación individual pueden importar.",
    focus: "La B12 suele presentar buena tolerancia, aunque algunas personas pueden experimentar molestias o reacciones relacionadas con la formulación. Las presentaciones orales y las inyectables no deben tratarse como idénticas en su uso.",
    safety: "Si aparece una reacción alérgica, suspende el producto y busca atención urgente ante dificultad respiratoria o hinchazón de lengua. Si tienes síntomas persistentes o una pauta médica, consulta antes de cambiar la presentación o la cantidad.",
    followup: "Comprueba la forma de B12, la dosis y los ingredientes adicionales del producto. Si recibes inyecciones o tratamiento por una deficiencia diagnosticada, comenta los efectos adversos con el profesional que lo indicó.",
    evidence: "La tolerancia depende de la formulación y de la persona. Que una vitamina sea hidrosoluble no significa que todos los productos o vías de administración estén libres de riesgos."
  },
  'como-tomar-la-vitamina-b12-correctamente': {
    excerpt: "La forma de tomar B12 depende de la presentación y de si se busca cubrir necesidades o tratar una deficiencia diagnosticada.",
    focus: "La B12 puede encontrarse en comprimidos, gotas, productos sublinguales y preparados inyectables. La elección depende de la situación clínica, la absorción y las instrucciones del producto, no de que una presentación se anuncie como más potente.",
    safety: "Si tienes una deficiencia diagnosticada, anemia o síntomas neurológicos, sigue el plan profesional y no sustituyas una pauta prescrita por un producto de venta libre sin consultarlo.",
    followup: "Revisa la cantidad por dosis, la frecuencia y la forma de B12 indicada en la etiqueta. Si sigues una dieta vegana o tomas medicamentos que pueden afectar a la absorción, pregunta qué estrategia de aporte y seguimiento conviene.",
    evidence: "Las pautas de mantenimiento y las utilizadas para tratar una deficiencia pueden ser diferentes. No conviertas la dosis de un producto o ensayo en una recomendación universal."
  },
  'cuando-tomar-la-vitamina-b12-manana-o-noche': {
    excerpt: "No existe una hora obligatoria para la B12 en todas las personas. La presentación, la pauta y la constancia importan más que una regla general.",
    focus: "La hora de toma suele depender de las instrucciones del producto y de la rutina personal. No debe asumirse que tomar B12 por la mañana garantiza más energía ni que hacerlo por la noche sea necesariamente perjudicial.",
    safety: "Si recibes un tratamiento pautado por una deficiencia, sigue la frecuencia indicada y consulta antes de modificarla. No retrases una evaluación médica de cansancio o debilidad confiando solo en cambiar la hora de una vitamina.",
    followup: "Elige un momento fácil de mantener siempre que sea compatible con las instrucciones de la presentación. Si notas cambios en el sueño o molestias, coméntalos con un profesional y revisa también otros factores.",
    evidence: "Para afirmar que una hora es superior, hacen falta estudios que comparen directamente horarios y resultados relevantes. Las funciones de la B12 no prueban por sí solas una ventana horaria óptima."
  },
  'dosis-de-la-vitamina-b12-como-interpretar-las-recomendaciones': {
    excerpt: 'La cantidad adecuada de B12 depende de la edad, la alimentación, la absorción y el motivo de uso. Compara unidades y presentación antes de interpretar la etiqueta.',
    focus: 'Distingue la cantidad declarada por comprimido de la pauta indicada para prevenir o tratar una deficiencia. Las necesidades habituales y el tratamiento de una carencia no son equivalentes.',
    safety: 'Si tienes síntomas compatibles con deficiencia, problemas de absorción, embarazo o tomas medicación de forma habitual, consulta antes de ajustar la dosis por tu cuenta.',
    followup: 'Lleva a la consulta la etiqueta y, si existen, los resultados analíticos. Pregunta si necesitas prevención, confirmación diagnóstica o tratamiento y seguimiento.',
    evidence: 'Las pautas estudiadas dependen de la causa de la deficiencia, la vía de administración y la respuesta individual. No conviertas una dosis comercial en una recomendación universal.'
  },
  'quien-deberia-evitar-la-vitamina-b12': {
    excerpt: 'No todas las personas necesitan evitar la B12, pero algunas requieren valoración para elegir la presentación y el seguimiento adecuados.',
    focus: 'La decisión depende de la causa de uso, la absorción, los antecedentes y otros tratamientos. Evitarla sin motivo puede ser tan poco útil como tomarla sin una necesidad clara.',
    safety: 'No uses el suplemento como sustituto de una evaluación si aparecen hormigueos, problemas de equilibrio, cansancio persistente u otros síntomas. Consulta especialmente si hay una enfermedad que afecta a la absorción.',
    followup: 'Antes de empezar, aclara con un profesional si existe una deficiencia confirmada, un factor de riesgo alimentario o una razón clínica para suplementar.',
    evidence: 'La seguridad y la utilidad deben valorarse según el contexto. Los datos de personas sanas no responden por sí solos a todas las situaciones clínicas.'
  },
  'interacciones-de-la-vitamina-b12-con-medicamentos': {
    excerpt: 'Algunos medicamentos pueden alterar la absorción o el estado de vitamina B12. La importancia depende del fármaco, la duración del tratamiento y los factores personales.',
    focus: 'La revisión debe considerar tanto los medicamentos prescritos como otros suplementos. No todos los usos simultáneos representan una interacción directa ni requieren la misma respuesta.',
    safety: 'No suspendas ni cambies una medicación por tu cuenta. Si tomas tratamientos prolongados o tienes síntomas, pregunta si conviene valorar la B12 mediante evaluación clínica.',
    followup: 'Prepara una lista actualizada de medicamentos, dosis y duración para el médico o farmacéutico, junto con cualquier suplemento que ya uses.',
    evidence: 'Las interacciones se deben confirmar para el medicamento y la situación concretos. No es correcto generalizar a partir de una posible asociación.'
  },
  'como-elegir-un-suplemento-de-la-vitamina-b12-de-calidad': {
    excerpt: 'Al elegir B12, revisa la cantidad por unidad, la forma declarada, los ingredientes añadidos y la claridad de las instrucciones. Un envase llamativo no garantiza mejor resultado.',
    focus: 'Compara la dosis real, la presentación y el número de unidades por envase. La metilcobalamina y la cianocobalamina son formas distintas, pero el nombre por sí solo no demuestra superioridad para todas las personas.',
    safety: 'Si se está tratando una deficiencia, no cambies de presentación ni de pauta sin comprobar que el producto encaja con el plan clínico. Revisa también alérgenos y excipientes.',
    followup: 'Guarda el etiquetado y el número de lote, y comprueba que el fabricante identifica claramente la composición y las instrucciones.',
    evidence: 'La calidad de fabricación, la forma química y la eficacia clínica son cuestiones diferentes. Evita deducir beneficios superiores únicamente de una afirmación publicitaria.'
  },
  'la-vitamina-b12-polvo-capsulas-o-comprimidos': {
    excerpt: 'La B12 se comercializa en comprimidos, cápsulas, gotas y otras presentaciones. La opción adecuada depende de la pauta, la tolerancia y la facilidad de uso.',
    focus: 'Compara la cantidad de B12 por unidad y las instrucciones específicas de cada formato. Las presentaciones no siempre son equivalentes en concentración ni modo de administración.',
    safety: 'Si tienes dificultades para tragar, problemas de absorción o un tratamiento pautado, consulta antes de sustituir una presentación por otra.',
    followup: 'Valora el coste por cantidad declarada, la facilidad para seguir la pauta y la compatibilidad con las instrucciones del producto.',
    evidence: 'No asumas que una presentación se absorbe mejor para todo el mundo. La elección debe apoyarse en la indicación y en evidencia pertinente para esa vía.'
  },
  'cuanto-tarda-en-hacer-efecto-la-vitamina-b12': {
    excerpt: 'El tiempo para notar cambios tras corregir una deficiencia de B12 varía según la causa, la intensidad y el tiempo de evolución. No todos los síntomas mejoran al mismo ritmo.',
    focus: 'Distingue la corrección de resultados analíticos de la recuperación de síntomas. Algunos problemas pueden necesitar seguimiento y no deben evaluarse solo por cómo te sientes unos días después.',
    safety: 'No retrases la consulta si aparecen síntomas neurológicos, empeoran o persisten pese al tratamiento. Sigue la pauta prescrita y acuerda cuándo revisar la respuesta.',
    followup: 'Pregunta qué señales deben vigilarse y cuándo realizar el seguimiento. Si no notas mejoría, informa al profesional en lugar de aumentar la cantidad por tu cuenta.',
    evidence: 'El tiempo de respuesta depende de la causa y del resultado evaluado. Los estudios no permiten prometer un plazo único para todas las personas.'
  },
  'que-pasa-si-dejas-de-tomar-la-vitamina-b12': {
    excerpt: 'Dejar la B12 puede ser irrelevante para algunas personas y arriesgado para otras, especialmente si existe una deficiencia, una dieta con fuentes limitadas o un problema de absorción.',
    focus: 'Antes de interrumpirla, identifica por qué se indicó: prevención dietética, mantenimiento o tratamiento. Esa razón determina si puede dejarse o si hace falta una alternativa.',
    safety: 'No suspendas un tratamiento pautado para una deficiencia sin consultarlo. Los síntomas neurológicos o la sospecha de recaída requieren evaluación, no solo reiniciar un producto comercial.',
    followup: 'Revisa con el profesional el motivo inicial, los resultados disponibles y si la causa que originó la deficiencia sigue presente.',
    evidence: 'La necesidad de continuar depende de la causa y de si se ha corregido. No se puede extrapolar la experiencia de una persona a todas las demás.'
  },
  'alimentos-ricos-en-la-vitamina-b12-frente-a-suplementos': {
    excerpt: 'La B12 se encuentra de forma natural sobre todo en alimentos de origen animal y en productos enriquecidos. La selección de alimentos depende del patrón dietético y de su etiquetado.',
    focus: 'Pescado, carne, huevos y lácteos pueden aportar B12 en distintas cantidades; algunas bebidas vegetales y cereales están enriquecidos. Comprueba la etiqueta: no todos los productos vegetales la contienen.',
    safety: 'Si sigues una dieta vegana, no confíes en alimentos vegetales no enriquecidos como fuente fiable de B12. Consulta cómo cubrir las necesidades y mantener un aporte constante.',
    followup: 'Compara las cantidades declaradas por ración y la frecuencia real de consumo. En dietas restrictivas, planifica el aporte con orientación profesional si es necesario.',
    evidence: 'La presencia de B12 depende del alimento y de si está enriquecido. Las listas genéricas de alimentos no sustituyen la comprobación del etiquetado.'
  },
  'deficiencia-de-la-vitamina-b12-senales-y-evaluacion': {
    excerpt: 'La deficiencia de B12 puede producir alteraciones hematológicas y neurológicas, pero síntomas como el cansancio tienen muchas causas y no bastan para diagnosticarla.',
    focus: 'La evaluación puede incluir historia dietética, medicamentos, factores de absorción, análisis de sangre y pruebas adicionales según el caso. Un solo síntoma no confirma una carencia.',
    safety: 'Consulta pronto si aparecen hormigueos persistentes, alteraciones del equilibrio, debilidad marcada o cambios cognitivos. No retrases la evaluación confiando solo en un suplemento.',
    followup: 'Anota síntomas, dieta, medicamentos y antecedentes digestivos para facilitar la valoración. Pregunta qué pruebas son apropiadas y cómo interpretar los resultados.',
    evidence: 'La interpretación de los análisis depende del contexto clínico y puede requerir pruebas complementarias. Evita diagnosticar o descartar una deficiencia a partir de un único dato aislado.'
  },
  'la-vitamina-b12-en-dietas-vegetarianas-y-veganas': {
    excerpt: 'Las dietas veganas no aportan de forma fiable B12 natural salvo alimentos enriquecidos; por eso es importante planificar una fuente constante y adecuada.',
    focus: 'Revisa si los productos vegetales que consumes están fortificados y qué cantidad de B12 aporta la ración. No todos los fermentados, algas o alimentos vegetales son fuentes fiables.',
    safety: 'Si estás embarazada, en lactancia, planificando un embarazo o alimentas a un menor con dieta vegana, consulta para asegurar un aporte suficiente y seguimiento apropiado.',
    followup: 'Haz una lista de alimentos enriquecidos y suplementos utilizados, con su frecuencia, y revisa si la estrategia cubre tus necesidades de forma constante.',
    evidence: 'La planificación de B12 en dietas veganas está relacionada con la fiabilidad de las fuentes. No se debe asumir que una dieta variada de plantas cubre automáticamente esta vitamina.'
  },
  'la-vitamina-b12-durante-el-embarazo-y-la-lactancia': {
    excerpt: 'Durante el embarazo y la lactancia, la B12 es importante para la salud materna e infantil, y la evaluación debe considerar dieta, absorción y antecedentes.',
    focus: 'La necesidad de suplementación depende del aporte habitual y de posibles factores de riesgo. Los productos combinados pueden incluir otros ingredientes que conviene revisar.',
    safety: 'Consulta con el equipo sanitario, especialmente si sigues una dieta vegana o vegetariana, tienes problemas de absorción o una deficiencia diagnosticada. No ajustes un tratamiento sin seguimiento.',
    followup: 'Lleva la etiqueta del producto y explica tu patrón alimentario y los suplementos prenatales que utilizas para evitar duplicidades.',
    evidence: 'Las recomendaciones para embarazo y lactancia deben basarse en guías específicas y situación individual, no extrapolarse sin más de estudios en adultos no gestantes.'
  },
  'la-vitamina-b12-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: 'En adultos mayores, la B12 merece atención por cambios en la absorción, la alimentación y el uso de determinados medicamentos. La edad por sí sola no confirma una deficiencia.',
    focus: 'La evaluación considera síntomas, dieta, antecedentes, medicamentos y análisis pertinentes. No todo cansancio o problema de memoria se explica por falta de B12.',
    safety: 'Si hay hormigueos, cambios de equilibrio, pérdida de apetito o anemia, consulta para investigar la causa. No atribuyas automáticamente los síntomas al envejecimiento.',
    followup: 'Revisa con un profesional los medicamentos habituales, la dieta y si está indicado controlar el estado de B12.',
    evidence: 'La prevalencia y las causas de deficiencia varían entre poblaciones. La edad puede ser un factor de riesgo, pero no reemplaza la evaluación clínica.'
  },
  'mitos-sobre-la-vitamina-b12-que-es-verdad-y-que-no': {
    excerpt: 'La B12 ayuda a prevenir o tratar problemas relacionados con su deficiencia, pero no es un estimulante universal ni garantiza más energía cuando el aporte ya es suficiente.',
    focus: 'Separa las funciones conocidas de la vitamina de las promesas comerciales. La utilidad de suplementar depende de la necesidad, la absorción y el objetivo real.',
    safety: 'No uses B12 para aplazar la evaluación de fatiga, hormigueos u otros síntomas persistentes. Una dosis alta no sustituye el diagnóstico de la causa.',
    followup: 'Comprueba si existe un factor de riesgo o una deficiencia confirmada antes de elegir un producto por reclamos de energía o bienestar.',
    evidence: 'Los beneficios demostrados para corregir una deficiencia no implican que dosis adicionales mejoren el rendimiento de todas las personas.'
  },
  'como-leer-la-etiqueta-de-la-vitamina-b12': {
    excerpt: 'La etiqueta de B12 debe indicar la cantidad por unidad, la forma del ingrediente, los demás componentes y las instrucciones de uso.',
    focus: 'Comprueba las unidades —por ejemplo, microgramos— y distingue la cantidad por comprimido de la porción recomendada. Revisa también otros productos que puedan contener B12.',
    safety: 'Si sigues tratamiento por una deficiencia, verifica con el profesional que el producto y la pauta corresponden a lo indicado. Revisa excipientes si tienes alergias o intolerancias.',
    followup: 'Compara envases usando la misma unidad y comprueba el lote, la fecha y la información del fabricante antes de decidir.',
    evidence: 'El etiquetado informa de la composición declarada, pero no demuestra por sí mismo que necesites el producto ni que una forma sea superior en todos los casos.'
  },
  'preguntas-frecuentes-sobre-la-vitamina-b12-guia-para-principiantes': {
    excerpt: 'Para valorar si necesitas B12, empieza por tu alimentación, posibles problemas de absorción, medicamentos y motivo de uso. No todas las personas necesitan la misma pauta.',
    focus: 'Las preguntas clave son qué fuente utilizas, qué cantidad declara el producto y si hay una deficiencia confirmada o un factor de riesgo. El objetivo cambia la estrategia.',
    safety: 'Si tienes síntomas persistentes o un diagnóstico previo, consulta antes de iniciar, cambiar o suspender el suplemento. No uses la etiqueta como sustituto de un plan de tratamiento.',
    followup: 'Anota tu patrón alimentario y los suplementos actuales; esa información puede orientar una conversación más útil con el profesional sanitario.',
    evidence: 'La prevención, el tratamiento y el mantenimiento son situaciones distintas. La pauta apropiada depende de la causa y del seguimiento necesario.'
  },
  'que-es-el-omega-3-y-para-que-sirve': {
    excerpt: 'El omega-3 agrupa ácidos grasos como EPA y DHA, presentes sobre todo en pescados grasos, y ALA, que se encuentra en algunas fuentes vegetales. No son formas idénticas.',
    focus: 'Distingue EPA y DHA de ALA al leer un suplemento. El aceite de pescado, el aceite de algas y las fuentes vegetales tienen composiciones diferentes y no deben compararse solo por el volumen del envase.',
    safety: 'Consulta antes de usar dosis altas si tomas anticoagulantes, tienes una enfermedad crónica, estás embarazada o tienes una intervención programada.',
    followup: 'Comprueba la cantidad de EPA y DHA por porción, no solo los miligramos totales de aceite. Identifica también la fuente y las instrucciones del producto.',
    evidence: 'Los efectos investigados dependen del ácido graso, la dosis, la población y el resultado. No todos los productos etiquetados como omega-3 son equivalentes.'
  },
  'beneficios-del-omega-3-que-dice-la-evidencia': {
    excerpt: 'Los omega-3 participan en funciones normales del organismo, pero los beneficios de suplementarlos dependen del objetivo y de la situación nutricional y clínica.',
    focus: 'Separa los beneficios de consumir pescado dentro de una dieta equilibrada de los efectos estudiados para cápsulas concretas. La evidencia no respalda todas las promesas comerciales.',
    safety: 'No uses suplementos para sustituir tratamientos indicados ni para tratar una enfermedad sin supervisión. Si tomas medicación o tienes una condición clínica, consulta antes de usar dosis elevadas.',
    followup: 'Define el objetivo de uso y revisa si tu alimentación ya aporta fuentes de omega-3. Un profesional puede ayudarte a valorar si el suplemento tiene sentido.',
    evidence: 'La evidencia varía por desenlace y población; un resultado favorable en un contexto no demuestra un beneficio general para todas las personas.'
  },
  'efectos-secundarios-del-omega-3': {
    excerpt: 'Los efectos adversos más habituales de los suplementos de omega-3 pueden incluir molestias digestivas o sabor a pescado; el riesgo depende del producto y la cantidad.',
    focus: 'Valora la tolerancia junto con los ingredientes, la forma de administración y la cantidad de EPA y DHA. Los productos combinados pueden añadir otros componentes.',
    safety: 'Consulta antes de usar dosis altas si tomas anticoagulantes o antiagregantes, tienes antecedentes médicos relevantes o vas a someterte a una intervención. Busca atención si aparece una reacción grave.',
    followup: 'Registra el producto, la cantidad y cuándo aparecen las molestias; revisa con un profesional si conviene cambiar la presentación o suspenderlo.',
    evidence: 'Los efectos adversos observados dependen de la dosis y de la formulación. No extrapoles automáticamente resultados de un producto a todos los suplementos de omega-3.'
  },
  'como-tomar-el-omega-3-correctamente': {
    excerpt: 'La forma de tomar omega-3 depende de las instrucciones del producto, la cantidad de EPA y DHA y la tolerancia digestiva. No existe una pauta única para todo el mundo.',
    focus: 'Comprueba la cantidad por cápsula y por porción, y si la etiqueta recomienda tomarlo con comida. No confundas los miligramos de aceite total con los de EPA y DHA.',
    safety: 'Consulta antes de ajustar cantidades o combinar varios productos, especialmente si tomas medicamentos que afectan a la coagulación o tienes una enfermedad crónica.',
    followup: 'Revisa la dosis declarada y las indicaciones del fabricante con el profesional que te aconseje; evita duplicar ingredientes entre productos.',
    evidence: 'Las dosis estudiadas dependen del objetivo y del tipo de omega-3. Una pauta usada en investigación no debe convertirse automáticamente en recomendación personal.'
  },
  'cuando-tomar-el-omega-3-manana-o-noche': {
    excerpt: 'No hay una hora universal que haga más eficaz al omega-3. La regularidad, la tolerancia y las instrucciones de la presentación suelen ser más prácticas que una regla de mañana o noche.',
    focus: 'Si la etiqueta aconseja tomarlo con alimentos, elige una comida que facilite seguir la pauta y tolerar el producto. No asumas que el horario por sí solo cambia los beneficios.',
    safety: 'Si tienes una pauta médica, tomas anticoagulantes o utilizas dosis altas, consulta antes de modificar la frecuencia o el momento de toma.',
    followup: 'Escoge un momento compatible con las instrucciones y tu rutina, y anota cualquier molestia para comentarla si persiste.',
    evidence: 'Para afirmar que un horario es superior hacen falta comparaciones directas de horarios y resultados relevantes. La función del omega-3 no establece por sí sola una hora óptima.'
  },
  'dosis-del-omega-3-como-interpretar-las-recomendaciones': {
    excerpt: 'La cantidad de omega-3 se interpreta según los miligramos de EPA y DHA, el objetivo y el producto concreto; no basta con mirar el aceite total del envase.',
    focus: 'Distingue la cantidad total de aceite de la suma de EPA y DHA. Los suplementos varían mucho en concentración, por lo que el número de cápsulas no permite comparar dosis por sí solo.',
    safety: 'Consulta antes de usar cantidades elevadas si tomas medicación, tienes una enfermedad crónica, estás embarazada o tienes una intervención programada. No ajustes una pauta médica por tu cuenta.',
    followup: 'Lleva la etiqueta y el motivo de uso a una consulta para revisar la cantidad real de EPA y DHA y si el producto es apropiado.',
    evidence: 'Los estudios usan formulaciones, cantidades y objetivos distintos. No conviertas la dosis de un ensayo en una recomendación universal.'
  },
  'quien-deberia-evitar-el-omega-3': {
    excerpt: 'El omega-3 no es adecuado para todo el mundo en cualquier cantidad. La evaluación depende de la medicación, las condiciones médicas, el producto y el objetivo de uso.',
    focus: 'La alergia a pescado o marisco, los antecedentes médicos y los ingredientes añadidos pueden influir en la elección. Las opciones a base de algas tampoco deben darse por adecuadas sin revisar su etiqueta.',
    safety: 'Pide orientación profesional si tomas anticoagulantes o antiagregantes, tienes trastornos de sangrado, una enfermedad crónica o una cirugía próxima. En embarazo y lactancia, revisa la fuente y la formulación.',
    followup: 'Comprueba la fuente del omega-3, los alérgenos declarados y la cantidad de EPA y DHA antes de comparar alternativas.',
    evidence: 'La seguridad depende de la dosis y del contexto individual; no puede decidirse únicamente por la categoría general «omega-3».'
  },
  'interacciones-del-omega-3-con-medicamentos': {
    excerpt: 'Al revisar posibles interacciones, importa conocer la cantidad de EPA y DHA y todos los medicamentos que se utilizan, no solo el nombre del suplemento.',
    focus: 'Los posibles efectos sobre la coagulación merecen especial atención en personas que toman anticoagulantes o antiagregantes. La valoración también debe incluir otros ingredientes del producto.',
    safety: 'No suspendas medicamentos ni cambies su dosis para incorporar omega-3. Si tomas tratamientos habituales o tienes una intervención prevista, consulta con tu médico o farmacéutico.',
    followup: 'Prepara una lista actualizada de medicamentos y una foto de la etiqueta, incluida la cantidad de EPA y DHA por porción.',
    evidence: 'Las interacciones dependen de la formulación, la dosis y el tratamiento concomitante. Evita extrapolar una advertencia general a todos los casos.'
  },
  'como-elegir-un-suplemento-del-omega-3-de-calidad': {
    excerpt: 'Para valorar la calidad de un omega-3, compara EPA y DHA por porción, fuente, ingredientes, conservación y controles verificables; no te guíes solo por el reclamo frontal.',
    focus: 'Comprueba si procede de pescado, kril o algas, qué cantidad de cada ácido graso aporta y si incluye otros ingredientes. El total de aceite no equivale a la cantidad de omega-3 activos.',
    safety: 'Revisa alérgenos, instrucciones de conservación y posibles ingredientes añadidos si tienes restricciones médicas. Desconfía de promesas de curar o prevenir enfermedades sin respaldo.',
    followup: 'Compara dos etiquetas con la misma base de cálculo y busca información clara del fabricante sobre composición, lote y control de calidad.',
    evidence: 'Un sello de calidad no demuestra por sí solo un beneficio clínico. La pureza declarada, la composición y la eficacia son aspectos distintos.'
  },
  'el-omega-3-polvo-capsulas-o-comprimidos': {
    excerpt: 'El omega-3 suele venderse en cápsulas blandas y líquidos; el formato influye en la comodidad, pero no determina por sí solo la concentración ni la calidad.',
    focus: 'Compara los miligramos de EPA y DHA por porción, el tamaño de la toma y las condiciones de conservación. Un líquido puede requerir medir la cantidad con cuidado y seguir instrucciones específicas.',
    safety: 'Revisa alérgenos y excipientes en cualquier presentación. Si tienes dificultades para tragar, alergias o una pauta médica, consulta antes de sustituir un formato por otro.',
    followup: 'Calcula el coste por cantidad de EPA y DHA y ten en cuenta el tamaño de porción y la facilidad de conservación.',
    evidence: 'No hay una presentación universalmente superior. La comparación debe considerar composición, tolerancia, estabilidad y evidencia pertinente.'
  },
  'cuanto-tarda-en-hacer-efecto-el-omega-3': {
    excerpt: 'Los cambios asociados al consumo de omega-3 no tienen un plazo único. Dependen del resultado que se evalúe, la alimentación inicial y la cantidad utilizada.',
    focus: 'Distingue los cambios en indicadores biológicos de los efectos que una persona puede notar. No percibir una sensación inmediata no permite concluir que el producto funcione o no funcione.',
    safety: 'No uses la ausencia de cambios subjetivos como motivo para aumentar la cantidad por tu cuenta. Si lo tomas por una indicación clínica, acuerda con el profesional cómo evaluar la respuesta.',
    followup: 'Define de antemano qué resultado se pretende valorar y en qué momento revisar si el suplemento sigue teniendo sentido.',
    evidence: 'Los ensayos difieren en duración, formulación y resultados. No es apropiado prometer una fecha concreta para notar beneficios.'
  },
  'que-pasa-si-dejas-de-tomar-el-omega-3': {
    excerpt: 'Dejar un suplemento de omega-3 no tiene el mismo significado para todas las personas: depende de la dieta, del motivo de uso y de si forma parte de un plan clínico.',
    focus: 'Si lo tomabas para complementar la alimentación, revisa qué fuentes de omega-3 quedan en tu dieta. Si se indicó como parte de un tratamiento, la decisión debe revisarse con el profesional responsable.',
    safety: 'No suspendas un producto prescrito o recomendado para una condición clínica sin consultar. Tampoco sustituyas un tratamiento médico por alimentos o suplementos sin orientación.',
    followup: 'Repasa el motivo inicial, los alimentos que consumes y cualquier indicación clínica antes de decidir si mantenerlo o dejarlo.',
    evidence: 'Los efectos de interrumpirlo dependen del contexto y del resultado de interés; no se pueden generalizar a todas las personas.'
  },
  'alimentos-ricos-en-el-omega-3-frente-a-suplementos': {
    excerpt: 'Pescados grasos como sardina, salmón y caballa aportan EPA y DHA; semillas y nueces aportan ALA, que el organismo convierte de forma limitada en EPA y DHA.',
    focus: 'Distingue las fuentes marinas de las vegetales y recuerda que no aportan necesariamente las mismas formas de omega-3. La frecuencia de consumo y el patrón dietético completo también importan.',
    safety: 'Si tienes alergia a pescado, sigues una dieta terapéutica o estás embarazada, consulta cómo elegir fuentes seguras y adecuadas. Comprueba las recomendaciones locales sobre especies y contaminantes.',
    followup: 'Revisa qué fuentes aparecen de forma habitual en tus comidas y compara su aporte con el objetivo que te hayas planteado antes de comprar un suplemento.',
    evidence: 'La alimentación puede aportar omega-3 sin necesidad de un producto para todo el mundo. La conveniencia de suplementar depende de la dieta y del objetivo específico.'
  },
  'deficiencia-del-omega-3-senales-y-evaluacion': {
    excerpt: 'La expresión «deficiencia de omega-3» no se identifica de forma fiable por un síntoma aislado. La evaluación considera la dieta, el contexto clínico y, cuando proceda, pruebas específicas.',
    focus: 'La piel seca, el cansancio u otras molestias son inespecíficos y pueden tener muchas causas. No deben utilizarse por sí solos para concluir que falta omega-3.',
    safety: 'Si tienes síntomas persistentes, pérdida de peso o una condición médica, consulta para investigar la causa en lugar de autodiagnosticarte y tomar dosis altas.',
    followup: 'Registra las fuentes alimentarias que consumes y explica al profesional cualquier síntoma o cambio relevante; pregunta si existe motivo para realizar pruebas.',
    evidence: 'No existe un conjunto de síntomas cotidianos que confirme por sí solo una deficiencia. La interpretación de pruebas debe hacerse según el contexto y el método utilizado.'
  },
  'el-omega-3-en-dietas-vegetarianas-y-veganas': {
    excerpt: 'Las dietas vegetarianas y veganas pueden aportar ALA mediante lino, chía, nueces y algunos aceites; para EPA y DHA puede valorarse el aceite de microalgas.',
    focus: 'Distingue el ALA vegetal de EPA y DHA. La conversión de ALA a las formas de cadena larga es limitada y variable, por lo que las fuentes no son directamente intercambiables.',
    safety: 'Si estás embarazada, en lactancia o tienes una condición médica, consulta antes de seleccionar un suplemento. Revisa también posibles alérgenos y la composición de las fórmulas de algas.',
    followup: 'Compara las fuentes vegetales habituales y, si consideras un producto de algas, revisa la cantidad declarada de EPA y DHA y las instrucciones.',
    evidence: 'La elección depende del patrón dietético y de la forma de omega-3 que se busca aportar. No todas las fuentes vegetales tienen el mismo perfil.'
  },
  'el-omega-3-durante-el-embarazo-y-la-lactancia': {
    excerpt: 'Durante el embarazo y la lactancia, la fuente y la composición del omega-3 importan tanto como la cantidad; no todos los productos son equivalentes.',
    focus: 'El pescado puede aportar DHA y otros nutrientes, mientras que los suplementos varían en concentración y procedencia. Los productos combinados pueden contener vitaminas u otros ingredientes que requieren revisión.',
    safety: 'Consulta con el equipo sanitario antes de elegir un suplemento, especialmente si tienes alergia, tomas medicación o usas productos de aceite de hígado de pescado que pueden aportar vitamina A.',
    followup: 'Lleva la etiqueta completa a la consulta y pregunta qué fuente y cantidad son adecuadas según tu dieta y situación.',
    evidence: 'La evidencia y las recomendaciones para embarazo y lactancia deben proceder de guías específicas; no extrapoles automáticamente estudios en otros adultos.'
  },
  'el-omega-3-en-adultos-mayores-que-tener-en-cuenta': {
    excerpt: 'En adultos mayores, la utilidad de un suplemento de omega-3 depende de la dieta, los objetivos, las enfermedades y la medicación habitual.',
    focus: 'Revisa primero las fuentes alimentarias y el motivo concreto de uso. La edad por sí sola no demuestra que haga falta un suplemento ni que vaya a mejorar memoria o movilidad.',
    safety: 'Si tomas anticoagulantes, tienes antecedentes de sangrado, enfermedades crónicas o una intervención próxima, consulta antes de usar dosis elevadas.',
    followup: 'Lleva una lista de medicamentos y la etiqueta del producto a una revisión, especialmente si ya utilizas varios suplementos.',
    evidence: 'Los estudios en personas mayores no muestran necesariamente el mismo resultado en todas las poblaciones ni para todos los desenlaces.'
  },
  'mitos-sobre-el-omega-3-que-es-verdad-y-que-no': {
    excerpt: 'El omega-3 no es una solución universal para el corazón, el cerebro o las articulaciones. La evidencia depende de la formulación, la cantidad y el objetivo concreto.',
    focus: 'Separa los beneficios de incluir pescado en una dieta equilibrada de los efectos de un suplemento específico. No todos los productos contienen cantidades comparables de EPA y DHA.',
    safety: 'No sustituyas tratamientos prescritos por suplementos ni uses dosis elevadas por promesas comerciales. Consulta si tienes una enfermedad o tomas medicamentos que puedan interactuar.',
    followup: 'Antes de comprar, define qué necesitas cubrir y comprueba si tu alimentación ya aporta fuentes de omega-3.',
    evidence: 'Un resultado favorable en un estudio no prueba que todos los productos produzcan el mismo beneficio. Revisa población, dosis y resultado medido.'
  },
  'como-leer-la-etiqueta-del-omega-3': {
    excerpt: 'La etiqueta del omega-3 debe permitir distinguir el aceite total de las cantidades de EPA y DHA, además de identificar ingredientes y advertencias.',
    focus: 'Comprueba unidades por cápsula y por porción, fuente del aceite, ingredientes añadidos, alérgenos, lote y condiciones de conservación. No compares productos usando solo el peso total del aceite.',
    safety: 'Si tomas medicación o tienes alergias, revisa advertencias y componentes adicionales con un profesional. No interpretes una etiqueta como autorización para usar dosis altas.',
    followup: 'Compara dos etiquetas en una tabla sencilla con EPA, DHA, número de cápsulas por porción y coste por cantidad efectiva.',
    evidence: 'La información de composición ayuda a comparar productos, pero no determina por sí sola si necesitas suplementación ni demuestra resultados clínicos.'
  },
  'preguntas-frecuentes-sobre-el-omega-3-guia-para-principiantes': {
    excerpt: 'Para decidir si necesitas omega-3, empieza por la alimentación, el objetivo y la medicación habitual. La elección cambia según busques una fuente dietética o una formulación concreta.',
    focus: 'Comprueba la cantidad de EPA y DHA, la fuente y los ingredientes añadidos. Pregúntate también si el producto cubre una necesidad real o duplica algo que ya tomas.',
    safety: 'Consulta antes de usar dosis altas si tomas anticoagulantes, tienes una condición médica, estás embarazada o en lactancia. No sustituyas tratamientos por suplementos.',
    followup: 'Lleva la etiqueta y una lista de otros suplementos o medicamentos a la consulta si necesitas una recomendación individual.',
    evidence: 'No existe una única pauta válida para todo el mundo. La utilidad depende de la dieta, el objetivo, la formulación y el contexto clínico.'
  },
  'que-es-el-hierro-y-para-que-sirve': {
    excerpt: 'El hierro es un mineral necesario para formar hemoglobina y transportar oxígeno. La necesidad de suplementarlo depende de la situación y no se deduce solo del cansancio.',
    focus: 'Distingue el hierro presente en los alimentos del suplemento utilizado para prevenir o tratar una deficiencia. La dosis, la forma y la indicación deben interpretarse según el contexto.',
    safety: 'No empieces hierro por tu cuenta si sospechas anemia; el exceso puede ser perjudicial y existen distintas causas de anemia. Busca valoración si tienes síntomas persistentes o sangrado.',
    followup: 'Si te han recomendado hierro, pregunta qué motivo se está tratando, qué seguimiento está previsto y cómo se relaciona la pauta con tus análisis.',
    evidence: 'El hierro es esencial, pero eso no significa que todas las personas necesiten suplementarlo. La evidencia sobre tratamiento depende de confirmar la causa y la deficiencia.'
  },
  'beneficios-del-hierro-que-dice-la-evidencia': {
    excerpt: 'El hierro puede mejorar los problemas causados por una deficiencia confirmada, pero no es un energizante universal y no trata todas las formas de anemia.',
    focus: 'Separa el beneficio de corregir la falta de hierro de los efectos en personas con niveles adecuados. El objetivo debe ser tratar la causa y recuperar valores apropiados, no tomar más por si acaso.',
    safety: 'Evita la suplementación sin indicación, especialmente si hay antecedentes de sobrecarga de hierro o enfermedades relevantes. Si tienes fatiga persistente, consulta en vez de autotratarte.',
    followup: 'Revisa con un profesional los análisis y la causa probable antes de elegir un suplemento o cambiar la pauta.',
    evidence: 'Los beneficios dependen del estado de hierro inicial y del motivo clínico. No se puede asumir que añadir hierro mejore energía o rendimiento en personas sin deficiencia.'
  },
  'efectos-secundarios-del-hierro': {
    excerpt: 'Los suplementos de hierro pueden causar molestias digestivas, como náuseas, estreñimiento o dolor abdominal. La tolerancia depende de la formulación y de la pauta.',
    focus: 'La cantidad de hierro elemental y la presentación influyen en la comparación entre productos. Las heces oscuras pueden aparecer con el uso, pero otros síntomas requieren valoración.',
    safety: 'Mantén el hierro fuera del alcance de los niños: una sobredosis puede ser muy peligrosa. Busca atención urgente ante una ingesta accidental importante o síntomas graves.',
    followup: 'Si tienes molestias, consulta antes de cambiar la dosis, la frecuencia o la presentación; el profesional puede valorar alternativas y la necesidad de seguimiento.',
    evidence: 'Los efectos adversos varían entre formulaciones y personas. No aumentes la cantidad para acelerar la respuesta ni ignores síntomas intensos.'
  },
  'como-tomar-el-hierro-correctamente': {
    excerpt: 'La forma correcta de tomar hierro depende de la presentación, la indicación y la tolerancia. Sigue las instrucciones de la receta o del envase y no dupliques dosis olvidadas.',
    focus: 'Comprueba cuánto hierro elemental aporta cada unidad y si las instrucciones indican tomarlo con alimentos o separado de ciertos productos. Calcio, té, café y algunos medicamentos pueden afectar a la absorción.',
    safety: 'No empieces ni ajustes hierro sin valoración cuando no se ha confirmado la necesidad. Guarda el producto de forma segura y sigue las instrucciones específicas sobre interacciones.',
    followup: 'Pregunta al farmacéutico cómo coordinar la toma con otros medicamentos y qué hacer si olvidas una dosis o tienes molestias digestivas.',
    evidence: 'Las recomendaciones pueden variar según la formulación y el objetivo terapéutico. No existe una instrucción horaria única aplicable a todos los suplementos de hierro.'
  },
  'cuando-tomar-el-hierro-manana-o-noche': {
    excerpt: 'No hay una hora universal para tomar hierro: importan la formulación, las instrucciones, la tolerancia y la coordinación con alimentos y medicamentos.',
    focus: 'Algunas pautas recomiendan tomarlo separado de ciertos alimentos o bebidas, mientras que tomarlo con comida puede mejorar la tolerancia en determinados casos. Sigue las indicaciones específicas recibidas.',
    safety: 'Consulta antes de modificar la pauta si tomas otros medicamentos o tienes una condición clínica. No aumentes la cantidad ni cambies el horario para compensar síntomas sin orientación.',
    followup: 'Elige el horario que respete las instrucciones y sea sostenible, y confirma con el farmacéutico las separaciones necesarias respecto a tus otros medicamentos.',
    evidence: 'La absorción y tolerancia dependen de la formulación y del contexto. La evidencia no respalda una única hora ideal para todas las personas.'
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
