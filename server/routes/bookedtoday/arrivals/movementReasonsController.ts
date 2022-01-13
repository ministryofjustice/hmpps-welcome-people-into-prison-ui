import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService, ImprisonmentStatusesService } from '../../../services'
import { setImprisonmentStatus } from './state'

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
      const data = await this.expectedArrivalsService.getArrival(id)

      return res.render('pages/bookedtoday/arrivals/movementReason.njk', {
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
      const { movementReason } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/imprisonment-status/${imprisonmentStatus}`)
      }

      const selectedImprisonmentStatus = await this.imprisonmentStatusesService.getImprisonmentStatus(
        imprisonmentStatus
      )

      setImprisonmentStatus(res, {
        code: selectedImprisonmentStatus.code,
        imprisonmentStatus: selectedImprisonmentStatus.imprisonmentStatusCode,
        movementReasonCode: movementReason,
      })

      return res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
