import { PotentialMatch } from 'welcome'
import { StatusAndReasons } from '../../../services/imprisonmentStatusesService'
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
  potentialMatches?: PotentialMatch[]
}

export const StatusAndReasonsCodec: Codec<StatusAndReasons> = {
  write: (value: StatusAndReasons): Record<string, string> => {
    return {
      code: value.code,
      imprisonmentStatus: value.imprisonmentStatus,
      movementReasonCode: value.movementReasonCode,
    }
  },

  read(record: Record<string, unknown>): StatusAndReasons {
    assertHasStringValues(record, ['code', 'imprisonmentStatus', 'movementReasonCode'])

    return {
      code: record.code,
      imprisonmentStatus: record.imprisonmentStatus,
      movementReasonCode: record.movementReasonCode,
    }
  },
}

export const SexCodec: Codec<string> = {
  write: (value: string): Record<string, string> => {
    return {
      data: value,
    }
  },

  read(record: Record<string, unknown>): string {
    assertHasStringValues(record, ['data'])
    return record.data
  },
}

export const NewArrivalCodec: Codec<NewArrival> = {
  // write: (value: NewArrival): Record<string, string> => ({ ...value }),

  write: (value: NewArrival): Record<string, string> => {
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      pncNumber: value.pncNumber,
      prisonNumber: value.prisonNumber,
      sex: value.sex,
      code: value.code,
      imprisonmentStatus: value.imprisonmentStatus,
      movementReasonCode: value.movementReasonCode,
      potentialMatches: value.potentialMatches ? JSON.stringify(value.potentialMatches) : undefined,
    }
  },

  read(record: Record<string, unknown>): NewArrival {
    assertHasStringValues(record, ['firstName', 'lastName', 'dateOfBirth'])
    assertHasOptionalStringValues(record, [
      'prisonNumber',
      'pncNumber',
      'sex',
      'code',
      'imprisonmentStatus',
      'movementReasonCode',
      'potentialMatches',
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
      potentialMatches: record.potentialMatches ? JSON.parse(record.potentialMatches) : undefined,
    }
  },
}

export const State = {
  imprisonmentStatus: stateOperations('status-and-reason', StatusAndReasonsCodec),
  sex: stateOperations('sex', SexCodec),
  newArrival: stateOperations('new-arrival', NewArrivalCodec),
}
