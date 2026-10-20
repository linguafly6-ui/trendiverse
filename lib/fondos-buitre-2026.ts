import type { Article } from './types'

/**
 * Artículo sobre fondos buitre en 2026.
 * Centrado en compras, inversores y grandes tenedores. Las medidas de alquiler
 * del mismo decreto se tratan en lib/decreto-alquiler-2026.ts para no competir
 * por las mismas búsquedas.
 */
export const FONDOS_BUITRE_2026_ARTICLES: Article[] = [
  {
    id: 11,
    title: 'Fondos buitre en 2026: quién no puede comprar vivienda y desde cuándo',
    slug: 'fondos-buitre-2026-decreto-vivienda',
    category: 'toptrends',
    excerpt: 'El decreto de vivienda prohíbe a los fondos buitre y a los propietarios de más de 10 viviendas comprar por debajo del 70% del valor de tasación. Qué se considera compra especulativa, las excepciones y qué implica para inversores y vendedores.',
    content: `Los fondos buitre han vuelto al centro del debate público en España. En apenas una semana, el Gobierno ha aprobado, derogado y vuelto a aprobar un paquete normativo que limita sus compras de vivienda, y lo ha extendido a los grandes propietarios particulares. Este artículo se centra en lo que afecta a quien compra e invierte: qué operaciones quedan prohibidas, a quién se aplica y qué excepciones existen.

## Qué es un fondo buitre

Un fondo buitre es un vehículo de inversión que compra activos en situaciones de dificultad o con descuentos muy fuertes, con la expectativa de obtener una rentabilidad elevada. En el mercado inmobiliario suele adquirir viviendas, edificios completos o carteras de préstamos impagados. La lógica es siempre la misma: comprar barato algo que tiene un problema, ya sea una deuda morosa, un inmueble deteriorado o una cartera que un banco quiere sacar de balance, y rentabilizarlo mediante el alquiler, la venta posterior o una gestión más agresiva.

El nombre no es jurídico, sino periodístico y popular, y de ahí vienen buena parte de las discusiones. Ahora, por primera vez, un texto legal español se atreve a definir qué operaciones caen en esa categoría.

## Qué ha pasado esta semana

La cronología ayuda a entender el lío normativo, porque ha sido un ida y vuelta poco habitual:

- **29 de septiembre de 2026:** el Consejo de Ministros aprueba el Real Decreto-ley 26/2026, con medidas de urgencia sobre vivienda.
- **30 de septiembre:** el texto se publica en el BOE y entra en vigor el 1 de octubre.
- **Días después:** el Congreso rechaza los dos reales decretos-ley, que decaen.
- **6 de octubre:** el Gobierno los recupera y aprueba de nuevo, manteniendo la esencia del texto anterior y endureciendo las condiciones para los compradores.

El detonante político fue el desahucio de una vecina en Madrid que se convirtió en símbolo del problema. La ministra de Vivienda y Agenda Urbana, Isabel Rodríguez, defendió la norma como respuesta a «el principal problema de los españoles». El presidente del Gobierno justificó la reapertura de los decretos diciendo que las «circunstancias que los hacían imprescindibles no han cambiado».

## La definición legal de compra especulativa

El punto más comentado del decreto es que establece qué se considera una operación especulativa. Y lo hace sin fijarse en el nombre de la empresa, sino en el tipo de compra. Esa era precisamente la intención declarada de la ministra: una definición «muy rigurosa» centrada en la operación.

El criterio es concreto: se considera compra especulativa cuando una entidad adquiere una vivienda o un edificio residencial **a título gratuito o por un precio inferior al 70% de su valor de tasación de mercado**. Es decir, con un descuento superior al 30%.

Esa fórmula tiene una consecuencia interesante: la norma no persigue a un tipo de inversor concreto, sino a una forma de comprar. Si pagas el precio de mercado, la restricción no te aplica, por muy grande que seas.

## Qué se prohíbe y hasta cuándo

La restricción no es un veto genérico ni permanente:

- **Qué se prohíbe:** que quienes entren en esa definición adquieran viviendas o edificios residenciales por debajo del umbral del 70%.
- **Hasta cuándo:** la limitación está vigente hasta el 31 de diciembre de 2028 en el texto aprobado en septiembre, y el texto recuperado el 6 de octubre amplía el horizonte hasta 2030.
- **Qué se excluye:** quedan expresamente fuera de la limitación las operaciones destinadas a ampliar el parque de vivienda asequible o social, siempre que los inmuebles se alquilen con esa finalidad durante un mínimo de cinco años, y también las dirigidas a personas dependientes y especialmente vulnerables.

Esa excepción es la válvula que permite que un fondo siga comprando si se compromete a alquiler asequible. Es, en la práctica, la vía por la que el legislador intenta redirigir la inversión en lugar de prohibirla.

## La ampliación de octubre: también los grandes propietarios

El cambio más relevante del texto recuperado el 6 de octubre es que las mismas limitaciones se extienden a los **propietarios de más de 10 viviendas**. Ya no es solo una norma sobre fondos extranjeros: cualquier gran tenedor particular o sociedad que supere ese umbral queda sujeto a las mismas restricciones de compra.

Además, el nuevo texto amplía la definición y las condiciones aplicables a las excepciones, aunque fuentes del Ministerio de Vivienda no han detallado todavía cómo quedan. Pone el foco, según las mismas fuentes, en los fondos que adquieren inmuebles con fuertes descuentos, los grandes propietarios y sus filiales.

## Qué implica para inversores y vendedores

La norma no solo afecta a quien compra. También cambia las opciones de quien vende:

- **Si eres un gran tenedor o un fondo**, las compras con descuento superior al 30% quedan cerradas salvo que destines la vivienda a alquiler asequible durante al menos cinco años. Comprar a precio de mercado sigue siendo posible.
- **Si vendes una vivienda**, una oferta de un fondo o de un propietario con más de 10 viviendas por debajo del 70% de la tasación ya no puede cerrarse en esos términos. En la práctica, se reduce el número de compradores dispuestos a pagar rápido con un descuento fuerte.
- **Si eres un banco o un servicer que vende carteras**, las ventas de inmuebles residenciales con grandes descuentos a estos compradores quedan limitadas, lo que puede empujar hacia otras vías, como la venta de créditos.

El efecto real dependerá de cómo se tase y de si las operaciones se estructuran por encima del umbral. Ese es precisamente uno de los puntos que más dudas generan.

## El resto del decreto, en otro artículo

El mismo real decreto-ley incluye un paquete amplio de medidas sobre el alquiler: límite a la subida de la renta, prórrogas de contratos, regulación del alquiler de temporada y por habitaciones, suspensión de desahucios y bonificaciones fiscales. No las repetimos aquí; las explicamos en detalle en [cómo afecta el decreto de vivienda a arrendadores e inquilinos](/articles/decreto-vivienda-2026-arrendadores-arrendatarios).

## Las críticas: eficacia y alcance

No todo han sido aplausos. Hay dudas sobre la eficacia real del umbral del 70%. Un fondo puede comprar por encima de ese precio y quedar fuera de la restricción, o articular la operación mediante una sociedad intermedia. Y el propio hecho de que la limitación caduque plantea la pregunta de qué ocurrirá después de 2028 o 2030: si la restricción desaparece, el efecto sobre el mercado puede ser temporal.

También se critica que el veto a los fondos se haya presentado como el gran logro del paquete, mientras el grueso de la intervención en el alquiler recae sobre propietarios pequeños.

## El negocio que sigue: vivienda pública y créditos morosos

Más allá de la norma, hay dos frentes donde los fondos siguen operando y que han aparecido en la actualidad de estos días:

**La vivienda pública.** Un gran contrato estatal de gestión residencial adjudicado a Blackstone ha reabierto la pregunta de qué ocurre cuando el parque público entra en la órbita de grandes inversores. También se ha conocido que el Gobierno vendió por 204,7 millones de euros un edificio de Hacienda al Grupo Lar y a fondos gestionados por BlackRock, para levantar viviendas de lujo y una residencia. Y en Madrid se ha puesto cifra al fenómeno: varios de estos fondos operan sobre alrededor de 7.500 viviendas en la ciudad.

**Los créditos morosos.** Bancos y fondos de inversión están impulsando la venta de créditos morosos a clientes particulares a través de sus servicers inmobiliarios, con operaciones en las que participan Santander, Blackstone y Pollen. Es una vía menos visible que la compra de inmuebles, pero afecta directamente a deudores: su préstamo cambia de manos y con él cambia el interlocutor al que deben pagar.

## Preguntas frecuentes

### ¿Qué es exactamente un fondo buitre?

Un vehículo de inversión que compra activos en dificultades o con descuentos muy fuertes para obtener rentabilidad elevada. En inmobiliario, compra viviendas, edificios o carteras de préstamos impagados con la expectativa de rentabilizarlos mediante alquiler o venta.

### ¿Qué compras prohíbe el decreto de vivienda de 2026?

Las adquisiciones de viviendas o edificios residenciales a título gratuito o por debajo del 70% de su valor de tasación de mercado, es decir, con más de un 30% de descuento, por parte de las entidades que encajan en la definición.

### ¿Hasta cuándo estará en vigor la prohibición?

El texto aprobado en septiembre la fijaba hasta el 31 de diciembre de 2028. El decreto recuperado el 6 de octubre amplía el horizonte hasta 2030.

### ¿Hay excepciones?

Sí. Quedan fuera de la limitación las compras destinadas a ampliar el parque de vivienda asequible o social, siempre que se alquilen con esa finalidad durante al menos cinco años, y también las dirigidas a personas dependientes y especialmente vulnerables.

### ¿Afecta también a particulares?

Con el texto del 6 de octubre, sí. Las mismas limitaciones de compra se extienden a los propietarios de más de 10 viviendas, además de a los fondos y a sus filiales.

### ¿Puedo vender mi piso a un fondo?

Sí, siempre que el precio no esté por debajo del 70% del valor de tasación o que el comprador destine la vivienda a alquiler asequible durante al menos cinco años. Lo que queda limitado es la venta con descuentos superiores al 30% a fondos o grandes tenedores.

## Qué mirar a partir de ahora

El decreto tiene que superar todavía su convalidación en el Congreso, y los textos han demostrado ser frágiles: uno ya decayó. Merece la pena seguir tres cosas concretas:

- **Si la norma sobrevive esta vez** al trámite parlamentario, o vuelve a caer como la anterior.
- **Cómo se concreta la definición** en la práctica: qué operaciones quedan dentro y cuáles fuera, y si las excepciones dejan una puerta demasiado ancha.
- **El efecto real sobre el mercado**, más allá del anuncio. Si los fondos compran por encima del 70% o lo hacen a través de sociedades interpuestas, la restricción puede tener menos impacto del que sugiere su titular.`,
    image_url: '/images/articles/fondos-buitre-2026.svg',
    thumbnail_url: '/images/articles/fondos-buitre-2026.svg',
    read_time_minutes: 9,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T19:00:00.000Z',
  },
]
