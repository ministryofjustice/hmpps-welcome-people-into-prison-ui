/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import moment from 'moment'
import express from 'express'
import * as pathModule from 'path'
import config from '../config'
import { calculateAge, generateCurrentYear } from './utils'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): nunjucks.Environment {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Digital Prison Services'

  // Set domain url on current environment
  app.locals.domain = config.domain

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('formatDate', (value, format) => {
    return value ? moment(value).format(format) : null
  })

  njkEnv.addFilter('calculateAge', value => {
    return calculateAge(value)
  })

  njkEnv.addFilter('toOptions', (array, id: string, valueKey, textKey) => {
    return array.map((item: Record<string, string>, index: number) => ({
      value: item[valueKey],
      text: item[textKey],
      id: `${id}-${index}`,
      attributes: { 'data-qa': `${id}-${index}` },
    }))
  })

  njkEnv.addFilter('findError', (array, formFieldId) => {
    if (!array) return null
    const item = array.find((error: { href: string }) => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('findFirstError', (array, formFieldIds: string[]) => {
    if (!array) return null
    const item = array.find((error: { href: string }) => formFieldIds.find(id => error.href === `#${id}`))
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  const {
    analytics: { googleAnalyticsId, tagManagerContainerId, tagManagerEnvironment },
  } = config

  njkEnv.addGlobal('googleAnalyticsId', googleAnalyticsId)
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId)
  njkEnv.addGlobal('tagManagerEnvironment', tagManagerEnvironment)
  njkEnv.addGlobal('authUrl', config.apis.hmppsAuth.url)
  njkEnv.addGlobal('dpsUrl', config.dpsUrl)
  njkEnv.addGlobal('newDpsUrl', config.newDpsUrl)
  njkEnv.addGlobal('supportingMultitransactionsEnabled', config.supportingMultitransactionsEnabled)
  njkEnv.addGlobal('generateCurrentYear', generateCurrentYear)
  njkEnv.addGlobal('showExpectedArrivalPrisonerSummary', config.showExpectedArrivalPrisonerSummary)
  njkEnv.addGlobal('showPrisonTransferSummary', config.showPrisonTransferSummary)
  njkEnv.addGlobal('showBreadCrumb', config.showBreadCrumb)
  njkEnv.addGlobal('showRecentArrivals', config.showRecentArrivals)
  njkEnv.addGlobal('femalePrisons', config.femalePrisons)
  njkEnv.addGlobal('serviceOutageBannerEnabled', config.serviceOutageBannerEnabled)

  return njkEnv
}
