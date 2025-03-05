// src/validation/schemas.ts
import { z } from 'zod';
import xss from 'xss';

// Sanitize string inputs
const sanitizeString = (value: string): string => xss(value);

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').transform(sanitizeString),
  slug: z.string().min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(sanitizeString)
});

// Answer schema for creating answers
export const answerSchema = z.object({
  answer: z.string().min(1, 'Answer text is required').transform(sanitizeString),
  isCorrect: z.boolean().default(false)
});

// Question schema
export const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').transform(sanitizeString),
  categoryId: z.number().int().positive('Category ID must be a positive integer')
});

// Schema for creating a question with answers
export const questionWithAnswersSchema = questionSchema.extend({
  answers: z.array(answerSchema).min(1, 'At least one answer is required')
});