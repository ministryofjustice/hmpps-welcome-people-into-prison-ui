import type { RequestHandler } from 'express'
import logger from '../../logger'
import type LockManager from '../data/lockManager'

export function setLock(lockManager: LockManager, location: string): RequestHandler {
  return async (req, res, next) => {
    const { id: moveId } = req.params

    const lockSuccessful = await lockManager.lock(moveId, 30)

    if (!lockSuccessful) {
      logger.warn(`Unable to set lock - double click? redirecting to: ${location}`)
      return res.redirect(location)
    }
    logger.info(`Double-click prevention lock set for moveId: ${moveId}`)
    return next()
  }
}

export function isLocked(lockManager: LockManager, location: string): RequestHandler {
  return async (req, res, next) => {
    const { id: moveid } = req.params

    const locked = await lockManager.isLocked(moveid)

    if (locked) {
      logger.warn('duplicate booking prevention triggered')
      return res.redirect(location)
    }
    return next()
  }
}
