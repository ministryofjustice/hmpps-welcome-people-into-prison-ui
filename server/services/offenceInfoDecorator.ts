import type { Arrival } from 'welcome'

const NOT_AVAILABLE = 'Not available'

const INVALID_VALUES = ['UNKNOWN', 'NULL', 'WARRANT', 'NOT STATED', 'NK', 'NA', 'N/A', '.', '..', 'U/K']

export default class OffenceInfoDecorator {
  public decorateSingle(item: Arrival): Arrival {
    return { ...item, offence: this.getOffenceInfo(item) }
  }

  public getOffenceInfo(item: Arrival): string {
    if (this.isFromCustodySuite(item)) {
      return null
    }
    if (!item.offence) {
      return NOT_AVAILABLE
    }
    if (INVALID_VALUES.includes(item.offence.toUpperCase())) {
      return NOT_AVAILABLE
    }

    return item.offence
  }

  private isFromCustodySuite = (item: Arrival): boolean => item.fromLocationType === 'CUSTODY_SUITE'
}
