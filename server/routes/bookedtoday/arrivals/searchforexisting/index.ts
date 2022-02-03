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

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[]) =>
    router.get(
      `/prisoners/:id/search-for-existing-record${path}`,
      authorisationForUrlMiddleware([Role.PRISON_RECEPTION]),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get('', [searchForExistingRecordController.showSearch()])

  const changeNameController = new ChangeNameController(services.expectedArrivalsService)
  get('/change-name', [changeNameController.showChangeName()])

  const changeDateOfBirthController = new ChangeDateOfBirthController(services.expectedArrivalsService)
  get('/change-date-of-birth', [changeDateOfBirthController.showChangeDateOfBirth()])

  const changePrisonNumberController = new ChangePrisonNumberController(services.expectedArrivalsService)
  get('/change-prison-number', [changePrisonNumberController.showChangePrisonNumber()])

  const changePncNumberController = new ChangePncNumberController(services.expectedArrivalsService)
  get('/change-pnc-number', [changePncNumberController.showChangePncNumber()])

  return router
}
