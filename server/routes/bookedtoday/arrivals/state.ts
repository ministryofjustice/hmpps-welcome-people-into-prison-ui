import { assertHasStringValues, assertHasOptionalStringValues } from '../../../utils/utils'
import { Codec, stateOperations } from '../../../utils/state'

export type NewArrival = {
  firstName: string
  lastName: string
  dateOfBirth: string
  prisonNumber?: string
  pncNumber?: string
  sex?: string
  code?: string
  imprisonmentStatus?: string
  movementReasonCode?: string
}

export const NewArrivalCodec: Codec<NewArrival> = {
  write: (value: NewArrival): Record<string, string> => ({ ...value }),

  read(record: Record<string, unknown>): NewArrival {
    assertHasStringValues(record, ['firstName', 'lastName', 'dateOfBirth'])
    assertHasOptionalStringValues(record, [
      'prisonNumber',
      'pncNumber',
      'sex',
      'code',
      'imprisonmentStatus',
      'movementReasonCode',
    ])

    return {
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth,
      pncNumber: record.pncNumber,
      prisonNumber: record.prisonNumber,
      sex: record.sex,
      code: record.code,
      imprisonmentStatus: record.imprisonmentStatus,
      movementReasonCode: record.movementReasonCode,
    }
  },
}

export type SearchDetails = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  prisonNumber?: string
  pncNumber?: string
}

const SearchDetailsCodec: Codec<SearchDetails> = {
  write: (value: SearchDetails): Record<string, string> => ({ ...value }),

  read(record: Record<string, unknown>): SearchDetails {
    assertHasOptionalStringValues(record, ['firstName', 'lastName', 'dateOfBirth', 'prisonNumber', 'pncNumber'])

    return {
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth,
      prisonNumber: record.prisonNumber,
      pncNumber: record.pncNumber,
    }
  },
}

export const State = {
  searchDetails: stateOperations('search-details', SearchDetailsCodec),
  newArrival: stateOperations('new-arrival', NewArrivalCodec),
}
