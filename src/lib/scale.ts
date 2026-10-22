export const FACE_END = 0.12
export const ZOOM_END = 0.86
export const FINAL_HEIGHT_FRACTION = 0.72

export interface CameraScale {
  /** Money represented by the full height above the shared zero baseline. */
  upperAmount: number
  /** The face-to-stick-figure transition, before the camera moves. */
  faceProgress: number
  /** Normalized geometric zoom, held at one for the end of the scroll. */
  zoomProgress: number
}

export interface ScaleTick {
  value: number
  /** Position above the zero baseline, between zero and one. */
  fraction: number
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const positiveAmount = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
const cappedMultiply = (value: number, multiplier: number) => Math.min(Number.MAX_VALUE, value * multiplier)

/**
 * Zoom the camera, never the financial relationship: all money shares this
 * upper bound. A geometric zoom keeps the orders of magnitude scrollable,
 * while each individual frame remains a strictly linear ruler.
 */
export function cameraForProgress(progress: number, userAmount: number, selectedAmount: number): CameraScale {
  const scroll = Number.isFinite(progress) ? clamp01(progress) : 0
  const faceProgress = clamp01(scroll / FACE_END)
  const zoomProgress = clamp01((scroll - FACE_END) / (ZOOM_END - FACE_END))
  const initialUpper = Math.max(100_000, cappedMultiply(positiveAmount(userAmount), 3))
  // A very large personal amount must not reverse the camera into a zoom-in.
  const finalUpper = Math.max(initialUpper, cappedMultiply(positiveAmount(selectedAmount), 1 / FINAL_HEIGHT_FRACTION))
  const upperAmount = zoomProgress === 0 || initialUpper === finalUpper ? initialUpper
    : zoomProgress === 1 ? finalUpper
      : Math.exp(Math.log(initialUpper) + (Math.log(finalUpper) - Math.log(initialUpper)) * zoomProgress)

  return { upperAmount, faceProgress, zoomProgress }
}

/** Signed height: zero has no height and negative wealth extends below zero. */
export function amountToPixels(amount: number, upperAmount: number, plotHeight: number): number {
  if (!Number.isFinite(amount) || !Number.isFinite(upperAmount) || upperAmount <= 0
    || !Number.isFinite(plotHeight) || plotHeight < 0) {
    throw new RangeError('Money and plot dimensions must be finite, with a positive upper amount and nonnegative height')
  }
  return amount / upperAmount * plotHeight
}

/** Three to six major ticks, including zero, on a readable 1/2/5 ruler. */
export function scaleTicks(upperAmount: number): ScaleTick[] {
  if (!Number.isFinite(upperAmount) || upperAmount <= 0) return []
  const roughStep = upperAmount / 5
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  // Underflow is only possible far below any supported money input; keeping a
  // zero and endpoint still makes this utility safe for every positive number.
  if (magnitude === 0) return [{ value: 0, fraction: 0 }, { value: upperAmount, fraction: 1 }]
  const normalized = roughStep / magnitude
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  const count = Math.floor(upperAmount / step + 1e-10)
  return Array.from({ length: count + 1 }, (_, index) => ({
    value: index * step,
    fraction: Math.min(1, index * step / upperAmount),
  }))
}
