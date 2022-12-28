import type { RequestHandler } from 'express'
import crypto from 'crypto'

import logger from '../../logger'
import type LockManager from '../data/lockManager'

const LOCK_ID_KEY = 'lockId'

export function lockIdGenerator(): RequestHandler {
  return async (_, res, next) =>
    crypto.randomBytes(10, (err, buff) => {
      if (err) return next(err)
      res.locals[LOCK_ID_KEY] = buff.toString('hex')
      return next()
    })
}

export function obtainLock(lockManager: LockManager, location: string): RequestHandler {
  return async (req, res, next) => {
    const key = req.body[LOCK_ID_KEY]
    if (!key) {
      logger.info('No lock ID present!')
      throw new Error(`No lock ID present!`)
    }
    const lockSuccessful = await lockManager.lock(key, 30)
    if (!lockSuccessful) {
      logger.warn(`Unable to obtain lock - double click? redirecting to: ${location}`)
      return res.redirect(location)
    }
    logger.info(`Obtained lock: ${key}`)
    return next()
  }
}
