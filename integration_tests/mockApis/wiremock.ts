import superagent, { SuperAgentRequest, Response } from 'superagent'
import resetRedisDb from './redis'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const getMatchingRequests = body => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`), resetRedisDb()])

export { stubFor, getRequests, resetStubs, getMatchingRequests }
