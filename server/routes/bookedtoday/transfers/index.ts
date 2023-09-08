import type { Router } from 'express'
import type { Services } from '../../../services'

import CheckTransferController from './checkTransferController'
import ConfirmTransferAddedToRollController from './confirmTransferAddedToRollController'

import Role from '../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../config'
import Routes from '../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const checkTransferController = new CheckTransferController(services.transfersService, services.raiseAnalyticsEvent)

  const confirmTransferAddedToRollController = new ConfirmTransferAddedToRollController(services.prisonService)

  return Routes.forRole(Role.PRISON_RECEPTION)

    .get(
      '/prisoners/:prisonNumber/check-transfer',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkTransferController.checkTransfer()
    )
    .post(
      '/prisoners/:prisonNumber/check-transfer',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkTransferController.addToRoll()
    )
    .get('/prisoners/:prisonNumber/confirm-transfer', confirmTransferAddedToRollController.view())
    .build()
}
