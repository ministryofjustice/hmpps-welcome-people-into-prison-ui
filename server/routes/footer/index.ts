import { Router } from 'express'
import AccessibilityStatementController from './accessibilityStatementController'
import Routes from '../../utils/routeBuilder'

export default function routes(): Router {
  const accessibilityStatement = new AccessibilityStatementController()
  return Routes.forAnyRole().get('/accessibility-statement', accessibilityStatement.view()).build()
}
