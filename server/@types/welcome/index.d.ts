declare module 'welcome' {
  import { LocationType } from '../../services/expectedArrivalsService'

  export type Movement = schemas['Movement']

  export type TemporaryAbsence = {
    firstName: string
    lastName: string
    dateOfBirth: string
    prisonNumber: string
    reasonForAbsence: string
  }

  export interface schemas {
    /** A movement into prison */
    Movement: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber: string
      pncNumber: string
      date: string
      fromLocation: string
      moveType?: 'PRISON_REMAND' | 'COURT_APPEARANCE' | 'PRISON_RECALL' | 'VIDEO_REMAND' | 'PRISON_TRANSFER'
      fromLocationType?: LocationType
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
  }
}
