import type { Request } from 'express'
import type { ImprisonmentStatusesService } from '../../services'
import type { ValidationError } from '../validationMiddleware'

export default (imprisonmentStatusesService: ImprisonmentStatusesService) => {
  return async (body: Record<string, string>, req: Request): Promise<ValidationError[]> => {
    const { movementReason, imprisonmentStatus } = body
    const { systemToken } = req.session

    const status = await imprisonmentStatusesService.getImprisonmentStatus(systemToken, imprisonmentStatus)

    return !movementReason ? [{ text: status.secondLevelValidationMessage, href: '#movement-reason-0' }] : []
  }
}
