<script setup lang="ts">
import {ref, computed, watch, nextTick, onBeforeUnmount} from 'vue'
import {gsap} from 'gsap'
import {asset,parseAmount,toUsd,ratio,amountLabel,shareUrl,benchmarks,type Person,type FinancialRecord} from '../lib/model'
import copy from '../data/story.json'
import AmountLanes from './AmountLanes.vue'
import {createGuestPass} from '../lib/share'
const props=defineProps<{person:Person;record:FinancialRecord;reduced:boolean}>()
const raw=ref(''),currency=ref('EUR'),error=ref(''),wealth=ref<number|null>(null),revealed=ref(false),includeNumbers=ref(false),preview=ref(''),busy=ref(false),status=ref(''),fallback=ref(''),result=ref<HTMLElement>(),floatie=ref<HTMLElement>()
let blob:Blob|null=null,renderVersion=0,animation:gsap.core.Tween|undefined
const factor=computed(()=>wealth.value===null?null:ratio(props.record.value,wealth.value))
const title=computed(()=>wealth.value===null||wealth.value<=0?copy.inclusivePunchline:wealth.value>=props.record.value?copy.largePunchline:copy.punchline)
const pixelWidth=computed(()=>wealth.value!==null&&wealth.value>0?wealth.value/Math.max(props.record.value,wealth.value)*1000:0)
const lanes=computed(()=>[{name:`${props.record.entityId} · ${props.record.shortLabel}`,value:props.record.value,color:'#2855e8'},{name:wealth.value===null?'You · no amount entered':'You · estimated net worth',value:wealth.value??0,color:'#d9714e'}])
async function show(skip=false){
 const value=skip?null:parseAmount(raw.value)
 if(!skip&&value===null){error.value='Enter a number such as 25000 or -5000 (up to 1 quadrillion). Use a dot for decimals.';return}
 error.value='';wealth.value=value===null?null:toUsd(value,currency.value);revealed.value=true;includeNumbers.value=false;await nextTick()
 result.value?.scrollIntoView({behavior:props.reduced?'instant':'smooth',block:'start'})
 result.value?.focus({preventScroll:true});animation?.kill()
 if(!props.reduced)animation=gsap.fromTo(floatie.value!,{scale:3,x:100,y:-25},{scale:1,x:0,y:0,duration:1.8,ease:'power2.inOut',delay:.3})
 await render()
}
async function render(){
 if(!revealed.value)return
 const version=++renderVersion;busy.value=true;status.value='';blob=null
 if(preview.value){URL.revokeObjectURL(preview.value);preview.value=''}
 try{const created=await createGuestPass(props.person,props.record,wealth.value,includeNumbers.value);if(version!==renderVersion)return;blob=created;if(preview.value)URL.revokeObjectURL(preview.value);preview.value=URL.createObjectURL(created)}catch(e){status.value=e instanceof Error?e.message:'Could not make the preview.'}finally{if(version===renderVersion)busy.value=false}
}
function example(value:string){raw.value=value;error.value=''}
function save(){if(!blob||busy.value)return;const link=document.createElement('a');link.href=preview.value;link.download=`sorry-youre-plankton-${props.person.id}-guest-pass.png`;link.click();status.value='Your guest pass is ready to save.'}
async function copyLink(){try{await navigator.clipboard.writeText(shareUrl(props.person.id));status.value='Invitation link copied. Your financial details are not in it.'}catch{fallback.value=shareUrl(props.person.id);status.value='Copy the invitation link below. Your number is not included.'}}
async function share(){
 if(!blob||busy.value)return
 const file=new File([blob],'sorry-youre-plankton-guest-pass.png',{type:'image/png'})
 if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Sorry, You’re Plankton — Where do you fit?',text:'Big money. Tiny you.',url:shareUrl(props.person.id)});status.value='Guest pass shared.'}catch(e){if(!(e instanceof Error&&e.name==='AbortError')){status.value='Sharing is unavailable here. Save the image or copy the link.'}}}
 else await copyLink()
}
watch(()=>[props.record.id,props.person.id,includeNumbers.value],render)
onBeforeUnmount(()=>{renderVersion++;if(preview.value)URL.revokeObjectURL(preview.value);animation?.kill()})
</script>
<template>
<section id="you" class="personal section-pad" aria-labelledby="personal-title"><div class="personal-intro"><span class="eyebrow">03 / THE OPEN INVITATION</span><h2 id="personal-title">Enough<br>about <em>them.</em></h2><p>Put yourself in the water.</p><img :src="asset('visitor')" alt="An ordinary swimmer enjoying a yellow pool float" class="floatie-intro" width="1280" height="1280"/></div><form class="wealth-form" @submit.prevent="show()"><p class="eyebrow">YOUR BEACH CLUB APPLICATION</p><h3>No billions required.</h3><label for="wealth">Your estimated net worth</label><p id="wealth-help">What you own, minus what you owe. A rough guess is fine. Zero and negative numbers belong here, too.</p><div class="input-row"><label class="sr-only" for="currency">Currency</label><select id="currency" v-model="currency"><option value="EUR">EUR €</option><option value="USD">USD $</option></select><input id="wealth" v-model="raw" type="text" inputmode="text" autocomplete="off" placeholder="25,000" aria-describedby="wealth-help wealth-error" :aria-invalid="!!error"/></div><p id="wealth-error" role="alert" class="error">{{error}}</p><div class="sample-row"><span>Just looking?</span><button type="button" @click="example('25000')">Try 25,000</button><button type="button" @click="example('0')">Try zero</button><button type="button" @click="example('-5000')">Try −5,000</button></div><button type="submit" class="button dark full">Find my pixel <span>↗</span></button><button type="button" class="text-button skip-personal" @click="show(true)">Skip the number. I’m coming in anyway. →</button><p class="privacy">{{copy.privacy}}</p><p v-if="currency==='EUR'" class="fine">EUR → USD at {{benchmarks.fx.rate}} · ECB, {{benchmarks.fx.date}}.</p></form></section>
<section v-if="revealed" ref="result" id="result" class="result section-pad" tabindex="-1" aria-labelledby="result-title"><div class="result-heading"><span class="eyebrow">04 / YOUR PLACE IN THE WAVE</span><h2 id="result-title">{{title}}</h2><p v-if="factor!==null">{{record.shortLabel}} ({{record.period}}) is equivalent to <strong>{{factor.toLocaleString('en-US',{maximumSignificantDigits:4})}} times</strong> your estimated net worth.</p><p v-else-if="wealth!==null&&wealth<0">Debts exceed assets in this estimate. A positive wave or wealth ratio would be misleading, so we don’t draw one. There’s still a place for you here.</p><p v-else-if="wealth===0">Zero has no positive length on this ruler, and dividing by zero doesn’t make a useful comparison. You still get a guest pass.</p><p v-else>You don’t owe the ocean your financial details. Here’s your place in the picture.</p><p class="fine">{{record.metric==='estimated-net-worth'?'Two wealth snapshots, taken on different dates.':'An amount comparison: company money and personal wealth have different economic meanings.'}}</p></div><div class="reveal-diagram"><div ref="floatie" class="you-marker"><img :src="asset('visitor')" alt="Your magnified floatie location marker"/><span>YOU ARE HERE ↓<small>Magnified marker · not to scale</small></span></div><AmountLanes :lanes="lanes"/><p v-if="wealth!==null&&wealth>0" class="pixel-note">On a 1,000-pixel-wide ruler, your amount spans <b>{{pixelWidth<.01?pixelWidth.toExponential(2):pixelWidth.toLocaleString('en-US',{maximumFractionDigits:2})}} pixels</b>. {{pixelWidth<1?'Too small for one whole pixel. The marker helps you find it.':'A real amount, on the same ruler.'}}</p></div><div class="pass-layout"><div class="pass-copy"><span class="eyebrow">SOUVENIRS FROM THE END OF SCALE</span><h3>Your guest pass.<br>Admission: <em>everyone.</em></h3><p>Take the picture. Invite someone into the water.</p><label class="check-option"><input type="checkbox" v-model="includeNumbers" :disabled="wealth===null||wealth<=0"/> Include my amount and ratio</label><p class="fine">Hidden by default. A precise ratio can also reveal your approximate wealth. Check the preview before sharing.</p><button class="button dark full" :disabled="!preview||busy" @click="share">Share my place in the wave ↗</button><div class="share-secondary"><button class="text-button" :disabled="!preview||busy" @click="save">Save image ↓</button><button class="text-button" @click="copyLink">Copy invitation link ↗</button></div><p class="status" role="status">{{busy?'Making your guest pass…':status}}</p><input v-if="fallback" class="fallback-link" :value="fallback" aria-label="Invitation link to copy" readonly @focus="($event.target as HTMLInputElement).select()"/></div><div class="pass-preview" :aria-busy="busy"><img v-if="preview" :src="preview" alt="Your guest pass preview, showing the selected financial metric, date, source, and your chosen disclosure settings" width="1080" height="1350"/><p v-else>Making your guest pass…</p><span>PREVIEW · THIS IS THE IMAGE YOU’LL SHARE</span></div></div></section>
</template>
