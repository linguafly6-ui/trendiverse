import test from 'node:test'
import assert from 'node:assert/strict'
import { GET } from '../app/api/article-image/route'

test('article image endpoint returns cached, article-specific SVG with safe accessible text', async () => {
  const request = new Request('https://trendiverse.org/api/article-image?slug=colores-casa&title=Colores%20para%20pintar%20la%20casa&category=hogar')
  const response = await GET(request)
  const svg = await response.text()
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /image\/svg\+xml/)
  assert.match(response.headers.get('cache-control') ?? '', /s-maxage=604800/)
  assert.match(svg, /<title id="title">Colores para pintar la casa<\/title>/)
  assert.match(svg, /Ilustración editorial original de TrendiVerse/)
  assert.match(svg, /HOGAR/)
  assert.match(svg, /<svg[^>]+width="1200"[^>]+height="630"/)
  assert.doesNotMatch(svg, /<script|javascript:/i)
})

test('article image endpoint escapes untrusted title and uses fallback palette for unknown categories', async () => {
  const request = new Request('https://trendiverse.org/api/article-image?slug=test&title=%3Cscript%3Ealert(1)%3C%2Fscript%3E&category=unknown')
  const response = await GET(request)
  const svg = await response.text()
  assert.equal(response.status, 200)
  assert.match(svg, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(svg, /<script>/i)
  assert.match(svg, /TRENDIVERSE · UNKNOWN/)
})
