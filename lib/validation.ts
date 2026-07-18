import { z } from 'zod';

export const generateRequestSchema = z.object({
  businessType: z.string().min(1),
  platform: z.enum(['TikTok', 'Instagram', 'Facebook']),
  tone: z.string().min(1),
  emotion: z.string().optional(),
  ageGroup: z.string().optional(),
  topic: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
