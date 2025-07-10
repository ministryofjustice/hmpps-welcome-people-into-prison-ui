import { RequestHandler } from 'express'
import { BodyScanService } from '../services'

export default class ScanConfirmationController {
  public constructor(private readonly bodyScanService: BodyScanService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const bodyScan = req.flash('body-scan')?.[0] as Record<string, string>
      const { systemToken } = req.session

      if (!bodyScan) {
        return res.redirect('/page-not-found')
      }

      const prisonerDetails = await this.bodyScanService.getPrisonerDetails(systemToken, prisonNumber)
      return res.render('pages/bodyscans/scanConfirmation.njk', {
        prisonNumber,
        prisonerDetails,
        bodyScan,
      })
    }
  }
}
