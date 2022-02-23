import type { RequestHandler } from 'express'
import type { ImprisonmentStatusesService } from '../../../services'
import { State } from './state'

export default class MovementReasonsController {
  public constructor(private readonly imprisonmentStatusesService: ImprisonmentStatusesService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id, imprisonmentStatus } = req.params

      const { movementReasons, secondLevelTitle } = await this.imprisonmentStatusesService.getImprisonmentStatus(
        imprisonmentStatus
      )

      const data = State.newArrival.get(req)

      return res.render('pages/bookedtoday/arrivals/movementReason.njk', {
        id,
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

      State.newArrival.update(req, res, {
        code: selectedImprisonmentStatus.code,
        imprisonmentStatus: selectedImprisonmentStatus.imprisonmentStatusCode,
        movementReasonCode: movementReason,
      })

      return res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
