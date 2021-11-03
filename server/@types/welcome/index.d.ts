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

  export const enum Gender {
    FEMALE = 'F',
    MALE = 'M',
    NOT_KNOWN = 'NK',
    NOT_SPECIFIED = 'NS',
    REFUSED = 'REF',
  }

  export type NewOffenderBooking = {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: Gender
    prisonId: string
    imprisonmentStatus: string
    movementReasonCode: string
  }

  export type Prison = {
    description: string
  }

  export type OffenderNumber = {
    offenderNo: string
  }

  export interface schemas {
    /** A movement into prison */
    Movement: {
      id?: string
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber: string
      pncNumber: string
      date: string
      fromLocation: string
      fromLocationType: LocationType
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
  }

  export interface ImprisonmentStatus {
    description: string
    imprisonmentStatusCode: string
    secondLevelTitle?: string
    movementReasons: { description?: string; movementReasonCode: string }[]
  }
}
