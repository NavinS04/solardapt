// Qualification for the Solar Survey Engine demo: a fixed points table (rules,
// not AI), so the same answers always give the same score. Shared by the /demo
// page and the CLI.
export const QUALIFY_AT = 55;

export type QuestionKey = 'type' | 'roof' | 'bill' | 'when';
export interface Question { key: QuestionKey; title: string; sub: string; opts: [label: string, points: number][] }

export const QUESTIONS: Question[] = [
  {
    key: 'type',
    title: 'What type of property is it?',
    sub: 'Helps us plan the survey.',
    opts: [['Detached', 20], ['Semi-detached', 20], ['Terraced', 15], ['Bungalow', 20], ['Flat or maisonette', 0]],
  },
  {
    key: 'roof',
    title: 'Which way does the main roof face?',
    sub: 'Not sure is fine, the surveyor checks.',
    opts: [['South', 25], ['East or west', 20], ['North', 5], ['Not sure', 12]],
  },
  {
    key: 'bill',
    title: 'Roughly what’s your monthly electricity bill?',
    sub: 'A ballpark is plenty.',
    opts: [['Over £150', 25], ['£75 to £150', 18], ['Under £75', 8]],
  },
  {
    key: 'when',
    title: 'When are you hoping to install?',
    sub: 'No pressure either way.',
    opts: [['As soon as possible', 30], ['In 1 to 3 months', 25], ['In 3 to 6 months', 15], ['Just researching', 5]],
  },
];

export interface QualifyResult {
  score: number;
  qualified: boolean;
  breakdown: { key: QuestionKey; answer: string; points: number }[];
}

/** Score a full set of answers (option labels, matched case-insensitively). */
export function qualify(answers: Record<QuestionKey, string>): QualifyResult {
  const breakdown = QUESTIONS.map((q) => {
    const given = answers[q.key];
    const opt = q.opts.find(([label]) => label.toLowerCase() === given?.trim().toLowerCase());
    if (!opt) throw new Error(`Unknown answer for "${q.key}": ${given ?? '(missing)'}`);
    return { key: q.key, answer: opt[0], points: opt[1] };
  });
  const score = breakdown.reduce((a, b) => a + b.points, 0);
  return { score, qualified: score >= QUALIFY_AT, breakdown };
}
