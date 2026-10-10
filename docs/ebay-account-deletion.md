# Cierre de cuenta de eBay Marketplace

Este endpoint permite que eBay valide el destino de las notificaciones `MARKETPLACE_ACCOUNT_DELETION` y que Trendiverse acepte solo notificaciones firmadas. No enciende el adapter de Browse, no pide la exención de conservación de datos y no llama a eBay.

No está listo para producción. Faltan el binding D1, la migración del recibo y una clave pública real obtenida con `getPublicKey`. Aceptar una notificación no demuestra que se hayan borrado datos personales.

## Qué hay guardado hoy

Se revisaron el esquema D1 (`articles`, `deals`, `tools`, `categories`), el catálogo de Segunda Mano y `wrangler.toml`. No hay columnas `username`, `userId` ni `eiasToken`. El binding `DB` está comentado. El binding KV `CACHE` también está comentado. Los anuncios, precios y estadísticas editoriales no están unidos a una cuenta de eBay. No existe un sistema de usuarios de eBay y esta entrega no lo crea.

Eso no demuestra que no existan datos personales en otros almacenes: logs de Cloudflare, analítica, KV si alguien lo enlaza en el panel, u otro sitio fuera de este repositorio. El recibo de una notificación válida queda en `acknowledged-deletion-not-implemented`. El código marca la limitación como `no-ebay-user-identity-stored`. HTTP 204 significa que la firma se aceptó y que el recibo se cerró. No significa que se haya buscado ni borrado el contenido de un vendedor.

El almacén de producción no ejecuta `DELETE` sobre anuncios, precios ni estadísticas. Un duplicado con el recibo ya cerrado responde 204 y no vuelve a entrar en el borrado.

## URL del portal de eBay

```text
https://trendiverse.org/api/ebay/account-deletion
```

Hay que copiarla tal cual. El hash del challenge usa `EBAY_ACCOUNT_DELETION_ENDPOINT`, no la URL que el worker reconstruye. La guía oficial concatena, en UTF-8 y en este orden, `challengeCode`, el token de verificación y esa URL. La respuesta es JSON `{ "challengeResponse": "<hex>" }` con HTTP 200 y `Content-Type: application/json`.

## Binding D1, sin aplicar

En este repositorio el binding no está activo:

```toml
# [[d1_databases]]
# binding = "DB"
```

`.github/workflows/deploy.yml` inyecta `CLOUDFLARE_D1_DATABASE_ID` en el entorno del job, pero el comando `wrangler pages deploy` no recibe ese id ni crea el binding. En los logs de `08e93a7` y `bdacbfe` el valor salió vacío, sin enmascarar. `npm run migrate:cf` aplicaría `wrangler d1 migrations apply trendiverse-db --remote`; no se ha ejecutado. El secreto de la API de Cloudflare no está en este entorno, así que no se ha podido leer el panel de Pages. No se puede afirmar que producción tenga `DB`.

Hasta que exista, el POST de una notificación firmada responde 503 y no reserva un recibo. El GET del challenge puede responder 200 si el token y la URL son válidos. La idempotencia duradera no existe sin D1: la ruta no usa memoria del isolate.

Pasos que faltan, y que no se han ejecutado:

1. Crear la base, si aún no existe: `npx wrangler d1 create trendiverse-db`.
2. En Cloudflare Pages, proyecto `trendiverse`, Settings, Functions, enlazar esa base con el nombre `DB`. No basta con descomentar `wrangler.toml` en un PR.
3. Aplicar las migraciones pendientes y, en concreto, `migrations/0005_ebay_account_deletion_receipts.sql`. El comando del repositorio es `npm run migrate:cf`. No lanza un borrado de anuncios: la tabla nueva solo tiene `notification_id`, `outcome` y `processed_at`.
4. Comprobar en el panel que el deployment de producción muestra el binding `DB`.

La reserva es un `INSERT ... ON CONFLICT(notification_id) DO NOTHING` antes de cualquier borrado. Si dos POST llegan a la vez, solo uno recibe la reserva y ejecuta el paso de borrado, que hoy no borra filas. El otro ve la reserva abierta y responde 503, o el recibo cerrado y responde 204. Si el proceso cae con la fila en `reserved`, un reintento posterior a 120 segundos la retoma con un `UPDATE` condicionado por la fecha y vuelve a ejecutar ese paso una sola vez. Una reserva más reciente sigue en 503. Retomar la reserva no significa que se hayan borrado datos personales: el paso de producción sigue sin borrar filas del catálogo.

## Secretos

Solo en Cloudflare Pages, como secretos del proyecto `trendiverse`. No van en el repositorio, en `wrangler.toml` ni en los logs.

| Variable | Uso |
| --- | --- |
| `EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN` | 32 a 80 caracteres: letras, cifras, `_` y `-`. Entra en el hash del challenge. |
| `EBAY_ACCOUNT_DELETION_ENDPOINT` | La URL de arriba, con `https`, sin consulta ni usuario, y con la ruta `/api/ebay/account-deletion`. |
| `EBAY_NOTIFICATION_PUBLIC_KEYS` | JSON con el `kid` de `X-EBAY-SIGNATURE` y la respuesta de `getPublicKey`. |

```bash
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN --project-name trendiverse
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_ENDPOINT --project-name trendiverse
npx wrangler pages secret put EBAY_NOTIFICATION_PUBLIC_KEYS --project-name trendiverse
```

