"use server";
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

export const generateAIInsights = async (industry: any): Promise<any> => {
    const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
    const response = (await model.generateContent(prompt)).response;
    const text = response.text().replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();
    return JSON.parse(text);
}

export const getIndustryInsights = async () => {
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) throw new Error("Not authenticated");
    const user = await db.user.findUnique({
        where: { id: userId }, include: {
            industryInsights: true, // 👈 this loads the related IndustryInsight
        }
    });
    if (!user) throw new Error("User not found");
    if (!user?.industryInsights) {
        const insights = await generateAIInsights(user.industry);
        if (!user.industry) throw new Error("User industry not found");
        const industryInsight = await db.industryInsight.create({
            data: {
                industry: user.industry,
                ...insights,
                nextUpdate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
            }
        });
        return industryInsight;
    }
    return user.industryInsights;
};
