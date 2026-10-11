# Cierre de cuenta de eBay Marketplace

Este endpoint permite que eBay valide el destino de las notificaciones `MARKETPLACE_ACCOUNT_DELETION` y que Trendiverse acepte solo notificaciones firmadas. No enciende el adapter de Browse y no pide la exención de conservación de datos. Con credenciales de aplicación, pide la clave pública a `getPublicKey` y el token de cliente a `api.ebay.com`. No llama a Browse.

No está listo para producción. Preview ya tiene la tabla del recibo. Producción no tiene binding D1 ni esa migración. Las credenciales de aplicación no están en el repositorio y esta entrega no las configura. Aceptar una notificación no demuestra que se hayan borrado datos personales.

## Qué hay guardado hoy

Se revisaron el esquema D1 (`articles`, `deals`, `tools`, `categories`), el catálogo de Segunda Mano y `wrangler.toml`. No hay columnas `username`, `userId` ni `eiasToken`. El binding `DB` de producción sigue comentado. Preview declara `DB` solo contra `trendiverse-preview`. El binding KV `CACHE` también está comentado. Los anuncios, precios y estadísticas editoriales no están unidos a una cuenta de eBay. No existe un sistema de usuarios de eBay y esta entrega no lo crea.

Eso no demuestra que no existan datos personales en otros almacenes: logs de Cloudflare, analítica, KV si alguien lo enlaza en el panel, u otro sitio fuera de este repositorio. El recibo de una notificación válida queda en `acknowledged-deletion-not-implemented`. El código marca la limitación como `no-ebay-user-identity-stored`. HTTP 204 significa que la firma se aceptó y que el recibo se cerró. No significa que se haya buscado ni borrado el contenido de un vendedor.

El almacén de producción no ejecuta `DELETE` sobre anuncios, precios ni estadísticas. Un duplicado con el recibo ya cerrado responde 204 y no vuelve a entrar en el borrado.

## URL del portal de eBay

```text
https://trendiverse.org/api/ebay/account-deletion
```

Hay que copiarla tal cual. El hash del challenge usa `EBAY_ACCOUNT_DELETION_ENDPOINT`, no la URL que el worker reconstruye. La guía oficial concatena, en UTF-8 y en este orden, `challengeCode`, el token de verificación y esa URL. La respuesta es JSON `{ "challengeResponse": "<hex>" }` con HTTP 200 y `Content-Type: application/json`.

## Binding D1

Producción no tiene binding D1 en `wrangler.toml`. El bloque superior sigue comentado y no contiene el id de `trendiverse`. Preview es el único entorno con `DB`:

```toml
[[env.preview.d1_databases]]
binding = "DB"
database_name = "trendiverse-preview"
database_id = "2bb04eb3-9f3f-40b3-a6ed-b1f58dc9107f"
```

`wrangler pages deploy` elige el entorno comparando la rama con `production_branch`. En `main` el checkout es la rama `main` y el despliegue no imprime alias de rama: ese es producción y usa la configuración superior, sin `DB`. En un pull request el checkout queda en `HEAD` y el alias es `head.trendiverse.pages.dev`: ese es preview y usa `env.preview`. Pages no hereda `vars`. `[vars]` sigue en `ENVIRONMENT = "production"`. `[env.preview.vars]` vale `ENVIRONMENT = "preview"`. Ningún módulo de la app lee esa variable: el endpoint usa `DB` y los secretos de eBay.

`.github/workflows/deploy.yml` inyecta `CLOUDFLARE_D1_DATABASE_ID` en el job, pero el comando no recibe ese id. En los logs de `08e93a7` y `bdacbfe` el valor salió vacío. `npm run migrate:cf` aplicaría `wrangler d1 migrations apply trendiverse-db --remote`. Ese nombre no es `trendiverse-preview` ni la base de producción `trendiverse`. No se ha ejecutado.

`trendiverse-preview` sí está migrada. `npm run migrate:preview:apply` aplicó `0001` a `0005` sobre `2bb04eb3-9f3f-40b3-a6ed-b1f58dc9107f`. `0004` falló una vez por un id de texto y, tras corregirlo, quedó aplicada junto con `0005`. La tabla `ebay_account_deletion_receipts` existe en esa base. La base `trendiverse` (`2324f41b-1407-4495-8fa1-f811bfe0cc9e`) no se ha migrado y no tiene binding.

Sin `DB`, el POST firmado responde 503 y no reserva un recibo. En un despliegue de preview que ya lleve este binding, el POST puede reservar el recibo en `trendiverse-preview`. El GET del challenge puede responder 200 si el token y la URL son válidos. La ruta no usa memoria del isolate.

La consulta y la aplicación de preview pasan por `scripts/d1-preview.ts`. El script lee `wrangler.toml` con Wrangler y solo continúa si preview tiene un único `DB` llamado `trendiverse-preview` con el id de arriba, y si la configuración superior y `production` no tienen ninguna base D1. Si el nombre resuelto es `trendiverse`, se detiene antes de lanzar Wrangler. `migrations list` y `migrations apply` con `--remote` crean, si falta, la tabla de seguimiento `d1_migrations`. Esos dos comandos ya se ejecutaron contra `trendiverse-preview`.

```text
npm run migrate:preview:list
npm run migrate:preview:apply
```

Esos scripts lanzan, después de la comprobación:

```text
wrangler d1 migrations list trendiverse-preview --env preview --remote
wrangler d1 migrations apply trendiverse-preview --env preview --remote
```

`apply` recorre `migrations/`, no solo `0005`. En una base vacía eso incluye `0001` a `0005`. `0005` crea `ebay_account_deletion_receipts` y no borra anuncios.

