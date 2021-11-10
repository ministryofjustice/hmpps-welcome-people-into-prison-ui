import type { ImprisonmentStatusesService } from '../../services'
import type { ValidationError } from '../validationMiddleware'

export default (imprisonmentStatusesService: ImprisonmentStatusesService) => {
  return async (body: Record<string, string>): Promise<ValidationError[]> => {
    const { movementReason, imprisonmentStatus } = body
    const status = await imprisonmentStatusesService.getImprisonmentStatus(imprisonmentStatus)

    return !movementReason ? [{ text: status.secondLevelValidationMessage, href: '#movement-reason-1' }] : []
  }
}
