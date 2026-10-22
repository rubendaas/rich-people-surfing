<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { amountLabel, benchmarks, parseAmount, toUsd } from './lib/model'
import { journeyFrame, storyProgressForScroll, scrollProgressForStory } from './lib/journey'
import { createStorySnap, storyStops } from './lib/scrollSnap'
import ScaleScene from './components/ScaleScene.vue'
import SourceDrawer from './components/SourceDrawer.vue'

const brandIcon = `${import.meta.env.BASE_URL}plankton.svg`
const sources = ref<InstanceType<typeof SourceDrawer>>()
const experience = ref<HTMLElement>(), amountDialog = ref<HTMLDialogElement>()
const raw = ref('25000'), currency = ref('USD'), amount = ref(25000), example = ref(true), error = ref('')
const progress = ref(0), manualStill = ref(false), reduced = ref(matchMedia('(prefers-reduced-motion: reduce)').matches)
const snapping = ref(false)
const still = computed(() => reduced.value || manualStill.value)
const displayedProgress = computed(() => still.value ? 1 : progress.value)
const frame = computed(() => journeyFrame(displayedProgress.value, amount.value, 128.3e9))
const stages = [
  { id: 'you', label: 'You', position: 0 },
  { id: 'build', label: 'The grind', position: .22 },
  { id: 'zoom', label: 'Zoom out', position: .45 },
  { id: 'waves', label: 'The big waves', position: .94 },
]
const stageIndex = computed(() => stages.findIndex(stage => stage.id === frame.value.stage))
const scrollPrompt = computed(() => still.value ? 'All three waves. One ruler.' : frame.value.stage === 'you' ? 'Scroll. You’ve got work to do.' : frame.value.stage === 'build' ? 'Keep going. Every little bit.' : frame.value.stage === 'zoom' ? 'Keep scrolling. Much, much further.' : 'All that distance. Same you.')
let media: MediaQueryList, pendingFrame = 0, snap: ReturnType<typeof createStorySnap> | undefined
function updateScroll() {
  pendingFrame = 0
  if (!experience.value) return
  const rect = experience.value.getBoundingClientRect()
  progress.value = storyProgressForScroll(-rect.top / Math.max(1, rect.height - innerHeight))
}
function queueScroll() { if (!pendingFrame) pendingFrame = requestAnimationFrame(updateScroll) }
function motionChange(event: MediaQueryListEvent) { snap?.cancel(); reduced.value = event.matches; nextTick(() => { restart(); updateScroll() }) }
function restart() { snap?.cancel(); window.scrollTo({ top: 0, behavior: 'instant' }) }
async function toggleStill() { manualStill.value = !manualStill.value; await nextTick(); restart(); updateScroll() }
function jump(position: number) {
  snap?.cancel()
  if (!experience.value) return
  const top = experience.value.getBoundingClientRect().top + scrollY
  window.scrollTo({ top: Math.ceil(top + (experience.value.clientHeight - innerHeight) * scrollProgressForStory(position)), behavior: 'instant' })
}
function openAmount() { snap?.cancel(); error.value = ''; amountDialog.value?.showModal() }
function applyAmount() {
  const parsed = parseAmount(raw.value)
  if (parsed === null) { error.value = 'Enter a number like 25000, 0 or -5000. Use a dot for decimals.'; return }
  amount.value = toUsd(parsed, currency.value); example.value = false; amountDialog.value?.close()
}
function resetAmount() { raw.value = '25000'; currency.value = 'USD'; amount.value = 25000; example.value = true; error.value = ''; amountDialog.value?.close() }
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)'); media.addEventListener('change', motionChange)
  window.addEventListener('scroll', queueScroll, { passive: true }); window.addEventListener('resize', queueScroll); updateScroll()
  snap = createStorySnap({
    enabled: () => !still.value,
    positions: () => {
      if (!experience.value) return []
      const top = experience.value.getBoundingClientRect().top + scrollY
      const distance = experience.value.clientHeight - innerHeight
      const ending = document.querySelector<HTMLElement>('#comparison-end')!
      const endTop = ending.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(ending).scrollMarginTop)
      return [...storyStops.map(position => Math.ceil(top + distance * scrollProgressForStory(position))),
        Math.min(endTop, document.documentElement.scrollHeight - innerHeight)]
    },
    onAnimating: active => { snapping.value = active },
  })
})
onBeforeUnmount(() => {
  media?.removeEventListener('change', motionChange); window.removeEventListener('scroll', queueScroll)
  window.removeEventListener('resize', queueScroll); cancelAnimationFrame(pendingFrame)
  snap?.destroy()
})
</script>

