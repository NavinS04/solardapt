// Pure ROI maths for the interactive calculator (BUILD_SPEC §6.6).
// No PII, fully unit-testable, region-aware currency handled in the UI layer.

export interface CalculatorInput {
  installsPerMonth: number;
  averageJobValue: number;
  currentCloseRate: number; // 0..1
}

export interface CalculatorOutput {
  extraAppointments: number;
  addedMonthlyRevenue: number;
  estimatedRoi: number; // multiple, e.g. 4.2x
  revenueLost: number;
}

// Conservative, transparent assumptions. Tunable via Content/CMS-lite defaults.
export const CALC_ASSUMPTIONS = {
  // Extra qualified appointments a dialled-in Meta funnel can add per month,
  // expressed relative to current install volume. Deliberately conservative.
  appointmentUpliftFactor: 1.5,
  // Estimated monthly ad + management cost used for the ROI denominator.
  estimatedMonthlyInvestment: 2500,
  // Share of demand currently missed without a predictable pipeline.
  missedDemandFactor: 0.6,
};

export function calculateRoi(input: CalculatorInput): CalculatorOutput {
  const closeRate = Math.min(Math.max(input.currentCloseRate, 0), 1);
  const installs = Math.max(input.installsPerMonth, 0);
  const jobValue = Math.max(input.averageJobValue, 0);

  const extraAppointments = Math.round(installs * CALC_ASSUMPTIONS.appointmentUpliftFactor);
  const extraInstalls = extraAppointments * closeRate;
  const addedMonthlyRevenue = Math.round(extraInstalls * jobValue);

  const estimatedRoi =
    CALC_ASSUMPTIONS.estimatedMonthlyInvestment > 0
      ? Number((addedMonthlyRevenue / CALC_ASSUMPTIONS.estimatedMonthlyInvestment).toFixed(1))
      : 0;

  const revenueLost = Math.round(
    installs * CALC_ASSUMPTIONS.missedDemandFactor * jobValue,
  );

  return { extraAppointments, addedMonthlyRevenue, estimatedRoi, revenueLost };
}
