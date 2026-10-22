/** The pauses sit inside each visual beat, away from text-change boundaries. */
export const storyStops = [0, .18, .22, .27, .315, .45, .60, .75, .87, .94] as const

type SnapOptions = {
  enabled: () => boolean
  positions: () => number[]
  onAnimating: (active: boolean) => void
}

/**
 * Gestures settle on beats. Decaying momentum is absorbed; renewed or sustained
 * input can continue without waiting for the trackpad to become completely quiet.
 * Only the story captures input; dialogs, browser zoom and the afterword stay native.
 */
export function createStorySnap({ enabled, positions, onAnimating }: SnapOptions) {
  let frame = 0, lastWheel = -Infinity, wheelTotal = 0, wheelDirection = 0, consumed = false
  let lastMagnitude = 0, lastAccepted = -Infinity, settledAt = -Infinity, continuation = 0, queuedWheel = 0
  let touch: { x: number; y: number; consumed: boolean } | undefined
  const interactive = 'button, a, input, textarea, select, [contenteditable]:not([contenteditable="false"])'
  const blocked = (target: EventTarget | null) => !enabled() || !!document.querySelector('dialog[open]')
    || target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')

  function stopAnimation() {
    cancelAnimationFrame(frame)
    frame = 0
    onAnimating(false)
  }

  function cancel() {
    stopAnimation()
    lastWheel = -Infinity
    wheelTotal = wheelDirection = 0
    lastMagnitude = continuation = queuedWheel = 0
    lastAccepted = settledAt = -Infinity
    consumed = false
    touch = undefined
  }

  function nextPosition(direction: number): number | undefined {
    const stops = positions()
    const first = stops[0], last = stops.at(-1)
    if (first === undefined || last === undefined || scrollY < first - 2 || scrollY > last + 2) return
    return direction > 0 ? stops.find(position => position > scrollY + 2)
      : [...stops].reverse().find(position => position < scrollY - 2)
  }

  function animateTo(target: number) {
    stopAnimation()
    const start = scrollY, distance = target - start, started = performance.now()
    // A firm arrival, with a longer breath for the large changes of scale.
    const duration = Math.abs(distance) > innerHeight ? 900 : 620
    onAnimating(true)
    function tick(now: number) {
      if (!enabled() || document.querySelector('dialog[open]')) { cancel(); return }
      const time = Math.min(1, (now - started) / duration)
      const eased = time < .5 ? 4 * time ** 3 : 1 - (-2 * time + 2) ** 3 / 2
      window.scrollTo({ top: Math.round(start + distance * eased), behavior: 'instant' })
      if (time < 1) frame = requestAnimationFrame(tick)
      else {
        frame = 0; settledAt = now; continuation = 0; onAnimating(false)
        if (queuedWheel) {
          const next = nextPosition(queuedWheel)
          queuedWheel = 0
          if (next !== undefined) { lastAccepted = now; animateTo(next) }
        }
      }
    }
    frame = requestAnimationFrame(tick)
  }

  function onWheel(event: WheelEvent) {
    if (blocked(event.target) || event.ctrlKey || event.metaKey || !event.cancelable
      || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1)
    const direction = Math.sign(delta), magnitude = Math.abs(delta), now = performance.now()
    const previousMagnitude = lastMagnitude
    const freshGesture = now - lastWheel > 120
    const renewed = now - lastAccepted > 200 && magnitude >= 12
      && magnitude >= previousMagnitude * 1.6 && magnitude - previousMagnitude >= 6
    // A deliberate reversal can interrupt the travel; tiny tail jitter cannot.
    const reversed = wheelDirection !== 0 && direction !== wheelDirection && magnitude >= 12
    if (reversed) { stopAnimation(); queuedWheel = 0 }
    lastWheel = now; lastMagnitude = magnitude
    const target = nextPosition(direction)
    if (target === undefined && !frame) {
      // Release into ordinary scrolling at either end of the story.
      if (consumed && !freshGesture && !renewed && now - settledAt < 160) event.preventDefault()
      else consumed = false
      return
    }
    event.preventDefault()
    if (freshGesture || renewed || reversed) { wheelTotal = continuation = 0; consumed = false }
    if (consumed) {
      // A held, steady scroll also moves on after a brief pause at the beat.
      // Small, fading inertia never accumulates into another step.
      if (!frame && now - settledAt >= 160) {
        continuation = magnitude > 0 && magnitude >= previousMagnitude * .85 ? continuation + magnitude : 0
        if (continuation >= 48) { consumed = false; wheelTotal = 0 }
      }
      if (consumed) return
    }
    if (direction !== wheelDirection) wheelTotal = 0
    wheelDirection = direction
    wheelTotal += delta
    if (Math.abs(wheelTotal) < 12) return
    consumed = true; lastAccepted = now; continuation = 0
    // Keep a deliberate second swipe made during travel, rather than dropping it.
    if (frame) queuedWheel = direction
    else if (target !== undefined) animateTo(target)
  }

  function onTouchStart(event: TouchEvent) {
    if (blocked(event.target) || event.touches.length !== 1) { touch = undefined; return }
    cancel()
    touch = { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY, consumed: false }
  }

  function onTouchMove(event: TouchEvent) {
    if (!touch || blocked(event.target) || event.touches.length !== 1 || !event.cancelable) return
    const dx = touch.x - event.touches[0]!.clientX, dy = touch.y - event.touches[0]!.clientY
    if (Math.abs(dx) >= Math.abs(dy)) return
    if (touch.consumed) { event.preventDefault(); return }
    const target = nextPosition(Math.sign(dy))
    if (target === undefined) return
    event.preventDefault()
    if (Math.abs(dy) < 32) return
    touch.consumed = true
    animateTo(target)
  }

  function onTouchEnd() { touch = undefined }

  function onKeyDown(event: KeyboardEvent) {
    if (blocked(event.target) || event.altKey || event.ctrlKey || event.metaKey
      || event.target instanceof Element && event.target.closest(interactive)) return
    if (['Home', 'End', 'Escape'].includes(event.key)) { cancel(); return }
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) || event.key === ' ' && !event.shiftKey ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) || event.key === ' ' && event.shiftKey ? -1 : 0
    if (!direction) return
    if (frame) { event.preventDefault(); return }
    const target = nextPosition(direction)
    if (target === undefined) return
    event.preventDefault()
    if (!event.repeat) { cancel(); animateTo(target) }
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('touchcancel', onTouchEnd)
  window.addEventListener('keydown', onKeyDown)
  // Grabbing the scrollbar or using a control always takes priority over snapping.
  window.addEventListener('pointerdown', cancel)
  window.addEventListener('resize', cancel)
  return {
    cancel,
    destroy() {
      cancel()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', cancel)
      window.removeEventListener('resize', cancel)
    },
  }
}
