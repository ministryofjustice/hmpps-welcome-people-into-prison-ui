import { Request, Router } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import type { ManagementReportDefinition } from 'management-reporting'
import type { ResponseError } from 'superagent'
import config from '../../config'
import { Services } from '../../services'
import DprService from '../../services/dprService'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import Role from '../../authentication/role'

let definitionsRoutesInitialised: boolean = false

async function populateRoutes(
  dprService: DprService,
  token: string,
  router: Router,
): Promise<ManagementReportDefinition[]> {
  const allDefinitions = await dprService.getManagementReportDefinitions(token)
  if (definitionsRoutesInitialised === false) {
    for (const definition of allDefinitions) {
      for (const variant of definition.variants) {
        router.get(
          `/management-reporting/${definition.id}-${variant.id}`,
          protectRoute(),
          ReportListUtils.createReportListRequestHandler({
            title: variant.name,
            definitionName: definition.id,
            variantName: variant.id,
            apiUrl: config.apis.welcome.url,
            apiTimeout: config.apis.welcome.timeout.deadline,
            layoutTemplate: 'partials/dprLayout.njk',
            tokenProvider: (req: Request) => {
              return req.session.systemToken
            },
          }),
        )
      }
    }
    definitionsRoutesInitialised = true
  }
  return allDefinitions
}

// eslint-disable-next-line import/prefer-default-export
export function dprRouter(router: Router, services: Services): Router {
  if (config.loadReportDefinitionsOnStartup === true && definitionsRoutesInitialised === false) {
    services.hmppsAuthClient.getSystemClientToken().then(token => populateRoutes(services.dprService, token, router))
  }

  router.get('/management-reporting', protectRoute(), async (req, res) => {
    const definitions = await populateRoutes(services.dprService, req.session.systemToken, router)
    res.render('pages/managementReporting/index.njk', { definitions })
  })

  return router
}

function protectRoute() {
  return asyncMiddleware((req, _res, next) => {
    if (_res.locals.user.isReportUser) {
      return next()
    }

    const error: ResponseError = new Error(`Forbidden. Missing permission: '${Role.REPORT_USER}'`)
    error.status = 403

    return next(error)
  })
}
