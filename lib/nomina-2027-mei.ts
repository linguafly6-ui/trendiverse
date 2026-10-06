import type { Article } from './types'

/**
 * Artículo sobre el cambio en la nómina de enero de 2027 por la subida del MEI.
 * Categoría `economia`. Formato editorial: Markdown simple (## / ### / listas /
 * **negrita**), tal como lo consume `parseArticleContent` en lib/article-content.ts.
 * El parser no soporta tablas: las series y escalas van como listas.
 */
export const NOMINA_2027_MEI_ARTICLES: Article[] = [
  {
    id: 10,
    title: 'La nómina cambia en enero de 2027: qué te descontarán para las pensiones y cuánto supone',
    slug: 'nomina-enero-2027-mei-pensiones',
    category: 'economia',
    excerpt: 'La aportación del trabajador al Mecanismo de Equidad Intergeneracional sube del 0,15% al 0,17% a partir del 1 de enero de 2027. Te explicamos qué es el MEI, cuánto supone en la práctica según tu base de cotización y dónde verlo en tu nómina.',
    content: `A partir del 1 de enero de 2027, la primera nómina del año llegará con un aumento en una de las cotizaciones que se descuentan al trabajador. La aportación del empleado al Mecanismo de Equidad Intergeneracional (MEI) sube del 0,15% al 0,17% de la base de cotización. Te explicamos qué es exactamente, cuánto dinero supone en la práctica y por qué sube.

## Qué es el MEI y por qué existe

El Mecanismo de Equidad Intergeneracional es una cotización específica creada para reforzar la financiación del sistema público de pensiones. Su nombre responde a su objetivo: repartir entre generaciones el esfuerzo de sostener las pensiones. La idea de fondo es que el sistema no cargue todo el coste sobre los trabajadores más jóvenes, sino que se genere un colchón que permita afrontar la jubilación de la generación del baby boom.

El MEI no es una cotización tradicional. No da derecho a una prestación adicional ni se acumula individualmente para el trabajador que la paga. Es una aportación que va directa al fondo con el que se financia el sistema, de forma parecida a lo que sería un seguro colectivo: pagas ahora para sostener una estructura que a ti te servirá en el futuro, pero no es dinero que se te devuelva a título individual.

Se reparte entre empresa y trabajador. La parte que paga el empleado es la que sube en 2027, y es la que verás reflejada en tu recibo de salarios.

## Cuánto sube exactamente

La subida es de dos centésimas porcentuales: del 0,15% al 0,17%.

Esa cifra parece insignificante leída así, y en términos absolutos lo es. El impacto real depende de la base de cotización de cada persona, no del salario neto ni del bruto nominal. La base de cotización es el importe sobre el que se calculan las cotizaciones sociales, y tiene topes mínimos y máximos según el grupo profesional.

Los ejemplos concretos ayudan más que el porcentaje. Para quien tenga una base mensual de **2.000 euros**, el descuento por este concepto pasa de 3 a **3,40 euros**. La diferencia es de **40 céntimos al mes**, siempre que esa base se mantenga igual. Si tu base es más alta, el incremento proporcional sube en la misma medida; si cotizas por la base mínima, el aumento se queda en unos pocos céntimos.

El cambio está previsto en el calendario de la Ley General de la Seguridad Social y forma parte de una subida gradual y escalonada de esta contribución, diseñada para que el ajuste no se note de golpe en el bolsillo de los trabajadores.

## Por qué sube ahora: una senda escalonada

Entender el contexto ayuda a ver hacia dónde va esta cotización y a distinguir este cambio de los que vendrán. El MEI se puso en marcha en 2023 y su recorrido está fijado de antemano: cada año sube un tramo, repartido entre empresa y trabajador. El incremento de 2027 no es una decisión nueva ni un ajuste improvisado, sino el tramo que corresponde según un calendario ya establecido.

Conviene hacer una precisión que a menudo se pasa por alto: el porcentaje total del MEI es mayor que el que se descuenta al trabajador. La empresa paga una parte bastante superior. Es decir, la subida no recae solo sobre el empleado: las dos partes asumen su tramo correspondiente.

## Dónde verlo en tu nómina

El trabajador puede comprobar el importe en el apartado de deducciones y cotizaciones a la Seguridad Social del recibo de salarios. Puede aparecer identificado como MEI o con el nombre completo, Mecanismo de Equidad Intergeneracional.

El cálculo lo aplica la empresa al confeccionar la nómina, sin que el empleado tenga que solicitarlo ni hacer ningún trámite. No hay que reclamar nada ni firmar nada: se aplica de oficio desde la primera nómina de 2027.

Si quieres verificar tu caso concreto, la recomendación es sencilla: compara el porcentaje y la base de cálculo en los recibos de diciembre de 2026 y enero de 2027. El porcentaje aplicado a ti debe ser el que consta en la normativa, y la base la misma si tu situación laboral no ha cambiado. Multiplicar ambos te da la cifra exacta que pagas.

## Que suba esta cotización no significa cobrar menos

Este es el punto donde más confusiones se generan, y merece explicación aparte. Que aumente la deducción por MEI no implica necesariamente que el ingreso final de enero sea inferior al de diciembre.

Hay otros factores en juego que pueden mover el resultado en cualquier dirección. Una subida salarial, un ascenso o un cambio de convenio pueden compensar de sobra los céntimos del MEI. Un cambio en la retención del IRPF también altera el resultado: el IRPF se recalcula cada año con la nueva escala y ajusta el porcentaje que se retiene según tu previsión anual, y su efecto puede ser mucho mayor que la subida del MEI, en una dirección o en otra. A eso se suman las variaciones en la jornada o en el tipo de contrato, que alteran la base y por tanto todos los cálculos, y la presencia de variables o pagas extras en el mes.

Por eso la única forma de medir el efecto real del MEI es aislarlo: mirar su porcentaje y su base de cálculo en los dos recibos, sin comparar la cifra de líquido a percibir, que está influida por todo lo anterior.

## Por qué sube y qué se pretende con ello

El contexto importa para entender la razón de esta escalera. El sistema público de pensiones español afronta en las próximas décadas el reto del envejecimiento de la población: la generación del baby boom se jubila y el número de pensionistas en relación con el de cotizantes crece. Sostener el sistema en ese escenario exige recursos adicionales, y el MEI nace precisamente para eso.

Hay un dato que conviene tener claro: no es un instrumento pensado como permanente. Está diseñado con un horizonte temporal, y si el fondo acumulado alcanza los objetivos previstos, parte del mecanismo podría revertirse o aplicarse de forma distinta. Ese componente temporal es lo que lo distingue de las cotizaciones clásicas del sistema, que sí son estructurales.

También explica por qué la subida es anual y pequeña en lugar de un ajuste único y grande: se trata de repartir el esfuerzo en el tiempo para que sea asumible, en lugar de concentrar el impacto en un solo ejercicio.

## A quién afecta y a quién no

El MEI se descuenta a las personas que cotizan por trabajo, incluyendo buena parte de los regímenes del sistema. En líneas generales:

- **Trabajadores por cuenta ajena:** es el caso más habitual y donde se ve reflejado en la nómina.
- **Autónomos:** también cotizan por este mecanismo sobre la base que hayan elegido.
- **Pensionistas:** no pagan MEI, porque no cotizan como trabajadores en activo.
- **Personas sin actividad laboral ni cotización:** no se ven afectadas.

Conviene señalar que las bases de cotización tienen topes, así que el efecto de la subida está acotado en la parte alta: quien cotiza por la base máxima paga el porcentaje sobre ese máximo, no sobre su salario real si este es superior.

## Preguntas frecuentes

### ¿Cuánto me sube la nómina en enero de 2027 por el MEI?

La aportación del trabajador pasa del 0,15% al 0,17% de su base de cotización, dos centésimas más. Para una base de 2.000 euros mensuales, el descuento sube de 3 a 3,40 euros al mes, unos 40 céntimos más.

### ¿Qué es exactamente el MEI?

El Mecanismo de Equidad Intergeneracional es una cotización creada para reforzar la financiación de las pensiones públicas. No da derecho a una prestación individual ni se acumula para el trabajador: es una aportación al sistema, repartida entre empresa y empleado.

### ¿Por qué sube en 2027?

Porque forma parte de una senda de subidas ya previstas en la Ley General de la Seguridad Social, escalonada año a año desde 2023. La de 2027 es el tramo que corresponde según ese calendario, no una decisión nueva.

### ¿Dónde veo este descuento en mi nómina?

En el apartado de deducciones y cotizaciones a la Seguridad Social, identificado como MEI o Mecanismo de Equidad Intergeneracional. Lo aplica la empresa al confeccionar la nómina, sin que el trabajador tenga que hacer ninguna gestión.

### ¿Voy a cobrar menos en enero?

No necesariamente. La subida del MEI son céntimos, y otros factores como una subida salarial o un cambio en la retención del IRPF pueden tener un efecto mayor y en dirección contraria. Para medir el efecto real del MEI, compara su porcentaje y su base de cálculo en los recibos de diciembre y enero.

### ¿Los pensionistas y los autónomos pagan el MEI?

Los pensionistas no, porque no cotizan como trabajadores en activo. Los autónomos sí lo pagan, sobre la base que hayan elegido.

### ¿El MEI es una cotización permanente?

No. Está diseñado con un horizonte temporal: si el fondo acumulado cumple los objetivos previstos, parte del mecanismo podría revertirse o aplicarse de otra forma. Eso lo distingue de las cotizaciones estructurales del sistema.`,
    image_url: '/images/articles/nomina-2027-mei.svg',
    thumbnail_url: '/images/articles/nomina-2027-mei.svg',
    read_time_minutes: 9,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T18:30:00.000Z',
  },
]
