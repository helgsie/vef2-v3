var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/routes/categories.ts
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
// GET /categories - Get all categories
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
// GET /categories/:slug - Get a specific category with its questions
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
// POST /categories - Create a new category
categoryRoutes.post('/', zValidator('json', categorySchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield c.req.json();
    try {
        // Check if a category with the same slug already exists
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
// PATCH /category/:slug - Update a category
categoryRoutes.patch('/:slug', zValidator('json', categorySchema.partial()), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    const body = yield c.req.json();
    try {
        // Check if the category exists
        const existingCategory = yield prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // If we're updating the slug, check that the new slug doesn't already exist
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
// DELETE /category/:slug - Delete a category
categoryRoutes.delete('/:slug', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    try {
        // Check if the category exists
        const existingCategory = yield prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Delete the category
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
