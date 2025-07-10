import type { Router } from 'express'
import type { Services } from '../../../services'

import Role from '../../../authentication/role'
import AddPersonalDetailsController from './addPersonalDetailsController'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'
import SearchForExistingRecordController from './searchForExistingRecordsController'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'

import validationMiddleware from '../../../middleware/validationMiddleware'
import DateOfBirthValidation from '../arrivals/validation/dateOfBirthValidation'
import MatchedRecordSelectionValidation from '../arrivals/searchforexisting/validation/matchedRecordSelectionValidation'
import NameValidation from '../arrivals/validation/nameValidation'
import PrisonNumberValidation from './validation/prisonNumberValidation'
import SearchForExistingRecordsDateOfBirthValidation from './validation/SearchForExistingRecordsDateOfBirthValidation'
import SearchForExistingRecordsValidation from './validation/searchForExistingRecordsValidation'
import SexValidation from './validation/sexValidation'
import Routes from '../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)

  const noMatchFoundController = new NoExistingRecordsFoundController()
  const singleMatchFoundController = new SingleExistingRecordFoundController()
  const multipleMatchesFoundController = new MultipleExistingRecordsFoundController(services.expectedArrivalsService)

  const addPersonalDetailsController = new AddPersonalDetailsController()

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get('/manually-confirm-arrival/search-for-existing-record', searchForExistingRecordController.view())

    .post(
      '/manually-confirm-arrival/search-for-existing-record',
      validationMiddleware(
        SearchForExistingRecordsValidation,
        SearchForExistingRecordsDateOfBirthValidation,
        PrisonNumberValidation,
      ),
      searchForExistingRecordController.submit(),
    )
    .get(`/manually-confirm-arrival/search-for-existing-record/no-record-found`, noMatchFoundController.view())
    .post(`/manually-confirm-arrival/search-for-existing-record/no-record-found`, noMatchFoundController.submit())
    .get(`/manually-confirm-arrival/search-for-existing-record/record-found`, singleMatchFoundController.view())
    .get(
      `/manually-confirm-arrival/search-for-existing-record/possible-records-found`,
      multipleMatchesFoundController.view(),
    )
    .post(
      `/manually-confirm-arrival/search-for-existing-record/possible-records-found`,
      validationMiddleware(MatchedRecordSelectionValidation),
      multipleMatchesFoundController.submit(),
    )

    .get('/manually-confirm-arrival/add-personal-details', addPersonalDetailsController.view())
    .post(
      '/manually-confirm-arrival/add-personal-details',
      validationMiddleware(NameValidation, DateOfBirthValidation, SexValidation),
      addPersonalDetailsController.submit(),
    )
    .build()
}
