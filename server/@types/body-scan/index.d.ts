declare module 'body-scan' {
  export type PrisonerDetails = schemas['PrisonerDetails']
  export type BodyScan = schemas['BodyScan']

  export type ReasonCode = 'INTELLIGENCE' | 'REASONABLE_DOUBT'
  export type ResultCode = 'POSITIVE' | 'NEGATIVE'

  export interface schemas {
    PrisonerDetails: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber?: string
      pncNumber?: string
      croNumber?: string
      sex: SexKeys
    }
    BodyScan: {
      date: string
      reason: ReasonCode
      result: ResultCode
    }
  }
}
