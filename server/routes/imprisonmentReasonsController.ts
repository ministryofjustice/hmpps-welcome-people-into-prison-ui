import { RequestHandler } from 'express'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { getKeyByValue } from '../utils/utils'
import getMapping from './urlMappings'

export default class ImprisonmentStatusesController {
  public constructor(
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly expectedArrivalsService: ExpectedArrivalsService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id, imprisonmentStatus } = req.params
      const mappings = getMapping()
      const statusDescription = getKeyByValue(mappings, imprisonmentStatus)
      const { movementReasons, secondLevelTitle } = await this.imprisonmentStatusesService.getImprisonmentStatus(
        statusDescription
      )

      const data = await this.expectedArrivalsService.getMove(id)
      return res.render('pages/imprisonmentReason.njk', { imprisonmentStatus, secondLevelTitle, movementReasons, data })
    }
  }

  public assignReason(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { imprisonmentStatus } = req.body
      const selectedStatus = await this.imprisonmentStatusesService.getImprisonmentStatus(imprisonmentStatus)
      const data = await this.expectedArrivalsService.getMove(id)
      return res.redirect(`/${imprisonmentStatus}`)
    }
  }
}
