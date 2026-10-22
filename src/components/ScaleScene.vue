<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { amountLabel, asset, people, recordFor } from '../lib/model'
import { amountToPixels, scaleTicks } from '../lib/scale'
import { journeyFrame, stageProgress } from '../lib/journey'
const props = defineProps<{ amount: number; progress: number; example: boolean }>()
defineEmits<{ editAmount: [] }>()
const root = ref<HTMLElement>(), width = ref(1200), height = ref(760)
let observer: ResizeObserver
const companies = [
  { id: 'musk', company: 'xAI', color: '#8094f1', label: 'Funding raised', date: 'Jan 2026' },
  { id: 'altman', company: 'OpenAI', color: '#6f9c84', label: 'Committed funding', date: 'Mar 2026' },
  { id: 'bezos', company: 'Amazon', color: '#2855e8', label: 'Company-wide spending', date: '2025' },
].map(item => { const person = people.find(p => p.id === item.id)!; return { ...item, person, record: recordFor(person) } })
const axisLabel = (value: number) => value >= 1000 && value < 1e6 ? `$${value / 1000}k` : amountLabel(value, true)
const maximum = Math.max(...companies.map(item => item.record.value))
const camera = computed(() => journeyFrame(props.progress, props.amount, maximum))
const mobile = computed(() => width.value < 650)
const baseline = computed(() => height.value - (mobile.value ? 150 : 142))
const plotHeight = computed(() => Math.max(160, baseline.value - (mobile.value ? 162 : 180)))
const left = computed(() => mobile.value ? 43 : 76)
const right = computed(() => width.value - (mobile.value ? 12 : 40))
const span = computed(() => right.value - left.value)
const youX = computed(() => left.value + span.value * (mobile.value ? .1 : .09))
const builtAmount = computed(() => Math.max(0, props.amount) * camera.value.buildProgress)
const yourHeight = computed(() => amountToPixels(builtAmount.value, camera.value.upperAmount, plotHeight.value))
const floorY = computed(() => baseline.value - yourHeight.value)
const chartOpacity = computed(() => stageProgress(props.progress, .12, .18))
const wavesOpacity = computed(() => stageProgress(props.progress, .32, .37))
const ticks = computed(() => scaleTicks(camera.value.upperAmount))
const bodySize = computed(() => (mobile.value ? 75 : 95) / camera.value.zoomFactor)
const headSize = computed(() => (mobile.value ? 91 : 116) / camera.value.zoomFactor)
const closeSize = computed(() => Math.max(width.value * .83, height.value * 1.28))
const faceSize = computed(() => closeSize.value * (headSize.value / closeSize.value) ** camera.value.faceToPerson)
const faceX = computed(() => width.value * .51 + (youX.value - width.value * .51) * camera.value.faceToPerson)
const faceY = computed(() => (height.value * .62) * (1 - camera.value.faceToPerson) + (floorY.value - bodySize.value - headSize.value * .47) * camera.value.faceToPerson)
const title = computed(() => {
  if (props.amount <= 0 && props.progress >= .12 && props.progress < .34) return 'Still showing up.'
  if (props.progress < .12) return 'Doing your best.'
  if (props.progress < .19) return 'You work.'
  if (props.progress < .24) return 'Rent. Bills. Repeat.'
  if (props.progress < .29) return 'A little left over.'
  if (props.progress < .34) return 'You built this.'
  if (props.progress < .50) return 'Now pull back.'
  if (props.progress < .68) return 'Further.'
  if (props.progress < .82) return 'No, further.'
  if (props.progress < .90) return 'There they are.'
  return props.amount >= maximum ? 'Plot twist. Big wave.' : 'Must be nice.'
})
const subtitle = computed(() => {
  if (props.amount <= 0 && props.progress >= .12 && props.progress < .34) return 'No positive balance. That doesn’t mean no effort.'
  if (props.progress < .12) return 'POV: you have an alarm clock.'
  if (props.progress < .19) return 'Early starts. Full weeks. Same inbox.'
  if (props.progress < .24) return 'A lot goes out. A little stays.'
  if (props.progress < .29) return 'Not much to them. A lot of life to you.'
  if (props.progress < .34) return 'That little line took something.'
  if (props.progress < .50) return 'Your amount stays the same. The view gets bigger.'
  if (props.progress < .68) return 'Thousands become millions.'
  if (props.progress < .82) return 'Millions become billions. You’re still down there.'
  return 'Three moguls. Three company-money waves. One ruler.'
})
const waves = computed(() => companies.map((item, index) => {
  const laneStart = left.value + span.value * (.23 + index * .255)
  const laneEnd = Math.min(right.value, laneStart + span.value * .23)
  const crest = laneStart + (laneEnd - laneStart) * .64
  const pixels = amountToPixels(item.record.value, camera.value.upperAmount, plotHeight.value)
  const top = baseline.value - pixels
  const path = [`M ${laneStart} ${baseline.value}`]
  for (let i = 1; i <= 90; i++) { const t = i / 90; path.push(`L ${laneStart + (crest - laneStart) * t} ${Math.max(-height.value * 2, baseline.value - pixels * t * t * (3 - 2 * t))}`) }
  path.push(`L ${laneEnd} ${Math.max(-height.value * 2, top)} L ${laneEnd} ${baseline.value} Z`)
  const portraitSize = Math.min(mobile.value ? 112 : 250, (laneEnd - laneStart) * (mobile.value ? 1.45 : 1.05))
  const portraitX = Math.max(0, Math.min(width.value - portraitSize, crest - portraitSize * .5))
  return { ...item, path: path.join(' '), start: laneStart, end: laneEnd, crest, top, pixels, portraitSize, portraitX, portraitY: top - portraitSize * .87, center: (laneStart + laneEnd) / 2 }
}))
const personalPath = computed(() => {
  const start = left.value + 5, end = youX.value + Math.min(85, span.value * .08)
  return `M ${start} ${baseline.value} C ${youX.value - 15} ${baseline.value} ${youX.value - 20} ${floorY.value} ${youX.value} ${floorY.value} L ${end} ${floorY.value} L ${end} ${baseline.value} Z`
})
const workNote = computed(() => props.amount <= 0 ? ['still', 'SHOWING UP'] : props.progress < .19 ? ['06:30', 'ALARM. AGAIN.'] : props.progress < .24 ? ['999+', 'UNREAD EMAILS'] : ['a bit', 'ACTUALLY SAVED'])
onMounted(() => { observer = new ResizeObserver(([entry]) => { width.value = entry!.contentRect.width; height.value = entry!.contentRect.height }); observer.observe(root.value!) })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="scale-scene" :class="[`stage-${camera.stage}`, { 'face-close': progress < .12 }]" :data-stage="camera.stage" :data-progress="progress" :data-upper-amount="camera.upperAmount" :data-user-pixels="yourHeight" :data-built-amount="builtAmount" :data-face-size="faceSize">
    <div class="scene-heading"><span class="eyebrow">{{camera.stage === 'you' ? '01 / A REGULAR HUMAN' : camera.stage === 'build' ? '02 / THE GRIND' : camera.stage === 'zoom' ? '03 / A LITTLE PERSPECTIVE' : '04 / THE BIG WAVES'}}</span><h2>{{title}}</h2><p>{{subtitle}}</p></div>
    <svg class="money-chart" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true" :style="{ opacity: chartOpacity }">
      <defs><clipPath id="wave-window"><rect x="0" :y="mobile ? 134 : 130" :width="width" :height="height"/></clipPath></defs>
      <g class="axis-grid"><g v-for="tick in ticks" :key="tick.value"><line :x1="left" :x2="right" :y1="baseline - tick.fraction * plotHeight" :y2="baseline - tick.fraction * plotHeight"/><text :x="left - 9" :y="baseline - tick.fraction * plotHeight + 4" text-anchor="end">{{axisLabel(tick.value)}}</text></g><line :x1="left" :x2="left" :y1="baseline - plotHeight" :y2="baseline"/></g>
      <text class="axis-title" :x="left - 9" text-anchor="end" :y="baseline - plotHeight - 17">USD ↑</text>
      <g :opacity="wavesOpacity" clip-path="url(#wave-window)"><path v-for="wave in waves" :key="wave.id" class="money-wave" :data-person="wave.id" :data-pixels="wave.pixels" :d="wave.path" :fill="wave.color"/></g>
      <path class="your-wave" :d="personalPath"/>
      <line class="zero-line" :x1="left" :x2="right" :y1="baseline" :y2="baseline"/>
      <g v-if="yourHeight < 2 && progress >= .34" class="you-locator"><circle :cx="youX" :cy="baseline" r="5"/><line :x1="youX" :x2="youX" :y1="baseline + 8" :y2="baseline + 20"/></g>
      <g :opacity="stageProgress(progress, .15, .20)" :transform="`translate(${youX} ${floorY}) scale(${bodySize / 100})`" class="stick-person"><path d="M 0 -100 L 0 -43 M 0 -84 L -27 -60 M 0 -84 L 32 -65 M 0 -43 L -23 0 M 0 -43 L 23 0"/></g>
    </svg>
    <img class="you-meme" :src="asset('you-meme')" alt="A gender-neutral, exhausted but hopeful meme face" :style="{width: `${faceSize}px`, left: `${faceX - faceSize / 2}px`, top: `${faceY - faceSize / 2}px`}"/>
    <div v-if="camera.stage === 'build' && progress < .29" class="work-note"><strong>{{workNote[0]}}</strong><span>{{workNote[1]}}</span></div>
    <div v-if="progress >= .20 && progress < .34" class="earned-amount"><span>{{example ? 'YOUR EXAMPLE' : 'YOUR AMOUNT'}}</span><strong>{{amount > 0 ? amountLabel(builtAmount) : amountLabel(amount)}}</strong><small>{{amount > 0 ? 'Bit by bit.' : 'Still showing up.'}}</small></div>
    <div v-if="progress >= .34 && progress < .9" class="zoom-odometer"><span>PULLING BACK</span><strong>{{Math.round(camera.zoomFactor).toLocaleString('en-US')}}<small>×</small></strong><span>{{yourHeight < 1 ? 'You’ve passed the one-pixel mark.' : 'Same you. More distance.'}}</span></div>
    <template v-for="wave in waves" :key="wave.id">
      <img v-if="progress >= .78 && wave.portraitY + wave.portraitSize > 0" class="mogul-portrait" :data-person="wave.id" :src="asset(wave.id)" alt="" :style="{width: `${wave.portraitSize}px`, left: `${wave.portraitX}px`, top: `${wave.portraitY}px`}"/>
      <div v-if="progress >= .8" class="wave-caption" :data-person="wave.id" :style="{left: `${wave.center}px`, top: `${baseline + 19}px`, width: `${(wave.end - wave.start) * 1.03}px`, '--wave-color': wave.color}"><span>{{wave.person.shortName}} / {{wave.company}}</span><strong>{{amountLabel(wave.record.value, mobile)}}</strong><small>{{wave.label}}</small><small>{{wave.date}}</small></div>
    </template>
    <div v-if="progress >= .34" class="you-caption" :style="{left: `${youX}px`, top: `${baseline + 24}px`}"><b>YOU</b><span>{{amountLabel(amount, mobile)}}</span><small v-if="yourHeight < 1">{{amount > 0 ? 'less than 1 px' : amount === 0 ? 'zero' : 'below zero'}}</small></div>
    <div v-if="progress >= .48 && yourHeight < 1" class="tiny-note" :style="{left: `${youX - 10}px`, top: `${baseline - 65}px`}"><span>still you.</span><span>↓</span></div>
    <div v-if="progress >= .2" class="scene-bottom"><button class="edit-amount" @click="$emit('editAmount')">{{example ? '$25,000 is an example.' : 'Your amount stays here.'}} <span>Change it ↗</span></button><span v-if="progress >= .9" class="company-note">Company money, not personal fortunes. Portraits aren’t to scale.</span><span v-else-if="camera.stage === 'build'" class="company-note">A little illustration of effort. Not an earnings forecast.</span></div>
    <p class="sr-only">The opening face shrinks onto a stick figure as an illustrative personal line builds. Then the camera zooms out. Your {{amountLabel(amount)}} and all three companies share a linear dollar Y-axis: xAI {{amountLabel(20e9)}} funding raised, OpenAI {{amountLabel(122e9)}} committed funding, and Amazon {{amountLabel(128.3e9)}} annual company-wide spending. These are different kinds of amounts, not a combined total.</p>
  </div>
</template>
