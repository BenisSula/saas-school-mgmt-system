import { z } from 'zod';

export const academicTermSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startsOn: z.string().date('Invalid start date'),
  endsOn: z.string().date('Invalid end date'),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const classSchema = z.object({
  name: z.string().min(1, 'Class name required'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});


