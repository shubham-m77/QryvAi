import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../prisma";
import { inngest } from "./client";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export const generateIndustryInsights = inngest.createFunction(
    {
        name: "Generate Industry Insights",
        id: "generate-industry-insights"
    },
    { cron: "0 0 * * 0" }, // every week
    async ({ step }) => {
        await step.run("Fetch and Process Industries", async () => {
            // First, fetch existing industries
            const industries = await db.industryInsight.findMany({
                select: { industry: true },
            });

            // Process each industry
            for (const { industry } of industries) {
                const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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

                try {
                    const res = await step.ai.wrap("gemini", async (p) => {
                        return await model.generateContent(p);
                    }, prompt);

                    // Safe property access with proper type checking
                    const candidates = res?.response?.candidates;
                    if (!candidates || candidates.length === 0) {
                        console.error(`No candidates returned for industry: ${industry}`);
                        continue;
                    }

                    const firstCandidate = candidates[0];
                    const parts = firstCandidate?.content?.parts;
                    if (!parts || parts.length === 0) {
                        console.error(`No parts found for industry: ${industry}`);
                        continue;
                    }

                    const firstPart = parts[0];
                    // Type guard to check if the part has text property
                    const text = 'text' in firstPart ? firstPart.text : "";

                    if (!text) {
                        console.error(`No text content found for industry: ${industry}`);
                        continue;
                    }

                    const cleanedtext = text.replace(/```(?:json)?\n?/g, "").replace(/```$/, "").trim();

                    let insights;
                    try {
                        insights = JSON.parse(cleanedtext);
                    } catch (parseError) {
                        console.error(`Failed to parse JSON for industry ${industry}:`, parseError);
                        continue;
                    }

                    await step.run(`Update ${industry} insights`, async () => {
                        // Use upsert instead of create with where clause
                        await db.industryInsight.upsert({
                            where: { industry },
                            update: {
                                ...insights,
                                lastUpdated: new Date(),
                                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            },
                            create: {
                                industry,
                                ...insights,
                                lastUpdated: new Date(),
                                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            }
                        });
                    });

                } catch (error) {
                    console.error(`Error processing industry ${industry}:`, error);
                    continue;
                }
            }
        });
    }
);