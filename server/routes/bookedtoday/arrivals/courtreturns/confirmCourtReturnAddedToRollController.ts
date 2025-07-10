import { RequestHandler } from 'express'
import type { PrisonService } from '../../../../services'

export default class ConfirmCourtReturnAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const activeCaseLoadId = res.locals.user.activeCaseload.id
      const { systemToken } = req.session
      const { firstName, lastName, prisonNumber, location } =
        (req.flash('prisoner')?.[0] as Record<string, string>) || {}
      if (!firstName || !lastName || !prisonNumber || !location) {
        return res.redirect('/page-not-found')
      }

      const prison = await this.prisonService.getPrison(systemToken, activeCaseLoadId)

      return res.render('pages/bookedtoday/arrivals/courtreturns/confirmCourtReturnAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
        location,
      })
    }
  }
}
