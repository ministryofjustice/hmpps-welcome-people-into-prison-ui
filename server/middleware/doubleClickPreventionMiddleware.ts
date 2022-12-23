import type { RequestHandler } from 'express'
import crypto from 'crypto'

import logger from '../../logger'
import LockManager from '../data/lockManager'

const LOCK_ID_KEY = 'lockId'

export function lockIdGenerator(): RequestHandler {
  return async (_, res, next) => {
    res.locals[LOCK_ID_KEY] = crypto.randomBytes(10).toString('hex')
    return next()
  }
}

export function obtainLock(lockManager: LockManager): RequestHandler {
  return async (req, _, next) => {
    const key = req.body[LOCK_ID_KEY]
    if (!key) {
      throw new Error(`No lock ID present!`)
    }
    const lockSuccessful = await lockManager.lock(key, 30)
    if (!lockSuccessful) {
      throw new Error(`Failed to acquire lock: ${key}`)
    }
    logger.info(`Obtained lock: ${key}`)
    return next()
  }
}

/** There is no way to await/try/catch on next so have to do this as a separate piece of middleware  */
export function releaseLock(lockManager: LockManager): RequestHandler {
  return async (req, res, next) => {
    const key = req.body[LOCK_ID_KEY]
    if (key) {
      const unlockSuccessful = await lockManager.unlock(key)
      logger.info(`Attempted to release lock: ${key}, result: ${unlockSuccessful}`)
    }
    return res.end()
  }
}