<template>
  <a class="skip-link" href="#comparison-end">Skip to the result</a>
  <header class="site-header">
    <a class="wordmark" href="#" @click.prevent="restart" aria-label="Sorry, You’re Plankton, back to your scale"><img class="brand-symbol" :src="brandIcon" alt="" width="34" height="34"/><span class="brand-name"><small>SORRY, YOU’RE</small><strong>PLANKTON</strong></span></a>
    <span class="header-tagline">An extremely small perspective.</span>
    <div class="header-tools"><button @click="toggleStill" :aria-pressed="still" :disabled="reduced">{{still ? 'Still view' : 'Reduce motion'}}</button><button v-if="displayedProgress >= .2" @click="sources?.open()">Sources ↗</button></div>
  </header>
  <main>
    <section ref="experience" id="experience" class="experience" :class="{ 'is-still': still }" :data-snapping="snapping" aria-label="From your face to the scale of AI money">
      <div class="sticky-screen">
        <ScaleScene :amount="amount" :progress="displayedProgress" :example="example" @edit-amount="openAmount"/>
        <div class="scroll-footer">
          <span class="scroll-prompt"><span v-if="!still" class="scroll-cue" aria-hidden="true"><svg viewBox="0 0 24 30"><path d="M12 3v20M5 16l7 7 7-7"/></svg></span> {{scrollPrompt}}</span>
          <nav class="journey-steps" aria-label="Story stages"><button v-for="(stage, index) in stages" :key="stage.id" :aria-current="stageIndex === index ? 'step' : undefined" :class="{ complete: index < stageIndex }" :disabled="still" @click="jump(stage.position)"><span>{{String(index + 1).padStart(2, '0')}}</span><b>{{stage.label}}</b></button></nav>
          <div class="scroll-track" aria-hidden="true"><span :style="{ width: `${displayedProgress * 100}%` }"/></div>
        </div>
      </div>
    </section>
    <section id="comparison-end" class="comparison-end" tabindex="-1">
      <div><span class="eyebrow">SAME OCEAN. VERY DIFFERENT BOATS.</span><h1>You’re still<br><span>in the picture.</span></h1><p>{{amount > 0 ? `${amountLabel(amount)}. It took something to build that.` : 'Your balance doesn’t measure your effort.'}} The dot isn’t your worth.</p><button class="text-button" @click="restart">Back to being enormous ↑</button></div>
      <aside id="made-with-ai" class="ai-note"><span class="ai-spark" aria-hidden="true">✳</span><span class="eyebrow">YES, WE MADE THIS WITH AI.</span><h2>The irony is<br>not lost on us.</h2><p>The code. The drawings. A lot of back-and-forth with a machine.</p><p>The money gap is absurd. Making things like this with AI is also ridiculously exciting. Both can be true.</p><p class="fine">One weird webpage won’t close the gap. We’re here for a little perspective, and the fun of making something.</p></aside>
    </section>
  </main>
  <footer class="site-footer"><span>Human curiosity. AI assistance. Very little money.</span><button @click="sources?.open()">Numbers & small print ↗</button></footer>
  <SourceDrawer ref="sources"/>
  <dialog ref="amountDialog" class="amount-dialog" aria-labelledby="amount-title" @click="($event.target === $event.currentTarget) && amountDialog?.close()">
    <form @submit.prevent="applyAmount"><div class="dialog-top"><span class="eyebrow">YOUR SIDE OF THE RULER</span><button type="button" class="icon-button" aria-label="Close amount settings" @click="amountDialog?.close()">×</button></div><h2 id="amount-title">Make it your number.</h2><p>$25,000 is just an example. Try your net worth: what you own minus what you owe. The little build-up is an illustration, not a savings forecast.</p><label for="wealth">Your estimated net worth</label><div class="input-row"><label class="sr-only" for="currency">Currency</label><select id="currency" v-model="currency"><option value="USD">USD $</option><option value="EUR">EUR €</option></select><input id="wealth" v-model="raw" inputmode="decimal" autocomplete="off" aria-describedby="wealth-error amount-privacy" :aria-invalid="!!error"/></div><p id="wealth-error" class="error" role="alert">{{error}}</p><button class="button dark" type="submit">Use this amount</button><button class="text-button" type="button" @click="resetAmount">Use the $25,000 example</button><p id="amount-privacy" class="fine">Only in this tab. No account, no tracking, no saving.</p><p v-if="currency === 'EUR'" class="fine">EUR → USD at {{benchmarks.fx.rate}} · {{benchmarks.fx.date}}.</p></form>
  </dialog>
</template>
