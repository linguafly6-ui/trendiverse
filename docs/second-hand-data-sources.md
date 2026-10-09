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

`lib/second-hand-product-mapping.ts` dice qué identifica cada slug y qué atributos faltan para comparar un modelo. Los 18 tienen una decisión auditable: nota, página oficial cuando el slug es un producto de fabricante y prioridad de revisión. Esa prioridad no es un ranking de ventas. Solo `nintendo-switch` está en `verified`: la ficha de Nintendo ES describe Nintendo Switch – Modelo OLED, con 64 GB y pantalla OLED de 7 pulgadas. La declaración UE de conformidad publica, en el mismo documento, «Product name Nintendo Switch – OLED Model console» y «Model number HEG-001». Esa cita queda guardada en el expediente. `HEG-001` es el código del fabricante, no un identificador de marketplace. `verificationEvidenceIssues()` no descarga esas URLs: solo comprueba la forma de los campos. `externalProductId` sigue en `null` en los 18. Un texto puesto en ese campo no es un identificador validado para comparar; ese contrato todavía no existe. Los otros 17 siguen en `pending`, con atributos vacíos y `verificationRef` en `null`. Las familias pendientes citan la página que deja abierta la capacidad, el lector o la región. Las categorías no tienen una ficha de un solo producto. No hay precios ni consultas a eBay.

`lib/second-hand-tech-candidates.ts` propone como máximo tres modelos por cada slug tecnológico, con el nombre, la generación y la capacidad o configuración que figura en una ficha oficial del fabricante. Todos siguen en `pending`, con `externalProductId: null`. No marcan el mapping como verificado ni habilitan una comparación. Si la ficha no cierra región, revisión o identificador, el candidato no se trata como un SKU. Lo que no se pudo cerrar queda en `SECOND_HAND_TECH_CANDIDATE_GAPS`. Un candidato no es un expediente de verificación.

## Política de evidencia

`lib/second-hand-verification-policy.ts` fija los requisitos para pasar un mapping de `pending` a `verified`. `verificationEvidenceIssues()` comprueba la forma del expediente y los hosts permitidos. No descarga las URLs ni lee el texto de los documentos. El expediente de `nintendo-switch` cumple esa forma con las dos URLs de www.nintendo.com citadas arriba. No lleva identificador de marketplace: la lista de hosts para esa fuente sigue vacía, y un `externalProductId` arbitrario no se trata como validado. El adapter de eBay sigue apagado.

Hay cuatro capas distintas.

**Identidad del producto.** La publica el fabricante en su ficha: fabricante, modelo exacto, generación o revisión, y una sola configuración relevante. Una categoría agrupa muchos modelos y no puede verificarse.

**Evidencia.** Cada dato tiene un respaldo propio.

- Fabricante, modelo, generación y configuración: la ficha oficial del fabricante. Hace falta el valor y una URL https de ese host. Los hosts son los mismos que ya admite `isOfficialCandidateSource()`: `support.apple.com`, `www.apple.com`, `www.samsung.com`, `www.playstation.com`, `www.nintendo.com`, `www.xbox.com` y `www.steamdeck.com`.
- Identificador de modelo o SKU: el fabricante lo publica en esa ficha. El código sin la URL donde aparece se rechaza. En el catálogo solo la Switch OLED trae HEG-001, y la cita que lo une al nombre de la consola está en la declaración UE. El validador no descarga ese PDF.
- Atributos demostrados: los cuatro valores de la identidad, repetidos con la URL de la ficha que los muestra. Un atributo del mapping en `null` no está demostrado.
- Referencia verificable: la persona o el registro interno que revisó la ficha. No es un identificador de marketplace ni una URL de anuncio.

**Ambigüedades pendientes.** Quien revisa tiene que dejar constancia de que miró la lista. Si queda abierta cualquiera de estas, el modelo no se verifica: varias capacidades, lector frente a edición digital, tamaño, conectividad, región o revisiones incompatibles. Los huecos ya anotados en `SECOND_HAND_TECH_CANDIDATE_GAPS` son de ese tipo. No cierran un modelo.

**Identificador de marketplace.** Va aparte de la identidad. Si no aparece, la identidad todavía puede estar completa: este cambio no lo busca ni lo rellena. `externalProductId` sigue en `null`. Si aparece, su fuente tiene que ser una URL https de un host de `MARKETPLACE_IDENTIFIER_SOURCE_HOSTS`, sin parámetros de afiliación. Esa lista está vacía: ningún dominio está autorizado y un https cualquiera no cuenta. No es la lista de fichas del fabricante.

No basta comparar la URL carácter a carácter con la ficha. Se trata como la misma ficha, y se rechaza, cualquier variante con otra query, otro fragmento, el puerto 443, la barra final o distintas mayúsculas en el host. Otra ruta u otro host no son esa ficha. Una URL http o imposible de parsear es una fuente inválida, con un problema propio. No se resuelven redirecciones ni se pide la página.

Tampoco se infiere el identificador. Se rechaza si el valor, al ignorar mayúsculas y espacios de más, es el fabricante, el modelo o el nombre completo. Un valor vacío o nulo no se convierte en un id.

La validación rechaza evidencia incompleta, URLs que no son https del fabricante (otro host, http o parámetros de afiliado), identificadores sin fuente y atributos críticos todavía ambiguos. Un fixture sintético solo sirve para probar esa forma. No es un producto del catálogo y no marca ninguno como verificado. Contra los hosts oficiales no es suficiente, porque su URL no es una ficha de fabricante.

## Qué falta antes de integrar una fuente real

- API oficial o acuerdo de uso (términos de servicio verificados; sin scraping frágil).
- Credenciales gestionadas fuera del repositorio.
- Licencia/atribución y límites de uso.
- Frecuencia de actualización, caché y moneda/mercado cubierto.
- Mapeo de productos de Trendiverse a identificadores de la fuente.
- Definición de la fórmula del Second-Hand Score y su fuente de tendencia.
