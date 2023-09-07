import type { RequestHandler } from 'express'
import type { TransfersService } from '../../../services'
import Role from '../../../authentication/role'

export default class SummaryTransferController {
  public constructor(private readonly transfersService: TransfersService) {}

  public summaryTransfer(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { prisonNumber } = req.params
      const { roles } = res.locals.user
      const transfer = await this.transfersService.getTransferWithBodyScanDetails(activeCaseLoadId, prisonNumber)
      const enableDpsLink = roles.includes(Role.PRISON_RECEPTION) && roles.includes(Role.ROLE_INACTIVE_BOOKINGS)
      const confirmArrivalEnabled = roles.includes(Role.PRISON_RECEPTION)
      return res.render(`pages/bookedtoday/transfers/summaryTransfer.njk`, {
        transfer,
        enableDpsLink,
        confirmArrivalEnabled,
      })
    }
  }
}
