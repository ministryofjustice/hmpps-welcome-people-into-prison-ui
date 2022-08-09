import { defineConfig } from 'cypress'

import { resetStubs } from './integration_tests/mockApis/wiremock'

import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import welcome from './integration_tests/mockApis/welcome'
import bodyscan from './integration_tests/mockApis/bodyScan'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,

        getSignInUrl: auth.getSignInUrl,
        stubSignIn: role => auth.stubSignIn(role),

        stubAuthUser: auth.stubUser,
        stubAuthPing: auth.stubPing,

        stubTokenVerificationPing: tokenVerification.stubPing,

        stubUserCaseLoads: welcome.stubUserCaseLoads,
        stubExpectedArrival: welcome.stubExpectedArrival,
        stubExpectedArrivals: welcome.stubExpectedArrivals,
        stubRecentArrivals: welcome.stubRecentArrivals,
        stubTransfers: welcome.stubTransfers,
        stubTransfer: welcome.stubTransfer,
        stubConfirmTransfer: welcome.stubConfirmTransfer,
        stubConfirmTransferReturnsError: welcome.stubConfirmTransferReturnsError,
        stubWelcomeApiPing: welcome.stubPing,
        stubTemporaryAbsences: welcome.stubTemporaryAbsences,
        stubTemporaryAbsence: welcome.stubTemporaryAbsence,
        stubConfirmTemporaryAbsence: welcome.stubConfirmTemporaryAbsence,
        stubConfirmTemporaryAbsenceReturnsError: welcome.stubConfirmTemporaryAbsenceReturnsError,
        stubConfirmCourtReturn: welcome.stubConfirmCourtReturn,
        stubConfirmCourtReturnsError: welcome.stubConfirmCourtReturnsError,
        stubPrison: welcome.stubPrison,
        stubPrisonerImage: welcome.stubPrisonerImage,
        stubMissingPrisonerImage: welcome.stubMissingPrisonerImage,
        stubCreateOffenderRecordAndBooking: ({ arrivalId, prisonNumber, location }) =>
          welcome.stubCreateOffenderRecordAndBooking(arrivalId, prisonNumber, location),
        stubConfirmUnexpectedArrval: ({ prisonNumber, location }) =>
          welcome.stubConfirmUnexpectedArrval({ prisonNumber, location }),
        stubCreateOffenderRecordAndBookingReturnsError: welcome.stubCreateOffenderRecordAndBookingReturnsError,
        stubImprisonmentStatus: welcome.stubImprisonmentStatus,
        stubMatchedRecords: welcome.stubMatchedRecords,
        stubUnexpectedArrivalsMatchedRecords: welcome.stubUnexpectedArrivalsMatchedRecords,
        stubPrisonerDetails: welcome.stubPrisonerDetails,
        getCourtReturnConfirmationRequest: welcome.getCourtReturnConfirmationRequest,
        getConfirmationRequest: welcome.getConfirmationRequest,
        getUnexpectedConfirmationRequest: welcome.getUnexpectedConfirmationRequest,
        getTransferConfirmationRequest: welcome.getTransferConfirmationRequest,

        // body-scan
        stubBodyScanApiPing: bodyscan.stubPing,
        stubSubmitBodyScan: bodyscan.stubSubmitBodyScan,
        stubRetrieveBodyScanRequest: bodyscan.stubRetrieveBodyScanRequest,
        stubBodyScanPrisonerDetails: bodyscan.stubBodyScanPrisonerDetails,
        stubAddBodyScan: bodyscan.stubAddBodyScan,
        stubGetBodyScan: bodyscan.stubGetBodyScan,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
