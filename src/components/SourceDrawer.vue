<script setup lang="ts">
import {ref} from 'vue'
import {records,benchmarks, amountLabel} from '../lib/model'
const comparisonRecords = [
  {name: 'Amazon', record: records.find(record => record.id === 'amazon-2025')!},
  {name: 'xAI', record: records.find(record => record.id === 'xai-series-e')!},
  {name: 'OpenAI', record: records.find(record => record.id === 'openai-2026')!},
]
const dialog=ref<HTMLDialogElement>()
function open(){dialog.value?.showModal()}
defineExpose({open})
</script>
<template>
  <dialog ref="dialog" class="source-dialog" aria-labelledby="sources-title" @click="($event.target===$event.currentTarget)&&dialog?.close()">
    <div class="source-inner">
      <div class="source-head"><span class="eyebrow">SOURCES & SCALE</span><button class="icon-button" aria-label="Close sources" @click="dialog?.close()">×</button></div>
      <h2 id="sources-title">The numbers.</h2>
      <p>Three companies. Three separately labeled amounts. Dated source snapshots, not a live financial feed.</p>
      <article v-for="{name, record} in comparisonRecords" :key="record.id" class="source-feature">
        <h3>{{name}} · {{amountLabel(record.value)}}</h3>
        <span class="pill">{{record.status}}</span>
        <b>{{record.label}} · {{record.period}}</b><p>{{record.scope}}</p>
        <a :href="record.sourceUrl" target="_blank" rel="noopener noreferrer">{{record.sourceTitle}} ↗</a>
        <p class="fine">Published {{record.publicationDate}} · Checked {{record.checkedDate}}</p>
        <p class="fine">{{record.overlapNotes}}</p>
      </article>
      <h3>How the scale works</h3>
      <p>Height above zero measures U.S. dollars. Your line and all three company waves share one linear vertical ruler: twice the amount means twice the height. After your line builds, scrolling pulls the camera back while the amounts stay fixed.</p>
      <p>The camera zooms out geometrically to cover the jump from thousands to billions. The dollar ticks show the current scale. This is a scale comparison, not a chart of wealth changing over time.</p>
      <p>The face, stick figure, and moguls are decorative illustrations, not measurements. The visitor locator helps you find a value smaller than a pixel; it does not enlarge its measured height. Zero and negative net worth have no positive height.</p>
      <h3>What is being compared?</h3>
      <p>The opening $25,000 is an editable example of net worth: assets minus debts. It is not an average, a salary, or a claim about your finances.</p>
      <p>The early build-up is an illustration of effort. It is not an earnings forecast, savings plan, or timeline. The finished line marks the example amount you chose.</p>
      <p>The company waves show spending, investor funding, and committed capital. These have different economic meanings from each other and from your net worth. They are not the moguls’ personal bank balances. Amazon’s record covers company-wide capital spending, not AI alone.</p>
      <p>Matching dollar heights shows the size of each amount; it does not make these different kinds of money interchangeable. We never add the waves together. Older personal-wealth records remain available below for reference; they are not used in this view.</p>
      <h3>Currency</h3>
      <p>EUR 1 = USD {{benchmarks.fx.rate}}. ECB reference rate, {{benchmarks.fx.date}}. Euros are converted once using this fixed snapshot. No inflation adjustment is applied.</p>
      <a :href="benchmarks.fx.sourceUrl" target="_blank" rel="noopener noreferrer">European Central Bank ↗</a>
      <details>
        <summary>All financial records</summary>
        <article v-for="r in records" :key="r.id" class="source-record">
          <h4>{{amountLabel(r.value)}} · {{r.entityId}}</h4><p>{{r.label}} · {{r.period}} · {{r.status}}</p><p>{{r.scope}}</p>
          <a :href="r.sourceUrl" target="_blank" rel="noopener noreferrer">{{r.sourceTitle}} ↗</a>
          <p class="fine">Published {{r.publicationDate}} · Checked {{r.checkedDate}}</p>
          <p class="fine">{{r.overlapNotes}}</p>
        </article>
      </details>
      <h3>Privacy & artwork</h3>
      <p>Your number stays in this tab’s memory. There is no account, analytics, browser storage, or automatic transmission of your financial input.</p>
      <p>The moguls are original AI-generated satirical portraits. The visitor is a gender-neutral stick figure. The people depicted do not endorse this project.</p>
      <h3>Yes, we made this with AI.</h3>
      <p>Code, illustrations, and a lot of back-and-forth. The gap is absurd; working with these tools is still exciting. Both can be true. An evening making a webpage will not fix it. This is a bit of satire, not a blueprint for changing the world.</p>
      <button class="button dark" @click="dialog?.close()">Back to the scale</button>
    </div>
  </dialog>
</template>
