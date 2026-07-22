import { RequestHandler } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import logger from '../../logger'
import type { UserService, PrisonService } from '../services'
import config from '../config'

export default function populateCurrentUser(userService: UserService, prisonService: PrisonService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (user) {
          const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
          const clientID = config.apis.hmppsAuth.apiClientId
          const activeCaseLoad = await prisonService.getPrison(user.activeCaseLoadId)
          const userCaseLoads = await userService.getUserCaseLoads(res.locals.user.token)

          res.locals.user = {
            ...user,
            ...res.locals.user,
            returnUrl,
            clientID,
            activeCaseLoad,
            userCaseLoads,
          }

          telemetry.setSpanAttributes({
            username: res.locals.user.username,
            activeCaseLoadId: res.locals.user.activeCaseLoadId,
            isReceptionUser: res.locals.user.isReceptionUser,
          })
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
