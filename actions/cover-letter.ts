'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

type CoverLetterInput = {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
};

const RETRYABLE_STATUS = [429, 500, 502, 503, 504];
const MAX_GENERATION_ATTEMPTS = 3;

function isRetryableError(error: any) {
    const message = String(error?.message ?? "").toLowerCase();
    const status = error?.response?.status ?? error?.status ?? null;

    return (
        RETRYABLE_STATUS.includes(status) ||
        message.includes("high demand") ||
        message.includes("unavailable") ||
        message.includes("timeout") ||
        message.includes("rate limit")
    );
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCoverLetter(data: CoverLetterInput) {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    const skills = Array.isArray(user.skills) ? user.skills.join(", ") : user.skills ?? "";
    const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${skills}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
        try {
            const result = await model.generateContent(prompt);
            const content = result.response.text().trim();

            const coverLetter = await db.coverLetter.create({
                data: {
                    content,
                    jobDescription: data.jobDescription,
                    companyName: data.companyName,
                    jobTitle: data.jobTitle,
                    userId,
                },
            });

            return coverLetter;
        } catch (error: any) {
            const attemptMessage = `Attempt ${attempt} of ${MAX_GENERATION_ATTEMPTS}`;
            console.error("Error generating cover letter:", attemptMessage, error?.message ?? error);

            if (attempt === MAX_GENERATION_ATTEMPTS || !isRetryableError(error)) {
                throw new Error(
                    "Failed to generate cover letter. The AI service is currently busy; please try again in a few moments."
                );
            }

            const backoffMs = 1000 * attempt;
            await delay(backoffMs);
        }
    }

    throw new Error("Failed to generate cover letter. Please try again.");
}
export async function getCoverLetters() {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    return await db.coverLetter.findMany({
        where: { userId },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getCoverLetter(id: string) {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    return await db.coverLetter.findUnique({
        where: {
            id,
            userId
        },
    });
}

export async function deleteCoverLetter(id: string) {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized!");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")

    return await db.coverLetter.delete({
        where: {
            id,
            userId,
        },
    });
}