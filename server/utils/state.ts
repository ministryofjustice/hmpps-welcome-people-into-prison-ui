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
    const result = req?.signedCookies?.[name]
    return result ? codec.read(result) : undefined
  }

const isStatePresent =
  (name: string) =>
  (req: Request): boolean => {
    return Boolean(req?.signedCookies?.[name])
  }

export class StateOperations<T> {
  constructor(
    public readonly cookieName: string,
    private readonly codec: Codec<T>
  ) {}

  clear(res: Response) {
    clearState(this.cookieName)(res)
  }

  set(res: Response, data: T): void {
    setState(this.cookieName, this.codec)(res, data)
  }

  get(req: Request): T | undefined {
    return getState(this.cookieName, this.codec)(req)
  }

  read(record: Record<string, unknown>) {
    return this.codec.read(record)
  }

  write(value: T) {
    return this.codec.write(value)
  }

  isStatePresent(req: Request) {
    return isStatePresent(this.cookieName)(req)
  }

  update(req: Request, res: Response, update: Partial<T>) {
    const val = getState(this.cookieName, this.codec)(req)
    const newValue = { ...val, ...update }
    setState(this.cookieName, this.codec)(res, newValue)
    return newValue
  }

  ensurePresent(redirectUrl: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) =>
      isStatePresent(this.cookieName)(req) ? next() : res.redirect(redirectUrl)
  }
}
