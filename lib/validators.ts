// Zod validators for every public boundary.
import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  business: z.string().max(160).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .min(6, 'Enter a valid phone number')
    .max(32)
    .regex(/^[+\d\s()-]+$/, 'Enter a valid phone number'),
  jobsPerMonth: z.coerce.number().int().min(0).max(10000).optional(),
  message: z.string().max(2000).optional().or(z.literal('')),
  // Attribution, captured from the landing URL.
  page: z.string().max(200).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  // Anti-bot honeypot — must stay empty.
  company_website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
