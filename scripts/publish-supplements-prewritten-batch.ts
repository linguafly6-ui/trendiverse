import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Item = { id:number; title:string; slug:string; keyword:string; cluster:string; intent:string; angle:string; editorialNote:string }

function runWrangler(args:string[]):string {
  return execFileSync('npx',['wrangler',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']})
}
function main() {
  const batch = Number(process.env.BATCH_NUMBER ?? '1')
  if (!Number.isInteger(batch) || batch < 1 || batch > 50) throw new Error('BATCH_NUMBER debe estar entre 1 y 50')
  const plan = JSON.parse(readFileSync(resolve('data/suplementos-editorial-plan.json'),'utf8')) as Item[]
  if (plan.length !== 500 || plan.some((x,i)=>x.id!==i+1)) throw new Error('Plan de suplementos inválido')
  const start = 6 + (batch-1)*10
  const end = Math.min(start+9,500)
  const selected = plan.filter(x=>x.id>=start&&x.id<=end)
  console.log(`Publicación de suplementos preparados: lote ${batch}/50, IDs ${start}–${end}`)
  const published:number[]=[]; const skipped:number[]=[]
  for (const item of selected) {
    const file = resolve(`data/supplements-drafts/${String(item.id).padStart(2,'0')}.json`)
    if (!existsSync(file)) throw new Error(`Falta el borrador preparado para el artículo ${item.id}: ${file}`)
    const q = `SELECT slug FROM articles WHERE slug = '${item.slug.replace(/'/g,"''")}' LIMIT 1;`
    const existing = runWrangler(['d1','execute',process.env.D1_DATABASE ?? 'trendiverse-preview','--remote','--json',`--command=${q}`])
    if (existing.includes(item.slug)) { console.log(`[${item.id}/500] Ya existe en D1; se omite: ${item.slug}`); skipped.push(item.id); continue }
    console.log(`[${item.id}/500] Publicando borrador preparado: ${item.title}`)
    execFileSync('npx',['tsx','scripts/generate-and-publish-savings-article.ts'],{stdio:'inherit',env:{...process.env,ARTICLE_TITLE:item.title,ARTICLE_SLUG:item.slug,ARTICLE_KEYWORD:item.keyword,ARTICLE_CLUSTER:item.cluster,ARTICLE_INTENT:item.intent,ARTICLE_ANGLE:item.angle,ARTICLE_EDITORIAL_NOTE:item.editorialNote,ARTICLE_CATEGORY:'suplementos',ARTICLE_SOURCE_FILE:file}})
    published.push(item.id)
    console.log(`[${item.id}/500] Publicación verificada por el publicador`)
  }
  console.log(JSON.stringify({success:true,batch,start,end,published,skipped,totalPlanned:500,nextBatch:batch<50?batch+1:null}))
}
try { main() } catch(e) { console.error(e instanceof Error?e.message:String(e)); process.exitCode=1 }
