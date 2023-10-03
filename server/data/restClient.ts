import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'

interface GetRequest {
  path?: string
  query?: Record<string, string>
  testQuery?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
  timeout?: Parameters<superagent.Request['timeout']>[0]
  retryCount?: number
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: string | object
  raw?: boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export default class RestClient {
  agent: Agent

  constructor(private readonly name: string, private readonly config: ApiConfig, private readonly token: string) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  async get({
    path = null,
    query = {},
    headers = {},
    responseType = '',
    raw = false,
    timeout = this.timeoutConfig(),
    retryCount = 2,
  }: GetRequest): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(retryCount, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(timeout)

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<unknown> {
    logger.info(`Post using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  public pipeIntoStream(stream: NodeJS.WritableStream, { path = null, headers = {} }: StreamRequest = {}) {
    superagent
      .get(`${this.apiUrl()}${path}`)
      .agent(this.agent)
      .auth(this.token, { type: 'bearer' })
      .retry(2, (err, res) => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .timeout(this.timeoutConfig())
      .set(headers)
      .pipe(stream)
  }

  async stream({ path = null, headers = {} }: StreamRequest = {}): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            logger.info(`Error calling ${this.name}, streaming path: ${path}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }
}
