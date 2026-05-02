"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

// Helper to extract base industry from user's industry string (e.g., "tech - software-development" -> "tech")
const extractBaseIndustry = (userIndustry: string): string => {
    if (!userIndustry) return "";
    // Split by " - " and take the first part
    const parts = userIndustry.split(" - ");
    return parts[0]?.trim() || userIndustry;
};

// Normalize enum values
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

// Initialize AI model
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export const generateAIInsights = async (industry: string) => {
    const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
{
  "salaryRange": [
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
Include at least 5 common roles for salary range.
Growth rate should be a percentage.
Include at least 5 skills and trends.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();
        return JSON.parse(cleanedText);
    } catch (error: any) {
        console.error("generateAIInsights failed:", error?.message ?? error);
        return null;
    }
}

export const getIndustryInsights = async () => {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const user = await db.user.findUnique({
        where: { id: userId }
    });

    if (!user) throw new Error("User not found");
    if (!user.industry) return null;

    // Extract base industry from user's industry string (e.g., "tech - software-development" -> "tech")
    const baseIndustry = extractBaseIndustry(user.industry);
    
    // Try to find existing IndustryInsight for this base industry
    let industryInsight = await db.industryInsight.findUnique({
        where: { industry: baseIndustry }
    });

    // If no existing insight, generate new one
    if (!industryInsight) {
        const insights = await generateAIInsights(baseIndustry);
        if (!insights || typeof insights !== "object") {
            console.error("generateAIInsights returned invalid data for", baseIndustry);
            return null;
        }

        try {
            industryInsight = await db.industryInsight.create({
                data: {
                    industry: baseIndustry,
                    salaryRange: insights.salaryRange ?? insights.salaryRanges ?? [],
                    growthRate: typeof insights.growthRate === "number" ? insights.growthRate : null,
                    demandLevel: normalizeDemandLevel(insights.demandLevel),
                    topSkills: normalizeStringArray(insights.topSkills),
                    marketOutlook: normalizeMarketOutlook(insights.marketOutlook),
                    keyTrends: normalizeStringArray(insights.keyTrends),
                    recommendedSkills: normalizeStringArray(insights.recommendedSkills),
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        } catch (err: any) {
            console.error('Failed to save industry insight:', err?.message ?? err);
            return null;
        }
    }

    return industryInsight;
};
