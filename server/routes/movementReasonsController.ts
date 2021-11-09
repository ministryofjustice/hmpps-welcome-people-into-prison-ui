import { RequestHandler } from 'express'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class MovementReasonsController {
  public constructor(
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly expectedArrivalsService: ExpectedArrivalsService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id, imprisonmentStatus } = req.params

      const { movementReasons, secondLevelTitle } = await this.imprisonmentStatusesService.getImprisonmentStatus(
        imprisonmentStatus
      )
      const data = await this.expectedArrivalsService.getMove(id)

      return res.render('pages/movementReason.njk', {
        errors: req.flash('errors'),
        imprisonmentStatus,
        secondLevelTitle,
        movementReasons,
        data,
      })
    }
  }

  public assignReason(): RequestHandler {
    return async (req, res) => {
      const { id, imprisonmentStatus } = req.params

      return req.errors
        ? res.redirect(`/prisoners/${id}/imprisonment-status/${imprisonmentStatus}`)
        : res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
