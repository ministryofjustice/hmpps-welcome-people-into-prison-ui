import express, { RequestHandler, Router } from 'express'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'

import authorisationForUrlMiddleware from '../../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import MatchedRecordSelectionValidation from './validation/matchedRecordSelectionValidation'

import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'
import { State } from '../state'
import searchRoutes from './search'

export default function routes(services: Services): Router {
  const router = express.Router()

  const checkSearchDetailsPresent = State.searchDetails.ensurePresent('/')
  const checkNewArrivalPresent = State.newArrival.ensurePresent('/')

  const get = (path: string, handlers: RequestHandler[]) =>
    router.get(
      `/prisoners/:id/search-for-existing-record${path}`,
      authorisationForUrlMiddleware([Role.PRISON_RECEPTION]),
      [
        redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
        ...handlers.map(handler => asyncMiddleware(handler)),
      ]
    )

  const post = (path: string, handlers: RequestHandler[]) =>
    router.post(
      `/prisoners/:id/search-for-existing-record${path}`,
      authorisationForUrlMiddleware([Role.PRISON_RECEPTION]),
      [
        redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
        ...handlers.map(handler => asyncMiddleware(handler)),
      ]
    )

  const multipleExistingRecordsFoundController = new MultipleExistingRecordsFoundController(
    services.expectedArrivalsService
  )
  get('/possible-records-found', [checkSearchDetailsPresent, multipleExistingRecordsFoundController.view()])
  post('/possible-records-found', [
    checkSearchDetailsPresent,
    validationMiddleware(MatchedRecordSelectionValidation),
    multipleExistingRecordsFoundController.submit(),
  ])

  const singleExistingRecordFoundController = new SingleExistingRecordFoundController()
  get('/record-found', [checkNewArrivalPresent, checkSearchDetailsPresent, singleExistingRecordFoundController.view()])

  const noExistingRecordsFoundController = new NoExistingRecordsFoundController(services.expectedArrivalsService)
  get('/no-record-found', [noExistingRecordsFoundController.view()])

  router.use(searchRoutes(services))

  return router
}
