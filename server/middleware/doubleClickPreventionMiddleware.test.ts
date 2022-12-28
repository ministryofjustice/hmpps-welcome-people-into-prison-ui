import { lockIdGenerator, obtainLock } from './doubleClickPreventionMiddleware'
import { mockNext, mockRequest, mockResponse } from '../routes/__testutils/requestTestUtils'
import { createLockManager } from '../data/__testutils/mocks'

describe('caseloadCheck', () => {
  const req = mockRequest({})
  const res = mockResponse({})
  const next = mockNext()
  const lockManager = createLockManager()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('lockIdGenerator', () => {
    test('should generate random ID', done => {
      lockIdGenerator()(req, res, () => {
        expect(res.locals.lockId).not.toBeNull()
        done()
      })
    })
  })

  describe('obtainLock', () => {
    test('errors when no lock id present in request', async () => {
      expect(() => obtainLock(lockManager, '/some-where')(req, res, next)).rejects.toThrow('No lock ID present!')
    })

    test('successfully obtains lock', async () => {
      req.body.lockId = 'some-lock'
      lockManager.lock.mockResolvedValue(true)

      await obtainLock(lockManager, '/some-where')(req, res, next)

      expect(lockManager.lock).toHaveBeenCalledWith('some-lock', 30)
      expect(next).toHaveBeenCalledWith()
    })

    test('fails to obtain lock', async () => {
      req.body.lockId = 'some-lock'
      lockManager.lock.mockResolvedValue(false)

      await obtainLock(lockManager, '/some-where')(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/some-where')
    })
  })
})
