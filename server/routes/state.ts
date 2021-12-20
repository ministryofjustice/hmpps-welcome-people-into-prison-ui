import { NextFunction, Request, RequestHandler, Response } from 'express'
import { StatusAndReasons } from '../services/imprisonmentStatusesService'
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

const SEX_COOKIE_NAME = 'sex'

export const clearSex = clearState('sex')

export const setSex = (res: Response, data: string): void => setState(SEX_COOKIE_NAME, SexCodec)(res, data)

export const getSex = (req: Request): string | undefined => getState(SEX_COOKIE_NAME, SexCodec)(req)

export const ensureSexPresentMiddleware =
  (redirectUrl: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return isStatePresent(SEX_COOKIE_NAME)(req) ? next() : res.redirect(redirectUrl)
  }
