import type { Router } from 'express'
import type { Services } from '../../../../../services'

import SearchForExistingRecordController from './searchForExistingRecordController'
import validationMiddleware from '../../../../../middleware/validationMiddleware'

import Role from '../../../../../authentication/role'
import ChangeNameController from './changeNameController'
import ChangeDateOfBirthController from './changeDateOfBirthController'
import ChangePrisonNumberController from './changePrisonNumberController'
import ChangePncNumberController from './changePncNumberController'
import NameValidator from '../../validation/nameValidation'
import DateOfBirthValidator from '../../validation/dateOfBirthValidation'
import PrisonNumberValidator from '../../validation/prisonNumberValidation'
import { State } from '../../state'
import Routes from '../../../../../utils/routeBuilder'
import config from '../../../../../config'
import redirectIfDisabledMiddleware from '../../../../../middleware/redirectIfDisabledMiddleware'
import * as backTrackPrevention from '../../../../../middleware/backTrackPreventionMiddleware'

export default function routes(services: Services): Router {
  const checkSearchDetailsPresent = State.searchDetails.ensurePresent('/page-not-found')

  const searchForExistingRecordController = new SearchForExistingRecordController(services.expectedArrivalsService)

  const changeNameController = new ChangeNameController()

  const changeDateOfBirthController = new ChangeDateOfBirthController()

  const changePrisonNumberController = new ChangePrisonNumberController()

  const changePncNumberController = new ChangePncNumberController()

  const checkIsLocked = backTrackPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  const routePrefix = `/prisoners/:id/search-for-existing-record`

  return Routes.forRole(Role.PRISON_RECEPTION)

    .get(
      routePrefix,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      searchForExistingRecordController.showSearch(),
    )
    .get(
      `${routePrefix}/new`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      searchForExistingRecordController.newSearch(),
    )
    .post(
      `${routePrefix}`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      searchForExistingRecordController.submitSearch(),
    )

    .get(
      `${routePrefix}/change-name`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changeNameController.showChangeName(),
    )
    .post(
      `${routePrefix}/change-name`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      validationMiddleware(NameValidator),
      changeNameController.changeName(),
    )

    .get(
      `${routePrefix}/change-date-of-birth`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changeDateOfBirthController.showChangeDateOfBirth(),
    )
    .post(
      `${routePrefix}/change-date-of-birth`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      validationMiddleware(DateOfBirthValidator),
      changeDateOfBirthController.changeDateOfBirth(),
    )

    .get(
      `${routePrefix}/change-prison-number`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changePrisonNumberController.showChangePrisonNumber(),
    )
    .post(
      `${routePrefix}/change-prison-number`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      validationMiddleware(PrisonNumberValidator),
      changePrisonNumberController.changePrisonNumber(),
    )
    .get(
      `${routePrefix}/remove-prison-number`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changePrisonNumberController.removePrisonNumber(),
    )

    .get(
      `${routePrefix}/change-pnc-number`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changePncNumberController.showChangePncNumber(),
    )
    .post(
      `${routePrefix}/change-pnc-number`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changePncNumberController.changePncNumber(),
    )
    .get(
      `${routePrefix}/remove-pnc-number`,
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      changePncNumberController.removePncNumber(),
    )

    .build()
}
