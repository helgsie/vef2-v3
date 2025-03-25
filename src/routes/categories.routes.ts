import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../index.js';
import { categorySchema } from '../validation/schemas.js';
import { cors } from 'hono/cors';

export const categoryRoutes = new Hono();

categoryRoutes.use(
  cors({
    origin: ['http://localhost:3000', 'https://vef2-v4-gjvc.onrender.com'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// GET /categories - Sækja alla flokka
categoryRoutes.get('/', async (c) => {
  try {
    const categories = await prisma.category.findMany();
    return c.json(categories, 200);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /categories/:slug - Sækja ákveðinn flokk með spurningum flokks
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

// POST /categories - Búa til flokk
categoryRoutes.post('/', zValidator('json', categorySchema), async (c) => {
  const body = await c.req.json();
  
  try {
    // Athuga hvort flokkur með sama slug sé til
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

// PATCH /category/:slug - Uppfæra flokk
categoryRoutes.patch('/:slug', zValidator('json', categorySchema.partial()), async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json();
  
  try {
    // Athuga hvort flokkur sé til
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // Ef við breytum slug, passa að slug sé ekki nú þegar í notkun
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

// DELETE /category/:slug - Eyða flokki
categoryRoutes.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  try {
    // Athuga hvort flokkur sé til
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // Eyða flokki
    await prisma.category.delete({
      where: { slug }
    });
    
    return c.newResponse("", { status: 204 });
  } catch (error) {
    console.error(`Error deleting category ${slug}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});