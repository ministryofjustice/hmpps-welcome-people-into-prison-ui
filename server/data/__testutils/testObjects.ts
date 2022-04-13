import {
  type Arrival,
  type ArrivalResponse,
  type ImprisonmentStatus,
  type PotentialMatch,
  type PotentialMatchCriteria,
  type Prison,
  Sex,
  SexKeys,
  type TemporaryAbsence,
  type Transfer,
  type UserCaseLoad,
} from 'welcome'
import type { NewArrival } from '../../routes/bookedtoday/arrivals/state'
import type { User } from '../hmppsAuthClient'

export const createArrival = ({
  id = '1111-1111-1111-1111',
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  prisonNumber = 'A1234AB',
  pncNumber = '01/98644M',
  date = '2021-10-13',
  fromLocation = 'Reading Court',
  fromLocationType = 'COURT',
  isCurrentPrisoner = true,
  potentialMatches = [createPotentialMatch()],
} = {}): Arrival => ({
  id,
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  date,
  fromLocation,
  fromLocationType,
  isCurrentPrisoner,
  potentialMatches,
})

export const createTemporaryAbsence = ({
  firstName = 'Sam',
  lastName = 'Smith',
  dateOfBirth = '1971-02-01',
  prisonNumber = 'A1234AA',
  reasonForAbsence = 'Hospital appointment',
  movementDateTime = '2022-01-17T14:20:00',
} = {}): TemporaryAbsence => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  reasonForAbsence,
  movementDateTime,
})

export const createTransfer = ({
  firstName = 'Sam',
  lastName = 'Smith',
  dateOfBirth = '1971-02-01',
  prisonNumber = 'A1234AA',
  pncNumber = '01/1234X',
  date = '2020-02-23',
  fromLocation = 'Kingston-upon-Hull Crown Court',
} = {}): Transfer => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  date,
  fromLocation,
})

export const createArrivalResponse = ({ prisonNumber = 'A1234AB', location = 'Reception' } = {}): ArrivalResponse => ({
  prisonNumber,
  location,
})

export const createImprisonmentStatuses = (): ImprisonmentStatus[] => [
  {
    code: 'on-remand',
    description: 'On remand',
    imprisonmentStatusCode: 'RX',
    movementReasons: [{ movementReasonCode: 'R' }],
  },
  {
    code: 'convicted-unsentenced',
    description: 'Convicted - waiting to be sentenced',
    imprisonmentStatusCode: 'JR',
    movementReasons: [{ movementReasonCode: 'V' }],
  },
  {
    code: 'determinate-sentence',
    description: 'Sentenced - fixed length of time',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'What is the type of fixed sentence?',
    secondLevelValidationMessage: 'Select the type of fixed-length sentence',
    movementReasons: [
      { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
      { description: 'Extended sentence for public protection', movementReasonCode: '26' },
      { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
      { description: 'Partly suspended sentence', movementReasonCode: 'P' },
    ],
  },
]
export const createMatchCriteria = (): PotentialMatchCriteria => ({
  firstName: 'James',
  lastName: 'Charles',
  dateOfBirth: '1988-07-13',
})

export const createPotentialMatch = ({
  firstName = 'James',
  lastName = 'Charles',
  dateOfBirth = '1988-07-13',
  prisonNumber = 'A5534HA',
  pncNumber = '11/836373L',
  croNumber = '952184/22A',
} = {}): PotentialMatch => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  croNumber,
  sex: SexKeys.MALE,
})

export const createNewArrival = ({
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  sex = Sex.NOT_SPECIFIED,
  imprisonmentStatus = 'RX',
  movementReasonCode = 'N',
  prisonNumber = 'A1234AA',
  expected = true,
} = {}): NewArrival => ({
  firstName,
  lastName,
  dateOfBirth,
  sex,
  imprisonmentStatus,
  movementReasonCode,
  prisonNumber,
  expected,
})

export const createPrison = ({ description = 'Moorland (HMP & YOI)' } = {}): Prison => ({ description })

export const createUserCaseLoad = ({
  caseLoadId = 'MDI',
  description = 'Moorland (HMP & YOI)',
} = {}): UserCaseLoad => ({
  caseLoadId,
  description,
})

export const createUser = ({ name = 'John Smith', activeCaseLoadId = 'MDI' } = {}): User => ({ name, activeCaseLoadId })
