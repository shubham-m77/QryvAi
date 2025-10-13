"use server"
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export async function saveResume(content: { content: string }) {
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
        const resume = await db.resume.upsert({
            where: {
                id: userId,
            },
            update: {
                content
            },
            create: {
                id: userId,
                content
            }
        })
        revalidatePath("/resume");
        return resume;
    } catch (error) {
        console.error("Error on saving resume:", error);
        throw new Error("Failed to save resume");
    }
}

// get resume
export async function getResume() {
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
        const resume = await db.resume.findUnique({
            where: {
                id: userId,
            }
        })
        revalidatePath("/resume");
        return resume;
    } catch (error: any) {
        console.error("Error on saving resume:", error);
        throw new Error("Failed to save resume");
    }
}

// improve text with AI
export async function improveWithAi({ current, type }: { current: string, type: string }) {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    const prompt = `
    You are an expert resume writer specializing in creating high-impact, industry-aligned descriptions. Rewrite and enhance the following ${type} description for a ${user.industry} professional.
Your goal is to make it powerful, results-driven, and tailored to industry standards.

Original content:
"${current}"

Instructions:
Start with strong, industry-relevant action verbs.

Quantify achievements using clear metrics, percentages, or results wherever possible.
        
Emphasize relevant technical and professional skills.

Keep it concise, professional, and ATS-friendly.

Focus on measurable accomplishments rather than job duties.

Integrate industry-specific keywords naturally.

Write as a single, polished paragraph without headings, bullet points, or explanations.
  `;
    try {
        const result = await model.generateContent(prompt);
        const res = result.response;
        const improvedText = res.text().trim();
        return improvedText;
    } catch (error: any) {
        console.error(`Error on improving: ${type}`, error);
        throw new Error(`Failed to improve ${type}`);
    }
}