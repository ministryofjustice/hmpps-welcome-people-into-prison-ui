import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import Role from '../../authentication/role'

export default class SummaryMoveOnlyController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { userRoles } = res.locals.user
      const { systemToken } = req.session
      const arrival = await this.expectedArrivalsService.getArrival(systemToken, id)
      const confirmArrivalEnabled = userRoles.includes(Role.PRISON_RECEPTION)
      return res.render('pages/bookedtoday/summaryMoveOnly.njk', { arrival, confirmArrivalEnabled })
    }
  }
}
