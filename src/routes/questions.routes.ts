import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../index.js';
import { questionSchema, questionWithAnswersSchema, answerSchema } from '../validation/schemas.js';
import { cors } from 'hono/cors';

export const questionRoutes = new Hono();

questionRoutes.use(
  cors({
    origin: ['http://localhost:3000', 'https://vef2-v4-gjvc.onrender.com'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

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
    return c.json({ error: 'Internal server error' }, 500);
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
    return c.json({ error: 'Internal server error' }, 500);
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
    
    // Nota transaction til að búa til spurningu og svör
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
    return c.json({ error: 'Internal server error' }, 500);
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
    // Athuga hvort spurningin sé til
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    // Ef við uppfærum flokkinn, athuga hvort hann sé þegar til
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
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /questions/:id - Eyða spurningu
questionRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  try {
    // Athuga hvort spurning sé til
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    // Eyða spurningu (svör eyðast líka vegna cascade delete)
    await prisma.question.delete({
      where: { id }
    });
    
    return c.newResponse("", { status: 204 });
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /questions/:id/answers - Bæta svari við spurningu
questionRoutes.post('/:id/answers', zValidator('json', answerSchema), async (c) => {
  const questionId = parseInt(c.req.param('id'), 10);
  
  if (isNaN(questionId)) {
    return c.json({ error: 'Invalid question ID' }, 400);
  }
  
  const body = await c.req.json();
  
  try {
    // Athuga hvort spurning sé til
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
    return c.json({ error: 'Internal server error' }, 500);
  }
});