declare module 'welcome' {
  export type Movement = schemas['Movement']

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
      moveType: 'PRISON_REMAND' | 'COURT_APPEARANCE' | 'PRISON_RECALL' | 'VIDEO_REMAND' | 'PRISON_TRANSFER'
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
