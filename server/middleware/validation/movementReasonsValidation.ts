import { Request, Response, NextFunction } from 'express'
import { ImprisonmentStatusesService } from '../../services'

export default (imprisonmentStatusesService: ImprisonmentStatusesService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { movementReason } = req.body
    const { imprisonmentStatus } = req.params
    const status = await imprisonmentStatusesService.getImprisonmentStatus(imprisonmentStatus)

    if (!movementReason) {
      const errorData = [{ text: status.secondLevelValidationMessage, href: '#movement-reason-1' }]
      req.errors = errorData
      req.flash('errors', errorData)
    }

    return next()
  }
}
