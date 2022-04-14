import * as cheerio from 'cheerio'
import type { Response } from 'supertest'

// eslint-disable-next-line import/prefer-default-export
export const testErrorMessageExists = (res: Response, errorMessage: string) => {
  const $ = cheerio.load(res.text)
  expect($('#error-summary-title').text()).toContain('There is a problem')
  expect($('.govuk-error-summary__body').text()).toContain(errorMessage)
  expect($('.govuk-error-message').text()).toContain(errorMessage)
}
