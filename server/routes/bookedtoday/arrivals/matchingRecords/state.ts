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
    assertHasStringValues(record, ['firstName', 'lastName', 'dateOfBirth'])
    assertHasOptionalStringValues(record, ['prisonNumber', 'pncNumber'])

    return {
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth,
      prisonNumber: record.prisonNumber,
      pncNumber: record.pncNumber,
    }
  },
}

export const State = { searchDetails: stateOperations('search-details', SearchDetailsCodec) }
