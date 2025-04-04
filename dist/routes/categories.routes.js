var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../index.js';
import { categorySchema } from '../validation/schemas.js';
import { cors } from 'hono/cors';
export const categoryRoutes = new Hono();
categoryRoutes.use(cors({
    origin: ['http://localhost:3000', 'https://vef2-v4-gjvc.onrender.com'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// GET /categories - Sækja alla flokka
categoryRoutes.get('/', (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany();
        return c.json(categories, 200);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}));
// GET /categories/:slug - Sækja ákveðinn flokk með spurningum flokks
categoryRoutes.get('/:slug', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    try {
        const category = yield prisma.category.findUnique({
            where: { slug },
            include: { questions: true }
        });
        if (!category) {
            return c.json({ error: 'Category not found' }, 404);
        }
        return c.json(category, 200);
    }
    catch (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}));
// POST /categories - Búa til flokk
categoryRoutes.post('/', zValidator('json', categorySchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield c.req.json();
    try {
        // Athuga hvort flokkur með sama slug sé til
        const existingCategory = yield prisma.category.findUnique({
            where: { slug: body.slug }
        });
        if (existingCategory) {
            return c.json({ error: 'A category with this slug already exists' }, 400);
        }
        const newCategory = yield prisma.category.create({
            data: body
        });
        return c.json(newCategory, 201);
    }
    catch (error) {
        console.error('Error creating category:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}));
// PATCH /category/:slug - Uppfæra flokk
categoryRoutes.patch('/:slug', zValidator('json', categorySchema.partial()), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    const body = yield c.req.json();
    try {
        // Athuga hvort flokkur sé til
        const existingCategory = yield prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Ef við breytum slug, passa að slug sé ekki nú þegar í notkun
        if (body.slug && body.slug !== slug) {
            const categoryWithNewSlug = yield prisma.category.findUnique({
                where: { slug: body.slug }
            });
            if (categoryWithNewSlug) {
                return c.json({ error: 'A category with this slug already exists' }, 400);
            }
        }
        const updatedCategory = yield prisma.category.update({
            where: { slug },
            data: body
        });
        return c.json(updatedCategory, 200);
    }
    catch (error) {
        console.error(`Error updating category ${slug}:`, error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}));
// DELETE /category/:slug - Eyða flokki
categoryRoutes.delete('/:slug', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    try {
        // Athuga hvort flokkur sé til
        const existingCategory = yield prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Eyða flokki
        yield prisma.category.delete({
            where: { slug }
        });
        return c.newResponse("", { status: 204 });
    }
    catch (error) {
        console.error(`Error deleting category ${slug}:`, error);
        return c.json({ error: 'Internal server error' }, 500);
    }
}));
