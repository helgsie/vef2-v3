var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const serveStaticFile = (filePath, c) => {
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
        }
        else {
            console.error('File not found:', filePath);
            return c.body('File not found', 404);
        }
    }
    catch (error) {
        console.error('Error serving file:', error instanceof Error ? error.message : error);
        return c.body('Internal server error', 500);
    }
};
app.use('/*', cors());
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
app.get('/categories', (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany();
        return c.json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return c.body('Internal server error', 500);
    }
}));
app.get('/categories/:slug', (c) => {
    const { slug } = c.req.param();
    const formFile = path.join(__dirname, 'public', 'questions.html');
    return serveStaticFile(formFile, c);
});
/*app.get('/categories/:slug', async (c) => {
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
});*/
/*app.get('/categories/:slug', async (c) => {
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

    // Now we render the HTML dynamically with the category data
    let html = `
    <html lang="is">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${category.name}</title>
        <link rel="stylesheet" href="/static/styles.css">
    </head>
    <body>
        <h1>${category.name}</h1>
        <div class="category-questions">
    `;

    // Iterate through the questions and answers to generate HTML content
    category.questions.forEach((question) => {
      html += `
        <div class="question-answer-pair">
            <p><strong>Q: ${question.questionText}</strong></p>
            <ul>
      `;

      question.answers.forEach((answer) => {
        html += `
          <li>${answer.answer} ${answer.isCorrect ? '<span class="checkmark">(Correct)</span>' : ''}</li>
        `;
      });

      html += `
            </ul>
        </div>
      `;
    });

    // Close the remaining HTML structure
    html += `
        </div>
        <div class="question-button-menu">
            <a href="/form" class="add-question-button">Bæta við spurningu</a>
        </div>
    </body>
    </html>
    `;

    return c.body(html);
  } catch (error) {
    console.error('Error fetching category data:', error);
    return c.body('Internal server error', 500);
  }
});*/
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
serve({
    fetch: app.fetch,
    port: PORT !== null && PORT !== void 0 ? PORT : 3000,
    hostname: HOST,
}, (info) => {
    console.log(`Server running on ${process.env.NODE_ENV === "production"
        ? "https://vef2-v3-thb0.onrender.com"
        : `http://${HOST}:${info.port}`}`);
});
