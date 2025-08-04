import type { Router } from 'express'
import CheckCourtReturnController from './checkCourtReturnController'
import ConfirmCourtReturnAddedToRollController from './confirmCourtReturnAddedToRollController'

import { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabled from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'
import Routes from '../../../../utils/routeBuilder'
import * as backTrackPrevention from '../../../../middleware/backTrackPreventionMiddleware'

export default function routes(services: Services): Router {
  const checkCourtReturnController = new CheckCourtReturnController(
    services.expectedArrivalsService,
    services.raiseAnalyticsEvent,
  )
  const confirmCourtReturnAddedToRollController = new ConfirmCourtReturnAddedToRollController(services.prisonService)
  const checkIsLocked = backTrackPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get(
      '/prisoners/:id/check-court-return',
      checkIsLocked,
      redirectIfDisabled(config.confirmCourtReturnEnabled),
      checkCourtReturnController.checkCourtReturn(),
    )
    .post(
      '/prisoners/:id/check-court-return',
      redirectIfDisabled(config.confirmEnabled),
      checkCourtReturnController.addToRoll(),
    )
    .get(
      '/prisoners/:id/prisoner-returned-from-court',
      checkIsLocked,
      redirectIfDisabled(config.confirmEnabled),
      confirmCourtReturnAddedToRollController.view(),
    )
    .build()
}
