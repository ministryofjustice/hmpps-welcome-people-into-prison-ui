/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["app"] }] */

import express from 'express'

const preprodText = 'This test version of DPS contains real data which may be up to 2 weeks old.'

export default (app: express.Express, phaseName: string) => {
  app.locals.phaseName = phaseName
  app.locals.phaseNameColour = phaseName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.phaseNameText = phaseName === 'PRE-PRODUCTION' ? preprodText : ''
}
