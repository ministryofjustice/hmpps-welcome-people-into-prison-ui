import { assertHasStringValues, assertHasOptionalStringValues } from '../../../utils/utils'
import { Codec, StateOperations } from '../../../utils/state'

export type NewArrival = {
  firstName: string
  lastName: string
  dateOfBirth: string
  prisonNumber?: string
  pncNumber?: string
  sex?: string
  // TODO: update this name to 'imprisonmentStatusCode'
  code?: string
  imprisonmentStatus?: string
  movementReasonCode?: string
  expected: boolean
}

export const NewArrivalCodec: Codec<NewArrival> = {
  write: (value: NewArrival): Record<string, string> => ({
    firstName: value.firstName,
    lastName: value.lastName,
    dateOfBirth: value.dateOfBirth,
    expected: value.expected.toString(),
    ...(value.prisonNumber !== undefined && { prisonNumber: value.prisonNumber }),
    ...(value.pncNumber !== undefined && { pncNumber: value.pncNumber }),
    ...(value.sex !== undefined && { sex: value.sex }),
    ...(value.code !== undefined && { code: value.code }),
    ...(value.imprisonmentStatus !== undefined && { imprisonmentStatus: value.imprisonmentStatus }),
    ...(value.movementReasonCode !== undefined && { movementReasonCode: value.movementReasonCode }),
  }),

  read(record: Record<string, unknown>): NewArrival {
    assertHasStringValues(record, ['firstName', 'lastName', 'dateOfBirth', 'expected'])
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
      expected: record.expected === 'true',
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
  searchDetails: new StateOperations('search-details', SearchDetailsCodec),
  newArrival: new StateOperations('new-arrival', NewArrivalCodec),
}
