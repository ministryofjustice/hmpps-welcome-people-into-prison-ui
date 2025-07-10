// import { Response, Router } from 'express'
// import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
// import config from '../../config'
// import { Services } from '../../services'
// // import { ManagementReportDefinition } from '../../data/types/locationsApi/managementReportDefinition'
// import TemporaryAbsencesService from '../../services/temporaryAbsencesService'
// import { ManagementReportDefinition } from '../../@types/welcome/managementReportDefinition'
// // import protectRoute from '../../middleware/protectRoute'
// // import addBreadcrumb from '../../middleware/addBreadcrumb'
//
// let definitionsRoutesInitialised: boolean = false
//
// async function populateRoutes(
//   temporaryAbsencesService: TemporaryAbsencesService,
//   router: Router,
// ): Promise<ManagementReportDefinition[]> {
//   const allDefinitions = await temporaryAbsencesService.getManagementReportDefinitions()
//   if (definitionsRoutesInitialised === false) {
//     for (const definition of allDefinitions) {
//       for (const variant of definition.variants) {
//         router.get(
//           `/management-reporting/${definition.id}-${variant.id}`,
//           ReportListUtils.createReportListRequestHandler({
//             title: variant.name,
//             definitionName: definition.id,
//             variantName: variant.id,
//             apiUrl: config.apis.welcome.url,
//             apiTimeout: config.apis.welcome.timeout.deadline,
//             layoutTemplate: 'partials/dprLayout.njk',
//             tokenProvider: (_, res: Response) => {
//               return res.locals.systemToken
//             },
//           }),
//         )
//       }
//     }
//     definitionsRoutesInitialised = true
//   }
//   return allDefinitions
// }
//
// export default function dprRouter(services: Services): Router {
//   const router = Router()
//
//   router.get('/management-reporting', async (req, res) => {
//     if (config.loadReportDefinitionsOnStartup === true && definitionsRoutesInitialised === false) {
//       services.authService
//         .getSystemClientToken()
//         .then(token => populateRoutes(services.temporaryAbsencesService, router))
//     }
//
//     const definitions = await populateRoutes(services.temporaryAbsencesService, router)
//     res.render('pages/managementReporting/index.njk', { definitions })
//   })
//
//   return router
// }
