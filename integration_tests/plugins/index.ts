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
    stubWelcomeApiPing: welcome.stubPing,
    stubTemporaryAbsences: welcome.stubTemporaryAbsences,
    stubPrison: welcome.stubPrison,
    stubPrisonerImage: welcome.stubPrisonerImage,
    stubMissingPrisonerImage: welcome.stubMissingPrisonerImage,
    stubCreateOffenderRecordAndBooking: welcome.stubCreateOffenderRecordAndBooking,
    stubImprisonmentStatus: welcome.stubImprisonmentStatus,
  })
}
