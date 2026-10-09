# Fuentes de datos de Segunda Mano

Capa en `lib/second-hand-data.ts`. `/segunda-mano/` y sus categorías obtienen los productos con `getSecondHandProducts()`, sin conocer la fuente.

## SecondHandDataSource

```ts
interface SecondHandDataSource {
  readonly id: string
  getProductData(productId: string): Promise<SecondHandPriceObservation | null>
}
```

Devuelve una observación real para el `slug` de un producto, o `null` si no hay dato. Por defecto se usa `emptySecondHandDataSource`, que siempre devuelve `null`: no hay ninguna fuente real conectada. Las páginas llaman a `getSecondHandProducts()` sin argumentos, así que las métricas siguen en `null`.

## Campos requeridos

`productId`, `price` (> 0), `currency` (ISO 4217), `condition`, `source` (no vacío), `sourceUrl` (http/https válida) y `observedAt` (fecha parseable, se normaliza a ISO). Opcionales: `referencePrice`, `minPrice`, `maxPrice` (positivos; si min > max se descartan).

## Validación y normalización

`validateObservation` rechaza precios no positivos, monedas inválidas, URLs inválidas, timestamps inválidos y observaciones sin fuente. `normalizeCondition` mapea a `new | like-new | good | fair | poor | unknown`. `getSecondHandMetrics` descarta observaciones inválidas o errores de la fuente y devuelve métricas `null`. `score` y `trend` permanecen `null` hasta que exista una fuente real para calcularlos; el ahorro solo se calcula si hay precio de referencia mayor que el usado.

## Añadir una fuente

1. Implementar `SecondHandDataSource` en un módulo nuevo de `lib/`.
2. Sustituir el default de `getSecondHandProducts` / `getSecondHandMetrics` por esa fuente. Las páginas no deben conocer la API, las credenciales ni el formato de la fuente.
3. Añadir tests con respuestas de ejemplo, nunca con datos reales de un marketplace.

## Adapter de eBay, sin activar

`lib/ebay-browse-adapter.ts` implementa `SecondHandDataSource` (`id: ebay-browse`). `getProductData` devuelve siempre `null` y no es el proveedor por defecto. No hay cliente HTTP, OAuth, cron, KV, caché ni credenciales.

`ebayOfferToObservation` solo normaliza. Devolver un objeto no autoriza a publicarlo ni activa el proveedor. La publicación sigue bloqueada hasta el gate de la PR #93: acceso de producción, autorización de EPN, `EBAY_ES`, frescura máxima de seis horas sin alargar el plazo si falla el refresco, permiso escrito para el uso de los datos, mapping verificado (`externalProductId` distinto de `null`) y credenciales solo en servidor. Ahorro, mínimo, máximo y score siguen fuera. Una condición no admitida por la categoría, un identificador no verificado, un anuncio de más de seis horas o una URL de ficha o de afiliado de eBay no producen un objeto normalizado.

## Por qué no datos manuales o ficticios

Un precio, ahorro o score inventado engaña al usuario y daña la credibilidad y el SEO. Sin fuente verificable, el valor es `null`.

La comparación de fuentes, la arquitectura prevista, la regla de frescura de eBay y las condiciones para calcular el score están en [second-hand-data-sources-research.md](./second-hand-data-sources-research.md). Ninguna fuente real está conectada. Cumplir la sección «Gate antes de implementar eBay» de ese documento sigue siendo obligatorio: el esqueleto no se activa hasta entonces.

## Catálogo verificable

`lib/second-hand-product-mapping.ts` dice qué identifica cada slug y qué atributos faltan para comparar un modelo. Los 18 están en revisión `pending`, con `externalProductId: null` y sin referencia de verificación. Ninguno se puede comparar todavía: las familias no fijan generación o capacidad, y moda, hogar y deporte son categorías, no un producto único. No hay precios ni identificadores de marketplace.

`lib/second-hand-tech-candidates.ts` propone como máximo tres modelos por cada slug tecnológico, con el nombre, la generación y la capacidad o configuración que figura en una ficha oficial del fabricante. Todos siguen en `pending`, con `externalProductId: null`. No marcan el mapping como verificado ni habilitan una comparación. Si la ficha no cierra región, revisión o identificador, el candidato no se trata como un SKU. Lo que no se pudo cerrar queda en `SECOND_HAND_TECH_CANDIDATE_GAPS`.

## Qué falta antes de integrar una fuente real

- API oficial o acuerdo de uso (términos de servicio verificados; sin scraping frágil).
- Credenciales gestionadas fuera del repositorio.
- Licencia/atribución y límites de uso.
- Frecuencia de actualización, caché y moneda/mercado cubierto.
- Mapeo de productos de Trendiverse a identificadores de la fuente.
- Definición de la fórmula del Second-Hand Score y su fuente de tendencia.
