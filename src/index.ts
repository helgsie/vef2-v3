// src/index.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { categoryRoutes } from './routes/categories';
import { questionRoutes } from './routes/questions';
import process from "node:process";
import { serve } from "@hono/node-server";
import { cors } from 'hono/cors';

export const prisma = new PrismaClient();

export const app = new Hono();
app.get('/', (c) => c.text('Pretty Blog API'))

app.use('/*', cors())

/*app.use('*', async (c, next) => {
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
});*/

app.route('/categories', categoryRoutes);
app.route('/questions', questionRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

serve(
  {
    fetch: app.fetch,
    port: PORT ?? 3000,
    hostname: HOST,
  },
  (info) => {
    console.log(
      `Server running on ${
        process.env.NODE_ENV === "production"
          ? "https://vef2-v3-thb0.onrender.com"
          : `http://${HOST}:${info.port}`
      }`,
    );
  },
);