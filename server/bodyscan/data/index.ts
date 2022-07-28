import type { RestClientBuilder } from '../../data'
import BodyScanClient from './bodyScanClient'

export const dataAccess = () => {
  return {
    bodyScanClient: ((token: string) => new BodyScanClient(token)) as RestClientBuilder<BodyScanClient>,
  }
}
export type BodyScanDataAccess = ReturnType<typeof dataAccess>

export { BodyScanClient }
