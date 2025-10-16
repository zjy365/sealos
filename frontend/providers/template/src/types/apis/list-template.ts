import { z } from 'zod';

export const queryParams = z.object({
  language: z.string().optional()
});

export const TemplateItemSchema = z.object({
  name: z.string(),
  uid: z.string(),
  resourceType: z.string(),
  readme: z.string(),
  icon: z.string(),
  description: z.string(),
  gitRepo: z.string(),
  category: z.array(z.string()),
  input: z.record(z.string(), z.any()),
  deployCount: z.number()
});

export const response = z.object({
  code: z.number(),
  data: z
    .object({
      templates: z.array(TemplateItemSchema),
      menuKeys: z.string()
    })
    .optional(),
  message: z.string().optional(),
  error: z.any().optional()
});

export type TemplateItemType = z.infer<typeof TemplateItemSchema>;
