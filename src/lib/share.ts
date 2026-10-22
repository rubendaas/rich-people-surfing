import {asset, amountLabel, shareUrl, waveY, type FinancialRecord, type Person} from './model'
export function loadImage(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('An illustration could not load. Please try again.'));img.src=src})}
export async function createGuestPass(person:Person, record:FinancialRecord, wealth:number|null, includeNumbers:boolean){
 await document.fonts.ready
 await document.fonts.load('900 90px "Big Shoulders Display"')
 const [surfer,visitor]=await Promise.all([loadImage(asset(person.id)),loadImage(asset('visitor'))])
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350
 const ctx=canvas.getContext('2d')!;const ink='#18251d',paper='#f4f1e8',blue='#2855e8'
 ctx.fillStyle=paper;ctx.fillRect(0,0,1080,1350);ctx.fillStyle=ink
 const text=(s:string,x:number,y:number,font:string,color=ink)=>{ctx.font=font;ctx.fillStyle=color;ctx.fillText(s,x,y)}
 const wrap=(s:string,x:number,y:number,max:number,line=32)=>{let row='';for(const word of s.split(' ')){if(ctx.measureText(row+word).width>max&&row){ctx.fillText(row.trim(),x,y);y+=line;row=''}row+=word+' '}ctx.fillText(row.trim(),x,y);return y}
 text('SORRY, YOU’RE PLANKTON',60,83,'900 38px "Big Shoulders Display"');text('GUEST PASS / EVERYONE GETS IN',600,77,'500 18px "DM Sans"')
 ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(60,110);ctx.lineTo(1020,110);ctx.stroke()
 const positive=wealth!==null&&wealth>0, large=positive&&wealth>=record.value
 const headline=!positive?['SAME OCEAN.','EVERYONE BELONGS.']:large?['YOU BROUGHT','A BIGGER BOARD.']:['I’M IN THIS PICTURE.','TECHNICALLY.']
 text(headline[0]!,60,230,'900 88px "Big Shoulders Display"');text(headline[1]!,60,326,'900 88px "Big Shoulders Display"')
 const max=Math.max(record.value,wealth??0),length=960*record.value/max,origin=60,base=790,amp=150
 ctx.fillStyle=blue;ctx.beginPath();ctx.moveTo(origin,base);for(let i=0;i<=100;i++)ctx.lineTo(origin+i/100*length,waveY(i/100,base,amp));ctx.lineTo(origin+length,base);ctx.closePath();ctx.fill()
 const sx=origin+length*.65,sy=waveY(.65,base,amp),spriteSize=Math.min(400,Math.max(80,length*.6))
 ctx.drawImage(surfer,sx-spriteSize*.5,sy-spriteSize*.87,spriteSize,spriteSize)
 text(amountLabel(record.value),60,845,'900 58px "Big Shoulders Display"')
 text(record.entityId.toUpperCase()+' · '+record.shortLabel.toUpperCase(),60,882,'700 19px "DM Sans"')
 text(record.period,60,915,'400 20px "DM Sans"')
 // The second measurement shares the corporate ruler. The floatie is explicitly a marker.
 const ownLength=positive?960*wealth/max:0
 ctx.fillStyle='#18251d';ctx.fillRect(60,990,ownLength,5)
 ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(60,955);ctx.lineTo(60,1012);ctx.stroke()
 ctx.drawImage(visitor,24,914,74,74)
 text('YOU ARE HERE',84,971,'700 18px "DM Sans"')
 text('Floatie = location marker, not to scale.',84,1004,'400 18px "DM Sans"')
 if(includeNumbers&&positive){text(`${amountLabel(wealth)} net worth · ${(record.value/wealth).toLocaleString('en-US',{maximumSignificantDigits:4})}× amount comparison`,60,1051,'500 23px "DM Sans"')}
 else{text('Your place in the ocean is bigger than your bank balance.',60,1051,'500 23px "DM Sans"')}
 text('Shared linear ruler. Wave height and people are illustrative.',60,1091,'400 17px "DM Sans"')
 text('Source: '+record.sourceTitle,60,1130,'400 17px "DM Sans"')
 ctx.font='400 17px "DM Sans"';ctx.fillStyle=ink;wrap('Source date '+record.publicationDate+' · '+(record.metric==='estimated-net-worth'?'Dated wealth estimate.':'Company money, not the surfer’s personal wealth.'),60,1158,950,25)
 ctx.fillStyle='#e6f67a';ctx.fillRect(0,1210,1080,140)
 text('WHERE DO YOU FIT?',60,1272,'900 48px "Big Shoulders Display"')
 ctx.font='400 17px "DM Sans"';ctx.fillStyle=ink;wrap(shareUrl(person.id),60,1311,960,20)
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not export the card.')),'image/png'))
 return blob
}
