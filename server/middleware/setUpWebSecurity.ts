import express, { Request, Response, NextFunction, Router } from 'express'
import helmet from 'helmet'
import crypto from 'crypto'
import { IncomingMessage } from 'http'
import cookieParser from 'cookie-parser'

import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet

  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })

  // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
  // <script nonce="{{ cspNonce }}">
  // or
  // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
  // This ensures only scripts we trust are loaded, and not anything injected into the
  // page by an attacker.
  const scriptSrc = [
    "'self'",
    '*.googletagmanager.com',
    '*.google-analytics.com',
    (req: IncomingMessage, res: Response) => `'nonce-${res.locals.cspNonce}'`,
    'code.jquery.com',
    "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
  ]
  const styleSrc = ["'self'", (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`, 'code.jquery.com']
  const imgSrc = [
    "'self'",
    'data:',
    '*.googletagmanager.com',
    '*.google-analytics.com',
    '*.analytics.google.com',
    '*.g.doubleclick.net',
    '*.google.com',
    'https://code.jquery.com',
  ]
  const fontSrc = ["'self'"]

  if (config.apis.frontendComponents.url) {
    scriptSrc.push(config.apis.frontendComponents.url)
    styleSrc.push(config.apis.frontendComponents.url)
    imgSrc.push(config.apis.frontendComponents.url)
    fontSrc.push(config.apis.frontendComponents.url)
  }

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc,
          styleSrc,
          imgSrc,
          fontSrc,
          formAction: [`'self' ${config.dpsUrl}`],
          connectSrc: [
            "'self'",
            '*.googletagmanager.com',
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.g.doubleclick.net',
            '*.google.com',
            'https://code.jquery.com',
          ],
        },
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      crossOriginEmbedderPolicy: false,
    })
  )

  router.use(cookieParser(config.session.secret))

  return router
}
