import express, { RequestHandler, Router } from 'express'
import SearchForExistingRecordController from './searchForExistingRecordController'

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

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get(
    '/prisoners/:id/search-for-existing-record',
    [searchForExistingRecordController.showSearch()],
    [Role.PRISON_RECEPTION]
  )

  return router
}
