// Expand the bundled, licensed WOFF1 font to SFNT for Sharp/Pango's build-time text.
// Browser assets continue to use the original smaller WOFF2 files.
import {readFile,writeFile} from 'node:fs/promises'
import {inflateSync} from 'node:zlib'
export async function prepareFont(source,target){
 const input=await readFile(source)
 if(input.toString('ascii',0,4)!=='wOFF')throw new Error('Expected WOFF1 font')
 const count=input.readUInt16BE(12),output=Buffer.alloc(input.readUInt32BE(16))
 output.writeUInt32BE(input.readUInt32BE(4),0);output.writeUInt16BE(count,4)
 const power=Math.floor(Math.log2(count));output.writeUInt16BE(16*2**power,6);output.writeUInt16BE(power,8);output.writeUInt16BE(count*16-16*2**power,10)
 let offset=12+count*16,head=0
 for(let i=0;i<count;i++){
  const entry=44+i*20,tableOffset=input.readUInt32BE(entry+4),compressed=input.readUInt32BE(entry+8),length=input.readUInt32BE(entry+12),destination=12+i*16
  input.copy(output,destination,entry,entry+4);output.writeUInt32BE(input.readUInt32BE(entry+16),destination+4);output.writeUInt32BE(offset,destination+8);output.writeUInt32BE(length,destination+12)
  const table=input.subarray(tableOffset,tableOffset+compressed);(compressed<length?inflateSync(table):table).copy(output,offset)
  if(input.toString('ascii',entry,entry+4)==='head')head=offset
  offset+=Math.ceil(length/4)*4
 }
 if(head){output.writeUInt32BE(0,head+8);let sum=0;for(let i=0;i<output.length;i+=4)sum=(sum+output.readUInt32BE(i))>>>0;output.writeUInt32BE((0xb1b0afba-sum)>>>0,head+8)}
 await writeFile(target,output)
}
