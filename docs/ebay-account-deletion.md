# Cierre de cuenta de eBay Marketplace

Este endpoint permite que eBay valide el destino de las notificaciones `MARKETPLACE_ACCOUNT_DELETION` y que Trendiverse acepte solo notificaciones firmadas. No enciende el adapter de Browse, no pide la exención de conservación de datos y no llama a eBay.

## Qué hay guardado hoy

El esquema D1 (`articles`, `deals`, `tools`, `categories`) y el catálogo de Segunda Mano no tienen `username`, `userId` ni `eiasToken`. Los anuncios, precios y estadísticas editoriales no están unidos a una cuenta de eBay. No existe un sistema de usuarios de eBay y esta entrega no lo crea.

Una notificación válida se responde con HTTP 204. El recibo interno queda en `no-linked-personal-data`. Eso significa que la notificación se aceptó y que no había filas personales que borrar. No significa que se haya borrado el contenido de un vendedor en eBay ni un anuncio global de Trendiverse.

Para poder borrar de verdad haría falta una tabla futura cuya clave sea esa identidad, registrada en el borrado dirigido. Hasta entonces el cumplimiento del borrado de datos personales de eBay no está cerrado. El código marca esa limitación como `no-ebay-user-identity-stored`.

## URL del portal de eBay

```text
https://trendiverse.org/api/ebay/account-deletion
```

Hay que copiarla tal cual en el portal de desarrolladores de eBay. El hash del challenge usa esa misma cadena, no la URL que el worker crea por su cuenta.

## Secretos

Solo en Cloudflare Pages, como secretos del proyecto `trendiverse`. No van en el repositorio, en `wrangler.toml` ni en los logs.

| Variable | Uso |
| --- | --- |
| `EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN` | 32 a 80 caracteres: letras, cifras, `_` y `-`. Entra en el hash del challenge. |
| `EBAY_ACCOUNT_DELETION_ENDPOINT` | La URL de arriba, con `https`, sin consulta ni usuario en la URL. |
| `EBAY_NOTIFICATION_PUBLIC_KEYS` | JSON `{ "kid": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----" }`. La clave pública del `kid` que eBay pone en `X-EBAY-SIGNATURE`. |

```bash
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN --project-name trendiverse
npx wrangler pages secret put EBAY_ACCOUNT_DELETION_ENDPOINT --project-name trendiverse
npx wrangler pages secret put EBAY_NOTIFICATION_PUBLIC_KEYS --project-name trendiverse
```

Si D1 está enlazado como `DB`, aplica `migrations/0005_ebay_account_deletion_receipts.sql`. Esa tabla solo guarda el id de la notificación, el resultado y la fecha. Sin D1, el recibo vive en la memoria del isolate: un duplicado en otro isolate vuelve a comprobar la firma y el borrado dirigido, que hoy no borra filas. El borrado dirigido tiene que seguir siendo idempotente cuando exista.

La clave pública se obtiene fuera de esta aplicación, con la API de notificaciones de eBay (`getPublicKey` para el `kid` de la cabecera). Este código no hace esa llamada. Si el secreto no está, o el `kid` no coincide, el POST no se acepta y no hay borrado.

## Challenge

`GET /api/ebay/account-deletion?challenge_code=<código>`

La respuesta 200 es JSON:

```json
{ "challengeResponse": "<sha256 en hexadecimal>" }
```

El SHA-256 es la concatenación exacta, en UTF-8, de `challengeCode`, el token de verificación y la URL del endpoint, en ese orden.

Con el servidor local y los tres valores en el entorno:

```bash
curl -sS "http://localhost:3000/api/ebay/account-deletion?challenge_code=ebay-challenge-code"
```

El hex esperado se puede calcular sin imprimir el token en un log de aplicación:

```bash
node --input-type=module -e "import { createHash } from 'node:crypto'; const h = createHash('sha256'); h.update(process.argv[1]); h.update(process.env.EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN); h.update(process.env.EBAY_ACCOUNT_DELETION_ENDPOINT); console.log(h.digest('hex'))" ebay-challenge-code
```

Un token ausente o con formato inválido, o un endpoint que no sea esa URL https, responde 503 y no calcula el hash.

## POST

eBay envía el cuerpo JSON y la cabecera `X-EBAY-SIGNATURE`. Esa cabecera es un JSON en Base64 con `alg` `ECDSA`, `digest` `SHA1`, `kid` y `signature`. Se verifica la firma ECDSA SHA-1 sobre el cuerpo crudo con la clave pública de ese `kid`. La clave tiene que ser EC P-256 en formato SPKI, que es la que publica eBay para esta notificación. Otra curva no se acepta.

| Resultado | HTTP |
| --- | --- |
| Firma válida, notificación aceptada o ya recibida | 204 |
| Firma ausente, inválida o de otro `kid` | 412 |
| Cuerpo que no es esta notificación, o sin identidad | 400 |
| Cuerpo de más de 64 KiB | 413 |
| Token, endpoint o claves públicas sin configurar | 503 |

Un 204 repetido no vuelve a ejecutar el borrado. El 412 no guarda un recibo. Los identificadores de la cuenta no se escriben en el recibo ni en la respuesta.

## Prueba automática

```bash
npm test -- tests/ebay-account-deletion.test.ts
```

Cubre el challenge, el formato del token, firmas inválidas, una notificación firmada, el duplicado, los errores de cuerpo y que un anuncio no asociado sobrevive.
