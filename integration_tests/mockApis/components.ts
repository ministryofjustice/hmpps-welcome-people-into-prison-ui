import { stubFor } from './wiremock'

export default {
  stubComponents: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/components/components\\?component=header&component=footer',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
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
  },
  stubComponentsFail: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/components/components\\?component=header&component=footer',
      },
      response: {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },
}
