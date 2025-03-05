import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { z } from "zod";

const prisma = new PrismaClient();

// Function to create a slug from a title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Zod Schemas for validation
const answerSchema = z.object({
  answer: z.string(),
  correct: z.boolean(),
});

const questionSchema = z.object({
  question: z.string(),
  answers: z.array(answerSchema),
});

const categorySchema = z.object({
  title: z.string(),
  file: z.string(),
});

async function main() {
  const indexPath = path.join("data", "index.json");
  if (!fs.existsSync(indexPath)) {
    console.error("❌ index.json file not found!");
    return;
  }

  let indexData;
  try {
    indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  } catch (error) {
    console.error("❌ Error parsing index.json:", error);
    return;
  }

  if (!Array.isArray(indexData)) {
    console.error("❌ index.json must be an array.");
    return;
  }

  for (const entry of indexData) {
    const categoryValidation = categorySchema.safeParse(entry);
    if (!categoryValidation.success) {
      console.warn(`⚠️ Skipping invalid category entry:`, entry);
      continue;
    }

    const { title, file } = categoryValidation.data;
    const filePath = path.join("data", file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Skipping missing file: ${file}`);
      continue;
    }

    let categoryData;
    try {
      categoryData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.warn(`⚠️ Error parsing ${file}, skipping...`);
      continue;
    }

    if (!categoryData.title || !Array.isArray(categoryData.questions)) {
      console.warn(`⚠️ Skipping category "${title}" due to invalid format.`);
      continue;
    }

    // Generate a slug for the category
    const slug = slugify(title);

    // Insert category into database, or update if it already exists
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: title },
      create: { 
        name: title,
        slug
      },
    });

    for (const questionEntry of categoryData.questions) {
      const questionValidation = questionSchema.safeParse(questionEntry);
      if (!questionValidation.success) {
        console.warn(`⚠️ Skipping invalid question in ${file}:`, questionEntry);
        continue;
      }

      const question = await prisma.question.create({
        data: {
          questionText: questionValidation.data.question,
          categoryId: category.id,
        },
      });

      for (const answerEntry of questionValidation.data.answers) {
        await prisma.answer.create({
          data: {
            answer: answerEntry.answer,
            isCorrect: answerEntry.correct,
            questionId: question.id,
          },
        });
      }
    }
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => console.error("❌ Error seeding database:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });