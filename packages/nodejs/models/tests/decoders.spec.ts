import * as E from 'fp-ts/lib/Either'
import * as z from 'zod'
import { pipe } from 'fp-ts/lib/function'
import { DateSchema, parse } from '../src/decoders'

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

describe('Dates', () => {
  it('Should parse date objects', () => {
    const date = new Date('2022-12-20T14:38:02.103Z')
    const result = pipe(date, parse(DateSchema))
    expect(E.isLeft(result)).toBe(false)
    expect(E.isRight(result)).toBe(true)
    expect(result).toStrictEqual(E.right(date))
  })
  it('Should parse valid iso datetime strings', () => {
    const string = '2020-01-01T10:36:00.103Z'
    const result = pipe(string, parse(DateSchema))
    expect(E.isLeft(result)).toBe(false)
    expect(E.isRight(result)).toBe(true)
    expect(result).toStrictEqual(E.right(new Date(string)))
  })
  it('Should parse valid iso date strings', () => {
    const string = '2021-10-20'
    const result = pipe(string, parse(DateSchema))
    expect(E.isLeft(result)).toBe(false)
    expect(E.isRight(result)).toBe(true)
    expect(result).toStrictEqual(E.right(new Date(string)))
  })
  it('Should not parse invalid iso date strings', () => {
    const string = 'invalid-date'
    const result = pipe(string, parse(DateSchema))
    expect(E.isLeft(result)).toBe(true)
    expect(E.isRight(result)).toBe(false)
  })
})
