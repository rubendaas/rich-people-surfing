// Static public share pages. No visitor data is ever used in these files.
import {resolve} from 'node:path'
import {prepareFont} from './font.mjs'
const fontConfigPath=resolve('node_modules/.cache/sorry-youre-plankton-fonts.conf')
process.env.FONTCONFIG_FILE=fontConfigPath
const {default:sharp}=await import('sharp')
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises'
const people=JSON.parse(await readFile('src/data/people.json','utf8'))
const records=JSON.parse(await readFile('src/data/records.json','utf8'))
const organizations=JSON.parse(await readFile('src/data/organizations.json','utf8'))
const deployment=JSON.parse(await readFile('site.config.json','utf8'))
const base=(process.env.BASE_PATH||deployment.basePath).replace(/\/?$/,'/')
const site=new URL(process.env.SITE_URL||deployment.origin)
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const rootHtml=await readFile('dist/index.html','utf8')
await mkdir('dist/share',{recursive:true})
await mkdir('dist/licenses',{recursive:true})
for (const name of ['big-shoulders-display','dm-sans']) await copyFile(`node_modules/@fontsource/${name}/LICENSE`,`dist/licenses/${name}.txt`)
await mkdir('node_modules/.cache/fonts',{recursive:true})
await writeFile(fontConfigPath,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${resolve('node_modules/.cache/fonts')}</dir><cachedir>${resolve('node_modules/.cache/fonts')}</cachedir></fontconfig>`)
const fontfile=resolve('node_modules/.cache/fonts/BigShouldersDisplay.ttf')
await prepareFont('node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff',fontfile)
async function label(text,width,size,color='#18251d'){
 return sharp({text:{text:`<span foreground="${color}" font_family="Big Shoulders Display Thin Black" size="${size*1024}" weight="normal">${escape(text)}</span>`,fontfile,width,rgba:true,dpi:72}}).png().toBuffer()
}
for(const person of people){
 const r=records.find(r=>r.id===person.recordId),value=`$${r.value/1e9} billion`,slug=`share/${person.id}/`,url=site?new URL(base+slug,site).href:base+slug
 const entity=organizations[person.organizationId].name
 const pixels=Buffer.alloc(1200*630*3)
 for(let y=0;y<630;y++)for(let x=0;x<1200;x++){const idx=(y*1200+x)*3;const t=Math.min(1,x/900);const wave=470-t*t*(3-2*t)*50;const color=y>=wave&&y<550?[40,85,232]:y>=550?[230,246,122]:[244,241,232];pixels[idx]=color[0];pixels[idx+1]=color[1];pixels[idx+2]=color[2]}
 const portrait=await sharp(`public/art/${person.id}.webp`).resize(390,390).png().toBuffer()
 const layers=[{input:await label('SORRY, YOU’RE PLANKTON',1060,52),left:50,top:35},{input:await label('BIG MONEY.\nTINY YOU.',680,96),left:50,top:126},{input:portrait,left:730,top:90},{input:await label(`${entity.toUpperCase()} · ${value} · ${r.shortLabel}`,1080,28,'#f4f1e8'),left:50,top:505},{input:await label(`${r.period} · Three waves. One tiny you.`,1080,26),left:50,top:580}]
 await sharp(pixels,{raw:{width:1200,height:630,channels:3}}).composite(layers).png().toFile(`dist/share/${person.id}.png`)
 const img=site?new URL(base+`share/${person.id}.png`,site).href:base+`share/${person.id}.png`
 const title=`${person.name} — Sorry, You’re Plankton`
 const desc=`${entity} · ${value}. ${r.label}. ${r.period}. Start face to face, build your little line, and scroll way out to meet all three company waves. Made with AI.`
 const metadata=`<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:image" content="${escape(img)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url" content="${escape(url)}"><meta name="twitter:card" content="summary_large_image">${site?`<link rel="canonical" href="${escape(url)}">`:''}`
 await mkdir(`dist/share/${person.id}`,{recursive:true})
 await writeFile(`dist/share/${person.id}/index.html`,rootHtml.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(desc)}">`).replace('</head>',metadata+'</head>'))
}
await copyFile('dist/share/bezos.png','dist/social.png')
const socialUrl=site?new URL(base+'social.png',site).href:base+'social.png'
await writeFile('dist/index.html',rootHtml.replace('</head>',`<meta property="og:title" content="Sorry, You’re Plankton — Big money. Tiny you."><meta property="og:description" content="Start face to face. Build your little line. Scroll way out to meet three enormous company waves. Made with AI."><meta property="og:image" content="${escape(socialUrl)}"><meta name="twitter:card" content="summary_large_image"></head>`))
console.log('Built three public share pages and social images.'+(site?'':' Set SITE_URL when building for public social crawlers.'))
