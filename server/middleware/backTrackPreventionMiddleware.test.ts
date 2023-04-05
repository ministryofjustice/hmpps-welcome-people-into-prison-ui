import { setLock, isLocked } from './backTrackPreventionMiddleware'
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

  describe('double click prevention middleware', () => {
    describe('setLock', () => {
      test('successfully sets lock', async () => {
        req.params.id = 'some-move-id'
        lockManager.lock.mockResolvedValue(true)

        await setLock(lockManager, '/some-where')(req, res, next)

        expect(lockManager.lock).toHaveBeenCalledWith('some-move-id', 30)
        expect(next).toHaveBeenCalledWith()
      })

      test('fails to set lock', async () => {
        req.params.id = 'some-move-id'
        lockManager.lock.mockResolvedValue(false)

        await setLock(lockManager, '/some-where')(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/some-where')
      })
    })

    describe('isLocked', () => {
      test('successfully checks lock', async () => {
        lockManager.lock.mockResolvedValue(true)
        req.params.id = 'some-move-id'

        await isLocked(lockManager, '/some-where')(req, res, next)

        expect(lockManager.isLocked).toHaveBeenCalledWith('some-move-id')
        expect(next).toHaveBeenCalledWith()
      })
    })
  })
})
