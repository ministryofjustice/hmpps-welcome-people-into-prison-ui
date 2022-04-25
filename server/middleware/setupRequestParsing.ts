import express, { Router } from 'express'
import { trimObjectValues } from '../utils/utils'

export default function setUpWebRequestParsing(): Router {
  const router = express.Router()
  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))

  router.use((req, res, next) => {
    req.body = trimObjectValues(req.body)
    next()
  })
  return router
}
