import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { clearImprisonmentStatus } from './state'

export default class ConfirmAddedToRollController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const offenderNumber = req.flash('offenderNumber')?.[0]
      if (!offenderNumber) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }
      const { id } = req.params
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getMove(id)
      const prison = await this.expectedArrivalsService.getPrison(activeCaseLoadId)
      clearImprisonmentStatus(res)
      return res.render('pages/confirmAddedToRoll', { data, prison, offenderNumber })
    }
  }
}
