"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "./dashboard";
import { redirect } from "next/navigation";

export const updateUser = async (data: any) => {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized!");
    }
    const userId = session.user.id;

    try {
        const result = await db.$transaction(async (tx: any) => {
            let industryInsight = await tx.industryInsight.findUnique({
                where: {
                    industry: data.industry,
                },
            });

            if (!industryInsight) {
                const insights = await generateAIInsights(data.industry);
                if (!data.industry) throw new Error("User industry not found");
                industryInsight = await tx.industryInsight.create({
                    data: {
                        industry: data.industry,
                        ...insights,
                        nextUpdate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                    },
                });
            }

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    industry: data.industry,
                    experience: data.experience,
                    bio: data.bio,
                    skills: data.skills,
                },
            });

            return { updatedUser, industryInsight };
        }, { timeout: 10000 });

        return { success: true, ...result };
    } catch (error: any) {
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