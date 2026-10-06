import type { Article } from './types'

/**
 * Artículo sobre el temporal de lluvias e inundaciones en Cataluña (octubre de 2026).
 * Categoría `virales`. Formato editorial: Markdown simple (## / ### / listas /
 * **negrita** / *cursiva*), tal como lo consume `parseArticleContent` en lib/article-content.ts.
 */
export const INUNDACIONES_CATALUNA_2026_ARTICLES: Article[] = [
  {
    id: 8,
    title: 'Inundaciones en Cataluña en octubre de 2026: alerta roja, comarcas afectadas y recomendaciones',
    slug: 'inundaciones-cataluna-octubre-2026-alerta-recomendaciones',
    category: 'virales',
    excerpt: 'Cataluña encadena varios días de lluvias torrenciales en octubre de 2026, con avisos rojos, la alarma ES-Alert activada en varias comarcas y más de 280 litros por metro cuadrado. Repasamos qué ha pasado, qué zonas se han visto afectadas y qué hacer durante un episodio de lluvias extremas.',
    content: `Cataluña ha vivido a comienzos de octubre de 2026 uno de los episodios de lluvias torrenciales más intensos de los últimos años. En pocos días se han encadenado avisos rojos, alertas masivas a los teléfonos móviles, inundaciones en núcleos urbanos y varias víctimas mortales, sobre un terreno que ya estaba empapado de jornadas anteriores. Este artículo repasa qué ha ocurrido, qué comarcas se han visto afectadas, hasta cuándo se esperan lluvias y qué recomiendan las autoridades hacer en una situación así.

## Qué ha pasado: un temporal de récord en pocos días

El episodio se desencadenó a finales de septiembre y se intensificó el fin de semana del 3 al 5 de octubre, cuando el Servei Meteorològic de Catalunya situó varias comarcas del litoral y del prelitoral catalán en **nivel rojo**, que es el grado máximo de peligro.

Las cifras explican por sí solas la magnitud del fenómeno. Se registraron acumulaciones de hasta **288 litros por metro cuadrado** en Vilassar de Mar, en la comarca del Maresme, en apenas unas horas. Para ponerlo en contexto: en muchas zonas de España eso equivale a más de la mitad de lo que llueve en un año completo. A esa acumulación hay que añadirle rachas de viento de hasta 120 kilómetros por hora en puntos del litoral.

Los expertos describieron el patrón de forma muy gráfica: no se trata de que llueva mucho durante días, sino de que llueve **muchísima cantidad en muy poco tiempo**. Es una diferencia crítica, porque el suelo y los sistemas de drenaje no tienen capacidad para absorber ese volumen en un intervalo tan corto. Esa intensidad es la que provoca las riadas y las inundaciones súbitas.

## Las comarcas afectadas

La Generalitat envió tres mensajes **ES-Alert** distintos a los teléfonos móviles de los residentes en las zonas señaladas. El ES-Alert es ese aviso que suena con una alarma estridente en el móvil, incluso si lo tienes en silencio, y que aparece en pantalla con instrucciones de emergencia. Su activación indica que el riesgo es inminente y que hay que tomar medidas de inmediato.

Las comarcas que recibieron la alerta fueron ocho:

- **Barcelonès**, la comarca de Barcelona
- **Alt Penedès**
- **Garraf**
- **Baix Llobregat**
- **Vallès Occidental**
- **Vallès Oriental**
- **Maresme**
- **La Selva**, ya en la provincia de Girona

El mensaje que llegó a los móviles era directo y sin matices: evitar desplazamientos, no acercarse a ríos ni rieras y no bajar a subterráneos, garajes o sótanos. La recomendación de llamar al 112 solo en caso de emergencia real buscaba mantener libres las líneas para las situaciones verdaderamente urgentes.

## Consecuencias: dos fallecidos, un desaparecido y miles de llamadas

El balance humano del temporal fue grave. **Dos personas fallecieron** en la provincia de Barcelona y una tercera permanecía **desaparecida**, según los datos difundidos durante los días más duros del episodio. Las inundaciones afectaron de forma notable a municipios como **Granollers**, en el Vallès Oriental, donde el agua anegó calles y bajos.

La presión sobre los servicios de emergencia fue enorme. El teléfono **112 recibió 7.440 llamadas** relacionadas con el temporal hasta las 14:00 horas del domingo 4 de octubre. Ese volumen da una idea de la cantidad de incidencias simultáneas: vehículos atrapados, bajos inundados, cortes de carretera y personas que necesitaban asistencia.

## Qué se espera de aquí en adelante

El temporal no terminó con el fin de semana. La semana arrancó con un nuevo frente y con **avisos de nivel naranja** en lugar de rojo, lo que supone un grado menos de peligro pero no significa que la situación esté resuelta. Las previsiones apuntan a que la inestabilidad se prolongue **hasta el jueves**, con el jueves como jornada de mayor riesgo.

El reparto previsto es el siguiente:

- **Tarde del lunes**: chubascos que pueden superar los 20 litros por metro cuadrado en 30 minutos en el litoral y el prelitoral.
- **Franja de mediodía y tarde del martes**: aviso naranja en el Pirineo y el centro, con posibilidad de superar los 30 litros por metro cuadrado en una hora y acumulaciones de más de 60 litros en doce horas. Los chubascos pueden ir acompañados de tormenta y granizo.
- **A partir de las 20:00 del martes**: los aguaceros pueden afectar con especial intensidad al **Camp de Tarragona** y comarcas del entorno.
- **Noche y madrugada**: las lluvias se intensifican en **Barcelona y su área metropolitana**, con nuevos chaparrones posibles en el **Maresme**, **La Selva** y el **Baix Empordà**.
- **Jueves**: Barcelona y su área metropolitana podrían registrar lluvias intensas durante la tarde, que podrían prolongarse en la costa central hasta la madrugada del viernes. En el Pirineo se esperan precipitaciones abundantes y nieve, con la cota bajando hasta los 2.200 metros.

El sur de Tarragona es una de las zonas que los meteorólogos señalan con especial atención, porque acumula varios días de lluvia y es habitualmente sensible a las inundaciones.

## Por qué el riesgo es mayor de lo que parece

Hay un factor que conviene entender y que las autoridades han repetido en cada comunicado: **el suelo está saturado**. Tras varios días de precipitaciones intensas, la tierra ya no absorbe más agua y los **ríos, rieras y barrancos bajan cargados**. Eso significa que una lluvia moderada que en condiciones normales no causaría problemas puede provocar crecidas rápidas y anegaciones.

Es la razón por la que el nivel del aviso no cuenta toda la historia. Un aviso naranja sobre terreno seco es una cosa; sobre terreno empapado, con los cauces llenos, es otra bastante más seria. En este contexto, los puntos habitualmente inundables y las zonas bajas concentran el mayor riesgo.

## Recomendaciones de Protecció Civil

Ante un episodio de lluvias torrenciales, las indicaciones oficiales se resumen en una serie de pautas muy concretas. Conviene tenerlas presentes porque, en una situación así, las decisiones se toman con prisa y es fácil equivocarse.

- **Evitar los desplazamientos.** Si no es imprescindible salir, lo mejor es quedarse en casa. Gran parte de las emergencias graves ocurren en coches atrapados por el agua.
- **No acercarse a ríos, rieras ni barrancos.** Aunque parezcan tranquilos, pueden crecer de golpe en pocos minutos. La corriente de una riada es mucho más potente de lo que parece.
- **No bajar a garajes, sótanos ni plantas bajo el nivel de la calle.** Son los espacios donde el agua se acumula primero y de donde es más difícil salir. Si ya estás en uno y empieza a entrar agua, sube inmediatamente.
- **Alejarse de los cauces si estás en el campo o en una zona abierta.** Buscar un punto elevado es la prioridad.
- **No cruzar con el coche una zona inundada.** El agua oculta baches y la profundidad real. Un palmo de agua en movimiento ya puede arrastrar un vehículo.
- **Llamar al 112 solo en emergencias reales**, para no bloquear las líneas que necesita quien está en peligro.
- **Seguir la información oficial** a través de los canales de Protecció Civil y del Servei Meteorològic de Catalunya, más que los rumores que circulan en redes.

## Cómo interpretar los avisos meteorológicos

Uno de los problemas de estas situaciones es que la gente no siempre distingue los distintos niveles de alerta, y eso lleva a infravalorar el riesgo. La escala básica tiene cuatro grados:

- **Verde**: no hay riesgo meteorológico relevante.
- **Amarillo**: riesgo bajo, pero conviene estar atento. Puede haber incidencias puntuales.
- **Naranja**: riesgo importante. Se esperan fenómenos que pueden ser peligrosos y se recomienda modificar los planes.
- **Rojo**: riesgo extremo. Los fenómenos previstos pueden ser muy peligrosos y la recomendación es no desplazarse.

A esa escala hay que sumarle el **ES-Alert**, que es un nivel distinto: no informa de una previsión, sino que avisa de que hay una emergencia en curso en tu zona concreta y de que debes actuar. Recibir uno significa que la situación ya no es una posibilidad, sino un hecho en tu entorno.

## Preguntas frecuentes

### ¿Qué comarcas de Cataluña han estado en alerta?
Las ocho comarcas que recibieron el aviso ES-Alert fueron Barcelonès, Alt Penedès, Garraf, Baix Llobregat, Vallès Occidental, Vallès Oriental, Maresme y La Selva. En los días posteriores se han activado avisos naranjas en otras zonas, especialmente en el sur de Cataluña, Tarragona y el Pirineo.

### ¿Qué significa que el aviso sea naranja y no rojo?
Significa que el peligro es importante pero no extremo. Aun así, en un episodio con el suelo saturado y los ríos crecidos, un aviso naranja puede provocar inundaciones porque la capacidad de absorción del terreno está agotada. Conviene no relajarse solo porque el nivel haya bajado.

### ¿Qué se debe hacer si llega una alerta ES-Alert al móvil?
Lo primero es leerla entera y seguir sus instrucciones. En general implican evitar desplazamientos, no acercarse a ríos ni rieras y no bajar a garajes o sótanos. Si estás en la calle, busca un punto elevado y resguardado, y evita los túneles y pasos subterráneos.

### ¿Hasta cuándo van a durar las lluvias en Cataluña?
Las previsiones apuntan a que la inestabilidad se mantenga hasta el jueves, con el jueves como jornada de mayor riesgo en Barcelona y su área metropolitana. Los chubascos podrían prolongarse en la costa central hasta la madrugada del viernes.

### ¿Por qué llueve tanto en la costa mediterránea?
Porque las masas de aire cálido y cargado de humedad procedentes del Mediterráneo chocan con la orografía del litoral catalán y descargan de golpe. Ese mecanismo concentra mucha precipitación en muy poco tiempo y espacio, que es exactamente lo que define a una lluvia torrencial.

## Qué lecciones deja este episodio

El temporal de octubre de 2026 en Cataluña deja varias ideas que van más allá de los datos de estos días. La primera es que **la intensidad importa más que el total**: 288 litros repartidos en una semana no provocan una riada, y los mismos 288 litros en cuatro horas sí lo hacen. La segunda es que el riesgo no desaparece cuando baja el nivel del aviso, porque el terreno saturado y los cauces cargados mantienen el peligro durante días.

La tercera es la utilidad de los sistemas de aviso masivo como el ES-Alert, que permiten llegar a toda una comarca en segundos con instrucciones concretas, algo impensable hace solo unos años. Y la última, quizá la más importante para quien lea esto en el futuro: en un episodio de lluvias torrenciales, la mayoría de los accidentes graves ocurren por decisiones tomadas en los primeros minutos, y casi siempre están relacionadas con desplazarse o con bajar a un espacio cerrado. Quedarse en un lugar seguro y esperar es, con diferencia, la mejor decisión.`,
    image_url: '/images/articles/inundaciones-cataluna-2026.svg',
    thumbnail_url: '/images/articles/inundaciones-cataluna-2026.svg',
    read_time_minutes: 10,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T17:30:00.000Z',
  },
]
