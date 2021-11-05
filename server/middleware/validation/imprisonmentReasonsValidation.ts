import { Request, Response, NextFunction } from 'express'
import { urlParse } from '../../utils/utils'
import * as mapUrlToError from './urlMapToError.json'

export default (req: Request, res: Response, next: NextFunction) => {
  const { movementReason } = req.body

  if (!movementReason) {
    const { originalUrl } = req
    const segmentOfUrl = urlParse(originalUrl, -1)
    const errorData = [{ text: mapUrlToError[segmentOfUrl], href: '#movement-reason-1' }]
    req.errors = errorData
    req.flash('errors', errorData)
  }

  next()
}
