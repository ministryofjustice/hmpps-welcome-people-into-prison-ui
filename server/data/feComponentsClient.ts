import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export type AvailableComponent = 'header' | 'footer'

export default class FeComponentsClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('feComponentsApi', config.apis.frontendComponents as ApiConfig, token)
  }

  async getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string
  ): Promise<Record<T[number], Component>> {
    return this.restClient.get({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken },
    }) as Promise<Record<T[number], Component>>
  }
}
