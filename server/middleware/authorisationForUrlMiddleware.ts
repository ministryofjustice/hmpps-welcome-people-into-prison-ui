import { RequestHandler } from 'express'

import logger from '../../logger'
import Role from '../authentication/role'

export default function authorisationForUrlMiddleware(authorisedRoles: Role[] = []): RequestHandler {
  return (req, res, next) => {
    if (authorisedRoles.length && !res.locals.user.userRoles.some((role: Role) => authorisedRoles.includes(role))) {
      logger.error('User is not authorised to access this URL')
      return res.redirect('/autherror')
    }
    return next()
  }
}
