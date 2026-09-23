import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import { initAll as initDprFrontend } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/all'

govukFrontend.initAll()
mojFrontend.initAll()
initDprFrontend()
