import { Request, Router } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import type { ManagementReportDefinition } from 'management-reporting'
import config from '../../config'
import { Services } from '../../services'
import DprService from '../../services/dprService'

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
          // protectRoute('reporting_location_information'), // FIXME sort permission
          // addBreadcrumb({ title: 'Management reporting', href: '/management-reporting' }), // FIXME sort breadcrumbs
          // addBreadcrumb({ title: variant.name, href: `/management-reporting/${definition.id}-${variant.id}` }),
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

  router.get(
    '/management-reporting',
    // protectRoute('reporting_location_information'), // FIXME sort permission
    // addBreadcrumb({ title: 'Management reporting', href: '/management-reporting' }), // FIXME sort breadcrumbs
    async (req, res) => {
      const token =
        'eyJraWQiOiJobXBwcy1hdXRoLWRldi0yMDIzMDMwNiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJESE9VU1RPTl9HRU4iLCJuYmYiOjE3NTQwNTI3MDcsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJ1c2VyX25hbWUiOiJESE9VU1RPTl9HRU4iLCJhdXRoX3NvdXJjZSI6Im5vbmUiLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiaXNzIjoiaHR0cHM6Ly9zaWduLWluLWRldi5obXBwcy5zZXJ2aWNlLmp1c3RpY2UuZ292LnVrL2F1dGgvaXNzdWVyIiwiZXhwIjoxNzU0MDUzOTA3LCJpYXQiOjE3NTQwNTI3MDcsImp0aSI6IjRSaUJWMUJYeWRfdTJNeThobENKMzA3WmVMbyIsImF1dGhvcml0aWVzIjpbIlJPTEVfRVNUQUJMSVNITUVOVF9ST0xMIiwiUk9MRV9CT09LSU5HX0NSRUFURSIsIlJPTEVfVFJBTlNGRVJfUFJJU09ORVIiLCJST0xFX1VTRVJfUEVSTUlTU0lPTlNfX1JPIiwiUk9MRV9NQUlOVEFJTl9IRUFMVEhfUFJPQkxFTVMiLCJST0xFX1JFTEVBU0VfUFJJU09ORVIiLCJST0xFX1NUQUZGX1NFQVJDSCIsIlJPTEVfRFBSX0FQSV9BQ0NFU1MiLCJST0xFX1NZU1RFTV9VU0VSIiwiUk9MRV9WSUVXX1BSSVNPTkVSX0RBVEEiLCJST0xFX1ZJRVdfQVJSSVZBTFMiLCJST0xFX1BSSVNPTkVSX1NFQVJDSCJdLCJjbGllbnRfaWQiOiJ3ZWxjb21lLXBlb3BsZS1pbnRvLXByaXNvbi1jbGllbnQtMiJ9.FOrBzws0d8nSoiMTqPwQDizrg6y9dFanzQ1sGme9WDD3s7iqErp1nzZs6ttRYBSnWEba5da20mIKJPGM1CtR1TyPJZNbC10qP7j5AQYyC95IDmC5Vf794KngY-1Ed2JZy5Vi35Sw5UEFptp3MYkHuL9o8lCgd2eGIDPTQhdyQehTEb9NlR7BsfQVpyS0BMsij9-YU0n_BFe9xPVkqP4aB2aYdlj7lISVdwDwUCzNl2fGGJrTTTpuXSPuJWcyJ-NzKf1LtoWspvGfHe7F-5t_9OT8zbPVb-87o_XJmLWXfcVF0Sc1oqKo2drhshCEtpJjYbUHR22QM4UpBZKUVTKEAA'
      const definitions = await populateRoutes(services.dprService, req.session.systemToken, router)
      res.render('pages/managementReporting/index.njk', { definitions })
    },
  )

  return router
}
