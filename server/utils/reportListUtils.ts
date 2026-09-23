import type { RequestHandler } from 'express'

type ReportListRequestHandlerOptions = {
  title: string
  definitionName: string
  variantName: string
  apiUrl: string
  apiTimeout: number
  layoutTemplate: string
  tokenProvider: (req: Express.Request) => string
}

type ReportListUtilsModule = {
  createReportListRequestHandler: (options: ReportListRequestHandlerOptions) => RequestHandler
}

const reportListUtils: ReportListUtilsModule = {
  createReportListRequestHandler: () => (_req, res) => {
    res.status(501).send('Management report list is unavailable in this build.')
  },
}

export default reportListUtils
