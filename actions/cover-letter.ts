'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export async function generateCoverLetter({ data }: { data: any }) {
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
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName
        }.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
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

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();

        const coverLetter = await db.coverLetter.create({
            data: {
                content,
                jobDescription: data.jobDescription,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                status: "completed",
                userId,
            },
        });

        return coverLetter;
    } catch (error: any) {
        console.error("Error generating cover letter:", error.message);
        throw new Error("Failed to generate cover letter");
    }
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

export async function getCoverLetter(id: number) {
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

export async function deleteCoverLetter(id: number) {
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