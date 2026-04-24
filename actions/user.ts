"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { generateAIInsights } from "./dashboard";
import { revalidatePath } from "next/cache";

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

export const updateUser = async (data: any) => {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized!");
    }
    const userId = session.user.id;

     try {
        let industryInsight = await db.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          const salaryRange = insights?.salaryRanges ?? insights?.salaryRange ?? [];
          const growthRate = typeof insights?.growthRate === "number" ? insights.growthRate : null;
          const demandLevel = normalizeDemandLevel(insights?.demandLevel);
          const topSkills = normalizeStringArray(insights?.topSkills);
          const marketOutlook = normalizeMarketOutlook(insights?.marketOutlook);
          const keyTrends = normalizeStringArray(insights?.keyTrends);
          const recommendedSkills = normalizeStringArray(insights?.recommendedSkills);

          if (!insights || typeof insights !== "object") {
            console.error("Could not generate AI insights for industry", data.industry, ". Creating default industry insight instead.");
          }

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRange,
              growthRate,
              demandLevel,
              topSkills,
              marketOutlook,
              keyTrends,
              recommendedSkills,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await db.user.update({
          where: {
            id: userId,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills,
          },
        });

        revalidatePath("/");
        return updatedUser;
  }
  catch (error: any) {
        throw new Error("Failed to update user: " + error.message);
    }
};

export const getUserOnboardingStatus = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized!");
    }

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { industry: true },
        });

        if (!user) throw new Error("User not found");

        return { isOnboarded: !!user.industry };
    } catch (error: any) {
        throw new Error("Failed to get onboarding status: " + error.message);
    }
};