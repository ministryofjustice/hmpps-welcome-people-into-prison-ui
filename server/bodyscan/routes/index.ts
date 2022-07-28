import { Router } from 'express'
import type { BodyScanServices } from '../services'
import BodyScanValidator from '../validation/bodyScanValidation'
import validationMiddleware from '../../middleware/validationMiddleware'
import BodyScanController from './bodyScanController'
import Routes from '../../utils/routeBuilder'

export default function routes(services: BodyScanServices): Router {
  const bodyScan = new BodyScanController(services.bodyScanService)

  return Routes.forAnyRole()
    .get('/prisoners/:prisonNumber/record-body-scan', bodyScan.view())
    .post('/prisoners/:prisonNumber/record-body-scan', validationMiddleware(BodyScanValidator), bodyScan.submit())
    .build()
}
