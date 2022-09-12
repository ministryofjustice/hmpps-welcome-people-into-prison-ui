import type { LocationType, PotentialMatch } from 'welcome'

export const enum MatchType {
  COURT_RETURN = 'COURT_RETURN',
  INSUFFICIENT_INFO = 'INSUFFICIENT_INFO',
  SINGLE_MATCH = 'SINGLE_MATCH',
  NO_MATCH = 'NO_MATCH',
  MULTIPLE_POTENTIAL_MATCHES = 'MULTIPLE_POTENTIAL_MATCHES',
}

export type ArrivalInfo = {
  prisonNumber?: string
  pncNumber?: string
  potentialMatches?: PotentialMatch[]
  fromLocationType: LocationType
  isCurrentPrisoner: boolean
}

export type WithMatchType<T extends ArrivalInfo> = T & { matchType: MatchType }

export class MatchTypeDecorator {
  public decorate<T extends ArrivalInfo>(items: T[]): WithMatchType<T>[] {
    return items.map(item => this.decorateSingle(item))
  }

  public decorateSingle<T extends ArrivalInfo>(item: T): WithMatchType<T> {
    return { ...item, matchType: this.getMatchType(item) }
  }

  public getMatchType<T extends ArrivalInfo>(item: T): MatchType {
    if (!item.prisonNumber && !item.pncNumber) {
      return MatchType.INSUFFICIENT_INFO
    }
    switch (item.potentialMatches?.length || 0) {
      case 0:
        return MatchType.NO_MATCH
      case 1:
        return this.isCourtReturn(item) ? MatchType.COURT_RETURN : MatchType.SINGLE_MATCH
      default:
        return MatchType.MULTIPLE_POTENTIAL_MATCHES
    }
  }

  private isCourtReturn = <T extends ArrivalInfo>(item: T): boolean =>
    item.isCurrentPrisoner && item.fromLocationType === 'COURT'
}
