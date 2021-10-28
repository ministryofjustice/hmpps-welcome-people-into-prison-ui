import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import config from '../config'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (user) {
          const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
          const clientID = config.apis.hmppsAuth.apiClientId
          res.locals.user = { ...user, ...res.locals.user, returnUrl, clientID }
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
