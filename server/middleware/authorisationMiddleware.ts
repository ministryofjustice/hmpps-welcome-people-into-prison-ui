import jwtDecode from 'jwt-decode'
import { RequestHandler } from 'express'

import logger from '../../logger'
import Role from '../authentication/role'
import asyncMiddleware from './asyncMiddleware'

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    if (res.locals && res.locals.user && res.locals.user.token) {
      // @ts-ignore
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      res.locals.user = {
        roles,
        isReceptionUser: roles.includes(Role.PRISON_RECEPTION),
        ...res.locals.user,
      }
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
