/**
 * Worker de IA para TrendiVerse.
 *
 * Endpoints (POST, cuerpo JSON):
 *   /resumen  { content, title? }  -> { result }
 *   /faq      { content, title? }  -> { faq: [{ question, answer }] }
 *   /seo      { content, title? }  -> { title, description }
 *   /audio    { text }             -> audio/mpeg
 *
 * Seguridad: si existe el secreto SHARED_SECRET, exige la cabecera
 * x-api-key con ese valor. Crearlo con:
 *   npx wrangler secret put SHARED_SECRET
 */

// Modelo de texto a voz. Cambialo aqui si Cloudflare renombra el modelo.
const TTS_MODEL = '@cf/deepgram/aura-1'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

function cors(env) {
  return {
    'access-control-allow-origin': env.ALLOWED_ORIGIN || '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-api-key',
    vary: 'Origin',
  }
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...cors(env) },
  })
}

/** Recorta el texto para no gastar contexto ni neuronas de mas. */
function trim(text, max) {
  const t = String(text || '').trim()
  return t.length <= max ? t : t.slice(0, max)
}

/** Quita el HTML y el markdown para que el modelo reciba texto limpio. */
function plain(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^#{2,3}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function askText(env, system, user, maxTokens) {
  const model = env.DEFAULT_MODEL || '@cf/deepseek-ai/deepseek-v4-flash'
  const out = await env.AI.run(model, {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens || 1024,
  })
  return String((out && out.response) || '').trim()
}

/** Extrae el primer JSON valido de una respuesta del modelo. */
function parseJson(raw) {
  const start = raw.indexOf('[') === -1
    ? raw.indexOf('{')
    : Math.min(
        raw.indexOf('{') === -1 ? Infinity : raw.indexOf('{'),
        raw.indexOf('[')
      )
  if (start === -1 || !isFinite(start)) return null
  const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'))
  if (end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
}

const SYS_RESUMEN =
  'Eres editor de un medio digital espanol. Escribes en espanol de Espana, claro y directo, sin relleno. ' +
  'No inventas datos: si algo no aparece en el texto, no lo afirmas.'

const SYS_FAQ =
  'Eres editor de un medio digital espanol. A partir del articulo, redactas preguntas frecuentes. ' +
  'Devuelves SOLO un array JSON con objetos {"question","answer"}, sin texto adicional. ' +
  'Entre 4 y 6 preguntas. Las respuestas, de una a tres frases, basadas unicamente en el articulo.'

const SYS_SEO =
  'Eres especialista SEO de un medio digital espanol. Devuelves SOLO un objeto JSON ' +
  '{"title","description"}. El title tiene 46 caracteres o menos y no repite el nombre del medio. ' +
  'La description tiene 155 caracteres o menos e incluye el dato mas buscable del articulo.'

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(env) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Usa POST' }, 405, env)
    }

    // Puerta minima: si hay secreto configurado, se exige la cabecera.
    const secret = env.SHARED_SECRET
    if (secret && request.headers.get('x-api-key') !== secret) {
      return json({ error: 'No autorizado' }, 401, env)
    }

    const url = new URL(request.url)
    let body = {}
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Cuerpo JSON invalido' }, 400, env)
    }

    const title = trim(body.title || '', 200)
    const content = plain(trim(body.content || body.text || '', 20000))

    try {
      // -------- Audio --------
      if (url.pathname === '/audio') {
        const text = trim(body.text || content, 1800)
        if (!text) return json({ error: 'Falta "text"' }, 400, env)
        const audio = await env.AI.run(TTS_MODEL, { text, encoding: 'mp3' })
        const headers = { 'content-type': 'audio/mpeg', ...cors(env) }
        if (audio instanceof ReadableStream) {
          return new Response(audio, { headers })
        }
        const bytes = audio instanceof ArrayBuffer ? new Uint8Array(audio) : audio
        return new Response(bytes, { headers })
      }

      if (!content) return json({ error: 'Falta "content"' }, 400, env)
      const user = title ? `Titulo: ${title}\n\nArticulo:\n${content}` : `Articulo:\n${content}`

      // -------- Resumen --------
      if (url.pathname === '/resumen') {
        const result = await askText(
          env,
          SYS_RESUMEN,
          `${user}\n\nEscribe un resumen del articulo en 3 o 4 frases, en un solo parrafo.`,
          512
        )
        return json({ result }, 200, env)
      }

      // -------- Preguntas frecuentes --------
      if (url.pathname === '/faq') {
        const raw = await askText(
          env,
          SYS_FAQ,
          `${user}\n\nDevuelve el array JSON de preguntas frecuentes.`,
          1024
        )
        const faq = parseJson(raw)
        if (!Array.isArray(faq)) return json({ error: 'Respuesta no parseable', raw }, 502, env)
        return json({ faq }, 200, env)
      }

      // -------- Titulo y descripcion SEO --------
      if (url.pathname === '/seo') {
        const raw = await askText(
          env,
          SYS_SEO,
          `${user}\n\nDevuelve el objeto JSON con title y description.`,
          256
        )
        const seo = parseJson(raw)
        if (!seo || typeof seo !== 'object') return json({ error: 'Respuesta no parseable', raw }, 502, env)
        return json(
          {
            title: trim(seo.title, 46),
            description: trim(seo.description, 155),
          },
          200,
          env
        )
      }

      return json({ error: 'Ruta no encontrada. Usa /resumen, /faq, /seo o /audio.' }, 404, env)
    } catch (e) {
      return json(
        { error: 'Error al llamar al modelo', detail: String(e && e.message ? e.message : e) },
        500,
        env
      )
    }
  },
}
