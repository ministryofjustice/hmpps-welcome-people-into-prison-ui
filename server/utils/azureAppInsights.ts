import { config } from 'dotenv'
import { Contracts, defaultClient, DistributedTracingModes, setup, TelemetryClient } from 'applicationinsights'
import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { ClientRequest, RequestOptions } from 'http'
import applicationVersion from '../applicationVersion'

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

function version(): string {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export function initialiseAppInsights(): void {
  // Loads .env file contents into | process.env
  config()
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(name = defaultName()): TelemetryClient {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    return defaultClient
  }
  return null
}

export function addUserDataToRequests(
  envelope: EnvelopeTelemetry,
  contextObjects: RequestOptions | ClientRequest | Error
) {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username, activeCaseLoadId, isReceptionUser } =
      contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    const { properties } = envelope.data.baseData
    // eslint-disable-next-line no-param-reassign
    envelope.data.baseData.properties = {
      username,
      activeCaseLoadId,
      isReceptionUser,
      ...properties,
    }
  }
  return true
}
