import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'
import Role from '../../authentication/role'
import SummaryWithRecordController from './summaryWithRecordController'
import SummaryWithoutRecordController from './summaryWithoutRecordController'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  const summaryWithRecordController = new SummaryWithRecordController(services.expectedArrivalsService)
  const summaryWithoutRecordController = new SummaryWithoutRecordController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', choosePrisonerController.redirectToConfirm())

    .forRole(Role.PRISON_RECEPTION)
    .get('/prisoners/:id/summary-with-record', summaryWithRecordController.view())
    .get('/prisoners/:id/summary-without-record', summaryWithoutRecordController.view())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))

    .build()
}
