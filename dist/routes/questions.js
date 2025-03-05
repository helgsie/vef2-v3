"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRoutes = void 0;
// src/routes/questions.ts
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const index_1 = require("../index");
const schemas_1 = require("../validation/schemas");
const questionRoutes = new hono_1.Hono();
exports.questionRoutes = questionRoutes;
// GET /questions - Sækja allar spurningar
questionRoutes.get('/', (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield index_1.prisma.question.findMany({
            include: {
                category: true,
                answers: true
            }
        });
        return c.json(questions, 200);
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }
}));
// GET /questions/:id - Sækja ákveðna spurningu
questionRoutes.get('/:id', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
        return c.json({ error: 'Invalid question ID' }, 400);
    }
    try {
        const question = yield index_1.prisma.question.findUnique({
            where: { id },
            include: {
                category: true,
                answers: true
            }
        });
        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }
        return c.json(question, 200);
    }
    catch (error) {
        console.error(`Error fetching question ${id}:`, error);
        throw error;
    }
}));
// POST /questions - Búa til nýja spurningu með svör
questionRoutes.post('/', (0, zod_validator_1.zValidator)('json', schemas_1.questionWithAnswersSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield c.req.json();
    try {
        // Athuga hvort flokkur sé til
        const category = yield index_1.prisma.category.findUnique({
            where: { id: body.categoryId }
        });
        if (!category) {
            return c.json({ error: 'Category not found' }, 400);
        }
        // Create question and answers in a transaction
        const newQuestion = yield index_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const question = yield tx.question.create({
                data: {
                    questionText: body.questionText,
                    categoryId: body.categoryId
                }
            });
            // Búa til svör fyrir spurningu
            const answers = yield Promise.all(body.answers.map((answer) => tx.answer.create({
                data: {
                    answer: answer.answer,
                    isCorrect: answer.isCorrect,
                    questionId: question.id
                }
            })));
            return Object.assign(Object.assign({}, question), { answers });
        }));
        return c.json(newQuestion, 200);
    }
    catch (error) {
        console.error('Error creating question:', error);
        throw error;
    }
}));
// PATCH /questions/:id - Uppfæra spurningu
questionRoutes.patch('/:id', (0, zod_validator_1.zValidator)('json', schemas_1.questionSchema.partial()), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
        return c.json({ error: 'Invalid question ID' }, 400);
    }
    const body = yield c.req.json();
    try {
        // Check if the question exists
        const existingQuestion = yield index_1.prisma.question.findUnique({
            where: { id }
        });
        if (!existingQuestion) {
            return c.json({ error: 'Question not found' }, 404);
        }
        // If updating the category, check that it exists
        if (body.categoryId) {
            const category = yield index_1.prisma.category.findUnique({
                where: { id: body.categoryId }
            });
            if (!category) {
                return c.json({ error: 'Category not found' }, 400);
            }
        }
        const updatedQuestion = yield index_1.prisma.question.update({
            where: { id },
            data: body,
            include: {
                answers: true,
                category: true
            }
        });
        return c.json(updatedQuestion, 200);
    }
    catch (error) {
        console.error(`Error updating question ${id}:`, error);
        throw error;
    }
}));
// DELETE /questions/:id - Eyða spurningu
questionRoutes.delete('/:id', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
        return c.json({ error: 'Invalid question ID' }, 400);
    }
    try {
        // Check if the question exists
        const existingQuestion = yield index_1.prisma.question.findUnique({
            where: { id }
        });
        if (!existingQuestion) {
            return c.json({ error: 'Question not found' }, 404);
        }
        // Delete the question (answers will be deleted due to cascade delete)
        yield index_1.prisma.question.delete({
            where: { id }
        });
        return c.body(null, 204);
    }
    catch (error) {
        console.error(`Error deleting question ${id}:`, error);
        throw error;
    }
}));
// POST /questions/:id/answers - Add an answer to a question
questionRoutes.post('/:id/answers', (0, zod_validator_1.zValidator)('json', schemas_1.answerSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const questionId = parseInt(c.req.param('id'), 10);
    if (isNaN(questionId)) {
        return c.json({ error: 'Invalid question ID' }, 400);
    }
    const body = yield c.req.json();
    try {
        // Check if the question exists
        const question = yield index_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }
        const newAnswer = yield index_1.prisma.answer.create({
            data: {
                answer: body.answer,
                isCorrect: body.isCorrect,
                questionId
            }
        });
        return c.json(newAnswer, 200);
    }
    catch (error) {
        console.error(`Error creating answer for question ${questionId}:`, error);
        throw error;
    }
}));
