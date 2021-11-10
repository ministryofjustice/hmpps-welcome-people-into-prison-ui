import { RequestHandler } from 'express'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class ImprisonmentStatusesController {
  public constructor(
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly expectedArrivalsService: ExpectedArrivalsService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const imprisonmentStatuses = await this.imprisonmentStatusesService.getAllImprisonmentStatuses()
      const data = await this.expectedArrivalsService.getMove(id)

      return res.render('pages/imprisonmentStatus.njk', { errors: req.flash('errors'), imprisonmentStatuses, data })
    }
  }

  public assignStatus(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { imprisonmentStatus } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/imprisonment-status`)
      }

      const selectedImprisonmentStatus = await this.imprisonmentStatusesService.getImprisonmentStatus(
        imprisonmentStatus
      )

      return selectedImprisonmentStatus.movementReasons.length > 1
        ? res.redirect(`/prisoners/${id}/imprisonment-status/${imprisonmentStatus}`)
        : res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
