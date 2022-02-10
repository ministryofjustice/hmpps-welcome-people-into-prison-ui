declare module 'welcome' {
  export type Arrival = schemas['Arrival']
  export type Transfer = schemas['Transfer']
  export type TemporaryAbsence = schemas['TemporaryAbsence']
  export type NewOffenderBooking = schemas['NewOffenderBooking']
  export type ImprisonmentStatus = schemas['ImprisonmentStatus']
  export type Prison = schemas['Prison']
  export type PrisonNumber = schemas['PrisonNumber']
  export type UserCaseLoad = schemas['UserCaseLoad']
  export type ArrivalResponse = schemas['ArrivalResponse']

  export const enum Gender {
    FEMALE = 'F',
    MALE = 'M',
    NOT_KNOWN = 'NK',
    NOT_SPECIFIED = 'NS',
    REFUSED = 'REF',
  }

  export const enum GenderKeys {
    FEMALE = 'FEMALE',
    MALE = 'MALE',
    TRANS = 'TRANS',
  }

  type PotentialMatch = {
    firstName: string
    lastName: string
    dateOfBirth: string
    prisonNumber?: string
    pncNumber?: string
  }

  export interface schemas {
    Arrival: {
      id?: string
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber: string
      pncNumber: string
      date: string
      fromLocation: string
      fromLocationType: LocationType
      gender?: GenderKeys
      potentialMatches?: PotentialMatch[]
      isCurrentPrisoner: boolean
    }
    Transfer: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber: string
      pncNumber: string
      date: string
      fromLocation: string
    }
    TemporaryAbsence: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber: string
      reasonForAbsence: string
      movementDateTime: string
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    NewOffenderBooking: {
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: Gender
      prisonId: string
      imprisonmentStatus: string
      movementReasonCode: string
    }
    ImprisonmentStatus: {
      code: string
      description: string
      imprisonmentStatusCode: string
      secondLevelTitle?: string
      secondLevelValidationMessage?: string
      movementReasons: { description?: string; movementReasonCode: string }[]
    }
    Prison: {
      description: string
    }
    PrisonNumber: {
      prisonNumber: string
    }
    ArrivalResponse: {
      prisonNumber: string
      location: string
    }
    UserCaseLoad: {
      caseLoadId: string
      description: string
    }
  }
}
