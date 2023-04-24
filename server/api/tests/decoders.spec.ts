import z from 'zod'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { parse } from '../src/decoders'

describe('Functional Parsing', () => {
    it('Should return a E.left', () => {
        const Model = z.object({
            version: z.literal('1.0.0'),
            name: z.string(),
        })
        const result = pipe({}, parse(Model))
        expect(E.isLeft(result)).toBe(true)
        expect(E.isRight(result)).toBe(false)
    })
    it('Should return a E.right', () => {
        const Model = z.object({
            version: z.literal('1.0.0'),
            name: z.string(),
        })
        const result = pipe({ version: '1.0.0', name: 'test' }, parse(Model))
        expect(E.isLeft(result)).toBe(false)
        expect(E.isRight(result)).toBe(true)
    })
})
