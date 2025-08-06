declare module 'management-reporting' {
  export type ManagementReportDefinition = schemas['ManagementReportDefinition']

  export interface schemas {
    ManagementReportDefinition: {
      id: string
      name: string
      description: string
      variants: ReportVariant[]
      authorised: boolean
    }
  }

  export type ReportVariant = {
    id: string
    name: string
    description: string
  }
}
