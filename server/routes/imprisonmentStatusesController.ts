import { RequestHandler } from 'express'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import * as urlMappings from './urlMappings.json'

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

      return res.render('pages/imprisonmentStatus.njk', { imprisonmentStatuses, data })
    }
  }

  public assignStatus(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { imprisonmentStatus } = req.body

      return urlMappings[`${imprisonmentStatus}`]
        ? res.redirect(`/prisoners/${id}/imprisonment-status/${urlMappings[`${imprisonmentStatus}`]}`)
        : res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
