import { CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express'
import config from '../config'

export type Codec<T> = {
  read(record: Record<string, unknown>): T
  write(value: T): Record<string, string>
}

export const cookieOptions: CookieOptions = {
  domain: config.session.domain,
  httpOnly: true,
  maxAge: config.session.expiryMinutes * 60 * 1000,
  sameSite: 'lax',
  secure: config.https,
  signed: true,
}

const clearState =
  (name: string) =>
  (res: Response): void => {
    res.clearCookie(name, cookieOptions)
  }

const setState =
  <T>(name: string, codec: Codec<T>) =>
  (res: Response, data: T): void => {
    res.cookie(name, codec.write(data), cookieOptions)
  }

const getState =
  <T>(name: string, codec: Codec<T>) =>
  (req: Request): T | undefined => {
    const result = req.signedCookies[name]
    return result ? codec.read(result) : undefined
  }

const isStatePresent =
  (name: string) =>
  (req: Request): boolean => {
    return Boolean(req.signedCookies[name])
  }

export const stateOperations = <T>(cookieName: string, codec: Codec<T>) => ({
  clear: clearState(cookieName),

  set: (res: Response, data: T): void => setState(cookieName, codec)(res, data),

  get: (req: Request): T | undefined => getState(cookieName, codec)(req),

  read: (record: Record<string, unknown>) => codec.read(record),

  write: (value: T) => codec.write(value),

  isStatePresent: isStatePresent(cookieName),

  update: (req: Request, res: Response, update: Partial<T>) => {
    const val = getState(cookieName, codec)(req)
    const newValue = { ...val, ...update }
    setState(cookieName, codec)(res, newValue)
    return newValue
  },

  ensurePresent:
    (redirectUrl: string): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) =>
      isStatePresent(cookieName)(req) ? next() : res.redirect(redirectUrl),
})
