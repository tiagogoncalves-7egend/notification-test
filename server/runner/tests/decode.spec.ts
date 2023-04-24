import * as z from 'zod'
import * as E from 'fp-ts/lib/Either'
import { parse } from '../src/decoders'

describe('Parse', () => {
    it('Should parse the given model when the input is valid', async () => {
        const Model = z.object({
            id: z.string(),
            name: z.string(),
            version: z.number(),
        })
        const result = parse(Model)({
            id: 'uuid',
            name: 'Jane Doe',
            version: 3,
        })
        expect(result).toStrictEqual(
            E.right({
                id: 'uuid',
                name: 'Jane Doe',
                version: 3,
            })
        )
    })
    it('Should not parse the given model when the input is invalid', async () => {
        const Model = z.object({
            id: z.string(),
            name: z.string(),
            version: z.number(),
        })
        const result = parse(Model)({
            id: 'uuid',
            name: 'Jane Doe',
            version: 'test',
        })
        expect(E.isLeft(result)).toBe(true)
    })
})
