import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
const names = ['bezos','musk','altman','visitor','bezos-lean','musk-lean','altman-lean','foam','you-meme']
const manifest = {}
for (const name of names) {
  const path = `art/masters/${name}.png`
  const meta = await sharp(path).metadata()
  const stats = await sharp(path).stats()
  if (!meta.hasAlpha || stats.channels[3].min !== 0) throw new Error(`No transparent alpha: ${name}`)
  const face = name === 'you-meme'
  await sharp(path).resize({width:face?1254:900,withoutEnlargement:true}).webp({quality:face?94:88,alphaQuality:100}).toFile(`public/art/${name}.webp`)
  manifest[name] = {master:path,web:`art/${name}.webp`,width:meta.width,height:meta.height,displayWidth:face?1254:name==='foam'?220:340,pose:face?'head':name.endsWith('lean')?'lean':'base',pivot:{x:face?.51:.5,y:face?.978:name==='visitor'?.85:name==='foam'?.76:.87},alpha:'verified transparent; original alpha preserved'}
}
await writeFile('src/data/assets.json',JSON.stringify(manifest,null,2)+'\n')
console.log('Prepared 9 transparent masters and optimized WebP assets, including the full-resolution opening face.')
