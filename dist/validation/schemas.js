// src/validation/schemas.ts
import { z } from 'zod';
import xss from 'xss';
// Sanitize string inputs
const sanitizeString = (value) => xss(value);
// Category schema
export const categorySchema = z.object({
    title: z
        .string()
        .min(3, 'Flokkur þarf að vera 3 eða fleiri stafir að lengd')
        .max(256, "Flokkur má ekki vera lengri en 256 stafir")
        .transform(sanitizeString),
    slug: z
        .string().min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .transform(sanitizeString)
});
// Answer schema for creating answers
export const answerSchema = z.object({
    answer: z
        .string()
        .min(3, 'Svar þarf að vera 3 eða fleiri stafir að lengd')
        .max(512, "Svar má ekki vera lengra en 512 stafir")
        .transform(sanitizeString),
    isCorrect: z
        .boolean()
        .default(false)
});
// Question schema
export const questionSchema = z.object({
    questionText: z
        .string()
        .min(3, 'Spurning þarf að vera 3 eða fleiri stafir að lengd')
        .max(512, "Spurning má ekki vera lengri en 512 stafir")
        .transform(sanitizeString),
    categoryId: z
        .number()
        .int()
        .positive('Númer flokks þarf að vera jákvæð heiltala')
});
// Schema for creating a question with answers
export const questionWithAnswersSchema = questionSchema.extend({
    answers: z
        .array(answerSchema)
        .min(2, 'Spurning þarf að minnsta kosti tvo svarmöguleika')
});
