import { Request, Response, NextFunction } from 'express'
import { Services } from '../../services'

export default (services: Services) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { movementReason } = req.body
    const { imprisonmentStatus } = req.params
    const status = await services.imprisonmentStatusesService.getImprisonmentStatus(imprisonmentStatus)

    if (!movementReason) {
      const errorData = [{ text: status.secondLevelValidationMessage, href: '#movement-reason-1' }]
      req.errors = errorData
      req.flash('errors', errorData)
    }

    return next()
  }
}
