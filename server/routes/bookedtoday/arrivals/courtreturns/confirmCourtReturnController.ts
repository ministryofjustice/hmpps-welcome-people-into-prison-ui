import { RequestHandler } from 'express'
import type { PrisonService } from '../../../../services'

export default class ConfirmCourtReturnAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { firstName, lastName, prisonNumber } = req.flash('prisoner')?.[0] as Record<string, string>
      if (!firstName || !lastName || !prisonNumber) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }

      const prison = await this.prisonService.getPrison(activeCaseLoadId)

      return res.render('pages/bookedtoday/arrivals/courtreturns/confirmCourtReturnAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
      })
    }
  }
}
