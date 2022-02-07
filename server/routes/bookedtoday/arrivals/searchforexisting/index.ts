import express, { RequestHandler, Router } from 'express'
import SearchForExistingRecordController from './searchForExistingRecordController'

import authorisationForUrlMiddleware from '../../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import ChangeNameController from './changeNameController'
import ChangeDateOfBirthController from './changeDateOfBirthController'
import ChangePrisonNumberController from './changePrisonNumberController'
import ChangePncNumberController from './changePncNumberController'
import { State } from './state'

export default function routes(services: Services): Router {
  const router = express.Router()

  const checkSearchDetailsPresent = State.searchDetails.ensurePresent('/')

  const get = (path: string, handlers: RequestHandler[]) =>
    router.get(
      `/prisoners/:id/search-for-existing-record${path}`,
      authorisationForUrlMiddleware([Role.PRISON_RECEPTION]),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[]) =>
    router.post(
      `/prisoners/:id/search-for-existing-record${path}`,
      authorisationForUrlMiddleware([Role.PRISON_RECEPTION]),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get('', [searchForExistingRecordController.showSearch()])

  const changeNameController = new ChangeNameController()
  get('/change-name', [checkSearchDetailsPresent, changeNameController.showChangeName()])
  post('/change-name', [checkSearchDetailsPresent, changeNameController.changeName()])

  const changeDateOfBirthController = new ChangeDateOfBirthController()
  get('/change-date-of-birth', [checkSearchDetailsPresent, changeDateOfBirthController.showChangeDateOfBirth()])
  post('/change-date-of-birth', [checkSearchDetailsPresent, changeDateOfBirthController.changeDateOfBirth()])

  const changePrisonNumberController = new ChangePrisonNumberController()
  get('/change-prison-number', [checkSearchDetailsPresent, changePrisonNumberController.showChangePrisonNumber()])
  post('/change-prison-number', [checkSearchDetailsPresent, changePrisonNumberController.changePrisonNumber()])
  get('/remove-prison-number', [checkSearchDetailsPresent, changePrisonNumberController.removePrisonNumber()])

  const changePncNumberController = new ChangePncNumberController()
  get('/change-pnc-number', [checkSearchDetailsPresent, changePncNumberController.showChangePncNumber()])
  post('/change-pnc-number', [checkSearchDetailsPresent, changePncNumberController.changePncNumber()])
  get('/remove-pnc-number', [checkSearchDetailsPresent, changePncNumberController.removePncNumber()])

  return router
}
