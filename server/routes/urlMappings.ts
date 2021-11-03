export default function getMapping(): Record<string, string | boolean> {
  return {
    'Determinate sentence': 'determinate-sentence',
    'Indeterminate sentence': 'indeterminate-sentence',
    'Recall from licence or temporary release': 'recall',
    'Late return from licence': 'late-return',
    'Transfer from another establishment': 'transfer',
    'Temporary stay enroute to another establishment': 'temporary-stay',
    'Civil offence': 'civil-offence',
    'On remand': false,
    'Convicted unsentenced': false,
    'Awaiting transfer to hospital': false,
    'Detention under immigration powers': false,
    'Detention in Youth Offender Institution': false,
    'Recapture after escape': false,
  }
}
