import type { Request, Response } from 'express'
import { UserCaseLoad } from 'welcome'
import populateCurrentUser from './populateCurrentUser'
import { createMockPrisonService, createMockUserService } from '../services/__testutils/mocks'

const userService = createMockUserService()
const prisonService = createMockPrisonService()

const userCaseLoads: UserCaseLoad[] = [
  {
    caseLoadId: 'MDI',
    description: 'Moorland (HMP & YOI)',
  },
  {
    caseLoadId: 'NMI',
    description: 'Nottingham (HMP)',
  },
]

userService.getUser = jest.fn().mockResolvedValue({})
userService.getUserCaseLoads = jest.fn().mockResolvedValue(userCaseLoads)
prisonService.getPrison = jest.fn().mockResolvedValue({ prisonName: 'Moorland (HMP & YOI)' })

describe('populateCurrentUser', () => {
  const req = {
    protocol: 'http',
    get: () => 'localhost:5000',
    originalUrl: '/someOriginalUrl',
  } as unknown as Request
  const next = jest.fn()

  it('should define correct returnUrl', async () => {
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService, prisonService)(req, res, next)
    expect(res.locals.user.returnUrl).toBe('http://localhost:5000/someOriginalUrl')
  })

  it('should bypass redirectUrl creation', async () => {
    const res = { locals: {} } as unknown as Response
    await populateCurrentUser(userService, prisonService)(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should store activeCaseLoad in response', async () => {
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService, prisonService)(req, res, next)
    expect(res.locals.user.activeCaseLoad).toEqual({ prisonName: 'Moorland (HMP & YOI)' })
  })

  it('should store userCaseloads in response', async () => {
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService, prisonService)(req, res, next)
    expect(res.locals.user.userCaseLoads).toEqual(userCaseLoads)
  })

  it('should catch error', async () => {
    userService.getUser.mockRejectedValue(new Error('an error'))
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService, prisonService)(req, res, next)
    expect(next).toBeCalledWith(new Error('an error'))
  })
})
