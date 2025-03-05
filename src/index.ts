// src/index.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client';
import { categoryRoutes } from './routes/categories';
import { questionRoutes } from './routes/questions';
import { cors } from 'hono/cors';

// Create a new Prisma client
export const prisma = new PrismaClient();

// Create a Hono app
export const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Error handler middleware
app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Error) {
      return c.json(
        { error: error.message || 'Internal Server Error' },
        error.name === 'ValidationError' ? 400 : 500
      );
    }
    
    return c.json(
      { error: 'Internal Server Error' },
      500
    );
  }
});

// Routes
app.route('/categories', categoryRoutes);
app.route('/category', categoryRoutes);
app.route('/questions', questionRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Start the server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch
};
