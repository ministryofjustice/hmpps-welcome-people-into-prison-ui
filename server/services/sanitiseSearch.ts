import type { PotentialMatchCriteria } from 'welcome'
import { convertToTitleCase, createDate } from '../utils/utils'

export default function sanitiseSearchCriteria(criteria: Record<string, string>): PotentialMatchCriteria {
  const { prisonNumber, pncNumber, firstName, lastName, day, month, year } = criteria
  return {
    ...(prisonNumber && { prisonNumber }),
    ...(pncNumber && { pncNumber }),
    ...(firstName && { firstName: convertToTitleCase(firstName) }),
    ...(lastName && { lastName: convertToTitleCase(lastName) }),
    ...(day && month && year && { dateOfBirth: createDate(day, month, year) }),
  }
}
