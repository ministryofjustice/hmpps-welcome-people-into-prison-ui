declare module 'welcome' {
  export type Arrival = schemas['Arrival']
  export type Transfer = schemas['Transfer']
  export type TemporaryAbsence = schemas['TemporaryAbsence']
  export type ConfirmArrivalDetail = schemas['ConfirmArrivalDetail']
  export type ImprisonmentStatus = schemas['ImprisonmentStatus']
  export type Prison = schemas['Prison']
  export type UserCaseLoad = schemas['UserCaseLoad']
  export type ArrivalResponse = schemas['ArrivalResponse']
  export type PotentialMatchCriteria = schemas['PotentialMatchCriteria']
  export type PotentialMatch = schemas['PotentialMatch']
  export type PrisonerDetails = schemas['PrisonerDetails']

  export const enum Sex {
    FEMALE = 'F',
    MALE = 'M',
    NOT_KNOWN = 'NK',
    NOT_SPECIFIED = 'NS',
    REFUSED = 'REF',
  }

  export const enum SexKeys {
    FEMALE = 'FEMALE',
    MALE = 'MALE',
    TRANS = 'TRANS',
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
      fromLocationId?: string
      fromLocationType: LocationType
      gender?: SexKeys
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
    ConfirmArrivalDetail: {
      firstName: string
      lastName: string
      dateOfBirth: string
      sex: Sex
      prisonId: string
      fromLocationId?: string
      imprisonmentStatus: string
      movementReasonCode: string
      prisonNumber: string
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
    ArrivalResponse: {
      prisonNumber: string
      location: string
    }
    UserCaseLoad: {
      caseLoadId: string
      description: string
    }
    PotentialMatchCriteria: {
      firstName: string
      lastName: string
      dateOfBirth: string
      pncNumber?: string
    }
    PotentialMatch: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber?: string
      pncNumber?: string
      croNumber?: string
      sex: SexKeys
    }
    PrisonerDetails: {
      firstName: string
      lastName: string
      dateOfBirth: string
      prisonNumber?: string
      pncNumber?: string
      croNumber?: string
      sex: SexKeys
    }
  }
}
