import { Router } from 'express'
import type { BodyScanServices } from '../services'
import BodyScanValidator from '../validation/bodyScanValidation'
import validationMiddleware from '../../middleware/validationMiddleware'
import BodyScanController from './bodyScanController'
import Routes from '../../utils/routeBuilder'
import ScanConfirmationController from './scanConfirmationController'

export default function routes({ bodyScanService }: BodyScanServices): Router {
  const bodyScan = new BodyScanController(bodyScanService)
  const scanConfirmation = new ScanConfirmationController(bodyScanService)

  return Routes.forAnyRole()
    .get('/prisoners/:prisonNumber/record-body-scan', bodyScan.view())
    .post('/prisoners/:prisonNumber/record-body-scan', validationMiddleware(BodyScanValidator), bodyScan.submit())
    .get('/prisoners/:prisonNumber/scan-confirmation', scanConfirmation.view())
    .build()
}
