<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { gsap } from 'gsap'
import { asset, amountLabel, distance, waveY, waveAngle, type Person } from '../lib/model'
import manifest from '../data/assets.json'
const props = withDefaults(defineProps<{person: Person; value: number; progress?: number; overview?: boolean; hero?: boolean; reduced?: boolean}>(), {progress:0, overview:false, hero:false, reduced:false})
const emit = defineEmits<{ruler:[dollarsPerPixel:number]}>()
const root = ref<HTMLDivElement>(), canvas = ref<HTMLCanvasElement>(), rider = ref<HTMLDivElement>()
const dollarsPerPixel = ref(1e7), pose = computed(() => props.person.id + (!props.hero && props.progress > .35 && props.progress < .85 ? '-lean' : ''))
let observer: ResizeObserver, bob: gsap.core.Tween | undefined
const pivot = computed(() => manifest[pose.value as keyof typeof manifest].pivot)
function draw() {
  if (!canvas.value || !root.value || !rider.value) return
  const w = root.value.clientWidth, h = root.value.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2)
  canvas.value.width = w*dpr; canvas.value.height=h*dpr
  const ctx=canvas.value.getContext('2d')!; ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h)
  const inset = props.hero ? 0 : 32
  dollarsPerPixel.value = props.overview ? props.value/(w-inset*2) : 1e9/(w<600?90:160)
  emit('ruler',dollarsPerPixel.value)
  const length=props.hero?w*1.45:distance(props.value,dollarsPerPixel.value)
  const travel = props.overview || props.hero ? 0 : Math.max(0,length-w+inset*2)*props.progress
  const origin = props.hero ? -w*.18 : inset-travel
  const base=props.hero?h*.99:h-76, amplitude=props.hero?h*.56:Math.min(h*.22,100)
  ctx.fillStyle='#2855e8'; ctx.beginPath()
  const start=Math.max(0,origin), end=Math.min(w,origin+length)
  ctx.moveTo(start,base)
  for(let x=start;x<end;x+=2) ctx.lineTo(x,waveY((x-origin)/length,base,amplitude))
  ctx.lineTo(end,waveY((end-origin)/length,base,amplitude));ctx.lineTo(end,props.hero?h:base);ctx.lineTo(start,props.hero?h:base);ctx.closePath();ctx.fill()
  if (!props.hero) {
    ctx.strokeStyle='#18251d'; ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,base);ctx.lineTo(w,base);ctx.stroke()
    const tickValue=props.overview?props.value/4:1e9, tickWidth=tickValue/dollarsPerPixel.value
    ctx.font='11px "DM Sans", sans-serif';ctx.fillStyle='#18251d';ctx.textAlign='center'
    const first=Math.max(0,Math.ceil(-origin/tickWidth))
    for(let i=first;i*tickWidth+origin<=w-12;i++) {
      const x=origin+i*tickWidth
      ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base+9);ctx.stroke()
      ctx.fillText(amountLabel(i*tickValue,true),Math.max(30,x),base+28)
    }
    if (origin+length <=w-12 && !props.overview) {ctx.fillText(amountLabel(props.value,true),origin+length,base+48)}
  }
  const screenX=props.hero?w*.68:props.overview?origin+length*.6:w*.49
  const worldT=Math.max(.01,Math.min(.99,(screenX-origin)/length))
  const spriteWidth=props.hero?(w<650?Math.min(w*.57,240):Math.min(w*.39,490)):Math.min(w*.39,190)
  const spriteHeight=spriteWidth
  const x=origin+worldT*length, y=waveY(worldT,base,amplitude)
  rider.value.style.width=`${spriteWidth}px`
  rider.value.style.left=`${x-spriteWidth*pivot.value.x}px`
  rider.value.style.top=`${y-spriteHeight*pivot.value.y}px`
  rider.value.style.transformOrigin=`${pivot.value.x*100}% ${pivot.value.y*100}%`
  rider.value.style.transform=`rotate(${waveAngle(worldT,length,amplitude)}deg)`
}
onMounted(()=>{observer=new ResizeObserver(draw);observer.observe(root.value!);draw(); if(props.hero&&!props.reduced) bob=gsap.to('.hero-sprite-image',{y:-5,duration:2.4,yoyo:true,repeat:-1,ease:'sine.inOut'})})
watch(()=>[props.progress,props.value,props.overview,props.person.id,props.reduced],()=>{draw();if(props.reduced)bob?.kill()})
onBeforeUnmount(()=>{observer?.disconnect();bob?.kill()})
</script>
<template>
  <div ref="root" class="ocean-canvas" :class="{ 'ocean-hero':hero }">
    <canvas ref="canvas" aria-hidden="true" />
    <div ref="rider" class="surfer-sprite" aria-hidden="true"><img :src="asset(pose)" :class="{'hero-sprite-image':hero}" alt="" width="1280" height="1280" /></div>
    <template v-if="hero"><img class="hero-foam" :src="asset('foam')" alt=""/><div class="hero-ocean-label">THE FORECAST? <b>OBSCENE.</b><span>Illustration. The real ruler is below.</span></div></template>
    <span v-else class="sr-only">{{ amountLabel(value) }}. Horizontal distance measures dollars. Wave height and surfer size are decorative.</span>
  </div>
</template>
