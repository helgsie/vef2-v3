// src/tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Category API', () => {
  const testCategory = {
    name: 'Test Category',
    slug: 'test-category'
  };

  beforeAll(async () => {
    // Clean up test data
    await prisma.category.deleteMany({
      where: { slug: testCategory.slug }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.category.deleteMany({
      where: { slug: testCategory.slug }
    });
    await prisma.$disconnect();
  });

  it('should create a category', async () => {
    const res = await app.request('/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCategory)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(testCategory.name);
    expect(data.slug).toBe(testCategory.slug);
  });

  it('should get all categories', async () => {
    const res = await app.request('/categories');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should get a specific category', async () => {
    const res = await app.request(`/categories/${testCategory.slug}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(testCategory.name);
    expect(data.slug).toBe(testCategory.slug);
  });

  it('should update a category', async () => {
    const updatedName = 'Updated Test Category';
    const res = await app.request(`/category/${testCategory.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updatedName })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(updatedName);
    expect(data.slug).toBe(testCategory.slug);
  });
});

describe('Question API', () => {
  let categoryId: number;
  let questionId: number;
  
  beforeAll(async () => {
    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Question Category',
        slug: 'test-question-category'
      }
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.category.delete({
        where: { id: categoryId }
      });
    } catch (error) {
      console.log('Category already deleted or not found');
    }
    await prisma.$disconnect();
  });

  it('should create a question with answers', async () => {
    const testQuestion = {
      questionText: 'What is the capital of France?',
      categoryId,
      answers: [
        { answer: 'Paris', isCorrect: true },
        { answer: 'London', isCorrect: false },
        { answer: 'Berlin', isCorrect: false }
      ]
    };

    const res = await app.request('/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuestion)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.questionText).toBe(testQuestion.questionText);
    expect(data.answers.length).toBe(3);
    questionId = data.id;
  });

  it('should get all questions', async () => {
    const res = await app.request('/questions');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should get a specific question', async () => {
    const res = await app.request(`/questions/${questionId}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(questionId);
    expect(data.questionText).toBe('What is the capital of France?');
    expect(Array.isArray(data.answers)).toBe(true);
    expect(data.answers.length).toBe(3);
  });

  it('should add an answer to a question', async () => {
    const testAnswer = {
      answer: 'Madrid',
      isCorrect: false
    };

    const res = await app.request(`/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAnswer)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe(testAnswer.answer);
    expect(data.isCorrect).toBe(testAnswer.isCorrect);
  });
});