import { assertHasOptionalStringValues, assertHasStringValues } from '../../../../utils/utils'
import { Codec, stateOperations } from '../../../../utils/state'

export type SearchDetails = {
  firstName: string
  lastName: string
  dateOfBirth: string
  prisonNumber?: string
  pncNumber?: string
}

const SearchDetailsCodec: Codec<SearchDetails> = {
  write: (value: SearchDetails): Record<string, string> => ({ ...value }),

  read(record: Record<string, unknown>): SearchDetails {
    assertHasStringValues(record, ['firstName', 'lastName', 'movementReasonCode'])
    assertHasOptionalStringValues(record, ['dateOfBirth', 'prisonNumber', 'pncNumber'])

    return {
      firstName: record.firstName,
      lastName: record.firstName,
      dateOfBirth: record.dateOfBirth,
      prisonNumber: record.prisonNumber,
      pncNumber: record.pncNumber,
    }
  },
}

export const searchDetails = stateOperations('search-details', SearchDetailsCodec)
