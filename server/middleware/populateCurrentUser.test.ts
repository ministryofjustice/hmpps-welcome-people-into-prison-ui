import type { Request, Response } from 'express'
import UserService from '../services/userService'
import populateCurrentUser from './populateCurrentUser'

jest.mock('../services/userService')
const userService = new UserService(null) as jest.Mocked<UserService>

userService.getUser = jest.fn().mockResolvedValue({})

describe('populateCurrentUser', () => {
  const req = {
    protocol: 'http',
    get: () => 'localhost:5000',
    originalUrl: '/someOriginalUrl',
  } as unknown as Request
  const next = jest.fn()

  it('should define correct returnUrl', async () => {
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService)(req, res, next)
    expect(res.locals.user.returnUrl).toBe('http://localhost:5000/someOriginalUrl')
  })

  it('should bypass redirectUrl creation', async () => {
    const res = { locals: {} } as unknown as Response
    await populateCurrentUser(userService)(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should catch error', async () => {
    userService.getUser.mockRejectedValue(new Error('an error'))
    const res = { locals: { user: {} } } as unknown as Response
    await populateCurrentUser(userService)(req, res, next)
    expect(next).toBeCalledWith(new Error('an error'))
  })
})
