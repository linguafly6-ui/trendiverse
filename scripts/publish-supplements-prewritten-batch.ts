import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Item = { id:number; title:string; slug:string; keyword:string; cluster:string; intent:string; angle:string; editorialNote:string }
function runWrangler(args:string[]):string {
  return execFileSync('npx',['wrangler',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']})
}
function main() {
  const auto = process.env.AUTO_NEXT_BATCH === 'true'
  const batch = Number(process.env.BATCH_NUMBER ?? '1')
  if (!auto && (!Number.isInteger(batch) || batch < 1 || batch > 50)) throw new Error('BATCH_NUMBER debe estar entre 1 y 50')
  const plan = JSON.parse(readFileSync(resolve('data/suplementos-editorial-plan.json'),'utf8')) as Item[]
  if (plan.length !== 500 || plan.some((x,i)=>x.id!==i+1)) throw new Error('Plan de suplementos inválido')
  const available = plan.filter(x=>x.id>=6 && existsSync(resolve(`data/supplements-drafts/${String(x.id).padStart(2,'0')}.json`)))
  const start = auto ? 6 : 6 + (batch-1)*10
  const selected = auto ? available : available.filter(x=>x.id>=start&&x.id<start+10)
  if (selected.length===0) throw new Error('No hay borradores preparados para este lote')
  console.log(auto ? 'Publicación automática: se buscarán hasta 10 artículos preparados aún no publicados' : `Publicación manual: lote ${batch}/50, IDs ${start}–${Math.min(start+9,500)}`)
  const published:number[]=[]; const skipped:number[]=[]
  for (const item of selected) {
    if (auto && published.length>=10) break
    const file = resolve(`data/supplements-drafts/${String(item.id).padStart(2,'0')}.json`)
    const q = `SELECT slug FROM articles WHERE slug = '${item.slug.replace(/'/g,"''")}' AND title = '${item.title.replace(/'/g,"''")}' AND LENGTH(content) >= 800 LIMIT 1;`
    const existing = runWrangler(['d1','execute',process.env.D1_DATABASE ?? 'trendiverse-preview','--remote','--json',`--command=${q}`])
    if (existing.includes(item.slug)) { console.log(`[${item.id}/500] Ya existe con título y contenido completos en D1; se omite: ${item.slug}`); skipped.push(item.id); continue }
    console.log(`[${item.id}/500] Publicando borrador preparado: ${item.title}`)
    execFileSync('npx',['tsx','scripts/generate-and-publish-savings-article.ts'],{stdio:'inherit',env:{...process.env,ARTICLE_TITLE:item.title,ARTICLE_SLUG:item.slug,ARTICLE_KEYWORD:item.keyword,ARTICLE_CLUSTER:item.cluster,ARTICLE_INTENT:item.intent,ARTICLE_ANGLE:item.angle,ARTICLE_EDITORIAL_NOTE:item.editorialNote,ARTICLE_CATEGORY:'suplementos',ARTICLE_SOURCE_FILE:file}})
    published.push(item.id)
    console.log(`[${item.id}/500] Publicación verificada por el publicador`)
  }
  console.log(JSON.stringify({success:true,mode:auto?'auto-next-10':'manual',published,skipped,totalPlanned:500}))
}
try { main() } catch(e) { console.error(e instanceof Error?e.message:String(e)); process.exitCode=1 }
