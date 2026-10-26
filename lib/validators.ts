// Zod validators for every public boundary (BUILD_SPEC §10 security).
import { z } from 'zod';

export const MARKETS = ['UK', 'IRELAND', 'USA', 'AUSTRALIA', 'MIDDLE_EAST'] as const;
export type Market = (typeof MARKETS)[number];

export const leadSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(120),
  business: z.string().max(160).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .min(6, 'Enter a valid phone number')
    .max(32)
    .regex(/^[+\d\s()-]+$/, 'Enter a valid phone number'),
  jobsPerMonth: z.coerce.number().int().min(0).max(10000).optional(),
  market: z.enum(MARKETS).optional(),
  // Tracking metadata captured from the Meta click.
  source: z.string().max(64).optional(),
  fbclid: z.string().max(512).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  message: z.string().max(2000).optional().or(z.literal('')),
  // Anti-bot honeypot — must stay empty.
  company_website: z.string().max(0).optional(),
  consentMarketing: z.boolean().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
