import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import Role from '../../authentication/role'

export default class SummaryWithRecordController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { roles } = res.locals.user
      const enableDpsLink = roles.includes(Role.PRISON_RECEPTION) && roles.includes(Role.ROLE_INACTIVE_BOOKINGS)
      const data = await this.expectedArrivalsService.getArrivalAndSummaryDetails(id)
      return res.render('pages/bookedtoday/summaryWithRecord.njk', { ...data, enableDpsLink })
    }
  }
}
