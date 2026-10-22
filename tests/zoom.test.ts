import { describe, expect, it } from 'vitest'
import {
  amountToPixels,
  cameraForProgress,
  FACE_END,
  FINAL_HEIGHT_FRACTION,
  scaleTicks,
  ZOOM_END,
} from '../src/lib/scale'

const USER = 25_000
const SELECTED = 128.3e9
const PLOT_HEIGHT = 420

describe('The scrolling money camera', () => {
  it('starts on a visible human amount and waits for the face reveal', () => {
    for (const progress of [0, FACE_END / 2, FACE_END]) {
      const camera = cameraForProgress(progress, USER, SELECTED)
      expect(camera.upperAmount).toBe(100_000)
      expect(camera.zoomProgress).toBe(0)
      expect(amountToPixels(USER, camera.upperAmount, PLOT_HEIGHT)).toBe(105)
    }
    expect(cameraForProgress(0, USER, SELECTED).faceProgress).toBe(0)
    expect(cameraForProgress(FACE_END, USER, SELECTED).faceProgress).toBe(1)
  })

  it('travels through orders of magnitude without changing the money ratio', () => {
    const first = cameraForProgress(FACE_END, USER, SELECTED)
    const middle = cameraForProgress((FACE_END + ZOOM_END) / 2, USER, SELECTED)
    const last = cameraForProgress(ZOOM_END, USER, SELECTED)
    expect(middle.upperAmount / first.upperAmount).toBeCloseTo(last.upperAmount / middle.upperAmount)
    let previousUpper = first.upperAmount
    for (let frame = 0; frame <= 100; frame++) {
      const camera = cameraForProgress(FACE_END + frame / 100 * (ZOOM_END - FACE_END), USER, SELECTED)
      expect(camera.upperAmount).toBeGreaterThanOrEqual(previousUpper)
      const personalHeight = amountToPixels(USER, camera.upperAmount, PLOT_HEIGHT)
      const selectedHeight = amountToPixels(SELECTED, camera.upperAmount, PLOT_HEIGHT)
      expect(selectedHeight / personalHeight).toBeCloseTo(SELECTED / USER, 6)
      previousUpper = camera.upperAmount
    }
  })

  it('finishes with the selected amount on screen and a truly tiny human', () => {
    const camera = cameraForProgress(ZOOM_END, USER, SELECTED)
    expect(amountToPixels(SELECTED, camera.upperAmount, PLOT_HEIGHT)).toBeCloseTo(PLOT_HEIGHT * FINAL_HEIGHT_FRACTION)
    expect(amountToPixels(USER, camera.upperAmount, PLOT_HEIGHT)).toBeLessThan(0.001)
    expect(cameraForProgress(1, USER, SELECTED)).toEqual(camera)
  })

  it('is continuous where the reveal ends and the final view begins', () => {
    for (const boundary of [FACE_END, ZOOM_END]) {
      const before = cameraForProgress(boundary - 1e-8, USER, SELECTED).upperAmount
      const after = cameraForProgress(boundary + 1e-8, USER, SELECTED).upperAmount
      expect(after / before).toBeCloseTo(1, 5)
    }
  })

  it('never reverses the zoom when personal wealth exceeds the selection', () => {
    const first = cameraForProgress(0, 1e15, SELECTED)
    const last = cameraForProgress(1, 1e15, SELECTED)
    expect(last.upperAmount).toBe(first.upperAmount)
    expect(cameraForProgress(0.5, 1e15, SELECTED).upperAmount).toBe(first.upperAmount)
    expect(amountToPixels(1e15, last.upperAmount, PLOT_HEIGHT)).toBe(140)
    expect(amountToPixels(SELECTED, last.upperAmount, PLOT_HEIGHT)).toBeLessThan(140)
  })

  it('keeps zero and debt on the correct side of the baseline', () => {
    for (const user of [0, -5_000]) {
      const camera = cameraForProgress(1, user, SELECTED)
      const height = amountToPixels(user, camera.upperAmount, PLOT_HEIGHT)
      expect(height).toBeLessThanOrEqual(0)
      expect(height).toBe(user / camera.upperAmount * PLOT_HEIGHT)
    }
    expect(amountToPixels(0, 100_000, PLOT_HEIGHT)).toBe(0)
    expect(amountToPixels(-25_000, 100_000, PLOT_HEIGHT)).toBe(-105)
  })

  it('bounds scroll progress and keeps invalid or nonpositive selections finite', () => {
    expect(cameraForProgress(-1, USER, SELECTED)).toEqual(cameraForProgress(0, USER, SELECTED))
    expect(cameraForProgress(2, USER, SELECTED)).toEqual(cameraForProgress(1, USER, SELECTED))
    for (const value of [0, -1, NaN, Infinity]) {
      const camera = cameraForProgress(NaN, value, value)
      expect(camera.upperAmount).toBe(100_000)
      expect(camera.faceProgress).toBe(0)
      expect(camera.zoomProgress).toBe(0)
      expect(cameraForProgress(1, value, value).upperAmount).toBe(100_000)
    }
  })
})

describe('The visible vertical ruler', () => {
  it('keeps a useful number of aligned, readable ticks throughout the zoom', () => {
    for (let frame = 0; frame <= 100; frame++) {
      const camera = cameraForProgress(frame / 100, USER, SELECTED)
      const ticks = scaleTicks(camera.upperAmount)
      expect(ticks.length).toBeGreaterThanOrEqual(3)
      expect(ticks.length).toBeLessThanOrEqual(6)
      expect(ticks[0]).toEqual({ value: 0, fraction: 0 })
      const step = ticks[1]!.value
      const normalizedStep = step / 10 ** Math.floor(Math.log10(step))
      expect([1, 2, 5]).toContain(normalizedStep)
      for (const tick of ticks) {
        expect(tick.fraction).toBeGreaterThanOrEqual(0)
        expect(tick.fraction).toBeLessThanOrEqual(1)
        expect(tick.fraction * PLOT_HEIGHT).toBeCloseTo(amountToPixels(tick.value, camera.upperAmount, PLOT_HEIGHT))
      }
    }
  })

  it('rejects invalid geometry instead of drawing misleading measurements', () => {
    for (const upper of [0, -1, NaN, Infinity]) {
      expect(scaleTicks(upper)).toEqual([])
      expect(() => amountToPixels(USER, upper, PLOT_HEIGHT)).toThrow(RangeError)
    }
    expect(() => amountToPixels(Infinity, 100_000, PLOT_HEIGHT)).toThrow(RangeError)
    expect(() => amountToPixels(USER, 100_000, -1)).toThrow(RangeError)
  })
})
