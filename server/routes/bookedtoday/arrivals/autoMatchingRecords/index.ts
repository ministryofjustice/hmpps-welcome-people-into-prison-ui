import express, { RequestHandler, Router } from 'express'
import SingleMatchingRecordFoundController from './singleMatchingRecordFoundController'
import NoMatchingRecordsFoundController from './noMatchingRecordsFoundController'
import MultipleExistingsRecordsFoundController from './multipleExistingRecordsFoundController'

import authorisationForUrlMiddleware from '../../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const singleMatchingRecordFoundController = new SingleMatchingRecordFoundController(services.expectedArrivalsService)
  get('/prisoners/:id/record-found', [singleMatchingRecordFoundController.view()], [Role.PRISON_RECEPTION])

  const noMatchingRecordsFoundController = new NoMatchingRecordsFoundController(services.expectedArrivalsService)
  get('/prisoners/:id/no-record-found', [noMatchingRecordsFoundController.view()], [Role.PRISON_RECEPTION])

  const multipleExistingRecordsFoundController = new MultipleExistingsRecordsFoundController()
  get('/prisoners/:id/possible-matches-found', [multipleExistingRecordsFoundController.view()], [Role.PRISON_RECEPTION])

  return router
}
