import { Services } from '../../services'
import { dataAccess } from '../data'
import BodyScanService from './bodyScanService'

export const services = ({ hmppsAuthClient }: Services) => {
  const { bodyScanClient } = dataAccess()

  const bodyScanService = new BodyScanService(hmppsAuthClient, bodyScanClient)

  return {
    bodyScanService,
  }
}

export type BodyScanServices = ReturnType<typeof services>

export { BodyScanService }
