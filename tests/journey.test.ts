import { describe, expect, it } from 'vitest'
import { journeyFrame, stageProgress, storyProgressForScroll, scrollProgressForStory } from '../src/lib/journey'
import { amountToPixels } from '../src/lib/scale'

const USER = 25_000
const COMPANIES = [40e9, 128.3e9, 500e9]
const MAX_COMPANY = Math.max(...COMPANIES)
const PLOT_HEIGHT = 500

describe('The staged scroll journey', () => {
  it('introduces the person, their effort, the distance, then every wave', () => {
    const expected = [
      [0, 'you'], [0.119, 'you'], [0.12, 'build'], [0.319, 'build'],
      [0.32, 'zoom'], [0.799, 'zoom'], [0.80, 'waves'], [1, 'waves'],
    ] as const
    for (const [progress, stage] of expected) expect(journeyFrame(progress, USER, MAX_COMPANY).stage).toBe(stage)
  })

  it('reveals a person and finishes building their line before pulling back', () => {
    expect(journeyFrame(0, USER, MAX_COMPANY).faceToPerson).toBe(0)
    expect(journeyFrame(storyProgressForScroll(.005), USER, MAX_COMPANY).faceToPerson).toBeGreaterThan(0)
    expect(journeyFrame(0.10, USER, MAX_COMPANY).faceToPerson).toBeCloseTo(0.5)
    expect(journeyFrame(0.20, USER, MAX_COMPANY).faceToPerson).toBe(1)
    expect(journeyFrame(0.16, USER, MAX_COMPANY).buildProgress).toBe(0)
    expect(journeyFrame(0.235, USER, MAX_COMPANY).buildProgress).toBeCloseTo(0.5)
    expect(journeyFrame(0.31, USER, MAX_COMPANY).buildProgress).toBe(1)
    for (const progress of [0, 0.10, 0.16, 0.235, 0.31, 0.32]) {
      const frame = journeyFrame(progress, USER, MAX_COMPANY)
      expect(frame.upperAmount).toBe(100_000)
      expect(frame.zoomFactor).toBe(1)
    }
  })

  it('makes equal scroll distances span equal orders of magnitude', () => {
    const start = journeyFrame(0.32, USER, MAX_COMPANY)
    const middle = journeyFrame(0.61, USER, MAX_COMPANY)
    const end = journeyFrame(0.90, USER, MAX_COMPANY)
    expect(middle.upperAmount / start.upperAmount).toBeCloseTo(end.upperAmount / middle.upperAmount)
    expect(end.zoomFactor).toBeGreaterThan(1_000_000)
    expect(amountToPixels(USER, end.upperAmount, PLOT_HEIGHT)).toBeLessThan(0.001)
    expect(amountToPixels(MAX_COMPANY, end.upperAmount, PLOT_HEIGHT)).toBeCloseTo(PLOT_HEIGHT * 0.78)
    expect(journeyFrame(1, USER, MAX_COMPANY)).toEqual(end)
  })

  it('keeps every wave proportional on the same dollar ruler throughout the journey', () => {
    let previousUpper = 0
    for (let index = 0; index <= 200; index++) {
      const frame = journeyFrame(index / 200, USER, MAX_COMPANY)
      expect(frame.upperAmount).toBeGreaterThanOrEqual(previousUpper)
      const personalHeight = amountToPixels(USER, frame.upperAmount, PLOT_HEIGHT)
      for (const company of COMPANIES) {
        const companyHeight = amountToPixels(company, frame.upperAmount, PLOT_HEIGHT)
        expect(companyHeight / personalHeight).toBeCloseTo(company / USER, 5)
      }
      previousUpper = frame.upperAmount
    }
  })

  it('does not jump at the camera boundaries or zoom back in for large personal amounts', () => {
    for (const boundary of [0.32, 0.90]) {
      const before = journeyFrame(boundary - 1e-9, USER, MAX_COMPANY).upperAmount
      const after = journeyFrame(boundary + 1e-9, USER, MAX_COMPANY).upperAmount
      expect(after / before).toBeCloseTo(1, 6)
    }
    for (const progress of [0, 0.32, 0.61, 0.90, 1]) {
      const frame = journeyFrame(progress, 1e15, MAX_COMPANY)
      expect(frame.upperAmount).toBe(3e15)
      expect(frame.zoomFactor).toBe(1)
    }
  })

  it('preserves zero and debt without inventing positive wealth', () => {
    for (const userAmount of [0, -5_000]) {
      for (const progress of [0, 0.235, 0.61, 1]) {
        const frame = journeyFrame(progress, userAmount, MAX_COMPANY)
        const builtAmount = userAmount * frame.buildProgress
        const height = amountToPixels(builtAmount, frame.upperAmount, PLOT_HEIGHT)
        expect(height).toBeLessThanOrEqual(0)
        expect(height).toBe(builtAmount / frame.upperAmount * PLOT_HEIGHT)
        expect(Number.isFinite(frame.zoomFactor)).toBe(true)
      }
    }
  })

  it('bounds malformed inputs and remains finite for enormous amounts', () => {
    expect(journeyFrame(-1, USER, MAX_COMPANY)).toEqual(journeyFrame(0, USER, MAX_COMPANY))
    expect(journeyFrame(2, USER, MAX_COMPANY)).toEqual(journeyFrame(1, USER, MAX_COMPANY))
    expect(journeyFrame(NaN, USER, MAX_COMPANY)).toEqual(journeyFrame(0, USER, MAX_COMPANY))
    for (const value of [0, -1, NaN, Infinity]) {
      expect(journeyFrame(1, value, value).upperAmount).toBe(100_000)
    }
    for (const user of [USER, Number.MAX_VALUE]) {
      let previousUpper = 0
      for (let index = 0; index <= 200; index++) {
        const frame = journeyFrame(index / 200, user, Number.MAX_VALUE)
        expect(Number.isFinite(frame.upperAmount)).toBe(true)
        expect(Number.isFinite(frame.zoomFactor)).toBe(true)
        expect(frame.upperAmount).toBeGreaterThanOrEqual(previousUpper)
        previousUpper = frame.upperAmount
      }
    }
  })
})

