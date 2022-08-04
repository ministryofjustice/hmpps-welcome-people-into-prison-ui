declare module 'body-scan' {
  export type PrisonerDetails = schemas['PrisonerDetails']
  export type BodyScan = schemas['BodyScan']
  export type BodyScanInfo = schemas['LimitStatusResponse']

  export type ReasonCode = 'INTELLIGENCE' | 'REASONABLE_SUSPICION'
  export type ResultCode = 'POSITIVE' | 'NEGATIVE'

  export const enum BodyScanStatus {
    DO_NOT_SCAN = 'DO_NOT_SCAN',
    CLOSE_TO_LIMIT = 'CLOSE_TO_LIMIT',
    OK_TO_SCAN = 'OK_TO_SCAN',
  }

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
    LimitStatusResponse: {
      prisonNumber: string
      bodyScanStatus: BodyScanStatus
      numberOfBodyScans: number
      numberOfBodyScansRemaining: number
    }
  }
}
