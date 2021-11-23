import { RequestHandler } from 'express'
import logger from '../../logger'
import type UserService from '../services/userService'
import type ExpectedArrivalsServices from '../services/expectedArrivalsService'
import config from '../config'

export default function populateCurrentUser(
  userService: UserService,
  expectedArrivalsServices: ExpectedArrivalsServices
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (user) {
          const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
          const clientID = config.apis.hmppsAuth.apiClientId
          const activeCaseLoad = await expectedArrivalsServices.getPrison(user.activeCaseLoadId)

          res.locals.user = { ...user, ...res.locals.user, returnUrl, clientID, activeCaseLoad }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user?.username}`)
      next(error)
    }
  }
}
