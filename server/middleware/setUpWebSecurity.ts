import express, { Response, Router } from 'express'
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

  router.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
    next()
  })

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: [
            "'self'",
            'www.googletagmanager.com',
            'www.google-analytics.com',
            (req: IncomingMessage, res: Response) => `'nonce-${res.locals.cspNonce}'`,
            'code.jquery.com',
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
          ],
          imgSrc: ["'self'", 'www.googletagmanager.com', 'www.google-analytics.com', 'https://code.jquery.com'],
          connectSrc: ["'self'", 'www.googletagmanager.com', 'www.google-analytics.com'],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
    })
  )

  router.use(cookieParser(config.session.secret))

  return router
}
