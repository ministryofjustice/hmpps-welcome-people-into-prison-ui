import type { RequestHandler } from 'express'
import type { ImprisonmentStatusesService } from '../../../../services'
import { State } from '../state'

export default class ImprisonmentStatusesController {
  public constructor(private readonly imprisonmentStatusesService: ImprisonmentStatusesService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const imprisonmentStatuses = await this.imprisonmentStatusesService.getAllImprisonmentStatuses()
      const data = State.newArrival.get(req)

      return res.render('pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus.njk', {
        id,
        errors: req.flash('errors'),
        imprisonmentStatuses,
        data,
      })
    }
  }

  public assignStatus(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { imprisonmentStatus } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/imprisonment-status`)
      }

      const selectedImprisonmentStatus =
        await this.imprisonmentStatusesService.getImprisonmentStatus(imprisonmentStatus)

      if (selectedImprisonmentStatus.movementReasons.length === 1) {
        State.newArrival.update(req, res, {
          code: selectedImprisonmentStatus.code,
          imprisonmentStatus: selectedImprisonmentStatus.imprisonmentStatusCode,
          movementReasonCode: selectedImprisonmentStatus.movementReasons[0].movementReasonCode,
        })

        return res.redirect(`/prisoners/${id}/check-answers`)
      }

      return res.redirect(`/prisoners/${id}/imprisonment-status/${imprisonmentStatus}`)
    }
  }
}
