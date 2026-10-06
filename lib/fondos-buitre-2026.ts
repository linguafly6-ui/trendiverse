import type { Article } from './types'

/**
 * Artículo sobre las últimas novedades de los fondos buitre en 2026.
 * Categoría `economia`. Formato editorial: Markdown simple (## / ### / listas /
 * **negrita**), tal como lo consume `parseArticleContent` en lib/article-content.ts.
 * El parser no soporta tablas ni enlaces: los datos van como listas.
 */
export const FONDOS_BUITRE_2026_ARTICLES: Article[] = [
  {
    id: 11,
    title: 'Fondos buitre en 2026: el decreto que les prohíbe comprar vivienda y las últimas novedades',
    slug: 'fondos-buitre-2026-decreto-vivienda',
    category: 'economia',
    excerpt: 'El Gobierno ha endurecido las restricciones a los fondos buitre: no pueden comprar vivienda por debajo del 70% de su valor de tasación y las mismas limitaciones se extienden a los propietarios de más de 10 viviendas. Repasamos qué dice la norma, sus excepciones y las críticas.',
    content: `Los fondos buitre han vuelto al centro del debate público en España. En apenas una semana, el Gobierno ha aprobado, derogado y vuelto a aprobar un paquete normativo que busca frenar sus compras de vivienda, y lo ha extendido a los grandes propietarios particulares. Te contamos qué ha pasado, qué dice exactamente la norma y qué implica.

## Qué es un fondo buitre

Un fondo buitre es un vehículo de inversión que compra activos en situaciones de dificultad o con descuentos muy fuertes, con la expectativa de obtener una rentabilidad elevada. En el mercado inmobiliario suele adquirir viviendas, edificios completos o carteras de préstamos impagados. La lógica es siempre la misma: comprar barato algo que tiene un problema, ya sea una deuda morosa, un inmueble deteriorado o una cartera que un banco quiere sacar de balance, y rentabilizarlo mediante el alquiler, la venta posterior o una gestión más agresiva.

El nombre no es jurídico, sino periodístico y popular, y de ahí vienen buena parte de las discusiones. Ahora, por primera vez, un texto legal español se atreve a definirlos.

## Qué ha pasado esta semana

La cronología ayuda a entender el lío normativo, porque ha sido un ida y vuelta poco habitual:

- **29 de septiembre de 2026:** el Consejo de Ministros aprueba el Real Decreto-ley 26/2026, con medidas de urgencia sobre alquileres, desahucios y compras especulativas.
- **30 de septiembre:** el texto se publica en el BOE y entra en vigor el 1 de octubre.
- **Días después:** el Congreso rechaza los dos reales decretos-ley, que decaen.
- **6 de octubre:** el Gobierno los recupera y aprueba de nuevo, manteniendo la esencia del texto anterior y endureciendo las condiciones.

El detonante político fue el desahucio de una vecina en Madrid que se convirtió en símbolo del problema. La ministra de Vivienda y Agenda Urbana, Isabel Rodríguez, defendió la norma como respuesta a «el principal problema de los españoles». El presidente del Gobierno justificó la reapertura de los decretos diciendo que las «circunstancias que los hacían imprescindibles no han cambiado».

## La definición legal de fondo buitre

El punto más comentado del decreto es que establece, por primera vez, qué se considera una operación especulativa. Y lo hace sin fijarse en el nombre de la empresa, sino en el tipo de compra. Esa era precisamente la intención declarada de la ministra: una definición «muy rigurosa» centrada en la operación.

El criterio es concreto: se considera compra especulativa cuando una entidad adquiere una vivienda o un edificio residencial **a título gratuito o por un precio inferior al 70% de su valor de tasación de mercado**. Es decir, con un descuento superior al 30%.

Esa fórmula tiene una consecuencia interesante: la norma no persigue a un tipo de inversor concreto, sino a una forma de comprar. Si pagas el precio de mercado, la restricción no te aplica, por muy grande que seas.

## Qué se prohíbe y hasta cuándo

La restricción no es un veto genérico ni permanente:

- **Qué se prohíbe:** que quienes entren en esa definición adquieran viviendas o edificios residenciales por debajo del umbral del 70%.
- **Hasta cuándo:** la limitación está vigente hasta el 31 de diciembre de 2028 en el texto aprobado en septiembre, y el texto recuperado el 6 de octubre amplía el horizonte hasta 2030.
- **Qué se excluye:** quedan expresamente fuera de la limitación las operaciones destinadas a ampliar el parque de vivienda asequible o social, siempre que los inmuebles se alquilen con esa finalidad durante un mínimo de cinco años, y también las dirigidas a personas dependientes y especialmente vulnerables.

Esa excepción es la válvula que permite que un fondo siga comprando si se compromete a alquiler asequible. Es, en la práctica, la vía por la que el legislador intenta redirigir la inversión en lugar de prohibirla.

## La ampliación de octubre: también los grandes propietarios

El cambio más relevante del texto recuperado el 6 de octubre es que las mismas limitaciones se extienden a los **propietarios de más de 10 viviendas**. Ya no es solo una norma sobre fondos extranjeros: cualquier gran tenedor particular o sociedad que supere ese umbral queda sujeto a las mismas restricciones de compra que el decreto imponía a los fondos buitre.

Además, el nuevo texto amplía la definición y las condiciones aplicables a las excepciones, aunque fuentes del Ministerio de Vivienda no han detallado todavía cómo quedan esas excepciones. Pone el foco, según las mismas fuentes, en los fondos que adquieren inmuebles con fuertes descuentos, los grandes propietarios y sus filiales.

## Otras medidas del paquete

El decreto no va solo contra las compras especulativas. Incluye un conjunto más amplio que conviene conocer porque afecta a inquilinos, propietarios y compradores:

- **Suspensión de desahucios hasta el 31 de diciembre de 2030** para personas vulnerables sin alternativa habitacional.
- **Modificación de la Ley de Enjuiciamiento Civil:** las demandas de ejecución sobre bienes hipotecados deberán indicar si el inmueble es la vivienda habitual y si el ejecutante es gran tenedor. Quien declare no serlo deberá adjuntar una certificación del Registro de la Propiedad con la relación de viviendas a su nombre.
- **Regulación de los alquileres de temporada:** exigirán causa acreditada y una duración de entre 31 días y 12 meses. Si no se cumple, pasan a considerarse vivienda habitual.
- **Alquiler por habitaciones:** la suma de las rentas no puede superar la del alquiler de la vivienda completa.
- **Renovación automática y prórroga extraordinaria** de contratos, y límite a la actualización de la renta.
- **Cambios fiscales para las socimis** y bonificaciones en el IRPF para propietarios que rebajen o contengan el alquiler, de hasta el 100% en determinados supuestos.
- **Medidas para facilitar el acceso a vivienda asequible**, incluida la compra de primera vivienda.

## Las críticas: el foco en los fondos, la carga en los pequeños

No todo han sido aplausos. La crítica más repetida es que el decreto vende como gran logro el veto a los fondos, pero carga el grueso de la intervención del alquiler sobre los pequeños propietarios.

El argumento es que las medidas que más afectan al día a día del mercado, como los límites a la actualización de la renta, la regulación del alquiler de temporada y por habitaciones y las prórrogas obligatorias, recaen sobre arrendadores que tienen una o dos viviendas, no sobre los grandes tenedores. De ahí la frase que resume esa posición: asfixian al pequeño ahorrador.

También hay dudas sobre la eficacia real del umbral del 70%. Un fondo puede comprar por encima de ese precio y quedar fuera de la restricción, o articular la operación mediante una sociedad intermedia. Y el propio hecho de que el decreto caduque plantea la pregunta de qué ocurrirá después de 2028 o 2030: si la restricción desaparece, el efecto sobre el mercado puede ser temporal.

## El negocio que sigue: vivienda pública y créditos morosos

Más allá de la norma, hay dos frentes donde los fondos siguen operando y que han aparecido en la actualidad de estos días:

**La vivienda pública.** Un gran contrato estatal de gestión residencial adjudicado a Blackstone ha reabierto la pregunta de qué ocurre cuando el parque público entra en la órbita de grandes inversores. También se ha conocido que el Gobierno vendió por 204,7 millones de euros un edificio de Hacienda al Grupo Lar y a fondos gestionados por BlackRock, para levantar viviendas de lujo y una residencia. Y en Madrid se ha puesto cifra al fenómeno: varios de estos fondos operan sobre alrededor de 7.500 viviendas en la ciudad.

**Los créditos morosos.** Bancos y fondos de inversión están impulsando la venta de créditos morosos a clientes particulares a través de sus servicers inmobiliarios, con operaciones en las que participan Santander, Blackstone y Pollen. Es una vía menos visible que la compra de inmuebles, pero afecta directamente a deudores: su préstamo cambia de manos y con él cambia el interlocutor al que deben pagar.

## Preguntas frecuentes

### ¿Qué es exactamente un fondo buitre?

Un vehículo de inversión que compra activos en dificultades o con descuentos muy fuertes para obtener rentabilidad elevada. En inmobiliario, compra viviendas, edificios o carteras de préstamos impagados con la expectativa de rentabilizarlos mediante alquiler o venta.

### ¿Qué prohíbe el decreto de vivienda de 2026?

Que las entidades que encajen en la definición de fondo buitre compren viviendas o edificios residenciales a título gratuito o por debajo del 70% de su valor de tasación de mercado, es decir, con más de un 30% de descuento.

### ¿Hasta cuándo estará en vigor la prohibición?

El texto aprobado en septiembre la fijaba hasta el 31 de diciembre de 2028. El decreto recuperado el 6 de octubre amplía el horizonte hasta 2030.

### ¿Hay excepciones?

Sí. Quedan fuera de la limitación las compras destinadas a ampliar el parque de vivienda asequible o social, siempre que se alquilen con esa finalidad durante al menos cinco años, y también las dirigidas a personas dependientes y especialmente vulnerables.

### ¿Afecta también a particulares?

Con el texto del 6 de octubre, sí. Las mismas limitaciones de compra se extienden a los propietarios de más de 10 viviendas, además de a los fondos y a sus filiales.

### ¿Por qué el decreto se aprobó, se derogó y se volvió a aprobar?

El Consejo de Ministros aprobó dos reales decretos-ley el 29 de septiembre, el Congreso los rechazó días después y decayeron, y el 6 de octubre el Gobierno los recuperó manteniendo su esencia y endureciendo las condiciones.

## Qué mirar a partir de ahora

El decreto tiene que superar todavía su convalidación en el Congreso, y los textos han demostrado ser frágiles: uno ya decayó. Merece la pena seguir tres cosas concretas:

- **Si la norma sobrevive esta vez** al trámite parlamentario, o vuelve a caer como la anterior.
- **Cómo se concreta la definición** en la práctica: qué operaciones quedan dentro y cuáles fuera, y si las excepciones dejan una puerta demasiado ancha.
- **El efecto real sobre el mercado**, más allá del anuncio. Si los fondos compran por encima del 70% o lo hacen a través de sociedades intervinientes, la restricción puede tener menos impacto del que sugiere su titular.`,
    image_url: '/images/articles/fondos-buitre-2026.svg',
    thumbnail_url: '/images/articles/fondos-buitre-2026.svg',
    read_time_minutes: 10,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T19:00:00.000Z',
  },
]
