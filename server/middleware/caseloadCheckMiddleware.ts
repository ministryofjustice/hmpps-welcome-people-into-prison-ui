import { RequestHandler } from 'express'
import logger from '../../logger'

export default function caseloadCheckMiddleware(enabledPrisons: string[]): RequestHandler {
  return (req, res, next) => {
    if (enabledPrisons.includes(res.locals.user?.activeCaseLoadId)) {
      return next()
    }
    logger.warn('User is not authorised to access this')
    return res.redirect('/authError')
  }
}
