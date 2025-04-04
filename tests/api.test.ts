import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Category API', () => {
  const testCategory = {
    name: 'Prufuflokkur',
    slug: 'prufuflokkur'
  };

  beforeAll(async () => {
    await prisma.category.deleteMany({
      where: { slug: testCategory.slug }
    });
  });

  afterAll(async () => {
    await prisma.category.deleteMany({
      where: { slug: testCategory.slug }
    });
    await prisma.$disconnect();
  });

  it('ætti að búa til flokk', async () => {
    const res = await app.request('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCategory)
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe(testCategory.name);
    expect(data.slug).toBe(testCategory.slug);
  });

  it('ætti að sækja alla flokka', async () => {
    const res = await app.request('/categories');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('ætti að sækja ákveðinn flokk', async () => {
    const res = await app.request(`/categories/${testCategory.slug}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(testCategory.name);
    expect(data.slug).toBe(testCategory.slug);
  });

  it('ætti að breyta flokki', async () => {
    const updatedName = 'Breyttur prufuflokkur';
    const res = await app.request(`/categories/${testCategory.slug}`, {
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
        name: 'Prufuflokkur með spurningum',
        slug: 'prufuflokkur-med-spurningum'
      }
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    try {
      await prisma.category.delete({
        where: { id: categoryId }
      });
    } catch (error) {
      console.log('Flokkur ekki til eða þegar búið að eyða');
    }
    await prisma.$disconnect();
  });

  it('ætti að búa til spurningu með svörum', async () => {
    const testQuestion = {
      questionText: 'Hver er höfuðborg Frakklands?',
      categoryId,
      answers: [
        { answer: 'París', isCorrect: true },
        { answer: 'London', isCorrect: false },
        { answer: 'Berlín', isCorrect: false }
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

  it('ætti að sækja allar spurningar', async () => {
    const res = await app.request('/questions');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('ætti að sækja ákveðna spurningu', async () => {
    const res = await app.request(`/questions/${questionId}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(questionId);
    expect(data.questionText).toBe('Hver er höfuðborg Frakklands?');
    expect(Array.isArray(data.answers)).toBe(true);
    expect(data.answers.length).toBe(3);
  });

  it('ætti að bæta svarmöguleika við spurningu', async () => {
    const testAnswer = {
      answer: 'Madríd',
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