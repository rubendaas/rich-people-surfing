<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed} from 'vue'
import {waveY, amountLabel} from '../lib/model'
const props=defineProps<{lanes:{name:string,value:number,color:string}[]}>()
const root=ref<HTMLDivElement>(),canvas=ref<HTMLCanvasElement>(),width=ref(600)
const maximum=computed(()=>Math.max(1,...props.lanes.map(l=>Math.max(0,l.value))))
let resize:ResizeObserver
function draw(){
 if(!root.value||!canvas.value)return
 const w=root.value.clientWidth,h=props.lanes.length*100; width.value=w
 const dpr=Math.min(devicePixelRatio||1,2); canvas.value.width=w*dpr;canvas.value.height=h*dpr
 const ctx=canvas.value.getContext('2d')!;ctx.scale(dpr,dpr)
 props.lanes.forEach((lane,i)=>{const base=i*100+82,len=Math.max(0,lane.value)/maximum.value*(w-2);ctx.fillStyle=lane.color;ctx.beginPath();ctx.moveTo(1,base);for(let t=0;t<=1.001;t+=.01)ctx.lineTo(1+t*len,waveY(t,base,40));ctx.lineTo(1+len,base);ctx.closePath();ctx.fill();ctx.strokeStyle='#18251d55';ctx.beginPath();ctx.moveTo(1,base);ctx.lineTo(w,base);ctx.stroke()})
}
onMounted(()=>{resize=new ResizeObserver(draw);resize.observe(root.value!);draw()});watch(()=>props.lanes,draw,{deep:true});onBeforeUnmount(()=>resize?.disconnect())
</script>
<template><div ref="root" class="amount-lanes" :style="{height:`${lanes.length*100}px`}"><canvas ref="canvas" aria-hidden="true"/><div v-for="(lane,i) in lanes" :key="lane.name" class="lane-label" :style="{top:`${i*100}px`}"><b>{{lane.name}}</b><span>{{amountLabel(lane.value)}}<template v-if="lane.value>0&&lane.value/maximum*(width-2)<1"> · smaller than 1 pixel</template><template v-if="lane.value<=0"> · no positive wave</template></span></div></div><p class="fine">Shared linear ruler: the full width represents {{amountLabel(maximum)}}. Aligned origins; height is illustrative.</p></template>
