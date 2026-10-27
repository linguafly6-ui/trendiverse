import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Item = { id:number; title:string; slug:string; keyword:string; cluster:string; intent:string; angle:string; editorialNote:string }
type Draft = { title?:string; excerpt?:string; content?:string; category?:string; editorialBatchReady?:boolean; refreshPublishedArticle?:boolean }

function runWrangler(args:string[]):string {
  return execFileSync('npx',['wrangler',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']})
}
function wordCount(value:string):number {
  return value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0
}
function findArticleRow(value:unknown, slug:string):Record<string,unknown>|undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found=findArticleRow(item,slug)
      if (found) return found
    }
    return undefined
  }
  if (value && typeof value==='object') {
    const obj=value as Record<string,unknown>
    if (obj.slug===slug && typeof obj.content==='string') return obj
    for (const child of Object.values(obj)) {
      const found=findArticleRow(child,slug)
      if (found) return found
    }
  }
  return undefined
}
function main() {
  const auto = process.env.AUTO_NEXT_BATCH === 'true'
  const batch = Number(process.env.BATCH_NUMBER ?? '1')
  if (!auto && (!Number.isInteger(batch) || batch < 1 || batch > 50)) throw new Error('BATCH_NUMBER debe estar entre 1 y 50')
  const plan = JSON.parse(readFileSync(resolve('data/suplementos-editorial-plan.json'),'utf8')) as Item[]
  if (plan.length !== 500 || plan.some((x,i)=>x.id!==i+1)) throw new Error('Plan de suplementos inválido')
  const available = plan.filter(x=>{
    const file=resolve(`data/supplements-drafts/${String(x.id).padStart(2,'0')}.json`)
    if (x.id<6 || !existsSync(file)) return false
    if (!auto) return true
    try { return (JSON.parse(readFileSync(file,'utf8')) as Draft).editorialBatchReady===true } catch { return false }
  })
  const start = auto ? 6 : 6 + (batch-1)*20
  const selected = auto ? [...available].sort((a,b)=>b.id-a.id).slice(0,20).sort((a,b)=>a.id-b.id) : available.filter(x=>x.id>=start&&x.id<start+20)
  if (selected.length===0) throw new Error('No hay borradores preparados para este lote')
  console.log(auto ? 'Publicación automática: se procesarán hasta 20 borradores marcados editorialBatchReady' : `Publicación manual: lote ${batch}/50, IDs ${start}–${Math.min(start+19,500)}`)
  const published:number[]=[]; const skipped:number[]=[]
  for (const item of selected) {
    if (auto && published.length>=20) break
    const file = resolve(`data/supplements-drafts/${String(item.id).padStart(2,'0')}.json`)
    const draft = JSON.parse(readFileSync(file,'utf8')) as Draft
    const words = wordCount(draft.content ?? '')
    if (draft.title?.trim() !== item.title || !draft.excerpt?.trim() || !draft.content?.trim()) {
      throw new Error(`Borrador ${item.id} inválido: título, extracto o contenido ausente/no coincidente`)
    }
    if (words < 2000) throw new Error(`Borrador ${item.id} rechazado: ${words} palabras; mínimo obligatorio 2000. No se publicará ningún artículo corto.`)
    console.log(`[${item.id}/500] Borrador validado: ${words} palabras`)
    const q = `SELECT slug, title, content, image_url FROM articles WHERE slug = '${item.slug.replace(/'/g,"''")}' LIMIT 1;`
    const existingRaw = runWrangler(['d1','execute',process.env.D1_DATABASE ?? 'trendiverse-preview','--remote','--json',`--command=${q}`])
    let existingArticle:Record<string,unknown>|undefined
    try { existingArticle=findArticleRow(JSON.parse(existingRaw),item.slug) } catch { /* Treat unreadable verification as not verified; safely republish. */ }
    const storedWords = typeof existingArticle?.content==='string' ? wordCount(existingArticle.content) : 0
    const storedTitle = typeof existingArticle?.title==='string' ? existingArticle.title.trim() : ''
    const storedImage = typeof existingArticle?.image_url==='string' ? existingArticle.image_url.trim() : ''
    const storedContent = typeof existingArticle?.content === 'string' ? existingArticle.content.trim() : ''
    const draftContent = (draft.content ?? '').trim()
    const exactContentMatch = storedContent.length > 0 && storedContent === draftContent
    if (existingArticle && storedTitle===item.title && storedWords>=2000 && storedImage.startsWith('https://') && (exactContentMatch || draft.refreshPublishedArticle !== true)) {
      console.log(`[${item.id}/500] Ya existe en D1 con título, imagen y ${storedWords} palabras; ${exactContentMatch ? 'el contenido coincide' : 'no se ha solicitado actualización editorial'}, se omite: ${item.slug}`)
      skipped.push(item.id)
      continue
    }
    if (existingArticle && draft.refreshPublishedArticle === true) console.log(`[${item.id}/500] Actualización editorial solicitada; se reemplazará el contenido existente desde el borrador aprobado.`)
    else if (existingArticle) console.log(`[${item.id}/500] Registro incompleto: ${storedWords} palabras; se actualizará desde el borrador aprobado.`)
    console.log(`[${item.id}/500] Publicando borrador preparado: ${item.title}`)
    execFileSync('npx',['tsx','scripts/generate-and-publish-savings-article.ts'],{stdio:'inherit',env:{...process.env,ARTICLE_TITLE:item.title,ARTICLE_SLUG:item.slug,ARTICLE_KEYWORD:item.keyword,ARTICLE_CLUSTER:item.cluster,ARTICLE_INTENT:item.intent,ARTICLE_ANGLE:item.angle,ARTICLE_EDITORIAL_NOTE:item.editorialNote,ARTICLE_CATEGORY:'suplementos',ARTICLE_SOURCE_FILE:file}})
    published.push(item.id)
    console.log(`[${item.id}/500] Publicación verificada por el publicador`)
  }
  console.log(JSON.stringify({success:true,mode:auto?'auto-next-20':'manual',published,skipped,totalPlanned:500}))
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `published_count=${published.length}\n`, 'utf8')
}
try { main() } catch(e) { console.error(e instanceof Error?e.message:String(e)); process.exitCode=1 }
