import { Request, Response } from 'express'
import { assertHasStringValues } from './utils'
import { cookieOptions, Codec, StateOperations } from './state'

type TestType = {
  firstName: string
  lastName: string
  prisonId: string
}

const TestCodec: Codec<TestType> = {
  write: (value: TestType): Record<string, string> => {
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      prisonId: value.prisonId,
    }
  },

  read(record: Record<string, string>): TestType {
    assertHasStringValues(record, ['firstName', 'lastName', 'prisonId'])
    return {
      firstName: record.firstName,
      lastName: record.lastName,
      prisonId: record.prisonId,
    }
  },
}

const fixture = new StateOperations('test', TestCodec)

describe('state', () => {
  describe('clearUpdate', () => {
    it('interacts with response', () => {
      const res = { clearCookie: jest.fn() } as unknown as Response<unknown>

      fixture.clear(res)

      expect(res.clearCookie).toBeCalledWith('test', cookieOptions)
    })
  })

  describe('getState', () => {
    it('interacts with request and returns signed cookie', () => {
      const req = {
        signedCookies: {
          test: {
            firstName: 'Jim',
            lastName: 'Smith',
            prisonId: 'MDI',
          },
        },
      } as unknown as Request

      const result = fixture.get(req)

      expect(result).toStrictEqual({
        firstName: 'Jim',
        lastName: 'Smith',
        prisonId: 'MDI',
      })
    })

    it('returns undefined when no state', () => {
      const req = {
        signedCookies: {},
      } as unknown as Request

      const result = fixture.get(req)

      expect(result).toStrictEqual(undefined)
    })

    it('validates field are present and correct type', () => {
      const req = {
        signedCookies: {
          test: {
            firstName: 'Jim',
            prisonId: 'MDI',
          },
        },
      } as unknown as Request

      expect(() => fixture.get(req)).toThrowError('Missing or invalid keys: lastName')
    })
  })

  describe('setState', () => {
    it('sets signed cookie', () => {
      const res = { cookie: jest.fn() } as unknown as Response<unknown>

      fixture.set(res, {
        firstName: 'Jim',
        lastName: 'Smith',
        prisonId: 'MDI',
      })

      expect(res.cookie).toHaveBeenCalledWith(
        'test',
        {
          firstName: 'Jim',
          lastName: 'Smith',
          prisonId: 'MDI',
        },
        cookieOptions,
      )
    })
  })

  describe('updateState', () => {
    it('sets signed cookie', () => {
      const res = { cookie: jest.fn() } as unknown as Response<unknown>

      const req = {
        signedCookies: {
          test: {
            firstName: 'Jim',
            lastName: 'Smith',
            prisonId: 'MDI',
          },
        },
      } as unknown as Request

      fixture.update(req, res, {
        firstName: 'James',
      })

      expect(res.cookie).toHaveBeenCalledWith(
        'test',
        {
          firstName: 'James',
          lastName: 'Smith',
          prisonId: 'MDI',
        },
        cookieOptions,
      )
    })
  })

  describe('isStatePresent', () => {
    it('when present', () => {
      const req = {
        signedCookies: { test: 'blah' },
      } as unknown as Request

      const result = fixture.isStatePresent(req)

      expect(result).toStrictEqual(true)
    })

    it('when empty', () => {
      const req = {
        signedCookies: { test: '' },
      } as unknown as Request

      const result = fixture.isStatePresent(req)

      expect(result).toStrictEqual(false)
    })

    it('when absent', () => {
      const req = {
        signedCookies: {},
      } as unknown as Request

      const result = fixture.isStatePresent(req)

      expect(result).toStrictEqual(false)
    })
  })
})
