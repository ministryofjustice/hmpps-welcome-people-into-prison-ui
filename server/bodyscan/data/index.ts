import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../config'
import logger from '../../../logger'
import BodyScanClient from './bodyScanClient'
import { redisClient } from '../../data/redisClient'

export const dataAccess = () => {
  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger)

  return {
    bodyScanClient: () => new BodyScanClient(redisClient, authenticationClient),
  }
}

export type BodyScanDataAccess = ReturnType<typeof dataAccess>

export { BodyScanClient }
