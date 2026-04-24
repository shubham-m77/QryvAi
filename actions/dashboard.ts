"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const normalizeDemandLevel = (value: any): Prisma.IndustryInsightCreateInput["demandLevel"] => {
    const normalized = String(value ?? "MEDIUM").trim().toUpperCase();
    return normalized === "HIGH" ? "HIGH" : normalized === "LOW" ? "LOW" : "MEDIUM";
};

const normalizeMarketOutlook = (value: any): Prisma.IndustryInsightCreateInput["marketOutlook"] => {
    const normalized = String(value ?? "NEUTRAL").trim().toUpperCase();
    return normalized === "POSITIVE" ? "POSITIVE" : normalized === "NEGATIVE" ? "NEGATIVE" : "NEUTRAL";
};

const normalizeStringArray = (value: any): string[] => {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
};
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview"
});

export const generateAIInsights = async (industry: string) => {
    const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error: any) {
        console.error("generateAIInsights failed:", error?.message ?? error);
        return null;
    }
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
            return null;
        }

        // Call AI and parse defensively
        const insights = await generateAIInsights(user.industry);

        if (!insights || typeof insights !== "object") {
            console.error("generateAIInsights returned invalid data for", user.industry);
            return null;
        }

        try {
            const industryInsight = await db.industryInsight.create({
                data: {
                    industry: user.industry,
                    salaryRange: insights.salaryRanges ?? insights.salaryRange ?? [],
                    growthRate: typeof insights.growthRate === "number" ? insights.growthRate : null,
                    demandLevel: normalizeDemandLevel(insights.demandLevel),
                    topSkills: normalizeStringArray(insights.topSkills),
                    marketOutlook: normalizeMarketOutlook(insights.marketOutlook),
                    keyTrends: normalizeStringArray(insights.keyTrends),
                    recommendedSkills: normalizeStringArray(insights.recommendedSkills),
                    nextUpdate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                },
            });
            return industryInsight;
        } catch (err: any) {
            console.error('Failed to save industry insight:', err?.message ?? err);
            return null;
        }
    }
    return user.industryInsights;
};
