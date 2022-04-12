export default [
  {
    code: 'on-remand',
    description: 'On remand',
    imprisonmentStatusCode: 'RX',
    movementReasons: [
      {
        movementReasonCode: 'R',
      },
    ],
  },
  {
    code: 'convicted-unsentenced',
    description: 'Convicted - waiting to be sentenced',
    imprisonmentStatusCode: 'JR',
    movementReasons: [
      {
        movementReasonCode: 'V',
      },
    ],
  },
  {
    code: 'determinate-sentence',
    description: 'Sentenced - fixed length of time',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'What is the type of determinate sentence?',
    secondLevelValidationMessage: 'Select the type of determinate sentence',
    movementReasons: [
      {
        description: 'Extended sentence for public protection',
        movementReasonCode: '26',
      },
      {
        description: 'Imprisonment without option of a fine',
        movementReasonCode: 'I',
      },
      {
        description: 'Intermittent custodial sentence',
        movementReasonCode: 'INTER',
      },
      {
        description: 'Partly suspended sentence',
        movementReasonCode: 'P',
      },
    ],
  },
  {
    code: 'indeterminate-sentence',
    description: 'Sentenced for life',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'What is the type of indeterminate sentence?',
    secondLevelValidationMessage: 'Select the type of indeterminate sentence',
    movementReasons: [
      {
        description: 'Custody for life - aged under 18',
        movementReasonCode: '27',
      },
      {
        description: 'Custody for life - aged at least 18 but under 21',
        movementReasonCode: '29',
      },
      {
        description: "Detained at Her Majesty's Pleasure under Section 53 (1) Children and Young Persons Act",
        movementReasonCode: 'J',
      },
      {
        description: 'For public protection',
        movementReasonCode: '25',
      },
    ],
  },
  {
    code: 'recall',
    description: 'Recalled',
    imprisonmentStatusCode: 'LR_ORA',
    secondLevelTitle: 'Where is the prisoner being recalled from?',
    secondLevelValidationMessage: 'Select where the person is being recalled from',
    movementReasons: [
      {
        description: 'Detention and Training Order',
        movementReasonCode: 'Y',
      },
      {
        description: 'Emergency temporary release',
        movementReasonCode: 'ETRLR',
      },
      {
        description: 'Error in emergency temporary release',
        movementReasonCode: 'ETRRIE',
      },
      {
        description: 'Foreign national removal scheme',
        movementReasonCode: 'ETB',
      },
      {
        description: 'Home Detention Curfew',
        movementReasonCode: 'B',
      },
      {
        description: 'Home leave',
        movementReasonCode: 'H',
      },
      {
        description: 'Intermittent custody',
        movementReasonCode: '24',
      },
      {
        description: 'Licence',
        movementReasonCode: 'L',
      },
    ],
  },
  {
    code: 'transfer',
    description: 'Transfer from another establishment',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'Where is the prisoner being transferred from?',
    secondLevelValidationMessage: 'Select the type of transfer',
    movementReasons: [
      {
        description: 'Another establishment',
        movementReasonCode: 'INT',
      },
      {
        description: 'A foreign establishment',
        movementReasonCode: 'T',
      },
    ],
  },
  {
    code: 'temporary-stay',
    description: 'Temporary stay enroute to another establishment',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'Why is the prisoner staying at this establishment?',
    secondLevelValidationMessage: 'Select why the person is staying at this establishment',
    movementReasons: [
      {
        description: 'Sameday stopover enroute to another establishment',
        movementReasonCode: 'Z',
      },
      {
        description: 'Overnight stopover enroute to another establishment',
        movementReasonCode: 'S',
      },
      {
        description: 'Overnight stopover for accumulated visits',
        movementReasonCode: 'Q',
      },
    ],
  },
  {
    code: 'awaiting-transfer-to-hospital',
    description: 'Awaiting transfer to hospital',
    imprisonmentStatusCode: 'S35MHA',
    movementReasons: [
      {
        movementReasonCode: 'O',
      },
    ],
  },
  {
    code: 'late-return',
    description: 'Late return from licence',
    imprisonmentStatusCode: 'LR_ORA',
    secondLevelTitle: 'What is the type of late return?',
    secondLevelValidationMessage: 'Select the type of late return',
    movementReasons: [
      {
        description: 'Voluntary',
        movementReasonCode: 'A',
      },
      {
        description: 'Involuntary',
        movementReasonCode: 'U',
      },
    ],
  },
  {
    code: 'detention-under-immigration-powers',
    description: 'Detention under immigration powers',
    imprisonmentStatusCode: 'DET',
    movementReasons: [
      {
        movementReasonCode: 'E',
      },
    ],
  },
  {
    code: 'youth-offender',
    description: 'Detention in Youth Offender Institution',
    imprisonmentStatusCode: 'YOI',
    movementReasons: [
      {
        movementReasonCode: 'W',
      },
    ],
  },
  {
    code: 'recapture',
    description: 'Recapture after escape',
    imprisonmentStatusCode: 'SENT03',
    movementReasons: [
      {
        movementReasonCode: 'RECA',
      },
    ],
  },
  {
    code: 'civil-offence',
    description: 'Civil offence',
    imprisonmentStatusCode: 'CIVIL',
    secondLevelTitle: 'What is the civil offence?',
    secondLevelValidationMessage: 'Select the civil offence',
    movementReasons: [
      {
        description: 'Civil committal',
        movementReasonCode: 'C',
      },
      {
        description: 'Non-payment of a fine',
        movementReasonCode: 'F',
      },
    ],
  },
]
