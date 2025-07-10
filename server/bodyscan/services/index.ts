import { dataAccess } from '../data'
import BodyScanService from './bodyScanService'

export const services = () => {
  const { bodyScanClient } = dataAccess()

  const bodyScanService = new BodyScanService(bodyScanClient())

  return {
    bodyScanService,
  }
}

export type BodyScanServices = ReturnType<typeof services>

export { BodyScanService }
