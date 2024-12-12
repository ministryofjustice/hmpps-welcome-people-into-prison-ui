import type { Request, Response } from 'express'

import Role from '../authentication/role'
import authorisationForUrlMiddleware from './authorisationForUrlMiddleware'

describe('authorisationMiddlewareForUrl', () => {
  let req: Request
  const next = jest.fn()

  function createResWithRole(role?: Role): Response {
    return {
      locals: {
        user: {
          roles: role !== undefined ? [role] : [],
        },
      },
      redirect: (redirectUrl: string) => {
        return redirectUrl
      },
    } as unknown as Response
  }

  it('should return next when no required roles', () => {
    const res = createResWithRole(Role.PRISON_RECEPTION)

    const authorisationResponse = authorisationForUrlMiddleware()(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })

  it('should redirect when user has no authorised roles', () => {
    const res = createResWithRole()

    const authorisationResponse = authorisationForUrlMiddleware([Role.PRISON_RECEPTION])(req, res, next)

    expect(authorisationResponse).toEqual('/autherror')
  })

  it('should return next when user has authorised role', () => {
    const res = createResWithRole(Role.PRISON_RECEPTION)

    const authorisationResponse = authorisationForUrlMiddleware([Role.PRISON_RECEPTION])(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })
})
