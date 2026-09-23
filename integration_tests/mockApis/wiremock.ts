import superagent, { SuperAgentRequest, Response } from 'superagent'
import resetRedisDb from './redis'

const url = 'http://localhost:9091/__admin'

const stubFor = async (mapping: Record<string, unknown>): Promise<SuperAgentRequest> => {
  const response = await superagent.post(`${url}/mappings`).send(mapping)

  if (response.status >= 400) {
    throw new Error(`WireMock rejected mapping (${response.status}): ${JSON.stringify(response.body)}`)
  }

  return null
}

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const getMatchingRequests = body => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`), resetRedisDb()])

export const stubPing = async (urlPrefix: string, httpStatus = 200): Promise<SuperAgentRequest> =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `${urlPrefix}/health/ping`,
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export { stubFor, getRequests, resetStubs, getMatchingRequests }
