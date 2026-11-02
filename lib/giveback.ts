// Pure maths for the "what it gives you back" estimator on /demo.
// Every number comes from the visitor: their hours, their rate, their share of
// work they think could come off their plate, their own quiet quotes. No
// Solardapt uplift or forecast is assumed, and the page says so.

export interface GiveBackInput {
  hoursChasing: number; // per week: chasing enquiries, reminders, rebooking
  hoursQuoting: number; // per week: typing up proposals and grid forms
  hoursEvening: number; // per week: answering messages after hours
  shareOff: number; // 0..1, the visitor's own estimate of how much could be automated
  hourValue: number; // £ an hour of their time is worth
  quietQuotes: number; // quotes in the last 12 months that went quiet
  reopenRate: number; // 0..1, the visitor's own guess at how many could go ahead
  profitPerInstall: number; // £
}

export interface GiveBackOutput {
  hoursPerWeek: number;
  hoursPerYear: number;
  timeValuePerYear: number;
  installsFromQuotes: number;
  quoteProfitPerYear: number;
}

export const WORKING_WEEKS = 46;
const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);
const pos = (n: number) => Math.max(Number.isFinite(n) ? n : 0, 0);

export function calculateGiveBack(i: GiveBackInput): GiveBackOutput {
  const weekly = (pos(i.hoursChasing) + pos(i.hoursQuoting) + pos(i.hoursEvening)) * clamp01(i.shareOff);
  const installs = pos(i.quietQuotes) * clamp01(i.reopenRate);
  return {
    hoursPerWeek: Number(weekly.toFixed(1)),
    hoursPerYear: Math.round(weekly * WORKING_WEEKS),
    timeValuePerYear: Math.round(weekly * WORKING_WEEKS * pos(i.hourValue)),
    installsFromQuotes: Number(installs.toFixed(1)),
    quoteProfitPerYear: Math.round(installs * pos(i.profitPerInstall)),
  };
}
