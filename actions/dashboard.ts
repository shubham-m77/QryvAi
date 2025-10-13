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

export const generateAIInsights = async (industry: string) => {
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
        // Ensure the user has an industry before calling the AI
        if (!user.industry) {
            // Gracefully return a value the client can handle (no 500)
            // The client should detect this and show onboarding/placeholder UI
            return null;
        }

        // Call AI and parse defensively
        let parsed: any = null;
        try {
            const insightsText = await generateAIInsights(user.industry);
            // If generateAIInsights already returns parsed JSON, use it; otherwise ensure it's an object
            parsed = insightsText && typeof insightsText === 'object' ? insightsText : insightsText;
        } catch (err: any) {
            console.error('Failed to generate AI insights:', err?.message ?? err);
            return null; // fail gracefully
        }

        // Minimal validation / mapping before sending to DB
        const dataForDb: Object = {
            industry: user.industry,
            // Map expected fields with defaults
            salaryRanges: parsed?.salaryRanges ?? parsed?.salaryRange ?? [],
            growthRate: parsed?.growthRate ?? null,
            demandLevel: (parsed?.demandLevel ?? null),
            topSkills: parsed?.topSkills ?? [],
            marketOutlook: parsed?.marketOutlook ?? null,
            keyTrends: parsed?.keyTrends ?? [],
            recommendedSkills: parsed?.recommendedSkills ?? [],
            nextUpdate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        };

        try {
            const industryInsight = await db.industryInsight.create({ data: dataForDb });
            return industryInsight;
        } catch (err: any) {
            console.error('Failed to save industry insight:', err?.message ?? err);
            return null;
        }
    }
    return user.industryInsights;
};
