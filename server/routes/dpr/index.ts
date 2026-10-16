import { Request, Router } from 'express'
import {
  DprUser,
  routes as reportingRoutes,
  setUpDprResources,
} from '@ministryofjustice/hmpps-digital-prison-reporting-frontend'
import type { Environment } from 'nunjucks'
import type { ResponseError } from 'superagent'
import type { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import Role from '../../authentication/role'

export function dprRouter(router: Router, services: Services): Router {
  router.get(
    '/management-reporting',
    protectRoute(),
    asyncMiddleware(async (req, res) => {
      const definitions = await services.dprService.getManagementReportDefinitions(getSystemToken(req))
      res.render('pages/managementReporting/index.njk', { definitions })
    }),
  )

  return router
}

export function dprReportingRouter(services: Services, env: Environment): Router {
  const router = Router()
  const layoutPath = 'partials/dprLayout.njk'

  router.use(
    '/dpr',
    protectRoute(),
    (req, res, next) => {
      const user = new DprUser()
      user.id = res.locals.user.username
      user.token = getSystemToken(req)
      user.activeCaseLoadId = res.locals.user.activeCaseLoadId
      user.displayName = res.locals.user.displayName
      res.locals.dprUser = user
      next()
    },
    setUpDprResources(services.dprServices, layoutPath, env),
  )
  router.use(reportingRoutes({ services: services.dprServices, layoutPath }))

  return router
}

function getSystemToken(req: Request): string {
  const token = req.session.systemToken
  if (!token) {
    const error: ResponseError = new Error('Missing system token')
    error.status = 401
    throw error
  }
  return token
}

function protectRoute() {
  return asyncMiddleware((req, _res, next) => {
    if (_res.locals.user.isReportUser) {
      return next()
    }

    const error: ResponseError = new Error(`Forbidden. Missing permission: '${Role.REPORT_USER}'`)
    error.status = 403

    return next(error)
  })
}
