import { stubFor } from './wiremock'

const componentsUrl = '/components'

const stubComponents = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: componentsUrl,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        header: {
          html: '<header><h1>Common Components Header</h1></header>',
          javascript: [],
          css: [],
        },
        footer: {
          html: '<footer><h1>Common Components Footer</h1></footer>',
          javascript: [],
          css: [],
        },
      },
    },
  })

const stubComponentsFail = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: componentsUrl,
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        message: 'Component service unavailable',
      },
    },
  })

export default {
  stubComponents,
  stubComponentsFail,
}
