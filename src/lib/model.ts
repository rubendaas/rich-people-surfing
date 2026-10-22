import people from '../data/people.json'
import records from '../data/records.json'
import benchmarks from '../data/benchmarks.json'
export { people, records, benchmarks }
export type Person = typeof people[number]
export type FinancialRecord = typeof records[number]
export const asset = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`
export const recordFor = (person: Person, fortune = false) => records.find(r => r.id === (fortune && person.fortuneId ? person.fortuneId : person.recordId))!
export function amountLabel(value: number, compact = false): string {
  const a = Math.abs(value)
  const unit = a >= 1e12 ? [1e12, compact ? 'T' : ' trillion'] : a >= 1e9 ? [1e9, compact ? 'B' : ' billion'] : a >= 1e6 ? [1e6, compact ? 'M' : ' million'] : [1, '']
  return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: unit[0] === 1 && a >= 1000 ? 0 : 2 }).format(value / Number(unit[0])) + unit[1]
}
export function parseAmount(input: string): number | null {
  const clean = input.trim()
  if (!/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/.test(clean)) return null
  const n = Number(clean.replaceAll(',', ''))
  return Number.isFinite(n) && Math.abs(n) <= 1e15 ? n : null
}
export const toUsd = (amount: number, currency: string) => amount * (currency === 'EUR' ? benchmarks.fx.rate : 1)
export function distance(amount: number, dollarsPerPixel: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(dollarsPerPixel) || dollarsPerPixel <= 0) throw new Error('Invalid ruler')
  return amount / dollarsPerPixel
}
export const ratio = (company: number, wealth: number) => wealth > 0 ? company / wealth : null
// The normalized profile is stretched horizontally; it never changes a measured endpoint.
export function waveY(t: number, baseline: number, height: number) {
  return baseline - Math.sin(Math.PI * Math.max(0, Math.min(1, t))) ** 1.7 * height
}
export function waveAngle(t: number, length: number, height: number) {
  const epsilon = 0.0001
  return Math.atan2(waveY(t + epsilon, 0, height) - waveY(t - epsilon, 0, height), 2 * epsilon * length) * 180 / Math.PI
}
export function shareUrl(personId: string) {
  const path = import.meta.env.BASE_URL + (import.meta.env.PROD ? `share/${encodeURIComponent(personId)}/` : '')
  const url = new URL(path, window.location.origin)
  url.hash = `surfer=${encodeURIComponent(personId)}`
  return url.toString()
}
