import { CookieOptions, Response, Request } from 'express'
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

export const clearState =
  (name: string) =>
  (res: Response): void => {
    res.clearCookie(name, cookieOptions)
  }

export const setState =
  <T>(name: string, codec: Codec<T>) =>
  (res: Response, data: T): void => {
    res.cookie(name, codec.write(data), cookieOptions)
  }

export const getState =
  <T>(name: string, codec: Codec<T>) =>
  (req: Request): T | undefined => {
    const result = req.signedCookies[name]
    return result ? codec.read(result) : undefined
  }

export const isStatePresent =
  (name: string) =>
  (req: Request): boolean => {
    return Boolean(req.signedCookies[name])
  }
