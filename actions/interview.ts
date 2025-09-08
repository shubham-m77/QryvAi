'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function generateQuiz() {
    const session = await auth();
    const userId = session?.user?.id

    if (!userId) {
        return redirect("/sign-in");
    }
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    if (!user) throw new Error("User not found!")
    // const prompt = `Generate 10 technical interview questions for a ${user.skills.}`

}