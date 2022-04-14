import express, { RequestHandler, Router } from 'express'
import Role from '../../../authentication/role'
import { Services } from '../../../services'
import AddPersonalDetailsController from './addPersonalDetailsController'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'
import SearchForExistingRecordController from './searchForExistingRecordsController'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import validationMiddleware from '../../../middleware/validationMiddleware'
import DateOfBirthValidation from '../arrivals/validation/dateOfBirthValidation'
import MatchedRecordSelectionValidation from '../arrivals/searchforexisting/validation/matchedRecordSelectionValidation'
import NameValidation from '../arrivals/validation/nameValidation'
import PncNumberValidation from '../validation/pncNumberValidation'
import PrisonNumberValidation from './validation/prisonNumberValidation'
import SearchForExistingRecordsDateOfBirthValidation from './validation/SearchForExistingRecordsDateOfBirthValidation'
import SearchForExistingRecordsValidation from './validation/searchForExistingRecordsValidation'
import SexValidation from './validation/sexValidation'

export default function routes(services: Services): Router {
  const router = express.Router()
  const search = '/search-for-existing-record'

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      `/manually-confirm-arrival${path}`,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      `/manually-confirm-arrival${path}`,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)
  get('/search-for-existing-record', [searchForExistingRecordController.view()], [Role.PRISON_RECEPTION])

  post(
    '/search-for-existing-record',
    [
      validationMiddleware(
        SearchForExistingRecordsValidation,
        SearchForExistingRecordsDateOfBirthValidation,
        PrisonNumberValidation,
        PncNumberValidation
      ),
      searchForExistingRecordController.submit(),
    ],
    [Role.PRISON_RECEPTION]
  )

  const noExistingRecordsFoundController = new NoExistingRecordsFoundController()
  get(`${search}/no-record-found`, [noExistingRecordsFoundController.view()], [Role.PRISON_RECEPTION])
  post(`${search}/no-record-found`, [noExistingRecordsFoundController.submit()], [Role.PRISON_RECEPTION])

  const singleExistingRecordFoundController = new SingleExistingRecordFoundController()
  get(`${search}/record-found`, [singleExistingRecordFoundController.view()], [Role.PRISON_RECEPTION])

  const multipleExistingRecordsFoundController = new MultipleExistingRecordsFoundController(
    services.expectedArrivalsService
  )
  get(`${search}/possible-records-found`, [multipleExistingRecordsFoundController.view()], [Role.PRISON_RECEPTION])

  post(
    `${search}/possible-records-found`,
    [validationMiddleware(MatchedRecordSelectionValidation), multipleExistingRecordsFoundController.submit()],
    [Role.PRISON_RECEPTION]
  )

  const addPersonalDetailsController = new AddPersonalDetailsController()
  get('/add-personal-details', [addPersonalDetailsController.view()], [Role.PRISON_RECEPTION])

  post(
    '/add-personal-details',
    [validationMiddleware(NameValidation, DateOfBirthValidation, SexValidation), addPersonalDetailsController.submit()],
    [Role.PRISON_RECEPTION]
  )

  return router
}
