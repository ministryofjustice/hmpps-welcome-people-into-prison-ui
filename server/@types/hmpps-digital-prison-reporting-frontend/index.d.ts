declare module '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/setUpNunjucksFilters' {
  export { default } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/src/dpr/setUpNunjucksFilters'
}

declare module '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils' {
  import type { RequestHandler } from 'express'

  interface ReportListRequestHandlerOptions {
    title: string
    definitionName: string
    variantName: string
    apiUrl: string
    apiTimeout: number
    layoutTemplate: string
    tokenProvider: (req: Express.Request) => string
  }

  interface ReportListUtilsModule {
    createReportListRequestHandler: (options: ReportListRequestHandlerOptions) => RequestHandler
  }

  const reportListUtils: ReportListUtilsModule
  export default reportListUtils
}