Pasos que faltan, y que no se han ejecutado:

1. Configurar en Pages los secretos del endpoint. Sin la clave pública real, un POST firmado por eBay sigue en 412.
2. No descomentar el bloque superior ni escribir ahí el id de `trendiverse-preview`. Esa sección también alimenta el despliegue de `main`.
3. No se ha añadido un binding de producción. `npm run migrate:cf` no sirve para la base de preview.

La reserva es un `INSERT ... ON CONFLICT(notification_id) DO NOTHING` antes de cualquier borrado. Si dos POST llegan a la vez, solo uno recibe la reserva y ejecuta el paso de borrado, que hoy no borra filas. El otro ve la reserva abierta y responde 503, o el recibo cerrado y responde 204. Si el proceso cae con la fila en `reserved`, un reintento posterior a 120 segundos la retoma con un `UPDATE` condicionado por la fecha y vuelve a ejecutar ese paso una sola vez. Una reserva más reciente sigue en 503. Retomar la reserva no significa que se hayan borrado datos personales: el paso de producción sigue sin borrar filas del catálogo.

## Secretos

Solo en Cloudflare Pages, como secretos del proyecto `trendiverse`. No van en el repositorio, en `wrangler.toml` ni en los logs.

| Variable | Uso |
| --- | --- |
| `EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN` | 32 a 80 caracteres: letras, cifras, `_` y `-`. Entra en el hash del challenge. |
| `EBAY_ACCOUNT_DELETION_ENDPOINT` | La URL de arriba, con `https`, sin consulta ni usuario, y con la ruta `/api/ebay/account-deletion`. |
| `EBAY_NOTIFICATION_CLIENT_ID` | App ID de la aplicación. Hace falta, junto con el Cert ID, para el token de `getPublicKey`. |
| `EBAY_NOTIFICATION_CLIENT_SECRET` | Cert ID. Solo entra en el `Authorization: Basic` del token. |
| `EBAY_NOTIFICATION_PUBLIC_KEYS` | Respaldo si no hay credenciales: JSON con el `kid` y la respuesta de `getPublicKey`. Si las credenciales están configuradas, este JSON no verifica la firma. |

```bash
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN --project-name trendiverse
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_ENDPOINT --project-name trendiverse
npx wrangler pages secret put EBAY_NOTIFICATION_CLIENT_ID --project-name trendiverse
npx wrangler pages secret put EBAY_NOTIFICATION_CLIENT_SECRET --project-name trendiverse
npx wrangler pages secret put EBAY_NOTIFICATION_PUBLIC_KEYS --project-name trendiverse
```

Esos comandos no se han ejecutado en esta entrega.

El mecanismo oficial, descrito en la guía de Marketplace Account Deletion, en Notification API `getPublicKey` y en el SDK `eBay/event-notification-nodejs-sdk`, es: decodificar `X-EBAY-SIGNATURE` de Base64, leer `kid`, y llamar a `GET https://api.ebay.com/commerce/notification/v1/public_key/{kid}`. Esa operación exige un token de aplicación con el ámbito `https://api.ebay.com/oauth/api_scope`. El token se pide con `POST https://api.ebay.com/identity/v1/oauth2/token`, `grant_type=client_credentials` y `Authorization: Basic` del App ID y el Cert ID. La respuesta de la clave es `{ "key", "algorithm", "digest" }`. `key` es un PEM SPKI. Solo se acepta `ECDSA` y `SHA1`, y la curva P-256. El host está fijo en `api.ebay.com`; no sale de una variable.

La clave obtenida se guarda en la memoria del isolate como máximo una hora. No se vuelve a pedir mientras siga vigente. Un `kid` nuevo no está en esa copia y se pide entonces. Si la copia vigente no valida la firma, se pide otra vez por si eBay rotó la clave de ese mismo `kid`. Si la respuesta nueva es la misma, o tampoco valida, el POST no sigue. Un 404, o un 400 con el error `195001`, es un `kid` desconocido: responde 412 y no guarda la ausencia. Un fallo de red, un 401 que se repite, un JSON ilegible o una clave que no es P-256 responde 503 y no guarda esa respuesta. La copia no se comparte entre isolates y desaparece al reciclar el worker. Puede haber varios `kid` a la vez, hasta ocho. Una clave de prueba no sustituye a la que devuelve `getPublicKey`.

Sin credenciales, el JSON `EBAY_NOTIFICATION_PUBLIC_KEYS` sigue siendo el único origen. Puede ser un PEM o el cuerpo de `getPublicKey`:

```json
{
  "el-kid-de-la-cabecera": {
    "key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "algorithm": "ECDSA",
    "digest": "SHA1"
  }
}
```

La clave del fixture del SDK no es la clave de producción. En el respaldo sin credenciales, el secreto puede contener varios `kid` a la vez. Un `kid` ausente responde 412 y no guarda un recibo. Si el secreto falta, las credenciales no permiten pedir la clave, el algoritmo no es ECDSA o la curva no es P-256, el POST no se acepta y no hay borrado.

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
| Firma ausente, inválida, de otro `kid` o de un `kid` que `getPublicKey` no conoce | 412 |
| Cuerpo que no es esta notificación, o sin identidad | 400 |
| `Content-Length` o cuerpo de más de 64 KiB | 413 |
| Token de verificación, endpoint o claves sin configurar | 503 |
| `getPublicKey` o el token de aplicación no responden, o la respuesta no es una clave P-256 | 503 |
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

`tests/ebay-notification-public-key.test.ts` cubre la caché de una hora, su caducidad, un `kid` desconocido, un fallo de la API, una firma inválida y la rotación. Esas pruebas usan `fetch` falso y claves generadas en el test. No llaman a eBay.
