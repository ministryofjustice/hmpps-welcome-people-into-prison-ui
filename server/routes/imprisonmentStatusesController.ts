import { RequestHandler } from 'express'
import type ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import type ExpectedArrivalsService from '../services/expectedArrivalsService'
import { setImprisonmentStatus } from './state'

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

      if (selectedImprisonmentStatus.movementReasons.length === 1) {
        setImprisonmentStatus(res, {
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
