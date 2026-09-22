import type { RequestHandler } from 'express'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { ExpectedArrivalsService } from '../../services'
import newXRayBodyScansEnabled from '../../utils/featureToggles'

export default class RecentArrivalsSummaryController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly prisonPermissionsService: PermissionsService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const arrival = await this.expectedArrivalsService.getPrisonerSummaryDetails(prisonNumber, activeCaseLoadId)

      if (newXRayBodyScansEnabled(activeCaseLoadId)) {
        const prisoner = await this.prisonPermissionsService.getPrisonerDetails(prisonNumber)
        const user = {
          ...res.locals.user,
          userRoles: res.locals.user.roles,
          caseLoads: res.locals.user.userCaseLoads,
        }

        const prisonerPermissions = this.prisonPermissionsService.getPrisonerPermissions({
          user,
          prisoner,
          requestDependentOn: [],
        })

        return res.render('pages/recentArrivals/recentArrivalsSummary.njk', { arrival, prisonerPermissions })
      }

      return res.render('pages/recentArrivals/recentArrivalsSummary.njk', { arrival })
    }
  }
}
