import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'
import Role from '../../authentication/role'
import SummaryWithRecordController from './summaryWithRecordController'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  const summaryWithRecordController = new SummaryWithRecordController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', choosePrisonerController.redirectToConfirm())

    .forRole(Role.PRISON_RECEPTION)
    .get('/prisoners/:id/summary-with-record', summaryWithRecordController.view())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))

    .build()
}
