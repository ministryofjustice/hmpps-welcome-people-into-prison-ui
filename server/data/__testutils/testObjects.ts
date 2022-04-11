import {
  Arrival,
  ArrivalResponse,
  ImprisonmentStatus,
  PotentialMatch,
  PotentialMatchCriteria,
  Sex,
  SexKeys,
  TemporaryAbsence,
  Transfer,
} from 'welcome'
import { NewArrival } from '../../routes/bookedtoday/arrivals/state'

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
    description: 'Convicted unsentenced',
    imprisonmentStatusCode: 'JR',
    movementReasons: [{ movementReasonCode: 'V' }],
  },
  {
    code: 'determinate-sentence',
    description: 'Determinate sentence',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'What is the type of determinate sentence?',
    secondLevelValidationMessage: 'Select the type of determinate sentence',
    movementReasons: [
      { description: 'Extended sentence for public protection', movementReasonCode: '26' },
      { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
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
