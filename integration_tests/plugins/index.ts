import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import welcome from '../mockApis/welcome'

export default (on: (string, Record) => void): void => {
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
  })
}
