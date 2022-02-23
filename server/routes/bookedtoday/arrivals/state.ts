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
  newArrival: stateOperations('new-arrival', NewArrivalCodec),
}
