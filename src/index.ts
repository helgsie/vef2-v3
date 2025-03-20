// src/index.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import process from "node:process";
import { serve } from "@hono/node-server";
import { cors } from 'hono/cors';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = new URL('.', import.meta.url).pathname;

export const prisma = new PrismaClient();
export const app = new Hono();

const serveStaticFile = (filePath: string, c: any) => {
  try {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
    }[ext] || 'text/plain';

    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      return c.body(file, 200, { 'Content-Type': contentType });
    } else {
      console.error('File not found:', filePath);
      return c.body('File not found', 404);
    }
  } catch (error) {
    console.error('Error serving file:', error instanceof Error ? error.message : error);
    return c.body('Internal server error', 500);
  }
};

app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://vef2-v3-thb0.onrender.com'],
  credentials: true,
}))

app.get('/static/*', (c) => {
  const url = new URL(c.req.url);
  const filePath = path.join(__dirname, 'public', url.pathname.slice(7));
  return serveStaticFile(filePath, c);
});

app.get('/', (c) => {
  const indexFile = path.join(__dirname, 'public', 'index.html');
  return serveStaticFile(indexFile, c);
});

app.get('/form', (c) => {
  const formFile = path.join(__dirname, 'public', 'form.html');
  return serveStaticFile(formFile, c);
});

app.get('/categories', async (c) => {
  try {
    const categories = await prisma.category.findMany();

    return c.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.body('Internal server error', 500);
  }
});

app.get('/categories/:slug', async (c) => {
  const formFile = path.join(__dirname, 'public', 'questions.html');
  return serveStaticFile(formFile, c);
});

app.get('/api/categories/:slug', async (c) => {
  const { slug } = c.req.param();

  try {
    const category = await prisma.category.findUnique({
      where: {
        slug: slug,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!category) {
      return c.body('Category not found', 404);
    }

    return c.json(category);
  } catch (error) {
    console.error('Error fetching category data:', error);
    return c.body('Internal server error', 500);
  }
});

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