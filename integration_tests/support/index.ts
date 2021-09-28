import './commands'
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command'

addMatchImageSnapshotCommand({
  failureThreshold: 0.0007,
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.3 },
  capture: 'fullPage',
})