El mecanismo oficial, descrito en la guía de Marketplace Account Deletion y en el SDK `eBay/event-notification-nodejs-sdk`, es: decodificar `X-EBAY-SIGNATURE` de Base64, leer `kid`, y llamar a `GET https://api.ebay.com/commerce/notification/v1/public_key/{kid}` con un token de aplicación. La respuesta es `{ "key", "algorithm", "digest" }`. `key` es un PEM SPKI. En el fixture publicado por ese SDK, `algorithm` es `ECDSA` y `digest` es `SHA1`. Esta aplicación no hace esa llamada ni guarda credenciales de eBay.

El secreto puede ser un PEM o el cuerpo de `getPublicKey`:

```json
{
  "el-kid-de-la-cabecera": {
    "key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "algorithm": "ECDSA",
    "digest": "SHA1"
  }
}
```

La clave del fixture del SDK no es la clave de producción. El secreto puede contener varios `kid` a la vez. Para una rotación, se añade la clave nueva sin quitar la anterior hasta que eBay deje de firmar con la vieja. Un `kid` ausente responde 412 y no guarda un recibo. Esta aplicación no llama a `getPublicKey` para descubrir la clave nueva. Si el secreto falta, el algoritmo no es ECDSA o la curva no es P-256, el POST no se acepta y no hay borrado.

## Challenge

`GET /api/ebay/account-deletion?challenge_code=<código>`

El código del query entra en el hash tal cual. Un token ausente o con formato inválido, o un endpoint que no sea esa URL https, responde 503 y no calcula el hash.

Con el servidor local y los valores en el entorno:

```bash
curl -sS "http://localhost:3000/api/ebay/account-deletion?challenge_code=ebay-challenge-code"
```

El hex esperado se puede calcular sin imprimir el token:

```bash
node --input-type=module -e "import { createHash } from 'node:crypto'; const h = createHash('sha256'); h.update(process.argv[1]); h.update(process.env.EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN); h.update(process.env.EBAY_ACCOUNT_DELETION_ENDPOINT); console.log(h.digest('hex'))" ebay-challenge-code
```

## POST

La cabecera `X-EBAY-SIGNATURE` es un JSON en Base64. En el vector publicado por el SDK de Node, el campo `alg` es `ecdsa` en minúsculas, `digest` es `SHA1`, y `signature` es la firma ECDSA en Base64 DER. También se acepta `ECDSA` en mayúsculas. Cualquier otro algoritmo o digest se rechaza.

Se verifica ECDSA P-256 con SHA-1 sobre el cuerpo crudo. Si esa comprobación falla y el cuerpo es JSON, se repite sobre `JSON.stringify` del mismo objeto, que es lo que comprueba el SDK de Node. El SDK de Java vuelve a serializar con Jackson; esa cadena puede no coincidir. No se ha visto un POST real de eBay. Si la firma de un aviso real no encaja, la respuesta es 412 y no hay borrado.

| Resultado | HTTP |
| --- | --- |
| Firma válida, recibo cerrado ahora o ya cerrado antes | 204 |
| Firma válida, pero la reserva de otro proceso sigue abierta | 503 |
| Firma ausente, inválida o de otro `kid` | 412 |
| Cuerpo que no es esta notificación, o sin identidad | 400 |
| `Content-Length` o cuerpo de más de 64 KiB | 413 |
| Token, endpoint o claves públicas sin configurar | 503 |
| Sin binding D1, o fallo al reservar el recibo | 503 o 500 |

Un 412, un 400 y un 413 no guardan un recibo. Un fallo de D1 al reservar responde 500 y no ejecuta el borrado. Si el borrado lanza un error, se suelta la reserva `reserved` para que un reintento pueda continuar; hoy ese borrado no está implementado y no toca el catálogo. Los identificadores de la cuenta no se escriben en el recibo, en la respuesta ni en logs.

## Workers Builds

El comentario del bot con «Build: Failed» y los enlaces «View logs» corresponde al script de Worker `trendiverse` (`/workers/services/view/trendiverse`). La columna de URL de deployment está vacía. Es distinto del comentario de Cloudflare Pages, que en `e68e4cd` publicó `https://a00fad02.trendiverse.pages.dev`, y del Worker `trendiverse-ai` de `workers/ai`.

Esos enlaces abren el panel de Cloudflare. La API de logs respondió `9106` por falta de autorización, así que el texto remoto del build no se ha leído. En local, `npx wrangler deploy --dry-run` contra el `wrangler.toml` de la raíz termina al instante con: «It looks like you've run a Workers-specific command in a Pages project. For Pages, please run `wrangler pages deploy` instead.» Wrangler lanza ese error cuando el toml tiene `pages_build_output_dir`. El nombre del script del check, `trendiverse`, es el `name` de ese toml. No se ha cambiado la configuración del panel ni el toml: quitar `pages_build_output_dir` dejaría de marcar el proyecto como Pages.

## Prueba automática

```bash
node --import tsx --test tests/ebay-account-deletion.test.ts
```

Cubre el challenge, el formato del token, el vector de firma publicado por el SDK de eBay, firmas inválidas, una notificación firmada, el duplicado, dos reservas simultáneas, un fallo de base de datos, la ausencia de D1 y que un anuncio no asociado sobrevive. La clave de ese vector es un fixture público del SDK, no una clave obtenida de `getPublicKey` para Trendiverse.
