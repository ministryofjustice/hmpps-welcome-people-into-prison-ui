import { RequestHandler } from 'express'

import logger from '../../logger'
import Role from '../authentication/role'

export default function authorisationForUrlMiddleware(authorisedRoles: Role[] = []): RequestHandler {
  return (req, res, next) => {
    logger.info(authorisedRoles)
    if (authorisedRoles.length && !res.locals.user.roles.some((role: Role) => authorisedRoles.includes(role))) {
      logger.error('User is not authorised to access this URL')
      return res.redirect('/autherror')
    }
    return next()
  }
}
