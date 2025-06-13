import { Response, Router } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import { ManagementReportDefinition } from 'welcome'
import config from '../../config'
import ExpectedArrivalsService from '../../services/expectedArrivalsService'
import { Services } from '../../services'

let definitionsRoutesInitialised: boolean = false

async function populateRoutes(
  expectedArrivalsService: ExpectedArrivalsService,
  token: string,
  router: Router
): Promise<ManagementReportDefinition[]> {
  const allDefinitions = await expectedArrivalsService.getManagementReportDefinitions(token)
  if (definitionsRoutesInitialised === false) {
    for (const definition of allDefinitions) {
      for (const variant of definition.variants) {
        router.get(
          `/management-reporting/${definition.id}-${variant.id}`,
          ReportListUtils.createReportListRequestHandler({
            title: variant.name,
            definitionName: definition.id,
            variantName: variant.id,
            apiUrl: config.apis.welcome.url,
            apiTimeout: config.apis.welcome.timeout.deadline,
            layoutTemplate: 'partials/dprLayout.njk',
            tokenProvider: (_, res: Response) => {
              return res.locals.systemToken
            },
          })
        )
      }
    }
    definitionsRoutesInitialised = true
  }
  return allDefinitions
}

// eslint-disable-next-line import/prefer-default-export
export function dprRouter(services: Services): Router {
  const router = Router()
  if (config.loadReportDefinitionsOnStartup === true && definitionsRoutesInitialised === false) {
    services.authService
      .getSystemClientToken()
      .then(token => populateRoutes(services.expectedArrivalsService, token, router))
  }

  router.get('/management-reporting', async (req, res) => {
    const definitions = await populateRoutes(services.expectedArrivalsService, res.locals.systemToken, router)
    res.render('pages/managementReporting/index.njk', { definitions })
  })

  return router
}