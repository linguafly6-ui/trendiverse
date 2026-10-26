import test from 'node:test'
import assert from 'node:assert/strict'
import { GET } from '../app/api/article-image/route'

test('article image endpoint returns cached, article-specific SVG with safe accessible text', async () => {
  const request = new Request('https://trendiverse.org/api/article-image?slug=colores-casa&title=Colores%20para%20pintar%20la%20casa&category=hogar')
  const response = await GET(request)
  const svg = await response.text()
  assert.equal(response.status, 200)
  assert.ok((response.headers.get('content-type') ?? '').includes('image/svg+xml'))
  assert.ok((response.headers.get('cache-control') ?? '').includes('s-maxage=604800'))
  assert.ok(svg.includes('<title id="title">Colores para pintar la casa</title>'))
  assert.ok(svg.includes('Ilustración editorial original de TrendiVerse'))
  assert.ok(svg.includes('HOGAR'))
  assert.ok(svg.includes('width="1200"') && svg.includes('height="630"'))
  assert.ok(!svg.toLowerCase().includes('<script') && !svg.toLowerCase().includes('javascript:'))
})

test('article image endpoint escapes untrusted title and uses fallback palette for unknown categories', async () => {
  const request = new Request('https://trendiverse.org/api/article-image?slug=test&title=%3Cscript%3Ealert(1)%3C%2Fscript%3E&category=unknown')
  const response = await GET(request)
  const svg = await response.text()
  assert.equal(response.status, 200)
  assert.ok(svg.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(!svg.includes('<script>'))
  assert.ok(svg.includes('TRENDIVERSE · UNKNOWN'))
})


test('article image helper uses vector SVG fallback for the blank electricity-saving hero', async () => {
  const { articleImageUrl } = await import('../lib/article-images')
  const url = articleImageUrl({
    slug: 'como-ahorrar-electricidad-en-casa-sin-obras',
    title: 'Cómo ahorrar electricidad en casa sin hacer obras: guía práctica',
    category: 'hogar',
    image_url: '/images/como-ahorrar-electricidad-en-casa-sin-obras-hq.webp',
    thumbnail_url: '/images/como-ahorrar-electricidad-en-casa-sin-obras-hq.webp',
  })
  assert.ok(url.startsWith('/api/article-image?'))
  assert.ok(url.includes('slug=como-ahorrar-electricidad-en-casa-sin-obras'))
})

test('article image helper prefers a stored HTTPS article image over the generic fallback', async () => {
  const { articleImageUrl } = await import('../lib/article-images')
  const url = articleImageUrl({
    slug: 'official-product-guide',
    title: 'Guía de producto',
    category: 'tecnologia',
    image_url: 'https://cdn.example.org/product.jpg',
    thumbnail_url: null,
  })
  assert.equal(url, 'https://cdn.example.org/product.jpg')
})

test('article image helper prefers a local public image asset', async () => {
  const { articleImageUrl } = await import('../lib/article-images')
  const url = articleImageUrl({
    slug: 'bateria-philips',
    title: 'Batería Philips',
    category: 'chollos',
    image_url: '/images/articles/bateria-externa-philips-action.svg',
    thumbnail_url: '/images/articles/bateria-externa-philips-action-thumb.svg',
  })
  assert.equal(url, '/images/articles/bateria-externa-philips-action.svg')
})

test('article image helper uses a local thumbnail if the main image is unavailable', async () => {
  const { articleImageUrl } = await import('../lib/article-images')
  const url = articleImageUrl({
    slug: 'bateria-philips',
    title: 'Batería Philips',
    category: 'chollos',
    image_url: null,
    thumbnail_url: '/images/articles/bateria-externa-philips-action-thumb.svg',
  })
  assert.equal(url, '/images/articles/bateria-externa-philips-action-thumb.svg')
})

test('article image helper rejects non-HTTPS external URLs and unsafe local paths', async () => {
  const { articleImageUrl } = await import('../lib/article-images')
  const url = articleImageUrl({
    slug: 'decoracion-casa',
    title: 'Decoración de casa',
    category: 'hogar',
    image_url: 'http://example.org/image.jpg',
    thumbnail_url: '/../private/image.svg',
  })
  assert.ok(url.startsWith('/api/article-image?'))
})
