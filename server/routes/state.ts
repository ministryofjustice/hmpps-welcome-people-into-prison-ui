import { NextFunction, Request, RequestHandler, Response } from 'express'
import { StatusAndReasons } from 'welcome'
import { assertHasStringValues } from '../utils/utils'
import { clearState, Codec, getState, isStatePresent, setState } from '../utils/state'

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

const COOKIE_NAME = 'status-and-reason'

export const clearImprisonmentStatus = clearState(COOKIE_NAME)

export const setImprisonmentStatus = (res: Response, data: StatusAndReasons): void =>
  setState(COOKIE_NAME, StatusAndReasonsCodec)(res, data)

export const getImprisonmentStatus = (req: Request): StatusAndReasons | undefined =>
  getState(COOKIE_NAME, StatusAndReasonsCodec)(req)

export const ensureImprisonmentStatusPresentMiddleware =
  (redirectUrl: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return isStatePresent(COOKIE_NAME)(req) ? next() : res.redirect(redirectUrl)
  }
