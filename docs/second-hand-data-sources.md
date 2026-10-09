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

## Por qué no datos manuales o ficticios

Un precio, ahorro o score inventado engaña al usuario y daña la credibilidad y el SEO. Sin fuente verificable, el valor es `null`.

## Qué falta antes de integrar una fuente real

- API oficial o acuerdo de uso (términos de servicio verificados; sin scraping frágil).
- Credenciales gestionadas fuera del repositorio.
- Licencia/atribución y límites de uso.
- Frecuencia de actualización, caché y moneda/mercado cubierto.
- Mapeo de productos de Trendiverse a identificadores de la fuente.
- Definición de la fórmula del Second-Hand Score y su fuente de tendencia.
