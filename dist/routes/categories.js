"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
// src/routes/categories.ts
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const index_1 = require("../index");
const schemas_1 = require("../validation/schemas");
const categoryRoutes = new hono_1.Hono();
exports.categoryRoutes = categoryRoutes;
// GET /categories - Get all categories
categoryRoutes.get('/', (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield index_1.prisma.category.findMany();
        return c.json(categories, 200);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}));
// GET /categories/:slug - Get a specific category with its questions
categoryRoutes.get('/:slug', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    try {
        const category = yield index_1.prisma.category.findUnique({
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
        throw error;
    }
}));
// POST /category - Create a new category
categoryRoutes.post('/', (0, zod_validator_1.zValidator)('json', schemas_1.categorySchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield c.req.json();
    try {
        // Check if a category with the same slug already exists
        const existingCategory = yield index_1.prisma.category.findUnique({
            where: { slug: body.slug }
        });
        if (existingCategory) {
            return c.json({ error: 'A category with this slug already exists' }, 400);
        }
        const newCategory = yield index_1.prisma.category.create({
            data: body
        });
        return c.json(newCategory, 200);
    }
    catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}));
// PATCH /category/:slug - Update a category
categoryRoutes.patch('/:slug', (0, zod_validator_1.zValidator)('json', schemas_1.categorySchema.partial()), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    const body = yield c.req.json();
    try {
        // Check if the category exists
        const existingCategory = yield index_1.prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // If we're updating the slug, check that the new slug doesn't already exist
        if (body.slug && body.slug !== slug) {
            const categoryWithNewSlug = yield index_1.prisma.category.findUnique({
                where: { slug: body.slug }
            });
            if (categoryWithNewSlug) {
                return c.json({ error: 'A category with this slug already exists' }, 400);
            }
        }
        const updatedCategory = yield index_1.prisma.category.update({
            where: { slug },
            data: body
        });
        return c.json(updatedCategory, 200);
    }
    catch (error) {
        console.error(`Error updating category ${slug}:`, error);
        throw error;
    }
}));
// DELETE /category/:slug - Delete a category
categoryRoutes.delete('/:slug', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = c.req.param('slug');
    try {
        // Check if the category exists
        const existingCategory = yield index_1.prisma.category.findUnique({
            where: { slug }
        });
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Delete the category
        yield index_1.prisma.category.delete({
            where: { slug }
        });
        return c.body(null, 204);
    }
    catch (error) {
        console.error(`Error deleting category ${slug}:`, error);
        throw error;
    }
}));
