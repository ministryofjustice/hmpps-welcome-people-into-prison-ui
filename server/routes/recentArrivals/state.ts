import { assertHasStringValues } from '../../utils/utils'
import { Codec, StateOperations } from '../../utils/state'

export type SearchQuery = {
  searchQuery: string
}

export const SearchQueryCodec: Codec<SearchQuery> = {
  write: (value: SearchQuery): Record<string, string> => ({
    searchQuery: value.searchQuery,
  }),

  read(record: Record<string, unknown>): SearchQuery {
    assertHasStringValues(record, ['searchQuery'])

    return {
      searchQuery: record.searchQuery,
    }
  },
}

export const State = {
  searchQuery: new StateOperations('search-query', SearchQueryCodec),
}
