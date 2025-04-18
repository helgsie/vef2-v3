// src/index.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import process from "node:process";
import { serve } from "@hono/node-server";
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { api } from './routes/index.routes.js';
export const prisma = new PrismaClient();
export const app = new Hono();
app.use(cors({
    origin: ['http://localhost:3000', 'https://vef2-v4-gjvc.onrender.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use(prettyJSON());
app.route('/', api);
app.notFound((c) => c.json({ message: 'not found' }, 404));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
serve({
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
}, (info) => {
    console.log(`Server running on ${process.env.NODE_ENV === "production"
        ? "https://vef2-v3-thb0.onrender.com"
        : `http://${HOST}:${info.port}`}`);
});
