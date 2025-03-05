export type Category = {
    id: number;
    name: string;
    slug: string;
    questions: Question[];
};

export type Question = {
    id: number;
    questionText: string;
    categoryId: number;
    category: Category;
    answers: Answer[];
}

export type Answer = {
    id: number;
    answer: string;
    isCorrect: boolean;
    questionId: number;
    question: Question;
}