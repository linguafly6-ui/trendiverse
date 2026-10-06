import type { Article } from './types'

/**
 * Artículo sobre cómo afecta el decreto de vivienda de octubre de 2026
 * a arrendadores y arrendatarios. Categoría `economia`.
 * Formato editorial: Markdown simple (## / ### / listas / **negrita**),
 * tal como lo consume `parseArticleContent` en lib/article-content.ts.
 * El parser no soporta tablas ni enlaces: los datos van como listas.
 */
export const ALQUILER_DECRETO_2026_ARTICLES: Article[] = [
  {
    id: 12,
    title: 'Cómo afecta el nuevo decreto de vivienda a arrendadores y arrendatarios: todas las claves',
    slug: 'decreto-vivienda-2026-arrendadores-arrendatarios',
    category: 'economia',
    excerpt: 'El Real Decreto-ley 26/2026 cambia las reglas del alquiler para propietarios e inquilinos: límite del 2% a la subida de la renta hasta final de 2027, prórroga extraordinaria de dos años, regulación del alquiler de temporada y por habitaciones y nuevas bonificaciones en el IRPF. Repasamos qué gana y qué pierde cada parte.',
    content: `El Real Decreto-ley 26/2026, de 29 de septiembre, ha modificado las reglas del alquiler de vivienda en España de forma sustancial. Y lo hace con dos destinatarios muy distintos: quienes alquilan un piso para vivir, y quienes lo alquilan para ingresar una renta. Este artículo repasa, punto por punto, qué cambia para cada parte, y señala qué gana y qué pierde cada una.

## Qué es el decreto y por qué se ha aprobado

El texto se aprobó el 29 de septiembre de 2026, se publicó en el BOE el 30 de septiembre y entró en vigor el 1 de octubre. Días después, el Congreso lo rechazó y decayó. El 6 de octubre el Gobierno lo recuperó y lo aprobó de nuevo, manteniendo su esencia y endureciendo algunos puntos.

El detonante fue el desahucio de una vecina en Madrid que se convirtió en símbolo del problema de la vivienda, y su objetivo declarado es intervenir el mercado del alquiler para frenar las subidas. El texto tiene que superar todavía su convalidación en el Congreso, así que algunas medidas podrían cambiar o caer.

## Lo que cambia para los arrendatarios (inquilinos)

Para quien vive de alquiler, el decreto trae sobre todo protecciones: más estabilidad en el contrato, menos margen para subidas y más opciones de quedarse.

- **Límite a la subida de la renta.** Hasta el 31 de diciembre de 2027 se aplica una limitación extraordinaria. Si no hay acuerdo entre las partes, la actualización no podrá superar el **2%**. Y si la renta que ya pagas supera el límite máximo del sistema estatal de precios de referencia, el propietario **no podrá aplicar ninguna subida**.
- **Prórroga extraordinaria de hasta dos años.** Los inquilinos podrán solicitar una prórroga extraordinaria de hasta dos años para determinados contratos de vivienda habitual cuya prórroga obligatoria o tácita finalice antes del 31 de diciembre de 2028.
- **Renovación automática.** Una vez terminado el periodo inicial del contrato, el alquiler se prorrogará automáticamente por periodos sucesivos de **cinco años**, o de **siete** cuando el propietario sea una persona jurídica, salvo que exista causa justificada para no renovarlo.
- **Freno al alquiler de temporada encubierto.** Los contratos de temporada deberán acreditar una causa real de temporalidad. Si no la acreditan, pasan a tratarse como alquiler de vivienda habitual, con todas las protecciones que eso implica.
- **Alquiler por habitaciones: no se puede cobrar más que por el piso entero.** La suma de las rentas de las habitaciones de una vivienda no podrá superar lo que costaría alquilar la vivienda completa.
- **Freno a las subidas encadenando contratos temporales.** Cuando sobre una misma vivienda se celebren contratos temporales sucesivos, el incremento de la renta entre uno y el siguiente no podrá superar el porcentaje del **IRAV**, el índice de referencia para la actualización de arrendamientos. Se elimina así la posibilidad de subir el precio libremente en cada nuevo contrato.
- **Desgravación en la declaración de la renta.** Las medidas permiten a los inquilinos desgravarse parte de lo que pagan de alquiler. Según los cálculos del Gobierno, en un alquiler de 800 euros supondría una deducción apreciable en la declaración.
- **Suspensión de desahucios.** Se mantiene la protección frente a desahucios hasta el **31 de diciembre de 2030** para personas vulnerables sin alternativa habitacional.

## Lo que cambia para los arrendadores (propietarios)

Para quien alquila una vivienda, el efecto es más ambivalente: hay límites nuevos, pero también ventajas fiscales y menos burocracia en un punto concreto.

- **Techo a las subidas.** La actualización queda limitada al 2% en defecto de pacto hasta final de 2027, y a cero si la renta ya supera el índice de referencia. No se puede subir por encima de esos márgenes aunque el contrato tenga una cláusula de actualización.
- **Prórrogas obligatorias.** La prórroga extraordinaria de dos años y la renovación automática por periodos de cinco o siete años recortan la capacidad de recuperar la vivienda al final del contrato.
- **Alquiler de temporada y por habitaciones, bajo la LAU.** Si no se acredita la causa de temporalidad, el contrato se reconduce a vivienda habitual, y las habitaciones quedan sujetas a los límites del alquiler completo. Esto afecta a una fórmula que muchos propietarios usaban para esquivar los topes de la ley de vivienda.
- **Prohibición de exigir determinados seguros de impago**, lo que reduce las garantías que el arrendador podía pedir.
- **Cambio en el desistimiento del inquilino:** se modifican las condiciones en las que el arrendatario puede abandonar antes de tiempo.
- **Obligación de certificar la condición de gran tenedor.** El decreto modifica la Ley por el Derecho a la Vivienda para introducir la obligatoriedad de **certificar en el Registro de la Propiedad** la condición de gran tenedor de vivienda. Lo mismo se traslada a los procedimientos judiciales: las demandas de ejecución sobre bienes hipotecados deberán indicar si el inmueble es la vivienda habitual y si el ejecutante es gran tenedor, y quien declare no serlo deberá adjuntar una certificación registral con la relación de viviendas a su nombre.

## Las bonificaciones fiscales para propietarios

Este es el capítulo donde el decreto compensa parte de los límites anteriores. Se articulan reducciones en el IRPF para arrendadores que cumplan ciertos supuestos:

- **Hasta el 100%** cuando la renta inicial se rebaje en más de un 5% respecto a la última renta del contrato anterior de la misma vivienda, una vez aplicada la actualización que corresponda.
- **Del 100%, 95%, 90%, 85% o 70%** para nuevos contratos formalizados por el mismo arrendador que no sea gran tenedor, en función de la bajada aplicada.
- **Del 80%** durante la prórroga tácita, siempre que el arrendador no sea gran tenedor y se respete el límite de renta de referencia.
- Reducciones adicionales para arrendadores en **zonas tensionadas** que no sean grandes tenedores y formalicen un nuevo contrato, cuando la vivienda se alquile por primera vez o cuando se ceda a una administración pública o entidad sin ánimo de lucro para alquiler asequible.

En la práctica, el decreto usa la fiscalidad como palanca: quien baje el alquiler paga menos impuestos. No es una prohibición, es un incentivo.

## Qué pasa con los contratos ya firmados

Una duda muy habitual entre propietarios e inquilinos es si el decreto se aplica a los contratos que ya estaban en vigor. La respuesta depende de la medida:

- **Los contratos de temporada ya vigentes** en el momento de la entrada en vigor (1 de octubre de 2026) siguen rigiéndose por el régimen anterior hasta que expire el plazo pactado.
- **El límite a la actualización de la renta** no depende de cuándo se firmó el contrato. Lo determinante es que la renta deba actualizarse dentro del periodo comprendido entre el 1 de octubre de 2026 y el 31 de diciembre de 2027.

Es decir, en el límite de las subidas la norma alcanza a contratos antiguos, mientras que en los alquileres de temporada respeta lo ya pactado.

## Un contexto normativo accidentado

Conviene entender que la prórroga extraordinaria de dos años no es nueva. Ya existía en el Real Decreto-ley 8/2026, de 20 de marzo, que permitía a los inquilinos solicitarla cuando su contrato terminaba entre el 22 de marzo de 2026 y el 31 de diciembre de 2027. Ese texto también incluía el límite del 2% a la actualización.

El Congreso lo derogó el 28 de abril de 2026, y ambas medidas decayeron. El decreto de septiembre las recupera y las recoloca, y añade una disposición transitoria: si alguien ya solicitó una prórroga al amparo del texto de marzo, una nueva solicitud deberá regirse por la regulación actual. Y hay un detalle importante que puede cambiar el marco: si sale adelante la renovación automática del segundo decreto, la prórroga extraordinaria de dos años dejará de aplicarse como hasta ahora.

## Qué gana y qué pierde cada parte

Visto en conjunto, el reparto es desigual y conviene decirlo sin adornos.

**El arrendatario gana** estabilidad, un techo claro a las subidas, la posibilidad de prorrogar y la desgravación en la declaración. **Pierde poco** en términos directos, más allá de que los contratos de arrendamiento sean ahora más difíciles de conseguir si la oferta se retrae.

**El arrendador gana** bonificaciones fiscales notables, hasta el 100%, si baja el precio. **Pierde** capacidad de actualizar la renta, de recuperar la vivienda al vencimiento y de usar figuras como el alquiler de temporada para esquivar los límites. También asume una carga nueva de certificación registral.

La crítica más repetida por parte de propietarios es que el decreto vende como gran logro el freno a los fondos, pero carga el grueso de la intervención sobre los pequeños arrendadores. El argumento es que las medidas que más afectan al día a día —límites a la subida, prórrogas y regulación del alquiler por habitaciones— recaen sobre quien tiene una o dos viviendas, no sobre los grandes tenedores.

## Preguntas frecuentes

### ¿Cuánto me puede subir el alquiler mi casero en 2026 y 2027?

Hasta el 31 de diciembre de 2027 se aplica una limitación extraordinaria: si no hay acuerdo entre las partes, la subida no puede superar el 2%. Y si la renta que pagas ya está por encima del límite máximo del sistema estatal de precios de referencia, el propietario no puede aplicar ninguna actualización.

### ¿Puedo prorrogar mi contrato de alquiler dos años más?

Sí, si tu contrato es de vivienda habitual y su prórroga obligatoria o tácita finaliza antes del 31 de diciembre de 2028. En ese caso puedes solicitar una prórroga extraordinaria de hasta dos años.

### ¿Es obligatorio que el propietario acepte la prórroga?

La prórroga extraordinaria se concibe como una extensión que el arrendador debe asumir, dentro de los supuestos previstos y sin perjuicio de las causas legalmente establecidas de recuperación por necesidad.

### ¿Cómo me afecta si alquilo una habitación?

La suma de las rentas de todas las habitaciones de una vivienda no puede superar lo que costaría alquilar el piso completo. Además, si no se acredita la causa de temporalidad del contrato, se considera vivienda habitual.

### ¿Qué bonificaciones tengo como arrendador si bajo el alquiler?

Las reducciones en el IRPF pueden llegar al 100% cuando la renta inicial se rebaje más de un 5% respecto a la última renta del contrato anterior de la misma vivienda. También hay reducciones del 100%, 95%, 90%, 85% y 70% para nuevos contratos, y del 80% durante la prórroga tácita, en los supuestos previstos.

### ¿El decreto se aplica a contratos firmados antes de octubre de 2026?

En el límite a la actualización de la renta, sí: afecta a cualquier contrato cuya renta deba actualizarse entre el 1 de octubre de 2026 y el 31 de diciembre de 2027, con independencia de cuándo se firmó. En cambio, los contratos de temporada ya vigentes siguen con el régimen anterior hasta que expire el plazo pactado.

### ¿Qué es un gran tenedor y por qué debo certificarlo?

El decreto obliga a certificar en el Registro de la Propiedad la condición de gran tenedor de vivienda, según los requisitos que marca la ley estatal o la normativa autonómica que la sustituya. En los procedimientos judiciales, quien declare no ser gran tenedor debe aportar una certificación registral con la relación de viviendas a su nombre.

## Qué vigilar a partir de ahora

El decreto tiene que superar su convalidación en el Congreso, y el texto anterior ya decayó una vez, así que nada está cerrado. Merece la pena seguir tres cosas:

- **Si la norma sobrevive esta vez**, porque de ello depende que las medidas sobre prórrogas y actualización de renta se consoliden.
- **La interacción entre los dos decretos**, ya que si sale adelante la renovación automática, la prórroga extraordinaria de dos años dejará de aplicarse tal como está prevista.
- **El desarrollo autonómico**, porque la certificación de gran tenedor y parte del sistema de precios de referencia dependen de la normativa de cada comunidad.

Quien tenga un contrato en vigor o esté pensando en firmarlo hará bien en revisar su caso concreto con las cifras delante: la norma distingue entre grandes tenedores y particulares, entre zonas tensionadas y no tensionadas, y entre contratos antiguos y nuevos. Las respuestas generales ayudan a orientarse, pero no sustituyen a mirar el propio contrato.`,
    image_url: '/images/articles/decreto-alquiler-2026.svg',
    thumbnail_url: '/images/articles/decreto-alquiler-2026.svg',
    read_time_minutes: 10,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T19:30:00.000Z',
  },
]
