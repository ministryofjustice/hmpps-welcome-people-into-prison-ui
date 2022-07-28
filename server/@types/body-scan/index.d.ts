declare module 'body-scan' {
  export type PrisonerDetails = schemas['PrisonerDetails']

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
  }
}
