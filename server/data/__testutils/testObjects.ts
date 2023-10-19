import type {
  Arrival,
  RecentArrival,
  ArrivalResponse,
  ImprisonmentStatus,
  PotentialMatch,
  PotentialMatchCriteria,
  Prison,
  TemporaryAbsence,
  Transfer,
  UserCaseLoad,
  PrisonerDetails,
  PaginatedResponse,
} from 'welcome'
import type { BodyScanStatus } from 'body-scan'
import { WithBodyScanInfo } from '../../services/bodyScanInfoDecorator'

import type { NewArrival } from '../../routes/bookedtoday/arrivals/state'
import type { User } from '../hmppsAuthClient'
import { MatchType } from '../../services/matchTypeDecorator'

export const withBodyScanStatus = <T>(
  t: T,
  { bodyScanStatus = 'OK_TO_SCAN' }: { bodyScanStatus?: BodyScanStatus } = {}
) => ({
  ...t,
  bodyScanStatus,
})

export const withBodyScanInfo = <T>(
  t: T,
  {
    numberOfBodyScans = 0,
    numberOfBodyScansRemaining = 116,
    bodyScanStatus = 'OK_TO_SCAN',
  }: { numberOfBodyScans?: number; numberOfBodyScansRemaining?: number; bodyScanStatus?: BodyScanStatus } = {}
) => ({
  ...t,
  numberOfBodyScans,
  numberOfBodyScansRemaining,
  bodyScanStatus,
})

export const withMatchType = <T>(t: T, { matchType = MatchType.SINGLE_MATCH } = {}) => ({
  ...t,
  matchType,
})

export const createArrival = ({
  id = '1111-1111-1111-1111',
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  prisonNumber = 'A1234AB',
  pncNumber = '01/98644M',
  date = '2021-10-13',
  fromLocation = 'Reading Court',
  fromLocationId = 'REDCC',
  fromLocationType = 'COURT',
  isCurrentPrisoner = true,
  offence = 'Burglary',
  potentialMatches = [createPotentialMatch()],
}: Partial<Arrival> = {}): Arrival => ({
  id,
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  date,
  fromLocation,
  fromLocationId,
  fromLocationType,
  isCurrentPrisoner,
  potentialMatches,
  offence,
})

export const createRecentArrival = ({
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  prisonNumber = 'A1234AB',
  movementDateTime = '2022-01-17T14:20:00',
  location = 'MDI-1-3-004',
} = {}): RecentArrival => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  movementDateTime,
  location,
})

export const createRecentArrivalResponse = ({
  content = [],
  pageable = {
    sort: { empty: true, sorted: false, unsorted: true },
    offset: 0,
    pageSize: 50,
    pageNumber: 0,
    paged: true,
    unpaged: false,
  },
  last = true,
  totalPages = 0,
  totalElements = 0,
  size = 50,
  number = 0,
  sort = { empty: true, sorted: false, unsorted: true },
  first = true,
  numberOfElements = 0,
  empty = true,
} = {}): PaginatedResponse<RecentArrival> => ({
  content,
  pageable,
  last,
  totalPages,
  totalElements,
  size,
  number,
  sort,
  first,
  numberOfElements,
  empty,
})

export const createPrisonerDetails = ({
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  prisonNumber = 'A1234AB',
  pncNumber = '01/98644M',
  sex = 'MALE',
  arrivalType = 'NEW_BOOKING',
}: Partial<PrisonerDetails> = {}): PrisonerDetails => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  sex,
  arrivalType,
  arrivalTypeDescription: 'description',
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
  mainOffence = 'theft',
} = {}): Transfer => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  date,
  fromLocation,
  mainOffence,
})

export const createTransferWithBodyScan = ({
  firstName = 'Sam',
  lastName = 'Smith',
  dateOfBirth = '1971-02-01',
  prisonNumber = 'A1234AA',
  pncNumber = '01/1234X',
  date = '2020-02-23',
  fromLocation = 'Kingston-upon-Hull Crown Court',
  mainOffence = 'theft',
  numberOfBodyScans = 0,
  numberOfBodyScansRemaining = 116,
  bodyScanStatus = 'OK_TO_SCAN' as BodyScanStatus,
} = {}): WithBodyScanInfo<Transfer> => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  date,
  fromLocation,
  mainOffence,
  numberOfBodyScans,
  numberOfBodyScansRemaining,
  bodyScanStatus,
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

export const statusWithSingleReason = createImprisonmentStatuses().find(s => s.code === 'on-remand')
export const statusWithManyReasons = createImprisonmentStatuses().find(s => s.code === 'determinate-sentence')

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
  arrivalType = 'NEW_BOOKING',
}: Partial<PotentialMatch> = {}): PrisonerDetails => ({
  firstName,
  lastName,
  dateOfBirth,
  prisonNumber,
  pncNumber,
  croNumber,
  sex: 'MALE',
  arrivalType,
  arrivalTypeDescription: 'description',
})

export const createNewArrival = ({
  firstName = 'Jim',
  lastName = 'Smith',
  dateOfBirth = '1973-01-08',
  sex = 'NS',
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
