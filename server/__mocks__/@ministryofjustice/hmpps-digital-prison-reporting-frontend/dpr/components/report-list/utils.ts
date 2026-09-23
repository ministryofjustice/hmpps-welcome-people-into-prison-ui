import type { Request, RequestHandler, Response } from 'express'

type ReportListRequestHandlerOptions = {
  title: string
  definitionName: string
  variantName: string
  apiUrl: string
  apiTimeout: number
  layoutTemplate: string
  tokenProvider: (req: Request) => string
}

type ReportListUtilsModule = {
  createReportListRequestHandler: (options: ReportListRequestHandlerOptions) => RequestHandler
}

const reportListUtils: ReportListUtilsModule = {
  createReportListRequestHandler: () => (_req: Request, res: Response) => {
    res.status(501).send('Management report list is unavailable in tests.')
  },
}

export default reportListUtils
