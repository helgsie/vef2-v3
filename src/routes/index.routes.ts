import { Hono } from 'hono';
import { categoryRoutes } from './categories.routes.js';
import { questionRoutes } from './questions.routes.js';
import { cors } from 'hono/cors';

export const api = new Hono();

api.use(
  cors({
    origin: ['http://localhost:3000', 'https://vef2-v4-gjvc.onrender.com'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

const routes = [
  {
    href: '/',
    methods: ['GET'],
  },
  {
    href: '/categories',
    querystrings: ['limit', 'offset'],
    methods: ['GET', 'POST'],
  },
  {
    href: '/categories/:slug',
    methods: ['GET', 'PATCH', 'DELETE'],
  },
  {
    href: '/questions',
    methods: ['GET', 'POST'],
  },
  {
    href: '/questions/:id',
    methods: ['GET', 'PATCH', 'DELETE'],
  },
];

api.get('/', (c) => c.json(routes));
api.route('/categories', categoryRoutes);
api.route('/questions', questionRoutes);