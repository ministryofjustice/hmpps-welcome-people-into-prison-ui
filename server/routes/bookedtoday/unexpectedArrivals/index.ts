import express, { RequestHandler, Router } from 'express'
import SearchForExistingRecordController from './arrivals/searchForExistingRecordsController'
import NoExistingRecordsFoundController from './arrivals/noExistingRecordsFoundController'
import SingleExistingRecordFoundController from './arrivals/singleExistingRecordFoundController'
import MultipleExistingRecordsFoundController from './arrivals/multipleExistingRecordsFoundController'
import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import Role from '../../../authentication/role'
import validationMiddleware from '../../../middleware/validationMiddleware'
import searchForExistingRecordsValidator from './arrivals/validation/searchForExistingRecordsValidation'

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

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get(
    '/manually-confirm-arrival/search-for-existing-record',
    [searchForExistingRecordController.view()],
    [Role.PRISON_RECEPTION]
  )

  post(
    '/manually-confirm-arrival/search-for-existing-record',
    [validationMiddleware(searchForExistingRecordsValidator), searchForExistingRecordController.submit()],
    [Role.PRISON_RECEPTION]
  )

  const noExistingRecordsFoundController = new NoExistingRecordsFoundController(services.expectedArrivalsService)
  get(
    '/manually-confirm-arrival/search-for-existing-record/no-record-found',
    [noExistingRecordsFoundController.view()],
    [Role.PRISON_RECEPTION]
  )

  const singleExistingRecordFoundController = new SingleExistingRecordFoundController(services.expectedArrivalsService)
  get(
    '/manually-confirm-arrival/search-for-existing-record/record-found',
    [singleExistingRecordFoundController.view()],
    [Role.PRISON_RECEPTION]
  )

  const multipleExistingRecordsFoundController = new MultipleExistingRecordsFoundController(
    services.expectedArrivalsService
  )
  get(
    '/manually-confirm-arrival/search-for-existing-record/possible-records-found',
    [multipleExistingRecordsFoundController.view()],
    [Role.PRISON_RECEPTION]
  )

  return router
}
