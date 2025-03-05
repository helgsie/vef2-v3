// src/routes/questions.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index';
import { questionSchema, questionWithAnswersSchema, answerSchema } from '../validation/schemas';

const questionRoutes = new Hono();

type Answer = z.infer<typeof answerSchema>;

// GET /questions - Sækja allar spurningar
questionRoutes.get('/', async (c) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: true,
        answers: true
      }
    });
    return c.json(questions, 200);
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
});

// GET /questions/:id - Sækja ákveðna spurningu
questionRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  try {
    const question = await prisma.question.findUnique({
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
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    throw error;
  }
});

// POST /questions - Búa til nýja spurningu með svör
questionRoutes.post('/', zValidator('json', questionWithAnswersSchema), async (c) => {
  const body = await c.req.json();
  
  try {
    // Athuga hvort flokkur sé til
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId }
    });
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 400);
    }
    
    // Create question and answers in a transaction
    const newQuestion = await prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          questionText: body.questionText,
          categoryId: body.categoryId
        }
      });
      
      // Búa til svör fyrir spurningu
      const answers = await Promise.all(
        body.answers.map((answer: Answer) => 
          tx.answer.create({
            data: {
              answer: answer.answer,
              isCorrect: answer.isCorrect,
              questionId: question.id
            }
          })
        )
      );
      
      return {
        ...question,
        answers
      };
    });
    
    return c.json(newQuestion, 200);
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
});

// PATCH /questions/:id - Uppfæra spurningu
questionRoutes.patch('/:id', zValidator('json', questionSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  const body = await c.req.json();
  
  try {
    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    // If updating the category, check that it exists
    if (body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId }
      });
      
      if (!category) {
        return c.json({ error: 'Category not found' }, 400);
      }
    }
    
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: body,
      include: {
        answers: true,
        category: true
      }
    });
    
    return c.json(updatedQuestion, 200);
  } catch (error) {
    console.error(`Error updating question ${id}:`, error);
    throw error;
  }
});

// DELETE /questions/:id - Eyða spurningu
questionRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  try {
    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    // Delete the question (answers will be deleted due to cascade delete)
    await prisma.question.delete({
      where: { id }
    });
    
    return c.body(null, 204);
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error);
    throw error;
  }
});

// POST /questions/:id/answers - Add an answer to a question
questionRoutes.post('/:id/answers', zValidator('json', answerSchema), async (c) => {
  const questionId = parseInt(c.req.param('id'), 10);
  
  if (isNaN(questionId)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  const body = await c.req.json();
  
  try {
    // Check if the question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!question) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    const newAnswer = await prisma.answer.create({
      data: {
        answer: body.answer,
        isCorrect: body.isCorrect,
        questionId
      }
    });
    
    return c.json(newAnswer, 200);
  } catch (error) {
    console.error(`Error creating answer for question ${questionId}:`, error);
    throw error;
  }
});

export { questionRoutes };