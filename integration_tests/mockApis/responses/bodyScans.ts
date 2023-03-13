export default {
  okToScan: (prisonNumber = 'A1234BC') => ({
    prisonNumber,
    bodyScanStatus: 'OK_TO_SCAN',
    numberOfBodyScans: 10,
    numberOfBodyScansRemaining: 106,
  }),
  closeToLimit: (prisonNumber = 'A1234BC') => ({
    prisonNumber,
    bodyScanStatus: 'CLOSE_TO_LIMIT',
    numberOfBodyScans: 114,
    numberOfBodyScansRemaining: 1,
  }),
  doNotScan: (prisonNumber = 'A1234BC') => ({
    prisonNumber,
    bodyScanStatus: 'DO_NOT_SCAN',
    numberOfBodyScans: 116,
    numberOfBodyScansRemaining: 0,
  }),
}
