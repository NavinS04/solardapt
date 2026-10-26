// Pure maths for the "cost of slow follow-up" calculator.
// Uses only the visitor's own inputs: no assumed uplift, no forecast of what
// Solardapt will recover. Fully unit-testable, no PII.

export interface CalculatorInput {
  enquiriesPerMonth: number;
  slowShare: number; // 0..1, share not contacted within an hour
  installRate: number; // 0..1, share of enquiries that become installs
  profitPerInstall: number; // £
}

export interface CalculatorOutput {
  coldEnquiries: number;
  installsAtStake: number;
  valueAtStake: number;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

export function calculateLeakage(input: CalculatorInput): CalculatorOutput {
  const enquiries = Math.max(input.enquiriesPerMonth, 0);
  const profit = Math.max(input.profitPerInstall, 0);

  const coldEnquiries = enquiries * clamp01(input.slowShare);
  const installsAtStake = coldEnquiries * clamp01(input.installRate);

  return {
    coldEnquiries: Math.round(coldEnquiries),
    installsAtStake: Number(installsAtStake.toFixed(1)),
    valueAtStake: Math.round(installsAtStake * profit),
  };
}
