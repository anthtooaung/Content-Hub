import { z } from 'zod';

export const generateRequestSchema = z.object({
  businessName: z.string().min(1).max(120),
  platform: z.enum(['Facebook', 'Instagram', 'TikTok']),
  emotion: z.enum(['excitement', 'trust', 'curiosity', 'urgency', 'joy', 'inspiration']),
  audienceAge: z.enum(['gen-z', 'millennial', 'gen-x', 'boomer']),
  prompt: z.string().min(1).max(2000),
  style: z.string().max(500).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const styleRequestSchema = z.object({
  platform: z.enum(['Facebook', 'Instagram', 'TikTok']),
});

export type StyleRequest = z.infer<typeof styleRequestSchema>;
