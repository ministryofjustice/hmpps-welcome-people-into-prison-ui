import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'
import Role from '../authentication/role'
import authorisationForUrlMiddleware from './authorisationForUrlMiddleware'

describe('authorisationMiddlewareForUrl', () => {
  let req: Request
  const next = jest.fn()

  function createResWithRole(role?: Role): Response {
    return {
      locals: {
        user: {
          roles: [role] || null,
        },
      },
      redirect: (redirectUrl: string) => {
        return redirectUrl
      },
    } as unknown as Response
  }

  it('should return next when no required roles', () => {
    const res = createResWithRole(Role.RECEPTION_USER)

    const authorisationResponse = authorisationForUrlMiddleware()(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })

  it('should redirect when user has no authorised roles', () => {
    const res = createResWithRole()

    const authorisationResponse = authorisationForUrlMiddleware([Role.RECEPTION_USER])(req, res, next)

    expect(authorisationResponse).toEqual('/autherror')
  })

  it('should return next when user has authorised role', () => {
    const res = createResWithRole(Role.RECEPTION_USER)

    const authorisationResponse = authorisationForUrlMiddleware([Role.RECEPTION_USER])(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })
})
