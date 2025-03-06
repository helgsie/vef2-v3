"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionWithAnswersSchema = exports.questionSchema = exports.answerSchema = exports.categorySchema = void 0;
// src/validation/schemas.ts
const zod_1 = require("zod");
const xss_1 = __importDefault(require("xss"));
// Sanitize string inputs
const sanitizeString = (value) => (0, xss_1.default)(value);
// Category schema
exports.categorySchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, 'Flokkur þarf að vera 3 eða fleiri stafir að lengd')
        .max(256, "Flokkur má ekki vera lengri en 256 stafir")
        .transform(sanitizeString),
    slug: zod_1.z
        .string().min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .transform(sanitizeString)
});
// Answer schema for creating answers
exports.answerSchema = zod_1.z.object({
    answer: zod_1.z
        .string()
        .min(3, 'Svar þarf að vera 3 eða fleiri stafir að lengd')
        .max(512, "Svar má ekki vera lengra en 512 stafir")
        .transform(sanitizeString),
    isCorrect: zod_1.z
        .boolean()
        .default(false)
});
// Question schema
exports.questionSchema = zod_1.z.object({
    questionText: zod_1.z
        .string()
        .min(3, 'Spurning þarf að vera 3 eða fleiri stafir að lengd')
        .max(512, "Spurning má ekki vera lengri en 512 stafir")
        .transform(sanitizeString),
    categoryId: zod_1.z
        .number()
        .int()
        .positive('Númer flokks þarf að vera jákvæð heiltala')
});
// Schema for creating a question with answers
exports.questionWithAnswersSchema = exports.questionSchema.extend({
    answers: zod_1.z
        .array(exports.answerSchema)
        .min(2, 'Spurning þarf að minnsta kosti tvo svarmöguleika')
});
