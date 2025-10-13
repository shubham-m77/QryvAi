'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export async function generateQuiz() {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    try {


        const prompt = `Generate 10 technical interview questions for a ${user.industry} professional${user.skills?.length ? 'with expertise in ${user.skills.join(", ")}' : ''}. 
    Each question should be multiple choice with 4 options and only one correct answer.
    Return the response in the following JSON format only, no additional text:
    {
        "questions": [{
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string",
        "explaination": "string"
        }]
        }
    `;
        const response = (await model.generateContent(prompt)).response;
        const text = response.text().replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();
        const quiz = JSON.parse(text);
        return quiz.questions;
    } catch (error: Object | any) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz");
    }
}
export async function saveQuizResults(questions: any[], answers: string[], score: number) {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    const questionResults = questions?.map((q: any, index: number) => ({
        question: q.question,
        selectedAnswer: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index] === q.correctAnswer,
        explanation: q.explanation
    }));
    const wrongAnswers = questionResults.filter((q: any) => !q.isCorrect);
    let improvementTip = null;
    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers?.map((q: any) => `Question: ${q.question}\nYour Answer: ${q.selectedAnswer}\nCorrect Answer: ${q.correctAnswer}`).join("\n\n");
        const improvementPrompt = `The user got the following ${user.industry} questions wrong:\n\n
            
            ${wrongQuestionsText}
            Based on these mistakes, provide a concise, specific improvement tip.
            Focus on the knowledge gaps revealed by these wrong answers.
            Keep the response under 2 sentences and make it encouraging.
            Don't explicitly mention the mistakes, instead focus on what to learn/practice.
            `;
        try {
            const response = (await model.generateContent(improvementPrompt)).response;
            const text = response.text().trim();
            improvementTip = text;
        } catch (error: any) {
            console.error("Error generating on improvement tip", error);
        }
    }
    try {
        const assessment = await db.assessment.create({
            data: {
                userId: userId,
                quizScore: score,
                questions: questionResults,
                category: "Technical",
                improvementTip,
            }
        })
        return assessment;
    } catch (error: any) {
        console.error("Error Solving quiz Result:", error)
        throw new Error("Failed to save assessment");
    }
}

// Get Assessment Stats or Report
export async function getAssessment() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId },
    })
    if (!user) throw new Error("User not found!")
    try {
        const assessments = await db.assessment.findMany({
            where: {
                id: userId
            },
            orderBy: {
                createdAt: "asc",
            }
        })
        return assessments;
    } catch (error: any) {
        console.error("Error fetching assessments!", error);
        throw new Error("Failed to fetch assessments!")
    }
}