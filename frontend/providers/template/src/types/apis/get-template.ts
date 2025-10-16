import { z } from 'zod';

export const pathParams = z.object({
  name: z.string()
});

export const queryParams = z.object({
  language: z.string().optional()
});

export const ResourceSchema = z.object({
  cpu: z.union([z.number(), z.object({ min: z.number(), max: z.number() })]).nullable(),
  memory: z.union([z.number(), z.object({ min: z.number(), max: z.number() })]).nullable(),
  storage: z.union([z.number(), z.object({ min: z.number(), max: z.number() })]).nullable(),
  nodeport: z.number()
});

export const TemplateDetailSchema = z.object({
  name: z.string(),
  uid: z.string(),
  resourceType: z.string(),
  resource: ResourceSchema.nullable(),
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
  data: TemplateDetailSchema.optional(),
  message: z.string().optional(),
  error: z.any().optional()
});

export type ResourceType = z.infer<typeof ResourceSchema>;
export type TemplateDetailType = z.infer<typeof TemplateDetailSchema>;
