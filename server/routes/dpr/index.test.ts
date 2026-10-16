import express, { Router, ErrorRequestHandler } from 'express'
import cookieSession from 'cookie-session'
import { createClient } from 'redis'
import request from 'supertest'
import path from 'path'
import {
  routes as reportingRoutes,
  setUpDprResources,
} from '@ministryofjustice/hmpps-digital-prison-reporting-frontend'
import type { Services } from '../../services'
import config from '../../config'
import nunjucksSetup from '../../utils/nunjucksSetup'
import { dprRouter, dprReportingRouter } from '.'

jest.mock('@ministryofjustice/hmpps-digital-prison-reporting-frontend', () => ({
  ...jest.requireActual('@ministryofjustice/hmpps-digital-prison-reporting-frontend'),
  routes: jest.fn(),
  setUpDprResources: jest.fn(),
}))

describe('Management reporting routes', () => {
  const getManagementReportDefinitions = jest.fn()
  const resources = jest.fn((_req, _res, next) => next())
  const services = {
    dprService: { getManagementReportDefinitions },
    dprServices: {},
  } as unknown as Services

  function createApp(isReportUser = true, withSystemToken = true) {
    const app = express()
    const env = nunjucksSetup(app, path)
    app.use(cookieSession({ keys: ['test-session-key'] }))
    app.use((req, res, next) => {
      if (withSystemToken) req.session.systemToken = 'system-token'
      req.flash = jest.fn().mockReturnValue([])
      res.locals.user = {
        username: 'report-user',
        displayName: 'Report User',
        activeCaseLoadId: 'MDI',
        isReportUser,
      }
      next()
    })
    app.use(dprRouter(Router(), services))
    app.use(dprReportingRouter(services, env))
    const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
      res.status(error.status || 500).json({ message: error.message })
    }
    app.use(errorHandler)
    return { app, env }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    services.dprServices = {} as Services['dprServices']
    getManagementReportDefinitions.mockResolvedValue([])
    jest.mocked(setUpDprResources).mockReturnValue(resources)
    jest.mocked(reportingRoutes).mockImplementation(() => {
      const router = Router()
      router.get('/dpr/test', (_req, res) => res.json(res.locals.dprUser))
      return router
    })
  })

  it('links authorised report variants to the supported synchronous report route', async () => {
    getManagementReportDefinitions.mockResolvedValue([
      {
        id: 'reception',
        name: 'Reception',
        authorised: true,
        variants: [{ id: 'arrivals', name: 'Arrivals' }],
      },
    ])
    const { app } = createApp()

    const response = await request(app).get('/management-reporting').expect(200)

    expect(response.text).toContain('/dpr/view-report/sync/report/reception/arrivals/load-report')
    expect(getManagementReportDefinitions).toHaveBeenCalledWith('system-token')
    expect(resources).not.toHaveBeenCalled()
  })

  it('denies the management report list to users without the report permission', async () => {
    const { app } = createApp(false)

    await request(app).get('/management-reporting').expect(403)

    expect(getManagementReportDefinitions).not.toHaveBeenCalled()
  })

  it('denies DPR routes before initializing reporting resources', async () => {
    const { app } = createApp(false)

    await request(app).get('/dpr/test').expect(403)

    expect(resources).not.toHaveBeenCalled()
  })

  it('initializes DPR requests with the system token and current user', async () => {
    const { app, env } = createApp()

    const response = await request(app).get('/dpr/test').expect(200)

    expect(response.body).toEqual({
      id: 'report-user',
      token: 'system-token',
      activeCaseLoadId: 'MDI',
      displayName: 'Report User',
    })
    expect(setUpDprResources).toHaveBeenCalledWith(services.dprServices, 'partials/dprLayout.njk', env)
    expect(resources).toHaveBeenCalledTimes(1)
  })

  it.each(['/management-reporting', '/dpr/test'])('rejects %s when the system token is missing', async requestPath => {
    const { app } = createApp(true, false)

    await request(app).get(requestPath).expect(401, { message: 'Missing system token' })

    expect(getManagementReportDefinitions).not.toHaveBeenCalled()
    expect(resources).not.toHaveBeenCalled()
  })

  it('forwards definition failures to the application error handler', async () => {
    getManagementReportDefinitions.mockRejectedValue(new Error('Definitions unavailable'))
    const { app } = createApp()

    await request(app).get('/management-reporting').expect(500, { message: 'Definitions unavailable' })
  })

  it('renders a synchronous report loading page using the installed DPR router and resources', async () => {
    const dpr = jest.requireActual<typeof import('@ministryofjustice/hmpps-digital-prison-reporting-frontend')>(
      '@ministryofjustice/hmpps-digital-prison-reporting-frontend',
    )
    const clients = dpr.initDprReportingClients(
      {
        ...config.apis.welcome,
        agent: { ...config.apis.welcome.agent, timeout: config.apis.welcome.timeout.response },
      },
      createClient(),
    )
    services.dprServices = dpr.createDprServices(clients)
    jest.spyOn(clients.reportDataStore, 'getUserConfig').mockResolvedValue({
      requestedReports: [],
      recentlyViewedReports: [],
      bookmarks: [],
      subscriptions: [],
      downloadPermissions: [],
      defaultFilters: [],
    })
    jest.spyOn(services.dprServices.featureFlagService, 'evaluateBooleanFlags').mockResolvedValue({
      saveDefaultsEnabled: false,
      streamingDownloadEnabled: false,
      barChartsEnabled: false,
      lineChartsEnabled: false,
      donutChartsEnabled: false,
      scorecardChartsEnabled: false,
      scorecardgroupChartsEnabled: false,
      matrixtimeseriesChartsEnabled: false,
      bartimeseriesChartsEnabled: false,
      linetimeseriesChartsEnabled: false,
    })
    jest.spyOn(services.dprServices.reportingService, 'getDefinitions').mockResolvedValue([])
    jest.spyOn(services.dprServices.reportingService, 'getDefinitionSummary').mockImplementation(
      jest.fn().mockResolvedValue({
        id: 'reception',
        name: 'Reception',
        authorised: true,
        variants: [{ id: 'arrivals', name: 'Arrivals' }],
      }),
    )
    jest.spyOn(services.dprServices.reportingService, 'getDefinition').mockImplementation(
      jest.fn().mockResolvedValue({
        id: 'reception',
        name: 'Reception',
        variant: { id: 'arrivals', name: 'Arrivals', specification: { fields: [] } },
      }),
    )
    jest.mocked(reportingRoutes).mockImplementation(dpr.routes)
    jest.mocked(setUpDprResources).mockImplementation(dpr.setUpDprResources)
    const { app } = createApp()

    const response = await request(app).get('/dpr/view-report/sync/report/reception/arrivals/load-report').expect(200)

    expect(response.text).toContain('Arrivals')
    expect(response.text).toContain('/assets/js/dpr.js')
    expect(services.dprServices.reportingService.getDefinition).toHaveBeenCalledWith(
      'system-token',
      'reception',
      'arrivals',
      undefined,
    )
  })
})
