declare module '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/setUpNunjucksFilters' {
  import type { Request } from 'express'

  type NunjucksEnvironment = {
    addFilter: (...args: unknown[]) => unknown
  }

  const setUpNunjucksFilters: (nunjucksEnv: NunjucksEnvironment, req?: Request) => void
  export default setUpNunjucksFilters
}

declare module '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils' {
  import type { Request, RequestHandler } from 'express'

  interface ReportListRequestHandlerOptions {
    title: string
    definitionName: string
    variantName: string
    apiUrl: string
    apiTimeout: number
    layoutTemplate: string
    tokenProvider: (req: Request) => string
  }

  interface ReportListUtilsModule {
    createReportListRequestHandler: (options: ReportListRequestHandlerOptions) => RequestHandler
  }

  const reportListUtils: ReportListUtilsModule
  export default reportListUtils
}