describe('Local stage progress', () => {
  it('stays bounded before and after an interval', () => {
    expect(stageProgress(-1, 0.2, 0.4)).toBe(0)
    expect(stageProgress(0.3, 0.2, 0.4)).toBeCloseTo(0.5)
    expect(stageProgress(1, 0.2, 0.4)).toBe(1)
    expect(stageProgress(NaN, 0.2, 0.4)).toBe(0)
    expect(stageProgress(0.3, 0.3, 0.3)).toBe(1)
  })
})


describe('Faster opening pace', () => {
  it('shortens the opening while preserving the long pullback', () => {
    // Distances are viewport heights: previous 1200svh section, now 1000svh.
    const introDistance = scrollProgressForStory(.32) * 9
    const pullbackDistance = (scrollProgressForStory(.90) - scrollProgressForStory(.32)) * 9
    expect(introDistance).toBeLessThan(.32 * 11 * .55)
    expect(pullbackDistance).toBeGreaterThan((.90 - .32) * 11 * .95)
  })
  it('keeps scroll and stage navigation continuous and reversible', () => {
    let previous = 0
    for (let step = 0; step <= 100; step++) {
      const scroll = step / 100
      const story = storyProgressForScroll(scroll)
      expect(story).toBeGreaterThanOrEqual(previous)
      expect(scrollProgressForStory(story)).toBeCloseTo(scroll, 10)
      previous = story
    }
    expect(storyProgressForScroll(.20 - 1e-9)).toBeCloseTo(storyProgressForScroll(.20 + 1e-9), 7)
    expect(storyProgressForScroll(NaN)).toBe(0)
    expect(scrollProgressForStory(2)).toBe(1)
  })
})
