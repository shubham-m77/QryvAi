import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../prisma";
import { inngest } from "./client";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateIndustryInsights = inngest.createFunction(
    {
        name: "Generate Industry Insights",
        id: "generate-industry-insights",
        triggers: [{ cron: "0 0 * * 0" }],
    },
    async ({ step }) => {
        await step.run("Fetch and Process Industries", async () => {
            const industries = await db.industryInsight.findMany({
                select: { industry: true },
            });

            for (const { industry } of industries) {
                // your same existing code here
            }
        });
    }
);