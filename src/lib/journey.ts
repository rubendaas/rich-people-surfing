export type JourneyStage = 'you' | 'build' | 'zoom' | 'waves'

export interface JourneyFrame {
  stage: JourneyStage
  /** The visible share of the personal line, before the camera pulls back. */
  buildProgress: number
  /** Zero is the opening face; one is the complete stick figure. */
  faceToPerson: number
  /** Dollars represented by the full height above the common zero baseline. */
  upperAmount: number
  /** Camera distance relative to the opening money scale; never below one. */
  zoomFactor: number
}

const finiteProgress = (value: number) => Number.isFinite(value) ? value : 0
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const positiveAmount = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
const cappedMultiply = (value: number, multiplier: number) => Math.min(Number.MAX_VALUE, value * multiplier)

/** A bounded local animation clock for one interval of the scroll. */
export function stageProgress(progress: number, start: number, end: number): number {
  const scroll = finiteProgress(progress)
  if (end <= start) return scroll >= end ? 1 : 0
  return clamp01((scroll - start) / (end - start))
}

/**
 * First meet the person, then build their line, then travel out to all waves.
 * Camera movement is geometric, but money is always drawn on one linear ruler.
 */
export function journeyFrame(progress: number, userAmount: number, maxCompanyAmount: number): JourneyFrame {
  const scroll = clamp01(finiteProgress(progress))
  const stage: JourneyStage = scroll < 0.12 ? 'you' : scroll < 0.32 ? 'build' : scroll < 0.80 ? 'zoom' : 'waves'
  const buildProgress = stageProgress(scroll, 0.16, 0.31)
  const faceToPerson = stageProgress(scroll, 0, 0.20)
  const zoomProgress = stageProgress(scroll, 0.32, 0.90)
  const initialUpper = Math.max(100_000, cappedMultiply(positiveAmount(userAmount), 3))
  const finalUpper = Math.max(initialUpper, cappedMultiply(positiveAmount(maxCompanyAmount), 1 / 0.78))

  // The endpoint clamp also prevents floating-point overflow near MAX_VALUE.
  const upperAmount = zoomProgress === 0 || initialUpper === finalUpper ? initialUpper
    : zoomProgress === 1 ? finalUpper
      : Math.max(initialUpper, Math.min(finalUpper,
        Math.exp(Math.log(initialUpper) + (Math.log(finalUpper) - Math.log(initialUpper)) * zoomProgress)))

  return { stage, buildProgress, faceToPerson, upperAmount, zoomFactor: upperAmount / initialUpper }
}


// Spend less distance on the opening; keep the long billions pullback.
export function storyProgressForScroll(progress: number): number {
  const scroll = clamp01(finiteProgress(progress))
  const story = scroll <= .20 ? scroll * .32 / .20 : .32 + (scroll - .20) * .68 / .80
  return Math.round(story * 1e10) / 1e10
}

export function scrollProgressForStory(progress: number): number {
  const story = clamp01(finiteProgress(progress))
  const scroll = story <= .32 ? story * .20 / .32 : .20 + (story - .32) * .80 / .68
  return Math.round(scroll * 1e10) / 1e10
}
