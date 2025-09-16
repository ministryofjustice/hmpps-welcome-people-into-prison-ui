import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import SummaryController from './summaryController'

import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'
import SummaryWithRecordController from './summaryWithRecordController'
import SummaryMoveOnlyController from './summaryMoveOnlyController'
import SummaryTransferController from './transfers/summaryTransferController'

import * as backTrackPrevention from '../../middleware/backTrackPreventionMiddleware'
import redirectIfDisabledMiddleware from '../../middleware/redirectIfDisabledMiddleware'
import config from '../../config'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  const summaryWithRecordController = new SummaryWithRecordController(services.expectedArrivalsService)
  const summaryMoveOnlyController = new SummaryMoveOnlyController(services.expectedArrivalsService)
  const summaryTransferController = new SummaryTransferController(services.transfersService)
  const summaryController = new SummaryController(services.expectedArrivalsService)
  const checkIsLocked = backTrackPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner/:id/summary', checkIsLocked, summaryController.redirectToSummary())
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', checkIsLocked, choosePrisonerController.redirectToConfirm())

    .get(
      '/prisoners/:prisonNumber/summary-transfer',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      summaryTransferController.summaryTransfer(),
    )
    .get('/prisoners/:id/summary-with-record', checkIsLocked, summaryWithRecordController.view())
    .get('/prisoners/:id/summary-move-only', checkIsLocked, summaryMoveOnlyController.view())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))

    .build()
}
