import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import Role from '../../authentication/role'

export default class SummaryWithRecordController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const roles = res.locals.user.userRoles
      const { systemToken } = req.session
      const enableDpsLink =
        (roles.includes(Role.PRISON_RECEPTION) && roles.includes(Role.ROLE_INACTIVE_BOOKINGS)) ||
        (roles.includes(Role.PRISON_RECEPTION) && roles.includes(Role.GLOBAL_SEARCH))
      const confirmArrivalEnabled = roles.includes(Role.PRISON_RECEPTION)
      const data = await this.expectedArrivalsService.getArrivalAndSummaryDetails(systemToken, id)
      return res.render('pages/bookedtoday/summaryWithRecord.njk', { ...data, enableDpsLink, confirmArrivalEnabled })
    }
  }
}
