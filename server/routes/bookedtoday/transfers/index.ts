import express, { RequestHandler, Router } from 'express'
import CheckTransferController from './checkTransferController'
import ConfirmTransferAddedToRollController from './confirmTransferAddedToRollController'

import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type { Services } from '../../../services'
import Role from '../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../config'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const checkTransferController = new CheckTransferController(services.transfersService)
  get(
    '/prisoners/:prisonNumber/check-transfer',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTransferController.checkTransfer()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:prisonNumber/check-transfer',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTransferController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmTransferAddedToRollController = new ConfirmTransferAddedToRollController(services.prisonService)
  get(
    '/prisoners/:prisonNumber/confirm-transfer',
    [confirmTransferAddedToRollController.view()],
    [Role.PRISON_RECEPTION]
  )

  return router
}
