import { StatusAndReasons } from '../../../services/imprisonmentStatusesService'
import { assertHasStringValues } from '../../../utils/utils'
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

export const State = {
  imprisonmentStatus: stateOperations('status-and-reason', StatusAndReasonsCodec),
  sex: stateOperations('sex', SexCodec),
}
