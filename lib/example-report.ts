// EXAMPLE FIGURES showing the weekly report format, used on the homepage and
// in the /demo report. Always shown with a "not client results" label; never
// presented as a real client's numbers.
export const EXAMPLE_REPORT = {
  spend: 315,
  enquiries: 34,
  qualified: 21,
  booked: 13,
  attended: 10,
} as const;

export const exampleCostPerAttended = EXAMPLE_REPORT.spend / EXAMPLE_REPORT.attended;

export const EXAMPLE_CHANGES = {
  changed:
    'paused the ad with the lowest qualified rate and moved Thursday survey slots to Saturday morning, where bookings were strongest.',
  next: 'test a new headline in two postcode districts.',
};
