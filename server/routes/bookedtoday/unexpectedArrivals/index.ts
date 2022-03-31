import express, { RequestHandler, Router } from 'express'
import AddPersonalDetailsController from './addPersonalDetailsController'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import DateOfBirthValidation from '../arrivals/validation/dateOfBirthValidation'
import MatchedRecordSelectionValidation from '../arrivals/searchforexisting/validation/matchedRecordSelectionValidation'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import NameValidation from '../arrivals/validation/nameValidation'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'
import Role from '../../../authentication/role'
import PncNumberValidation from './validation/pncNumberValidation'
import PrisonNumberValidation from './validation/prisonNumberValidation'
import SearchForExistingRecordController from './searchForExistingRecordsController'
import SearchForExistingRecordsDateOfBirthValidation from './validation/SearchForExistingRecordsDateOfBirthValidation'
import SearchForExistingRecordsValidation from './validation/searchForExistingRecordsValidation'
import { Services } from '../../../services'
import SexValidation from './validation/sexValidation'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'
import validationMiddleware from '../../../middleware/validationMiddleware'

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
