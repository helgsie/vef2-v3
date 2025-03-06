// src/index.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client';
import { categoryRoutes } from './routes/categories';
import { questionRoutes } from './routes/questions';
import { cors } from 'hono/cors';
import process from "node:process";
import { serve } from "@hono/node-server";

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
app.route('/questions', questionRoutes);

// 404 handler
/*app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});*/

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  () => {
    console.log(
      `Server running on ${
        process.env.NODE_ENV === "production"
          ? "https://vef2-v3-thb0.onrender.com"
          : `http://${HOST}:${PORT}`
      }`,
    );
  },
);