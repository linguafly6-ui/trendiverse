# Worker de IA de TrendiVerse

Puerta unica a Workers AI para la web. No toca `lib/db.ts` ni el build de la web
de Next: es un Worker independiente al que se llama por HTTP.

## Que ofrece

Todos los endpoints son `POST` con cuerpo JSON.

| Endpoint | Cuerpo | Devuelve |
| --- | --- | --- |
| `/resumen` | `{ content, title? }` | `{ result }` - resumen de 3 o 4 frases |
| `/faq` | `{ content, title? }` | `{ faq: [{ question, answer }] }` |
| `/seo` | `{ content, title? }` | `{ title, description }` |
| `/audio` | `{ text }` | `audio/mpeg` |

## Puesta en marcha

1. Activa Workers AI en el panel: **Workers & Pages -> AI**. El plan gratuito
   incluye 10.000 neuronas al dia.
2. Instala dependencias y despliega:

   ```bash
   cd workers/ai
   npx wrangler deploy
   ```

3. Crea el secreto que protege el Worker:

   ```bash
   npx wrangler secret put SHARED_SECRET
   ```

   Guarda ese valor: es la cabecera `x-api-key` que debera enviar quien llame.

## Prueba rapida

```bash
curl -X POST https://trendiverse-ai.<tu-subdominio>.workers.dev/resumen \
  -H 'content-type: application/json' \
  -H "x-api-key: $SHARED_SECRET" \
  -d '{"title":"Ejemplo","content":"Texto del articulo..."}'
```

## Coste y limites

- 10.000 neuronas gratis al dia; despues, 0,011 $ por cada 1.000.
- En el plan gratuito de Workers, los modelos de pago tienen un limite de
  20 peticiones por minuto.

## Modelo

El modelo por defecto es `@cf/deepseek-ai/deepseek-v4-flash`, por su ventana
de contexto de un millon de tokens. Se cambia con la variable `DEFAULT_MODEL`
en `wrangler.toml`. Alternativas recomendadas:

- `@cf/qwen/qwen3.8-27b` - 262.000 tokens de contexto, buen espanol.
- `@cf/zai-org/glm-4.7-flash` - 131.000 tokens, indicado para resumir.

## Aviso de uso

Este Worker esta pensado para tareas acotadas sobre texto que ya existe
(resumir, proponer preguntas frecuentes, redactar descripciones SEO). No esta
pensado para publicar articulos sin revision: el contenido generado debe
verificarse antes de salir a la web.
