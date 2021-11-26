import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import TransfersService from '../services/transfersService'

export default class CheckTransferController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly transfersService: TransfersService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const { firstName, lastName } = req.flash('prisoner')?.[0] as Record<string, string>

      if (!firstName && !lastName) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }

      const prison = await this.expectedArrivalsService.getPrison(activeCaseLoadId)
      return res.render('pages/confirmTransferAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
      })
    }
  }
}
