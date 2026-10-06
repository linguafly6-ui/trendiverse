import type { Article } from './types'

/**
 * Artículo sobre seguridad eléctrica en el baño y prevención de electrocuciones.
 * Categoría `tecnologia`. Formato editorial: Markdown simple (## / ### / listas /
 * **negrita** / *cursiva*), tal como lo consume `parseArticleContent` en
 * lib/article-content.ts. El parser no soporta tablas ni enlaces.
 *
 * NOTA: contenido de seguridad. Antes de publicar conviene una revisión por
 * personal cualificado (instalador autorizado) de las distancias, los volúmenes
 * del REBT y el protocolo de actuación ante una descarga.
 */
export const SEGURIDAD_ELECTRICA_BANO_ARTICLES: Article[] = [
  {
    id: 13,
    title: 'Cómo evitar electrocutarse con la alcachofa de la ducha: guía de seguridad eléctrica en el baño',
    slug: 'evitar-electrocucion-ducha-seguridad-electrica-bano',
    category: 'tecnologia',
    excerpt: 'El baño es la habitación más peligrosa de la casa desde el punto de vista eléctrico. Explicamos cuál es la protección que evita las electrocuciones en la ducha, las zonas del baño que marca la normativa, cómo comprobar si tu diferencial funciona y qué hacer ante una descarga.',
    content: `El baño es la habitación más peligrosa de la casa desde el punto de vista eléctrico, y no por exageración: es el único espacio donde el agua, la humedad y tu propio cuerpo desnudo y descalzo coinciden con enchufes, cables y aparatos conectados a la red. La buena noticia es que la electrocución en la ducha es un accidente casi siempre evitable, porque depende de que exista o no una protección muy concreta en tu cuadro eléctrico. Esta guía explica cuál es esa protección, dónde está el riesgo real y qué hacer si ocurre un accidente.

## Por qué el agua y la electricidad son una combinación letal

El agua de la ducha no es un buen conductor por sí misma. Lo que la convierte en peligrosa son las sales minerales y los iones que lleva disueltos, que permiten que la corriente la atraviese. Cuando estás dentro de ese circuito, con los pies mojados, sobre un suelo húmedo y con la piel empapada, tu resistencia al paso de la corriente cae en picado. La piel seca ofrece una resistencia elevada; la piel mojada, mucho menor, y por eso una tensión que en seco apenas se notaría puede ser mortal en la ducha.

A eso se suma un factor que casi nadie tiene en cuenta: **quedas atrapado en el circuito.** Cuando la corriente atraviesa un músculo, lo contrae. Si eso ocurre en la mano que sujeta la alcachofa, la contracción puede impedirte soltarla. Por eso el tiempo de exposición se alarga, y el daño crece con cada segundo.

La corriente puede causar desde quemaduras, a veces sin dejar marca visible en la piel, hasta daño interno, paro cardíaco o pérdida de conocimiento. Conviene recordar una idea que resume el riesgo: incluso una cantidad pequeña de electricidad puede ser mortal.

## El diferencial: la pieza que decide si te salvas

Si solo te llevas un concepto de este artículo, que sea este. El **interruptor diferencial**, también llamado diferencial o ID, es un dispositivo del cuadro eléctrico que detecta cuándo la corriente se está escapando por un camino que no debería, por ejemplo a través de tu cuerpo, y corta la luz en milisegundos.

El Reglamento Electrotécnico para Baja Tensión establece que para las instalaciones en cuartos de baño es obligatorio un diferencial con una sensibilidad **no superior a 30 miliamperios**. Ese valor no es arbitrario: por debajo de esa intensidad no se producen normalmente daños permanentes, y un diferencial de 30 mA está calibrado para cortar antes de que la exposición se vuelva letal.

Ahora la pregunta incómoda: **¿tiene tu casa ese diferencial, y funciona?** Un edificio antiguo puede tener un diferencial de sensibilidad mayor, que no protege igual, o directamente no tenerlo. Y uno moderno puede haber dejado de funcionar sin que nadie lo note, porque los diferenciales se estropean con el tiempo y con las tormentas.

## Dos casos reales que explican el problema

En 2018 murió un hombre electrocutado mientras se duchaba en Sabadell. La investigación apuntó a una instalación con **tuberías de cobre y sin diferencial operativo**: el agua y la estructura metálica del edificio transmitieron la tensión, y no había nada que cortara la corriente. El bloque de viviendas tuvo que ser desalojado. El caso no fue un descuido del fallecido: fue una instalación sin la protección que la normativa exige.

El segundo caso es el clásico que todos hemos visto en una película: un secador de pelo que cae en la bañera. Es un recurso cinematográfico, pero el riesgo que describe es real. Si un aparato enchufado cae al agua mientras tú estás dentro, la corriente busca el camino hacia tierra y ese camino puedes ser tú. Aquí es donde el diferencial marca la diferencia entre un susto y una tragedia: con un diferencial de 30 mA funcionando, la corriente se corta en milisegundos; sin él, la exposición continúa.

## Las zonas del baño: por qué el enchufe no puede estar donde está

La normativa española, a través de la instrucción ITC-BT-27 del REBT, divide el baño en cuatro volúmenes o zonas concéntricas según la distancia al agua. La lógica es simple: cuanto más cerca del agua, menos cosas eléctricas se permiten.

- **Volumen 0:** el interior de la bañera o del plato de ducha. Es la zona de riesgo máximo. Solo se admiten dispositivos de muy baja tensión, hasta 12 voltios en corriente alterna, con un grado de protección contra la inmersión. No se permite ningún enchufe, interruptor ni aparato eléctrico convencional.
- **Volumen 1:** el espacio justo por encima de la bañera o el plato de ducha, hasta 2,25 metros de altura. Aquí tampoco hay enchufes. Solo caben aparatos de muy baja tensión y algunos calentadores de agua o bombas de ducha si su alimentación está protegida con un diferencial de 30 mA o inferior.
- **Volumen 2:** el espacio alrededor, hasta 60 centímetros de la bañera o la ducha. Se permiten tomas de corriente protegidas por diferencial de alta sensibilidad, luminarias y aparatos de calefacción de clase II.
- **Volumen 3:** desde el borde del volumen 2 hasta 2,4 metros. Aquí ya se aceptan los mecanismos del volumen 2 y las tomas de corriente, siempre con transformador de aislamiento o protegidas por un diferencial de alta sensibilidad acompañado de interruptor magnetotérmico.

La consecuencia práctica es la que importa: **los enchufes de 230 voltios solo se permiten en el volumen 3**, es decir, a una distancia prudencial del agua. Y hay un detalle que sorprende a mucha gente: la normativa **no considera las mamparas ni los falsos techos como barreras** a efectos de separar volúmenes. Una mampara de ducha no crea zona segura; el agua salpica y la humedad se acumula igual.

Además, para los volúmenes 1, 2 y 3 se exige una **conexión equipotencial complementaria**: unir el cable de toma de tierra con todas las partes metálicas de los equipos y con las superficies conductoras accesibles, para que no pueda aparecer una diferencia de tensión entre dos elementos que tocas a la vez. Ese es el motivo por el que las bañeras y las duchas metálicas se consideran partes conductoras capaces de transmitir tensión si no están aisladas correctamente.

## Cómo comprobar si tu baño es seguro

Aquí llega la parte práctica. Puedes hacer una comprobación básica tú mismo, y hay cosas que conviene dejar en manos de un profesional.

Lo que puedes comprobar tú:

- **Localiza el diferencial.** En el cuadro eléctrico, busca un interruptor que suele estar etiquetado con un botón de prueba, normalmente marcado como T. Ese es el diferencial.
- **Pulsa el botón de prueba.** Es un test que debe hacerse periódicamente. Si al pulsarlo la luz se corta, el diferencial responde. Si no ocurre nada, ese diferencial no está protegiendo nada y hay que avisar a un electricista.
- **Lee la sensibilidad.** En el propio dispositivo figura su valor. Busca que sea de 30 mA o inferior. Si pone 300 mA, está pensado para proteger la instalación contra incendios, no a las personas.
- **Comprueba las distancias.** Mira dónde están los enchufes respecto a la ducha. Si hay un enchufe a menos de 60 centímetros del plato, esa instalación no cumple la normativa.
- **Busca señales de humedad o cableado antiguo.** Cables pelados, enchufes con marcas de calor, cables que pasan por zonas de salpicadura. Cualquiera de esas señales merece una revisión.

Lo que debes dejar a un electricista: la medición de la resistencia de la toma de tierra, la verificación de la conexión equipotencial, la sustitución del diferencial o cualquier intervención en el cuadro. Son trabajos con riesgo eléctrico real y con consecuencias legales si se hacen mal.

## Errores que conviene evitar

Hay hábitos muy extendidos que aumentan el riesgo sin que la gente lo perciba:

- **Usar el secador de pelo con los pies mojados y descalzo.** La piel mojada reduce tu resistencia, y estar descalzo sobre un suelo húmedo te pone en contacto con tierra. Es la combinación más peligrosa de todas.
- **Dejar aparatos enchufados cerca del agua.** Un secador, una plancha del pelo o una radio enchufados al borde del lavabo están a un tirón de caer al agua.
- **Usar regletas y alargadores en el baño.** Multiplican los puntos de contacto y muchos no están preparados para ambientes húmedos.
- **Confiar en la mampara como barrera.** Como vimos, la normativa no la reconoce como separación de volúmenes, y en la práctica el agua salpica igual.
- **Manipular un aparato con las manos mojadas, aunque esté apagado.** Un aparato apagado pero enchufado sigue teniendo tensión en su interior.

## Qué hacer si alguien recibe una descarga

Esta es la única parte del artículo que te pido que leas con atención, porque un error aquí puede convertirte en la segunda víctima.

**La regla que no admite excepciones: no toques a la persona si sigue en contacto con la corriente.** Tu cuerpo sería el nuevo camino hacia tierra. Muchos accidentes eléctricos domésticos tienen dos víctimas por este motivo.

Lo que hay que hacer, en este orden:

1. **Cortar la corriente** desde el cuadro eléctrico, el interruptor general o el diferencial. Es la medida más segura y la primera que hay que intentar.
2. **Si no puedes cortarla**, separar a la persona usando un objeto no conductor, como madera seca, una cuerda, una prenda de cuero o un palo seco, y siempre estando tú bien aislado. Nunca con las manos desnudas.
3. **Llamar al 112** de inmediato y seguir exactamente las instrucciones que te den.
4. **No mover a la persona** salvo que exista un peligro añadido. Las descargas eléctricas pueden causar lesiones internas y fracturas por contracción muscular, aunque no se vea nada por fuera.
5. **Si está inconsciente y no respira**, el 112 te indicará cómo actuar. No improvises maniobras que no domines.

Lo que **no** hay que hacer: tocar a la víctima con las manos, echar agua sobre ella o intentar moverla para sacarla de ahí antes de haber cortado la corriente.

## Preguntas frecuentes

### ¿Es peligroso ducharse si hay un diferencial de 30 mA en casa?

Con un diferencial de 30 mA funcionando correctamente, la instalación está protegida frente a las corrientes de fuga que podrían atravesar tu cuerpo. La protección está pensada exactamente para esa situación. Lo importante es que el dispositivo exista, sea del valor correcto y funcione, y esto último se comprueba con el botón de prueba.

### ¿Cuántas veces hay que pulsar el botón de prueba del diferencial?

Es una comprobación que conviene hacer con periodicidad, no una sola vez. Pulsarlo hace que el diferencial corte la luz, así que hay que hacerlo en un momento en que no haya nada importante encendido. Si al pulsarlo no salta, hay que llamar a un electricista.

### ¿Puedo electrocutarme si toco la alcachofa de la ducha?

La alcachofa de una ducha convencional es de plástico y no lleva corriente: el agua sale por la tubería, y lo que puede transmitir tensión es la instalación metálica si hay un defecto y no existe protección. El riesgo real no está en la alcachofa en sí, sino en el conjunto del baño: un aparato eléctrico que cae al agua, un enchufe mal situado o una instalación sin diferencial.

### ¿Las mamparas de ducha protegen del riesgo eléctrico?

No a efectos normativos, y tampoco en la práctica. El REBT no considera las mamparas ni los falsos techos como barreras para separar volúmenes. El agua salpica y la humedad permanece en el ambiente, así que las distancias siguen aplicando aunque tengas mampara.

### ¿Qué hago si sospecho que mi instalación es antigua?

Encargar una revisión a un electricista autorizado. Una instalación antigua puede tener un diferencial de sensibilidad insuficiente, carecer de toma de tierra en el baño o no tener la conexión equipotencial que exige la norma. Es una inversión pequeña comparada con el riesgo, y es la única forma de salir de dudas con datos.

### ¿El suelo del baño influye en el riesgo?

Sí, y bastante. Un suelo mojado y estar descalzo ponen tu cuerpo en contacto con tierra y reducen tu resistencia al paso de la corriente. De ahí que usar aparatos eléctricos en el baño con los pies mojados sea una de las prácticas más peligrosas que existen en casa.

## Conclusión

La electrocución en la ducha no ocurre porque alguien cometa una torpeza, sino porque la protección que debería cortar la corriente no está, no funciona o no es del valor adecuado. Ese es el verdadero mensaje de esta guía. La alcachofa no mata a nadie; lo que mata es una instalación sin diferencial de 30 mA y sin toma de tierra, un aparato enchufado al borde del agua y un suelo mojado que convierte tu cuerpo en el camino hacia tierra.

La comprobación más valiosa que puedes hacer hoy mismo lleva menos de un minuto: busca el diferencial en tu cuadro, mira si pone 30 mA y pulsa el botón de prueba. Si algo de eso no cuadra, llama a un electricista. Es una gestión trivial que puede marcar la diferencia entre leer este artículo y protagonizarlo.`,
    image_url: '/images/articles/seguridad-electrica-bano.svg',
    thumbnail_url: '/images/articles/seguridad-electrica-bano.svg',
    read_time_minutes: 10,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T20:00:00.000Z',
  },
]
