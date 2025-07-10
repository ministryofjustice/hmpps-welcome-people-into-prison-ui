import type { RequestHandler } from 'express'
import type { TransfersService } from '../../../services'
import Role from '../../../authentication/role'

export default class SummaryTransferController {
  public constructor(private readonly transfersService: TransfersService) {}

  public summaryTransfer(): RequestHandler {
    return async (req, res) => {
      const activeCaseLoadId = res.locals.user.activeCaseload.id
      const { prisonNumber } = req.params
      const { userRoles } = res.locals.user
      const { systemToken } = req.session

      const transfer = await this.transfersService.getTransferWithBodyScanDetails(systemToken, activeCaseLoadId, prisonNumber)
      const enableDpsLink =
        (userRoles.includes(Role.PRISON_RECEPTION) && userRoles.includes(Role.ROLE_INACTIVE_BOOKINGS)) ||
        (userRoles.includes(Role.PRISON_RECEPTION) && userRoles.includes(Role.GLOBAL_SEARCH))
      const confirmArrivalEnabled = userRoles.includes(Role.PRISON_RECEPTION)
      return res.render(`pages/bookedtoday/transfers/summaryTransfer.njk`, {
        transfer,
        enableDpsLink,
        confirmArrivalEnabled,
      })
    }
  }
}
