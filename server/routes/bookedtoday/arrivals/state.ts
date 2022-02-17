import { NewArrival } from 'welcome'
import { StatusAndReasons } from '../../../services/imprisonmentStatusesService'
import { assertHasStringValues, assertHasOptionalStringValues } from '../../../utils/utils'
import { Codec, stateOperations } from '../../../utils/state'

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

export const State = {
  imprisonmentStatus: stateOperations('status-and-reason', StatusAndReasonsCodec),
  sex: stateOperations('sex', SexCodec),
  newArrival: stateOperations('new-arrival', NewArrivalCodec),
}
