// src/routes/categories.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../index';
import { categorySchema } from '../validation/schemas';
import { Category } from '../types';

const categoryRoutes = new Hono();

// GET /categories - Get all categories
categoryRoutes.get('/', async (c) => {
  try {
    const categories = await prisma.category.findMany({
        include: { 
          questions: true 
        }
    });
    return c.json(categories, 200);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /categories/:slug - Get a specific category with its questions
categoryRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { questions: true }
    });
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    return c.json(category, 200);
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /category - Create a new category
categoryRoutes.post('/', zValidator('json', categorySchema), async (c) => {
  const body = await c.req.json();
  
  try {
    // Check if a category with the same slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
    });
    
    if (existingCategory) {
      return c.json({ error: 'A category with this slug already exists' }, 400);
    }
    
    const newCategory = await prisma.category.create({
      data: body
    });
    
    return c.json(newCategory, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /category/:slug - Update a category
categoryRoutes.patch('/:slug', zValidator('json', categorySchema.partial()), async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json();
  
  try {
    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // If we're updating the slug, check that the new slug doesn't already exist
    if (body.slug && body.slug !== slug) {
      const categoryWithNewSlug = await prisma.category.findUnique({
        where: { slug: body.slug }
      });
      
      if (categoryWithNewSlug) {
        return c.json({ error: 'A category with this slug already exists' }, 400);
      }
    }
    
    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: body
    });
    
    return c.json(updatedCategory, 200);
  } catch (error) {
    console.error(`Error updating category ${slug}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /category/:slug - Delete a category
categoryRoutes.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  try {
    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // Delete the category
    await prisma.category.delete({
      where: { slug }
    });
    
    return c.body(null, 204);
  } catch (error) {
    console.error(`Error deleting category ${slug}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { categoryRoutes };