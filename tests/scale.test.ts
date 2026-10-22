import {describe,it,expect} from 'vitest'
import {distance,ratio,parseAmount,toUsd,waveY,amountLabel,records,people,recordFor} from '../src/lib/model'
describe('The financial ruler',()=>{
 it('is linear without a minimum visible length',()=>{for(const n of [.01,1,1e3,1e9,1e15])expect(distance(n*2,1e8)).toBe(distance(n,1e8)*2);expect(distance(25000,128300000)).toBeLessThan(.001)})
 it('keeps zero and negative wealth out of positive ratios',()=>{expect(distance(0,10)).toBe(0);expect(distance(-25,10)).toBe(-2.5);expect(ratio(2e10,0)).toBeNull();expect(ratio(2e10,-5000)).toBeNull();expect(ratio(2e10,25000)).toBe(800000)})
 it('rejects invalid rulers',()=>{expect(()=>distance(1,0)).toThrow();expect(()=>distance(Infinity,10)).toThrow()})
 it('converts a dated EUR snapshot once',()=>{expect(toUsd(25000,'EUR')).toBeCloseTo(28085);expect(toUsd(25000,'USD')).toBe(25000);expect(toUsd(-5000,'EUR')).toBeCloseTo(-5617)})
 it('distinguishes absent inputs, malformed numbers, zero and negatives',()=>{for(const n of ['',' ','NaN','1e9','€25,000','1,2','25.000,00','10–20','1000000000000001'])expect(parseAmount(n)).toBeNull();expect(parseAmount('25,000.25')).toBe(25000.25);expect(parseAmount('0')).toBe(0);expect(parseAmount('-5000')).toBe(-5000)})
 it('uses the same normalized profile and exact endpoints',()=>{expect(waveY(0,200,100)).toBe(200);expect(waveY(1,200,100)).toBe(200);expect(waveY(.5,200,100)).toBe(100)})
 it('keeps dates, source, status and scope on every exact-value record',()=>{for(const r of records){expect(r.value).toBeGreaterThan(0);expect(r.sourceUrl).toMatch(/^https:/);for(const key of ['period','status','scope','publicationDate','checkedDate','overlapNotes'])expect(r[key as keyof typeof r]).toBeTruthy();expect(r.currency).toBe('USD')}})
 it('never manufactures a missing fortune',()=>{const sam=people.find(p=>p.id==='altman')!;expect(sam.fortuneId).toBeNull();expect(recordFor(sam).metric).toBe('committed-funding')})
 it('labels large and tiny money without NaN',()=>{expect(amountLabel(1e12)).toBe('$1 trillion');expect(amountLabel(128.3e9)).toBe('$128.3 billion');expect(amountLabel(-5000)).toBe('$-5,000')})
})
