import express, { RequestHandler, Router } from 'express'
import SearchForExistingRecordController from './searchForExistingRecordsController'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import Role from '../../../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      `/manually-confirm-arrival/search-for-existing-record${path}`,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      `/manually-confirm-arrival/search-for-existing-record${path}`,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get('', [searchForExistingRecordController.view()], [Role.PRISON_RECEPTION])

  post('', [searchForExistingRecordController.submit()], [Role.PRISON_RECEPTION])

  const noExistingRecordsFoundController = new NoExistingRecordsFoundController()
  get('/no-record-found', [noExistingRecordsFoundController.view()], [Role.PRISON_RECEPTION])

  const singleExistingRecordFoundController = new SingleExistingRecordFoundController()
  get('/record-found', [singleExistingRecordFoundController.view()], [Role.PRISON_RECEPTION])

  const multipleExistingRecordsFoundController = new MultipleExistingRecordsFoundController()
  get('/possible-records-found', [multipleExistingRecordsFoundController.view()], [Role.PRISON_RECEPTION])

  return router
}
